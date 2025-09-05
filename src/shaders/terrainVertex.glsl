#include ./noise/fractalBrownianMotion.glsl

uniform float uOffsetX;
uniform float uOffsetY;
uniform float uResolution;
uniform float uAmplitude;
uniform float uSize;
uniform bool uMask;
uniform float uMaskFadeStart;
uniform bool uFlatten;

varying vec3 vPosition;
varying vec3 vModelNormal;
varying float vHeight;

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

float squareMask(vec3 position) {
  vec2 center = vec2(0.0);
  vec2 dist = abs(position.xy - center);
  float maxDist = max(dist.x, dist.y);
  float normalizedDistance = maxDist / (uSize * 0.5);

  float falloff = 1.0 - smoothstep(0.9, 1.0, normalizedDistance);

  return falloff;
}

float mask(vec3 position) {
  float distanceFromCenter = length(position.xy);
  float normalizedDistance = pow(distanceFromCenter / (uSize / 2.0), uMaskFadeStart);
  float squareMask = squareMask(position);
  if (position.z <= 0.0)
    return position.z - normalizedDistance;

  return squareMask * position.z - normalizedDistance;
}

void main() {
  vec3 heightDisplacedPosition = position;
  vec2 offsetNoiseCoordinates = vec2(heightDisplacedPosition.x + uOffsetX, heightDisplacedPosition.y + uOffsetY);
  heightDisplacedPosition.z = fractalBrownianMotion(offsetNoiseCoordinates);

  if (uMask) {
    heightDisplacedPosition.z = mask(heightDisplacedPosition);
  }

  vHeight = heightDisplacedPosition.z;

  heightDisplacedPosition.z *= uAmplitude;

  float normalsCalculationOffset = 1.0 / uResolution * pow(uLacunarity, 2.0) * float(uOctaves);
  vec3 modelNormal = recalculateNormals(offsetNoiseCoordinates.xy, normalsCalculationOffset);

  if (uFlatten) {
    heightDisplacedPosition.z = 1.0;
  }

  vPosition = heightDisplacedPosition;
  vModelNormal = normalize(modelNormal);
  csm_Normal = normalize(modelNormal);
  csm_Position = heightDisplacedPosition;
}