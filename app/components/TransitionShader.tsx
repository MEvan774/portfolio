// src/components/transitions/TransitionCanvas.tsx
import React, { Component, createRef } from 'react';
import { vertexShaderSource, fragmentShaderSource } from "../shaders/DotTransitionShader.glsl.jsx";
import styles from './TransitionCanvas.module.css';

interface TransitionCanvasProps {
  width?: number;
  height?: number;
  spacing?: number;
  dotSize?: number;
  dotColor?: [number, number, number];
  speed?: number;
  onComplete?: () => void;
}

interface TransitionCanvasState {
  isAnimating: boolean;
}

interface WebGLResources {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
}

export default class TransitionCanvas extends Component<TransitionCanvasProps, TransitionCanvasState> {
  private canvasRef = createRef<HTMLCanvasElement>();
  private glResources: WebGLResources | null = null;
  private animationFrameId: number | null = null;
  private progress: number = 0;

  static defaultProps: Partial<TransitionCanvasProps> = {
    width: 1920,
    height: 1080,
    spacing: 25.0,
    dotSize: 1.0,
    dotColor: [0.0, 0.0, 0.0],
    speed: 0.01,
  };

  constructor(props: TransitionCanvasProps) {
    super(props);
    this.state = {
      isAnimating: false,
    };
  }

  componentDidMount(): void {
    this.initializeWebGL();
    this.startAnimation();
  }

  componentWillUnmount(): void {
    this.cleanup();
  }

  private initializeWebGL(): void {
    const canvas = this.canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref not available');
      return;
    }

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Compile vertex shader
    const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    if (!vertexShader) {
      console.error('Failed to create vertex shader');
      return;
    }

    // Compile fragment shader
    const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!fragmentShader) {
      console.error('Failed to create fragment shader');
      return;
    }

    // Create and link program
    const program = gl.createProgram();
    if (!program) {
      console.error('Failed to create program');
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check for linking errors
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking failed:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry (full-screen quad)
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    if (!buffer) {
      console.error('Failed to create buffer');
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Store resources
    this.glResources = { gl, program, buffer };
  }

  private compileShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check for compilation errors
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private animate = (): void => {
    if (!this.glResources) return;

    const canvas = this.canvasRef.current;
    if (!canvas) return;

    const { gl, program } = this.glResources;
    const { spacing, dotSize, dotColor, speed, onComplete } = this.props;

    // Clear canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Update progress
    this.progress += speed || 0.01;

    // Set uniforms
    const uniformLocations = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      spacing: gl.getUniformLocation(program, 'u_spacing'),
      progress: gl.getUniformLocation(program, 'u_animation_progress'),
      dotSize: gl.getUniformLocation(program, 'u_dot_size'),
      dotColor: gl.getUniformLocation(program, 'u_dot_color'),
    };

    gl.uniform2f(uniformLocations.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniformLocations.spacing, spacing || 25.0);
    gl.uniform1f(uniformLocations.progress, this.progress);
    gl.uniform1f(uniformLocations.dotSize, dotSize || 1.0);

    const color = dotColor || [0.0, 0.0, 0.0];
    gl.uniform3f(uniformLocations.dotColor, color[0], color[1], color[2]);

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Continue animation or stop
    if (this.progress < 1.0) {
      this.animationFrameId = requestAnimationFrame(this.animate);
      this.setState({ isAnimating: true });
    } else {
      this.setState({ isAnimating: false });
      onComplete?.();
    }
  };

  public startAnimation(): void {
    this.progress = 0;
    this.animate();
  }

  public resetAnimation(): void {
    this.progress = 0;
    if (this.glResources) {
      const { gl } = this.glResources;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }

  public setProgress(progress: number): void {
    this.progress = Math.max(0, Math.min(1, progress));
  }

  private cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.glResources) {
      const { gl, program, buffer } = this.glResources;
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      this.glResources = null;
    }
  }

  render(): React.ReactNode {
    const { width, height } = this.props;

    return (
      <canvas
        ref={this.canvasRef}
        width={width || 1920}
        height={height || 1080}
        className={styles.canvas}
      />
    );
  }
}
