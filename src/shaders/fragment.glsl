uniform float uAmplitude;
uniform int uOctaves;
uniform float uPersistence;

varying float vHeight;

void main() {
  vec3 lowColor = vec3(0.0);
  vec3 highColor = vec3(1.0);

  float maxPossibleValue = uAmplitude * (1.0 - pow(uPersistence, float(uOctaves))) / (1.0 - uPersistence);
  float normalizedHeight = (vHeight / maxPossibleValue + 1.0) / 2.0;

  vec3 color = mix(lowColor, highColor, normalizedHeight);

  csm_FragColor = vec4(color, 1.0);
}