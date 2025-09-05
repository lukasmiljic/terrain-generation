const int COLOR_STOPS_COUNT = 4;

uniform float uAmplitude;
uniform int uOctaves;
uniform float uPersistence;
uniform float uSize;
uniform bool uMask;
uniform bool uShowMask;
uniform float uMaskFadeStart;
uniform vec3 uColorsLow[COLOR_STOPS_COUNT];
uniform vec3 uColorsHigh[COLOR_STOPS_COUNT];
uniform float uStops[COLOR_STOPS_COUNT];
uniform float uSlopeThreshold;
uniform float uSlopeBlend;
uniform bool uColors;

varying float vHeight;
varying vec3 vPosition;
varying vec3 vModelNormal;

int findColorIndex(float terrainHeight) {
  for (int i = 0; i < COLOR_STOPS_COUNT - 1; i++) {
    float nextColorStopStartHeight = uStops[i + 1];
    if (terrainHeight <= nextColorStopStartHeight) {
      return i;
    }
  }
  return COLOR_STOPS_COUNT - 2;
}

float calculateInterpolationFactor(float height, int intervalIndex) {
  float lowerStopHeight = uStops[intervalIndex];
  float upperStopHeight = uStops[intervalIndex + 1];
  float intervalRange = upperStopHeight - lowerStopHeight;

  return (height - lowerStopHeight) / intervalRange;
}

vec3 interpolateColorInInterval(int intervalIndex, float interpolationFactor, bool useHighSlopeColors) {
  if (useHighSlopeColors) {
    return mix(uColorsHigh[intervalIndex], uColorsHigh[intervalIndex + 1], interpolationFactor);
  } else {
    return mix(uColorsLow[intervalIndex], uColorsLow[intervalIndex + 1], interpolationFactor);
  }
}

vec3 getHeightColor(float height, bool isHighSlope) {
  int intervalIndex = findColorIndex(height);
  float interpolationFactor = calculateInterpolationFactor(height, intervalIndex);

  return interpolateColorInInterval(intervalIndex, interpolationFactor, isHighSlope);
}

vec3 getSlopeBlendedColor(float height) {
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
  vec3 color;

  if (uColors) {
    color = getSlopeBlendedColor(normalizedHeight);
  } else {
    color = vec3(mix(0.1, 1.0, normalizedHeight));
  }

  if (uMask) {
    color = mask(color, vec3(1.0, 0.2, 0.0));
  }

  csm_DiffuseColor = vec4(color, 1.0);
}
