#include ./noise/fractalBrownianMotion.glsl

uniform float uOffsetX;
uniform float uOffsetY;
uniform float uResolution;
uniform float uAmplitude;
uniform float uSize;
uniform bool uMask;
uniform float uMaskFadeStart;

varying vec3 vPosition;

vec3 recalculateNormals(vec2 samplePos, float offset) {
  float hR = fractalBrownianMotion(vec2(samplePos.x + offset, samplePos.y)) * uAmplitude;
  float hL = fractalBrownianMotion(vec2(samplePos.x - offset, samplePos.y)) * uAmplitude;
  float hU = fractalBrownianMotion(vec2(samplePos.x, samplePos.y + offset)) * uAmplitude;
  float hD = fractalBrownianMotion(vec2(samplePos.x, samplePos.y - offset)) * uAmplitude;

  // cross-product of tangent vectors
  vec3 tangentX = normalize(vec3(2.0 * offset, 0.0, hR - hL));
  vec3 tangentY = normalize(vec3(0.0, 2.0 * offset, hU - hD));
  return normalize(cross(tangentX, tangentY));
}

float radialMask(vec3 position) {
  float distanceFromCenter = length(position.xy);
  float normalizedDistance = pow(distanceFromCenter / (uSize / 2.0), uMaskFadeStart);

  return position.z - normalizedDistance;
}

void main() {
  vec3 newPosition = position;
  vec2 offsetPosition = vec2(newPosition.x + uOffsetX, newPosition.y + uOffsetY);
  newPosition.z = fractalBrownianMotion(offsetPosition);

  if (uMask) {
    vHeight = radialMask(newPosition);
    newPosition.z = vHeight;
  }

  newPosition.z *= uAmplitude;

  float normalsCalculationOffset = 1.0 / uResolution * pow(uLacunarity, 2.0) * float(uOctaves);
  vec3 modelNormal = recalculateNormals(offsetPosition.xy, normalsCalculationOffset);

  vPosition = newPosition;
  csm_Normal = normalize(modelNormal);
  csm_Position = newPosition;
}