"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import { useTheme } from "../hooks/UseTheme";
import { useLanguage } from "@/app/hooks/UseLanguage";

/* ──────────────────────────────────────────────
   Mesh names expected inside the .glb file.
   Adjust these constants if your Blender names differ.
   ────────────────────────────────────────────── */
const MESH_NAMES = {
  monitor: "Monitor",
  sun: "Sun",
  moon: "Moon",
  depth: "Depth", // the inset "diorama" / parallax card mesh
} as const;

/* ──────────────────────────────────────────────
   Config
   ────────────────────────────────────────────── */
const FLOAT_SPEED = 0.01;
const FLOAT_AMPLITUDE = 0.15;
const TRAIL_LAG = 0.98; // how much sun/moon lag behind (0 = no lag, 1 = full frame behind)
const TWIRL_DURATION = 700; // ms
const GALAXY_STAR_COUNT = 2400;
const GLOW_INTENSITY = 10000.6;

interface DarkModeToggle3DProps {
  modelPath?: string;
  fallbackImagePath?: string;
  style?: React.CSSProperties;
}

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

/** Create a procedural galaxy texture for the depth mesh */
function createGalaxyTexture(width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Deep space gradient
  const bg = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    0,
    width * 0.5,
    height * 0.5,
    width * 0.7
  );
  bg.addColorStop(0, "#1a1040");
  bg.addColorStop(0.4, "#0d0b2e");
  bg.addColorStop(1, "#020010");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Nebula-like color clouds
  const nebulae = [
    { x: 0.3, y: 0.4, r: 0.35, color: "rgba(90, 40, 180, 0.15)" },
    { x: 0.65, y: 0.55, r: 0.3, color: "rgba(30, 80, 200, 0.12)" },
    { x: 0.5, y: 0.3, r: 0.25, color: "rgba(180, 50, 120, 0.1)" },
    { x: 0.4, y: 0.7, r: 0.2, color: "rgba(0, 175, 199, 0.12)" },
  ];
  for (const n of nebulae) {
    const ng = ctx.createRadialGradient(
      n.x * width,
      n.y * height,
      0,
      n.x * width,
      n.y * height,
      n.r * width
    );
    ng.addColorStop(0, n.color);
    ng.addColorStop(1, "transparent");
    ctx.fillStyle = ng;
    ctx.fillRect(0, 0, width, height);
  }

  // Stars
  for (let i = 0; i < GALAXY_STAR_COUNT; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 1.4 + 0.3;
    const brightness = Math.random() * 0.8 + 0.2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.fill();
  }

  // A few brighter "feature" stars with glow
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 3 + 1.5;
    const sg = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    sg.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    sg.addColorStop(0.4, "rgba(200, 220, 255, 0.3)");
    sg.addColorStop(1, "transparent");
    ctx.fillStyle = sg;
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Build a glow sprite to attach to sun/moon meshes */
function createGlowSprite(color: THREE.ColorRepresentation, size = 1.2): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const cx = 64,
    cy = 64;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);
  const col = new THREE.Color(color);
  const hex = `rgba(${Math.round(col.r * 255)}, ${Math.round(col.g * 255)}, ${Math.round(col.b * 255)}`;
  g.addColorStop(0, `${hex}, 0.6)`);
  g.addColorStop(0.35, `${hex}, 0.25)`);
  g.addColorStop(0.7, `${hex}, 0.06)`);
  g.addColorStop(1, `${hex}, 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);

  const map = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size, size, 1);
  return sprite;
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
const DarkModeToggle3D: React.FC<DarkModeToggle3DProps> = ({
  modelPath = "/models/FullMonitor.glb",
  fallbackImagePath = "/images/alt/MonitorFallback.png",
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Mesh refs
  const monitorRef = useRef<THREE.Object3D | null>(null);
  const sunRef = useRef<THREE.Object3D | null>(null);
  const moonRef = useRef<THREE.Object3D | null>(null);
  const depthRef = useRef<THREE.Object3D | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const outlineRefMoon = useRef<THREE.Group | null>(null);
  const outlineRefSun = useRef<THREE.Group | null>(null);

  // Outline ref (edge lines on monitor)
  const edgeLinesRef = useRef<THREE.Group | null>(null);

  // Glow sprites
  const sunGlowRef = useRef<THREE.Sprite | null>(null);
  const moonGlowRef = useRef<THREE.Sprite | null>(null);

  // Trailing float positions for sun/moon
  const sunTrailY = useRef(0);
  const moonTrailY = useRef(0);
  const monitorFloatY = useRef(0);

  const floatOffset = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const { t } = useLanguage();
  const { isDark, toggle, mounted } = useTheme();

  // Ref to track isDark inside callbacks without stale closures
  const isDarkRef = useRef(isDark);
  useEffect(() => {
    isDarkRef.current = isDark;
    // Update visibility whenever theme changes
    if (sunRef.current) sunRef.current.visible = !isDark;
    if (moonRef.current) moonRef.current.visible = isDark;
  }, [isDark]);

  // ─── Mobile detection ───
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ─── Scene bootstrap & model loading ───
  useEffect(() => {
    if (!containerRef.current || !mounted) return;
    const container = containerRef.current;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Clipping plane — will be positioned at the monitor screen face
    // to prevent the depth cone from being visible from behind
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    const clippingPlaneRef = { plane: clippingPlane };

    renderer.localClippingEnabled = true;

    // Ambient light (soft fill)
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    // Directional key light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);

    // ─── Load model ───
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        // Center & scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.multiplyScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        model.rotation.y = 200.6; // preserve your original rotation
        modelGroupRef.current = model;

        // Galaxy texture (created once)
        const galaxyTexture = createGalaxyTexture();

        // Edge lines group
        const edgeGroup = new THREE.Group();

        // ─── Traverse & configure meshes ───
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const name = child.name.toLowerCase();

          // --- MONITOR ---
          if (name.includes(MESH_NAMES.monitor.toLowerCase())) {
            monitorRef.current = child;
            // White material + black wireframe edges
            child.material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              emissive: 0xffa000,
              roughness: 0.35,
              metalness: 0.05,
            });

            // Create black edge lines using EdgesGeometry
            const edges = new THREE.EdgesGeometry(child.geometry, 30); // threshold angle 30°
            const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
            const lineSegments = new THREE.LineSegments(edges, lineMat);
            // Copy transform from mesh
            lineSegments.position.copy(child.position);
            lineSegments.rotation.copy(child.rotation);
            lineSegments.scale.copy(child.scale);
            edgeGroup.add(lineSegments);
          }

          // --- SUN ---
          if (name.includes(MESH_NAMES.sun.toLowerCase())) {
            sunRef.current = child;
            child.material = new THREE.MeshStandardMaterial({
              color: 0xffd54f,
              emissive: 0xffa000,
              emissiveIntensity: GLOW_INTENSITY,
              roughness: 0.3,
              metalness: 0.1,
            });
            // Attach glow sprite
           // const glow = createGlowSprite(0xffb300, 1.4);
            // child.add(glow);
            // sunGlowRef.current = glow;
                        const outlineMaterial = new THREE.MeshBasicMaterial({
              color: 0xde8400,
              side: THREE.BackSide
            });
    
              const outline = new THREE.Group();
              if (sunRef.current instanceof THREE.Mesh) {
                const outlineMesh = new THREE.Mesh(
                  sunRef.current.geometry,
                  outlineMaterial
                );
                outlineMesh.position.copy(new THREE.Vector3(sunRef.current.position.x + 0.03, sunRef.current.position.y, sunRef.current.position.z - 0.01)); // slight offset to prevent z-fighting
                outlineMesh.rotation.copy(sunRef.current.rotation);
                outlineMesh.scale.copy(sunRef.current.scale).multiplyScalar(1.1);
                outline.add(outlineMesh);
              }
              
                          outlineRefSun.current = outline;
                          scene.add(outline);
                          scene.add(model);
                          child.add(outline);
            
          }

          // --- MOON ---
          if (name.includes(MESH_NAMES.moon.toLowerCase())) {
            moonRef.current = child;
            child.material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              emissive: 0x90caf9,
              emissiveIntensity: GLOW_INTENSITY,
              roughness: 0.4,
              metalness: 0.15,
            });
            // Attach glow sprite
            // const glow = createGlowSprite(0x64b5f6, 1.2);
            // child.add(glow);
            // moonGlowRef.current = glow;
            // Create solid white outline using inverted hull technique
            const outlineMaterial = new THREE.MeshBasicMaterial({
              color: 0x1e79fe,
              side: THREE.BackSide
            });
    
              const outline = new THREE.Group();
              if (moonRef.current instanceof THREE.Mesh) {
                const outlineMesh = new THREE.Mesh(
                  moonRef.current.geometry,
                  outlineMaterial
                );
                outlineMesh.position.copy(new THREE.Vector3(moonRef.current.position.x + 0.04, moonRef.current.position.y, moonRef.current.position.z - 0.01)); // slight offset to prevent z-fighting
                outlineMesh.rotation.copy(moonRef.current.rotation);
                outlineMesh.scale.copy(moonRef.current.scale).multiplyScalar(1.1);
                outline.add(outlineMesh);
              }
              
                          outlineRefMoon.current = outline;
                          scene.add(outline);
                          scene.add(model);
                          child.add(outline);
            }
          


          // --- DEPTH / DIORAMA MESH (screen inset) ---
          if (name.includes(MESH_NAMES.depth.toLowerCase())) {
            depthRef.current = child;
                             child.material = new THREE.ShaderMaterial({
          uniforms: {
            uTexture: { value: galaxyTexture },
            uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
          },
          vertexShader: `
            varying vec4 vScreenPos;
            void main() {
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * mvPosition;
              vScreenPos = gl_Position;
            }
          `,
          fragmentShader: `
            uniform sampler2D uTexture;
            uniform vec2 uResolution;
            varying vec4 vScreenPos;

            void main() {
              vec2 screenUv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
              gl_FragColor = texture2D(uTexture, screenUv);
            }
          `,
          clippingPlanes: [clippingPlaneRef.plane],
          side: THREE.FrontSide,
        });
          }
        });

        edgeLinesRef.current = edgeGroup;
        model.add(edgeGroup);
        scene.add(model);

        // Set initial sun/moon visibility based on current theme
        // isDark at load time: show moon, hide sun. Light mode: show sun, hide moon.
        if (sunRef.current) sunRef.current.visible = !isDarkRef.current;
        if (moonRef.current) moonRef.current.visible = isDarkRef.current;

        setIsLoaded(true);
        setLoadError(false);
      },
      undefined,
      (error) => {
        console.error("Error loading 3D model:", error);
        setLoadError(true);
        setIsLoaded(true);
      }
    );

    // ─── Animation loop ───
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      floatOffset.current += FLOAT_SPEED;
      const targetY = Math.sin(floatOffset.current) * FLOAT_AMPLITUDE;
      monitorFloatY.current = targetY;

      // Smooth trailing for sun / moon
      sunTrailY.current += (targetY - sunTrailY.current) * (1 - TRAIL_LAG);
      moonTrailY.current += (targetY - moonTrailY.current) * (1 - TRAIL_LAG);

      // Apply float to individual meshes (relative offsets)
      if (monitorRef.current) {
        const baseY = monitorRef.current.userData._baseY ?? monitorRef.current.position.y;
        if (monitorRef.current.userData._baseY === undefined)
          monitorRef.current.userData._baseY = baseY;
        monitorRef.current.position.y = baseY + targetY;
      }
      if (depthRef.current) {
        const baseY = depthRef.current.userData._baseY ?? depthRef.current.position.y;
        if (depthRef.current.userData._baseY === undefined)
          depthRef.current.userData._baseY = baseY;
        depthRef.current.position.y = baseY + targetY;
      }
      if (sunRef.current) {
        const baseY = sunRef.current.userData._baseY ?? sunRef.current.position.y;
        if (sunRef.current.userData._baseY === undefined)
          sunRef.current.userData._baseY = baseY;
        sunRef.current.position.y = baseY + sunTrailY.current;
      }
      if (moonRef.current) {
        const baseY = moonRef.current.userData._baseY ?? moonRef.current.position.y;
        if (moonRef.current.userData._baseY === undefined)
          moonRef.current.userData._baseY = baseY;
        moonRef.current.position.y = baseY + moonTrailY.current;
      }

      // Keep edge lines synced with monitor
      if (edgeLinesRef.current && monitorRef.current) {
        edgeLinesRef.current.position.y = monitorRef.current.position.y;
      }
/*
      // Pulse glow sprites subtly
      const glowPulse = 1 + Math.sin(floatOffset.current * 2.5) * 4.12;
      if (sunGlowRef.current) {
        sunGlowRef.current.scale.set(1.4 * glowPulse, 1.4 * glowPulse, 1);
      }
      if (moonGlowRef.current) {
        moonGlowRef.current.scale.set(1.2 * glowPulse, 1.2 * glowPulse, 1);
      }
*/
      // Update clipping plane to match monitor orientation
      // The plane should sit at the screen face and clip everything behind it
      if (modelGroupRef.current && monitorRef.current) {
        const normal = new THREE.Vector3(0, 0, 1); // screen faces +Z in local space
        normal.applyQuaternion(modelGroupRef.current.quaternion);
        const monitorWorldPos = new THREE.Vector3();
        monitorRef.current.getWorldPosition(monitorWorldPos);
        clippingPlaneRef.plane.setFromNormalAndCoplanarPoint(normal, monitorWorldPos);
      }

      renderer.render(scene, camera);
    };
    animate();

    // ─── Resize ───
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);

      if (depthRef.current && depthRef.current instanceof THREE.Mesh && depthRef.current.material instanceof THREE.ShaderMaterial) {
        depthRef.current.material.uniforms.Uresolution.value.set(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    // ─── Cleanup ───
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current !== null) cancelAnimationFrame(animationIdRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [modelPath, mounted]);

  // ─── Click handler (twirl + theme toggle) ───
  const handleClick = useCallback(() => {
    if (isAnimating || !modelGroupRef.current) return;
    setIsAnimating(true);
    toggle();

    const group = modelGroupRef.current;
    const startRotation = group.rotation.y;
    const targetRotation = startRotation + Math.PI * 2;
    const startTime = Date.now();
    let hasSwapped = false; // track if we've swapped sun/moon mid-twirl

    const animateClick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / TWIRL_DURATION, 1);
      // Cubic ease-in-out
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      group.rotation.y = startRotation + (targetRotation - startRotation) * eased;

      // Swap sun/moon visibility at the halfway point of the twirl
      if (progress >= 0.5 && !hasSwapped) {
        hasSwapped = true;
        // By this point toggle() has already flipped isDark,
        // so isDarkRef.current reflects the NEW theme
        if (sunRef.current) sunRef.current.visible = !isDarkRef.current;
        if (moonRef.current) moonRef.current.visible = isDarkRef.current;
      }

      if (progress < 1) {
        requestAnimationFrame(animateClick);
      } else {
        setIsAnimating(false);
      }
    };
    animateClick();
  }, [isAnimating, toggle]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  /* ──────────────────────────────────────────────
     Fallback UI (when model fails to load)
     ────────────────────────────────────────────── */
  if (loadError) {
    return (
      <div
        style={{
          position: "fixed",
          top: "auto",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "12px",
          flexWrap: "nowrap",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* Neo-brutalist card – Desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", pointerEvents: "auto" }}>
            <div
              style={{
                position: "relative",
                width: "50px",
                height: "180px",
                backgroundColor: "#00AFC7",
                border: "4px solid #000000",
                boxShadow: "6px 8px 0px #000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 999,
              }}
            >
              <div
                style={{
                  writingMode: "vertical-lr",
                  transform: "rotate(180deg)",
                  textOrientation: "mixed",
                  fontSize: "24px",
                  fontWeight: "900",
                  color: "#000000",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  userSelect: "none",
                }}
              >
                {t("3DToggle.ClickMe")}
              </div>
            </div>
          </div>
        )}

        {/* Fallback image */}
        <div
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: "relative",
            width: isMobile ? "80px" : "160px",
            height: isMobile ? "80px" : "160px",
            cursor: "pointer",
            transition: "transform 0.3s ease",
            transform: isHovered && !isAnimating ? "scale(1.1)" : "scale(1)",
            pointerEvents: "auto",
            opacity: isAnimating ? 0.8 : 1,
            animation: isAnimating ? "spin 0.7s ease-in-out" : "none",
            ...style,
          }}
          aria-label="Toggle dark mode"
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <img
            src={fallbackImagePath}
            alt="Dark mode toggle"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: isDark ? "brightness(0.9)" : "brightness(1)",
              transition: "filter 0.3s ease",
            }}
          />
          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────
     Main 3D render
     ────────────────────────────────────────────── */
  return (
    <div
      style={{
        position: "fixed",
        top: "auto",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "12px",
        flexWrap: "nowrap",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* Neo-brutalist vertical card – Desktop only */}
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", pointerEvents: "auto" }}>
          <div
            style={{
              position: "relative",
              width: "50px",
              height: "180px",
              backgroundColor: "#00AFC7",
              border: "4px solid #000000",
              boxShadow: "6px 8px 0px #000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              zIndex: 999,
            }}
          >
            <div
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)",
                textOrientation: "mixed",
                fontSize: "24px",
                fontWeight: "900",
                color: "#000000",
                letterSpacing: "1px",
                textTransform: "uppercase",
                userSelect: "none",
              }}
            >
              {t("3DToggle.ClickMe")}
            </div>
          </div>
        </div>
      )}

      {/* 3D canvas container */}
      <div
        ref={containerRef}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: "relative",
          width: isMobile ? "80px" : "160px",
          height: isMobile ? "80px" : "160px",
          cursor: isLoaded && !isAnimating ? "pointer" : "default",
          transition: "transform 0.3s ease",
          transform: isHovered && !isAnimating ? "scale(1.1)" : "scale(1)",
          pointerEvents: "auto",
          opacity: isAnimating ? 0.8 : 1,
          ...style,
        }}
        aria-label="Toggle dark mode"
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {!isLoaded && mounted && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: isMobile ? "10px" : "12px",
              color: "#888",
            }}
          >
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default DarkModeToggle3D;