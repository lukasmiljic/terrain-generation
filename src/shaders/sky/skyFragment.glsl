varying vec3 vWorldPosition;

void main() {
  vec3 baseColor = vec3(0.02, 0.66, 0.73);
  vec3 highColor = vec3(1.0, 1.0, 0.55);

  float height = pow((normalize(vWorldPosition).y + 1.0) * 0.5, 1.7);
  vec3 color = mix(highColor, baseColor, height);

  csm_FragColor = vec4(color, 1.0);
}