uniform float uAmplitude;

varying float vHeight;

void main() {
  vec3 lowColor = vec3(0.0);
  vec3 highColor = vec3(1.0);

  float normalizedHeight = ((vHeight / uAmplitude) + 1.0) / 2.0;

  vec3 color = mix(lowColor, highColor, normalizedHeight);

  gl_FragColor = vec4(color, 1.0);
}