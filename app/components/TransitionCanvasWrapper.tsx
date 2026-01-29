// app/components/TransitionCanvasWrapper.tsx
"use client";

import { useEffect, useRef } from 'react';
import { useTransition } from '../context/TransitionContext';

// Import your shader sources
import { vertexShaderSource, fragmentShaderSource } from '../shaders/DotTransitionShader.glsl';
import styles from './TransitionCanvas.module.css';

/**
 * Wrapper that manages the WebGL canvas and connects to TransitionContext
 * Place this in your root layout
 */
export default function TransitionCanvasWrapper() {
  const { isTransitioning, config } = useTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glResourcesRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    buffer: WebGLBuffer;
  } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isTransitioningInRef = useRef(false);

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Compile shaders
    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking failed:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    if (!buffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    glResourcesRef.current = { gl, program, buffer };

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const resources = glResourcesRef.current;
      if (resources) {
        resources.gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isTransitioning) return;

    isTransitioningInRef.current = true;
    startTimeRef.current = performance.now();

    const { spacing = 25, dotSize = 1.0, dotColor = [0, 0, 0], speed = 600 } = config;

    const render = (progress: number) => {
      const canvas = canvasRef.current;
      const resources = glResourcesRef.current;

      if (!canvas || !resources) return;

      const { gl, program } = resources;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Set uniforms
      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, 'u_spacing'), spacing);
      gl.uniform1f(gl.getUniformLocation(program, 'u_animation_progress'), progress);
      gl.uniform1f(gl.getUniformLocation(program, 'u_dot_size'), dotSize);
      gl.uniform3f(
        gl.getUniformLocation(program, 'u_dot_color'),
        dotColor[0],
        dotColor[1],
        dotColor[2]
      );

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / speed, 1);

      render(progress);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (isTransitioningInRef.current) {
          // Transition in complete, start transition out
          isTransitioningInRef.current = false;
          startTimeRef.current = performance.now();

          const animateOut = (currentTime: number) => {
            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / speed, 1);

            render(1 - progress);

            if (progress < 1) {
              animationFrameRef.current = requestAnimationFrame(animateOut);
            }
          };

          animationFrameRef.current = requestAnimationFrame(animateOut);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isTransitioning, config]);

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas} ${isTransitioning ? styles.active : ''}`}
    />
  );
}