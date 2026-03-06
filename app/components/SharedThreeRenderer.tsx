/**
 * SharedThreeRenderer - Singleton that manages ONE WebGL context
 * for all Three.js components on the page.
 *
 * Instead of each Slab3D / DarkModeToggle3D creating its own
 * WebGLRenderer (which eats a WebGL context each), every component
 * registers a "render task" here. The singleton renders them all
 * in a single animation loop using scissor/viewport clipping.
 *
 * Overflow clipping:
 *   Pass `clipContainer` (a parent DOM element) in the task to
 *   restrict rendering to that element's bounds. This prevents
 *   3D content from drawing outside a scrollable card, for example.
 *
 * Usage:
 *   const id = SharedThreeRenderer.register({
 *     scene, camera, domElement,
 *     clipContainer: parentCardRef.current,  // optional
 *     onBeforeRender: (time, delta) => { ... },
 *   });
 *   // later:
 *   SharedThreeRenderer.unregister(id);
 */

import * as THREE from "three";

export interface RenderTask {
  scene: THREE.Scene;
  camera: THREE.Camera;
  /** The DOM element whose bounding rect determines the viewport */
  domElement: HTMLElement;
  /**
   * Optional parent element to clip against. The rendered area will
   * be the intersection of domElement's rect and clipContainer's rect.
   * Use this to keep 3D content inside a scrollable card / section.
   */
  clipContainer?: HTMLElement | null;
  /** Optional callback fired every frame before this task renders */
  onBeforeRender?: (time: number, delta: number) => void;
  /** If true, renderer.localClippingEnabled is set for this task */
  localClipping?: boolean;
}

type TaskId = string;

class _SharedThreeRenderer {
  private renderer: THREE.WebGLRenderer | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private tasks: Map<TaskId, RenderTask> = new Map();
  private rafId: number | null = null;
  private lastTime = 0;
  private nextId = 0;

  /**
   * Lazily create the shared renderer + overlay canvas.
   */
  private ensureRenderer(): THREE.WebGLRenderer {
    if (this.renderer) return this.renderer;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "999";
    document.body.appendChild(canvas);
    this.canvas = canvas;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    renderer.setScissorTest(true);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    this.renderer = renderer;

    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    return renderer;
  }

  private handleResize = () => {
    if (!this.canvas || !this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.renderer.setSize(w, h, false);
  };

  /**
   * Register a 3D component for rendering.
   * Returns an ID you must pass to unregister() on cleanup.
   */
  register(task: RenderTask): TaskId {
    this.ensureRenderer();
    const id = `task_${this.nextId++}`;
    this.tasks.set(id, task);

    if (this.tasks.size === 1) {
      this.startLoop();
    }

    return id;
  }

  /**
   * Remove a 3D component. When no tasks remain the loop
   * and renderer are torn down to free GPU resources.
   */
  unregister(id: TaskId) {
    this.tasks.delete(id);

    if (this.tasks.size === 0) {
      this.stopLoop();
      this.dispose();
    }
  }

  /**
   * Update the task in-place (e.g. if clipContainer changed).
   */
  update(id: TaskId, partial: Partial<RenderTask>) {
    const existing = this.tasks.get(id);
    if (existing) {
      this.tasks.set(id, { ...existing, ...partial });
    }
  }

  // ── render loop ────────────────────────────────────────────

  private startLoop() {
    this.lastTime = performance.now();
    const tick = (now: number) => {
      const delta = (now - this.lastTime) / 1000;
      this.lastTime = now;
      this.renderAll(now / 1000, delta);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Compute the intersection of two DOMRects.
   * Returns null if they don't overlap.
   */
  private intersectRects(
    a: DOMRect,
    b: DOMRect
  ): { left: number; top: number; right: number; bottom: number; width: number; height: number } | null {
    const left = Math.max(a.left, b.left);
    const top = Math.max(a.top, b.top);
    const right = Math.min(a.right, b.right);
    const bottom = Math.min(a.bottom, b.bottom);
    const width = right - left;
    const height = bottom - top;

    if (width <= 0 || height <= 0) return null;
    return { left, top, right, bottom, width, height };
  }

  private renderAll(time: number, delta: number) {
    const renderer = this.renderer;
    if (!renderer || !this.canvas) return;

    const canvasH = this.canvas.getBoundingClientRect().height;
    const dpr = renderer.getPixelRatio();

    // Clear the full canvas
    renderer.setScissor(0, 0, this.canvas.width, this.canvas.height);
    renderer.setViewport(0, 0, this.canvas.width, this.canvas.height);
    renderer.clear(true, true, true);

    for (const task of this.tasks.values()) {
      const el = task.domElement;
      if (!el) continue;

      const elRect = el.getBoundingClientRect();

      // Quick off-screen check
      if (
        elRect.bottom < 0 ||
        elRect.top > canvasH ||
        elRect.right < 0 ||
        elRect.left > window.innerWidth ||
        elRect.width === 0 ||
        elRect.height === 0
      ) {
        continue;
      }

      // ── Clip to parent container if specified ──
      // The viewport is always the full element rect (so the 3D scene
      // is centred correctly), but the scissor is clamped to the
      // clip container so nothing draws outside it.
      let visibleRect: { left: number; top: number; width: number; height: number };

      if (task.clipContainer) {
        const clipRect = task.clipContainer.getBoundingClientRect();
        const intersection = this.intersectRects(elRect, clipRect);
        if (!intersection) continue; // fully clipped — skip render
        visibleRect = intersection;
      } else {
        visibleRect = elRect;
      }

      // Convert DOM rect → GL coords (bottom-left origin)
      const vpX = Math.round(elRect.left * dpr);
      const vpY = Math.round((canvasH - elRect.bottom) * dpr);
      const vpW = Math.round(elRect.width * dpr);
      const vpH = Math.round(elRect.height * dpr);

      const scX = Math.round(visibleRect.left * dpr);
      const scY = Math.round((canvasH - visibleRect.top - visibleRect.height) * dpr);
      const scW = Math.round(visibleRect.width * dpr);
      const scH = Math.round(visibleRect.height * dpr);

      // Pre-render callback (animations, rotation, etc.)
      task.onBeforeRender?.(time, delta);

      // Update camera aspect
      if (task.camera instanceof THREE.PerspectiveCamera) {
        const aspect = elRect.width / elRect.height;
        if (Math.abs(task.camera.aspect - aspect) > 0.01) {
          task.camera.aspect = aspect;
          task.camera.updateProjectionMatrix();
        }
      }

      // Per-task local clipping toggle (needed for DarkModeToggle3D)
      renderer.localClippingEnabled = !!task.localClipping;

      renderer.setViewport(vpX, vpY, vpW, vpH);
      renderer.setScissor(scX, scY, scW, scH);
      renderer.render(task.scene, task.camera);
    }
  }

  // ── cleanup ────────────────────────────────────────────────

  private dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    window.removeEventListener("resize", this.handleResize);
  }
}

/** The one and only renderer instance */
const SharedThreeRenderer = new _SharedThreeRenderer();
export default SharedThreeRenderer;