varying vec3 vWorldPosition;

uniform vec3 baseColor;
uniform vec3 highColor;

void main() {
  float height = pow((normalize(vWorldPosition).y + 1.0) * 0.5, 1.7);
  vec3 color = mix(highColor, baseColor, height);

  csm_FragColor = vec4(color, 1.0);
}