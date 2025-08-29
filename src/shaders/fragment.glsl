uniform float uAmplitude;
uniform int uOctaves;
uniform float uPersistence;

varying float vHeight;

void main() {
  vec3 lowColor = vec3(0.2);
  vec3 highColor = vec3(1.0);

  float normalizedHeight = (vHeight + 1.0) / 2.0;

  vec3 color = mix(lowColor, highColor, normalizedHeight);

  csm_DiffuseColor = vec4(color, 1.0);
}
