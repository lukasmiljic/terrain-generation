uniform float uAmplitude;
uniform int uOctaves;
uniform float uPersistence;
uniform float uSize;
uniform bool uMask;
uniform bool uShowMask;
uniform float uMaskFadeStart;
uniform vec3 uColorsLow[4];
uniform vec3 uColorsHigh[4];
uniform float uStops[4];
uniform float uSlopeThreshold;
uniform float uSlopeBlend;

varying float vHeight;
varying vec3 vPosition;
varying vec3 vModelNormal;

int findColorIndex(float height) {
  for (int i = 0; i < 4 - 1; i++) {
    if (height <= uStops[i + 1]) {
      return i;
    }
  }
  return 2;
}

vec3 getHeightColor(float height, bool isHighSlope) {
  int index = findColorIndex(height);
  float t = (height - uStops[index]) / (uStops[index + 1] - uStops[index]);

  if (isHighSlope) {
    return mix(uColorsHigh[index], uColorsHigh[index + 1], t);
  } else {
    return mix(uColorsLow[index], uColorsLow[index + 1], t);
  }
}

vec3 getSlopeBlendedColor(float height, float slope) {
  float slopeFactor = 1.0 - abs(vModelNormal.z);

  float slopeBlendAmount = smoothstep(uSlopeThreshold - uSlopeBlend, uSlopeThreshold + uSlopeBlend, slopeFactor);

  vec3 lowSlopeColor = getHeightColor(height, false);
  vec3 highSlopeColor = getHeightColor(height, true);

  return mix(lowSlopeColor, highSlopeColor, slopeBlendAmount);
}

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
  float normalizedHeight = (vHeight + 1.0) / 2.0;
  float slope = 1.0 - abs(vModelNormal.z);

  vec3 color = getSlopeBlendedColor(normalizedHeight, slope);

  if (uMask) {
    color = mask(color, vec3(1.0, 0.2, 0.0));
  }

  csm_DiffuseColor = vec4(color, 1.0);
}
