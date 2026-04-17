// app/components/TransitionCanvasWrapper.tsx - FIXED for proper in/out transitions
"use client";

import { useEffect, useRef, useState } from 'react';
import { useTransition } from '../context/TransitionContext';
import { vertexShaderSource, fragmentShaderSource } from '../shaders/DotTransitionShader.glsl';
import styles from './TransitionCanvas.module.css';

export default function TransitionCanvasWrapper() {
  const { isTransitioning, config } = useTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glResourcesRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    buffer: WebGLBuffer;
  } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [animationState, setAnimationState] = useState<'idle' | 'in' | 'hold' | 'out'>('idle');
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(0);
  const phaseRef = useRef<'in' | 'out'>('in');

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

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

  // Handle transition state changes
  useEffect(() => {
    if (isTransitioning) {
      console.log('🎬 Canvas: Starting transition IN');
      setAnimationState('in');
      phaseRef.current = 'in';
      setProgress(0);
      startTimeRef.current = performance.now();
    } else if (animationState !== 'idle') {
      console.log('🎬 Canvas: Starting transition OUT');
      setAnimationState('out');
      phaseRef.current = 'out';
      setProgress(1);
      startTimeRef.current = performance.now();
    }
  }, [isTransitioning]);

  // Render function
  const render = (currentProgress: number) => {
    const canvas = canvasRef.current;
    const resources = glResourcesRef.current;

    if (!canvas || !resources) return;

    const { gl, program } = resources;
    const { spacing = 25, dotSize = 1.0, dotColor = [0, 0, 0] } = config;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_spacing'), spacing);
    gl.uniform1f(gl.getUniformLocation(program, 'u_animation_progress'), currentProgress);
    gl.uniform1f(gl.getUniformLocation(program, 'u_dot_size'), dotSize);
    gl.uniform3f(
      gl.getUniformLocation(program, 'u_dot_color'),
      dotColor[0],
      dotColor[1],
      dotColor[2]
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // Animation loop
  useEffect(() => {
    if (animationState === 'idle') return;

    const speed = config.speed || 600;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const rawProgress = Math.min(elapsed / speed, 1);

      let currentProgress: number;

      if (animationState === 'in') {
        // Transition IN: 0 → 1
        currentProgress = rawProgress;
        setProgress(currentProgress);
        render(currentProgress);

        if (rawProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          console.log('⚫ Canvas: Transition IN complete (screen covered)');
          setAnimationState('hold');
          render(1); // Keep at 1 (fully covered)
        }
      } else if (animationState === 'out') {
        // Transition OUT: 1 → 0
        currentProgress = 1 - rawProgress;
        setProgress(currentProgress);
        render(currentProgress);

        if (rawProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          console.log('✨ Canvas: Transition OUT complete (screen revealed)');
          setAnimationState('idle');
          setProgress(0);
          render(0);
        }
      } else if (animationState === 'hold') {
        // Just keep rendering at 1 (fully covered)
        render(1);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationState, config]);

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas} ${
        animationState !== 'idle' ? styles.active : ''
      }`}
    />
  );
}