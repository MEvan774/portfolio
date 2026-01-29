// dot-transition-shader.glsl
// Fragment shader for dot pattern page transitions
// Converted from Godot shader for use in WebGL

// VERTEX SHADER (use this with your WebGL setup)
const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// FRAGMENT SHADER (the main shader logic)
const fragmentShaderSource = `
  precision mediump float;
  
  varying vec2 v_uv;
  
  uniform vec2 u_resolution;
  uniform float u_spacing;
  uniform float u_animation_progress;
  uniform float u_dot_size;
  uniform vec3 u_dot_color;
  
  void main() {
    // 1. Progress zero - don't show anything
    if (u_animation_progress <= 0.0) {
      discard;
    }
    
    // 2. Calculate screen grid size
    vec2 screen_size = u_resolution;
    vec2 grid_count = floor(screen_size / u_spacing);
    
    // 3. Calculate normalized grid position [0,1]
    vec2 norm_pos = v_uv * screen_size / (grid_count * u_spacing);
    
    // 4. Diagonal delay calculation (top-left 0 → bottom-right 1)
    float delay = (norm_pos.x + norm_pos.y) * 0.5;
    
    // 5. Position-based delay threshold
    float visible_threshold = delay * 0.1 + 0.01;
    if (u_animation_progress < visible_threshold) {
      discard;
    }
    
    // 6. Dynamic transition calculation
    float transition = 0.3;
    float scale = smoothstep(
      delay - transition,
      delay + transition,
      u_animation_progress * (1.0 + transition)
    );
    
    // Size-based filtering
    if (scale < 0.005) {
      discard;
    }
    
    // 7. Calculate dot
    vec2 grid_center = (floor(v_uv * screen_size / u_spacing) + 0.5) * u_spacing;
    float dist = length(v_uv * screen_size - grid_center);
    float dot_radius = u_dot_size * scale * u_spacing * 0.8;
    
    // 8. Edge softening
    float alpha = 1.0 - smoothstep(
      max(dot_radius - 1.5, 0.0),
      dot_radius + 1.5,
      dist
    );
    
    // Alpha filtering
    if (alpha < 0.01) discard;
    
    gl_FragColor = vec4(u_dot_color, alpha);
  }
`;

// Export for use in your React app
export { vertexShaderSource, fragmentShaderSource };