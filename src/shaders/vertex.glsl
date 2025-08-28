#include ./noise/fractalBrownianMotion.glsl

uniform float uResolution;
uniform float uAmplitude;

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

void main() {
  vec3 newPosition = position;
  vHeight = fractalBrownianMotion(newPosition.xy);
  newPosition.z = vHeight * uAmplitude;

  float offset = 1.0 / uResolution * pow(uLacunarity, 2.0) * float(uOctaves);
  vec3 modelNormal = recalculateNormals(newPosition.xy, offset);

  csm_Normal = normalize(modelNormal);
  csm_Position = newPosition;
}