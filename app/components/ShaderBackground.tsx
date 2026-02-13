'use client';

import { useEffect, useRef } from 'react';

const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Enable derivatives extension if available (for better antialiasing)
    const derivExt = gl.getExtension('OES_standard_derivatives');
    if (derivExt) {
      console.log('OES_standard_derivatives enabled');
    }

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader with diagonal scroll and pulse nodes
    const fragmentShaderSource = `
      #ifdef GL_OES_standard_derivatives
      #extension GL_OES_standard_derivatives : enable
      #endif
      
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform float u_scroll;

      // Random function for node placement
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        // Use gl_FragCoord for pixel position + scroll offset
        vec2 pixelPos = gl_FragCoord.xy + vec2(0.0, u_scroll / 2.0);
        vec2 uv = pixelPos / u_resolution;
        
        // Diagonal scroll effect (moving bottom-left to top-right)
        float scrollSpeed = 0.05; // Adjust speed (higher = faster)
        vec2 scrollOffset = vec2(u_time * scrollSpeed, u_time * scrollSpeed);
        
        // Grid calculation with scroll
        float gridSize = 32.0;
        vec2 gridUV = (pixelPos / gridSize) + scrollOffset;
        
        // Manual derivative approximation (works without extension)
        float lineThickness = 40.0; // Adjust between 50.0 (very thick) and 2.0 (very thin)
        float pixelSize = lineThickness / u_resolution.y;
        vec2 grid = abs(fract(gridUV - 0.5) - 0.5) / pixelSize;
        float line = min(grid.x, grid.y);
        float gridPattern = 1.0 - min(line, 1.0);
        
        // Top falloff - fade from top (using original uv for screen-space fade)
        float screenUV_y = gl_FragCoord.y / u_resolution.y;
        float falloff = smoothstep(0.0, 0.9, 1.0 - screenUV_y);
        gridPattern *= falloff;
        
        // Pulse nodes at grid intersections (not cell centers)
        // Manual round function for WebGL 1
        vec2 gridIntersection = floor(gridUV + 0.5); // Snap to nearest intersection
        float nodeRandom = random(gridIntersection);
        
        // Only show nodes on some intersections (20% chance)
        float nodeThreshold = 0.8;
        float showNode = step(nodeThreshold, nodeRandom);
        
        // Pulse animation with offset based on position
        float pulseSpeed = 2.0;
        float pulseOffset = nodeRandom * 6.28; // Random phase offset
        float pulse = sin(u_time * pulseSpeed + pulseOffset) * 0.5 + 0.5;
        pulse = pow(pulse, 4.0); // Make pulse sharper
        
        // Distance from grid intersection (not cell center)
        vec2 distToIntersection = gridUV - gridIntersection;
        float distToNode = length(distToIntersection);
        float nodeRadius = 0.15;
        float nodeMask = 1.0 - smoothstep(0.0, nodeRadius, distToNode);
        
        // Combine node glow
        float nodeGlow = nodeMask * pulse * showNode * falloff;
        
        // Colors
        vec3 baseColor = vec3(0.0, 0.686, 0.78); // #00AFC7
        vec3 gridColor = vec3(0.467, 0.804, 1.0); // #77cdff
        vec3 nodeColor = vec3(1.0, 1.0, 1.0); // White for pulse nodes
        
        // Mix colors
        vec3 color = mix(baseColor, gridColor, gridPattern * 0.5);
        color = mix(color, nodeColor, nodeGlow * 0.7);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Compile shader
    function compileShader(source: string, type: number) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry (full screen quad)
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const scrollLocation = gl.getUniformLocation(program, 'u_scroll');

    // Handle resize
    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Scroll tracking
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize

    // Animation loop
    const startTime = Date.now();
    const render = () => {
      const time = (Date.now() - startTime) * 0.001;

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time);
      gl.uniform1f(scrollLocation, scrollRef.current);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafRef.current = requestAnimationFrame(render);
    };
    render();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default ShaderBackground;