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
}

export default function Slab3D({ 
  skillName, 
  icon,
  color = "#00AFC7",
  size = 100,
  rotationSpeed = 0.005 
}: Slab3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 5.0);
    scene.add(ambientLight);
/*
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 10.0);
    directionalLight1.position.set(2, 2, 3);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 10.0);
    directionalLight2.position.set(-2, -1, -1);
    scene.add(directionalLight2);
*/
    const modelPath = `/models/IconSlab.glb`;

    // Create icon texture from React icon if provided
    let iconTexturePromise: Promise<THREE.Texture | null> = Promise.resolve(null);
    if (icon) {
      iconTexturePromise = createIconTexture(icon, color);
    }

    // GLTF Loader
    const gltfLoader = new GLTFLoader();
    let model: THREE.Object3D | null = null;
    const edgeLines: THREE.LineSegments[] = [];

    gltfLoader.load(
      modelPath,
      (gltf) => {
        model = gltf.scene;
        scene.add(model);

        // Wait for icon texture to load, then apply materials
        iconTexturePromise.then((iconTexture) => {
          model!.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Dispose of old material
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => mat.dispose());
                } else {
                  child.material.dispose();
                }
              }
              
              // Create material with texture (texture has white background + black icon)
              if (iconTexture) {
                child.material = new THREE.MeshStandardMaterial({
                  map: iconTexture,
                  roughness: 100.0,
                  metalness: 0.0,
                  emissive: 0x111111, // Very slight glow
                  emissiveIntensity: 1.00,
                });
              } else {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xffffff,
                  roughness: 100.0,
                  metalness: 0.0,
                  emissive: 0x111111,
                  emissiveIntensity: 1.00,
                });
              }
              
              // Force material update
              child.material.needsUpdate = true;
              child.castShadow = true;
              child.receiveShadow = true;

              // Add black edge outlines using EdgesGeometry
              const edges = new THREE.EdgesGeometry(child.geometry, 30);
              const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0x000000,
                linewidth: 2
              });
              const lineSegments = new THREE.LineSegments(edges, lineMaterial);
              
              child.add(lineSegments);
              edgeLines.push(lineSegments);
            }
          });
        });

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Scale model to fit view
        const boxSize = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);
      },
      undefined,
      (error) => {
        console.warn(`Model not found for ${skillName}, using fallback box`);
        
        // Fallback: Create a simple box
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
          model = fallbackMesh;

          // Add edges to fallback
          const edges = new THREE.EdgesGeometry(geometry);
          const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000,
            linewidth: 2
          });
          const lineSegments = new THREE.LineSegments(edges, lineMaterial);
          fallbackMesh.add(lineSegments);
          edgeLines.push(lineSegments);
        });
      }
    );

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      if (model) {
        model.rotation.y += rotationSpeed;
        // model.rotation.x += rotationSpeed * 0.4;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
      
      edgeLines.forEach((line) => {
        line.geometry.dispose();
        if (line.material instanceof THREE.Material) {
          line.material.dispose();
        }
      });
      
      renderer.dispose();
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

// Helper function to create texture from React icon
// Creates a white background with black icon overlaid on top
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

    // Step 1: Fill entire canvas with WHITE background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Step 2: Convert React icon to SVG and inject BLACK color
    let iconString = renderToString(iconElement);
    
    // Replace all fill/stroke colors with BLACK
    iconString = iconString.replace(/fill="[^"]*"/g, `fill="#000000"`);
    iconString = iconString.replace(/stroke="[^"]*"/g, `stroke="#000000"`);
    
    // Add fill attribute if it doesn't exist
    if (!iconString.includes('fill=')) {
      iconString = iconString.replace('<svg', `<svg fill="#000000"`);
    }
    
    const img = new Image();
    const svgBlob = new Blob([iconString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    img.onload = () => {
      // Step 3: Draw the BLACK icon on top of the white background
      const iconSize = size * 0.7;
      const offset = (size - iconSize) / 2;
      
      ctx.drawImage(img, offset, offset, iconSize, iconSize);
      
      // Update texture
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
  });
}