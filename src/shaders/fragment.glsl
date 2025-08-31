uniform float uAmplitude;
uniform int uOctaves;
uniform float uPersistence;
uniform float uSize;
uniform bool uMask;
uniform bool uShowMask;
uniform float uMaskFadeStart;

varying float vHeight;
varying vec3 vPosition;

vec3 mask(vec3 inputColor, vec3 maskColor) {
  if (!uShowMask) {
    return inputColor;
  }

  float distanceFromCenter = length(vPosition.xy);

  float normalizedDistance = pow(distanceFromCenter / (uSize / 2.0), pow(uMaskFadeStart, 2.0));
  normalizedDistance = clamp(normalizedDistance, 0.0, 1.0);

  return mix(inputColor, maskColor, normalizedDistance);
}

void main() {
  vec3 lowColor = vec3(0.2);
  vec3 highColor = vec3(1.0);

  float normalizedHeight = (vHeight + 1.0) / 2.0;

  vec3 color = mix(lowColor, highColor, normalizedHeight);

  if (uMask) {
    color = mask(color, vec3(1.0, 0.2, 0.0));
  }

  csm_DiffuseColor = vec4(color, 1.0);
}
