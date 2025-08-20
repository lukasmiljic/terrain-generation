varying float vHeight;

void main() {
  // Create a color gradient based on height
  vec3 lowColor = vec3(0.2, 0.4, 0.1);   // dark green for valleys
  vec3 midColor = vec3(0.4, 0.6, 0.2);   // lighter green for mid elevations
  vec3 highColor = vec3(0.8, 0.8, 0.6);  // light tan for peaks

  float normalizedHeight = (vHeight + 5.0) / 10.0; // normalize height range
  normalizedHeight = clamp(normalizedHeight, 0.0, 1.0);

  vec3 color;
  if (normalizedHeight < 0.5) {
    color = mix(lowColor, midColor, normalizedHeight * 2.0);
  } else {
    color = mix(midColor, highColor, (normalizedHeight - 0.5) * 2.0);
  }

  gl_FragColor = vec4(color, 1.0);
}