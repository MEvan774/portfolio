"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { renderToString } from "react-dom/server";

interface Slab3DProps {
  skillName: string;
  icon?: React.ReactElement;
  color?: string;
  size?: number;
  rotationSpeed?: number;
  /**
   * Optional ref to a parent container element. Kept for API
   * compatibility — no longer needed now that each slab renders
   * in its own local canvas.
   */
  clipContainer?: HTMLElement | null;
}

export default function Slab3D({
  skillName,
  icon,
  color = "#00AFC7",
  size = 100,
  rotationSpeed = 0.005,
}: Slab3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene / Camera / Renderer ─────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(size, size, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const canvas = renderer.domElement;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.style.display = "block";
    mount.appendChild(canvas);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 5.0);
    scene.add(ambientLight);

    const modelPath = `/models/IconSlab.glb`;

    let iconTexturePromise: Promise<THREE.Texture | null> = Promise.resolve(null);
    if (icon) {
      iconTexturePromise = createIconTexture(icon, color);
    }

    const gltfLoader = new GLTFLoader();
    const edgeLines: THREE.LineSegments[] = [];

    gltfLoader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;
        scene.add(model);

        iconTexturePromise.then((iconTexture) => {
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat) => mat.dispose());
                } else {
                  child.material.dispose();
                }
              }

              if (iconTexture) {
                child.material = new THREE.MeshStandardMaterial({
                  map: iconTexture,
                  roughness: 100.0,
                  metalness: 0.0,
                  emissive: 0x111111,
                  emissiveIntensity: 1.0,
                });
              } else {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xffffff,
                  roughness: 100.0,
                  metalness: 0.0,
                  emissive: 0x111111,
                  emissiveIntensity: 1.0,
                });
              }

              child.material.needsUpdate = true;
              child.castShadow = true;
              child.receiveShadow = true;

              const edges = new THREE.EdgesGeometry(child.geometry, 30);
              const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x000000,
                linewidth: 2,
              });
              const lineSegments = new THREE.LineSegments(edges, lineMaterial);

              child.add(lineSegments);
              edgeLines.push(lineSegments);
            }
          });
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const boxSize = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);
      },
      undefined,
      () => {
        console.warn(`Model not found for ${skillName}, using fallback box`);

        iconTexturePromise.then((iconTexture) => {
          const geometry = new THREE.BoxGeometry(1.5, 1.5, 0.3);
          const material = iconTexture
            ? new THREE.MeshStandardMaterial({
                map: iconTexture,
                roughness: 0.5,
                metalness: 0.1,
              })
            : new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.5,
                metalness: 0.1,
              });

          const fallbackMesh = new THREE.Mesh(geometry, material);
          scene.add(fallbackMesh);
          modelRef.current = fallbackMesh;

          const edges = new THREE.EdgesGeometry(geometry);
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 2,
          });
          const lineSegments = new THREE.LineSegments(edges, lineMaterial);
          fallbackMesh.add(lineSegments);
          edgeLines.push(lineSegments);
        });
      }
    );

    // ── Render loop ───────────────────────────────────────────
    let rafId: number | null = null;
    const tick = () => {
      if (modelRef.current) {
        modelRef.current.rotation.y += rotationSpeed;
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // ── Cleanup ───────────────────────────────────────────────
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);

      edgeLines.forEach((line) => {
        line.geometry.dispose();
        if (line.material instanceof THREE.Material) {
          line.material.dispose();
        }
      });

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });

      renderer.dispose();
      if (canvas.parentNode === mount) {
        mount.removeChild(canvas);
      }
    };
  }, [skillName, icon, color, size, rotationSpeed]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
      aria-label={skillName}
      title={skillName}
    />
  );
}

function createIconTexture(
  iconElement: React.ReactElement,
  color: string
): Promise<THREE.Texture> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      const emptyTexture = new THREE.Texture();
      resolve(emptyTexture);
      return;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    let iconString = renderToString(iconElement);

    iconString = iconString.replace(/fill="[^"]*"/g, `fill="#000000"`);
    iconString = iconString.replace(/stroke="[^"]*"/g, `stroke="#000000"`);

    if (!iconString.includes("fill=")) {
      iconString = iconString.replace("<svg", `<svg fill="#000000"`);
    }

    const img = new Image();
    const svgBlob = new Blob([iconString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    img.onload = () => {
      const iconSize = size * 0.7;
      const offset = (size - iconSize) / 2;

      ctx.drawImage(img, offset, offset, iconSize, iconSize);

      texture.needsUpdate = true;

      URL.revokeObjectURL(url);
      resolve(texture);
    };

    img.onerror = () => {
      console.error("Failed to load icon texture");
      URL.revokeObjectURL(url);
      resolve(texture);
    };

    img.src = url;

    // silence unused warn (kept for API compatibility)
    void color;
  });
}
