"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { useTheme } from '../hooks/UseTheme';
import { useLanguage } from "@/app/hooks/UseLanguage";

interface DarkModeToggle3DProps {
  modelPath?: string;
  fallbackImagePath?: string;
  style?: React.CSSProperties;
}

const DarkModeToggle3D: React.FC<DarkModeToggle3DProps> = ({ 
  modelPath = '/models/LowPolyMonitor.glb',
  fallbackImagePath = '/images/alt/MonitorFallback.png', // Add your fallback image path
  style 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const outlineRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadError, setLoadError] = useState(false); // NEW: Track load error
  const floatOffset = useRef(0);
  const { t } = useLanguage();
  const { isDark, toggle, mounted } = useTheme();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !mounted) return;

    const container = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup with transparent background
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Load GLTF model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.multiplyScalar(scale);
        
        model.position.sub(center.multiplyScalar(scale));
        
        modelRef.current = model;
        modelRef.current.rotation.y = 200.6;
        
        // Create solid black outline using inverted hull technique
        const outlineMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000,
          side: THREE.BackSide
        });
        
        const outline = new THREE.Group();
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const outlineMesh = new THREE.Mesh(
              child.geometry,
              outlineMaterial
            );
            outlineMesh.position.copy(child.position);
            outlineMesh.rotation.copy(child.rotation);
            outlineMesh.scale.copy(child.scale).multiplyScalar(0.85);
            outline.add(outlineMesh);
          }
        });
        
        outlineRef.current = outline;
        scene.add(outline);
        scene.add(model);
        
        setIsLoaded(true);
        setLoadError(false);
      },
      (progress) => {
        console.log(`Loading: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
      },
      (error) => {
        console.error('Error loading 3D model:', error);
        setLoadError(true); // Set error state
        setIsLoaded(true); // Consider it "loaded" so loading text disappears
      }
    );

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (modelRef.current) {
        // Slow floating animation
        floatOffset.current += 0.01;
        const floatY = Math.sin(floatOffset.current) * 0.15;
        modelRef.current.position.y = floatY;
        
        // Sync outline with model
        if (outlineRef.current) {
          outlineRef.current.position.copy(modelRef.current.position);
          outlineRef.current.rotation.copy(modelRef.current.rotation);
        }
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [modelPath, mounted]);

  const handleClick = () => {
    // Prevent clicking during animation
    if (isAnimating) return;
    
    // Set animating state to true
    setIsAnimating(true);
    
    // Use the toggle function from your theme hook
    toggle();
    
    // Swift twirl animation on click
    if (modelRef.current) {
      const targetRotation = modelRef.current.rotation.y + Math.PI * 2;
      const duration = 700;
      const startTime = Date.now();
      const startRotation = modelRef.current.rotation.y;
      
      const animateClick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        if (modelRef.current) {
          modelRef.current.rotation.y = startRotation + (targetRotation - startRotation) * eased;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateClick);
        } else {
          // Animation complete - allow clicking again
          setIsAnimating(false);
        }
      };
      animateClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // If model failed to load, show fallback image
  if (loadError) {
    return (
      <div
        style={{
          position: 'fixed',
          top: isMobile ? 'auto' : '20px',
          bottom: isMobile ? '20px' : 'auto',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          flexWrap: 'nowrap',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Neo-brutalist vertical card - Desktop only */}
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '50px',
                height: '180px',
                backgroundColor: '#00AFC7',
                border: '4px solid #000000',
                boxShadow: '6px 8px 0px #000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 999,
              }}
            >
              <div
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  fontSize: '18px',
                  fontWeight: '900',
                  color: '#000000',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  userSelect: 'none',
                }}
              >
                {t("3DToggle.ClickMe")}
              </div>
            </div>
          </div>
        )}

        {/* Fallback Image */}
        <div
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: 'relative',
            width: isMobile ? '80px' : '160px',
            height: isMobile ? '80px' : '160px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            transform: isHovered && !isAnimating ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(0deg)',
            pointerEvents: 'auto',
            opacity: isAnimating ? 0.8 : 1,
            animation: isAnimating ? 'spin 0.7s ease-in-out' : 'none',
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
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: isDark ? 'brightness(0.9)' : 'brightness(1)',
              transition: 'filter 0.3s ease',
            }}
          />
          <style jsx>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Normal 3D model render
  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? 'auto' : '20px',
        bottom: isMobile ? '20px' : 'auto',
        right: '20px',
        zIndex: 1000,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        flexWrap: 'nowrap',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Neo-brutalist vertical card - Desktop only */}
      {!isMobile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '50px',
              height: '180px',
              backgroundColor: '#00AFC7',
              border: '4px solid #000000',
              boxShadow: '6px 8px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
            }}
          >
            <div
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                fontSize: '18px',
                fontWeight: '900',
                color: '#000000',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                userSelect: 'none',
              }}
            >
              {t("3DToggle.ClickMe")}
            </div>
          </div>
        </div>
      )}

      {/* 3D Model Container */}
      <div
        ref={containerRef}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          width: isMobile ? '80px' : '160px',
          height: isMobile ? '80px' : '160px',
          cursor: isLoaded && !isAnimating ? 'pointer' : 'default',
          transition: 'transform 0.3s ease',
          transform: isHovered && !isAnimating ? 'scale(1.1)' : 'scale(1)',
          pointerEvents: 'auto',
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
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: isMobile ? '10px' : '12px',
              color: '#888',
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