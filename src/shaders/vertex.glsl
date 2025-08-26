#include ./noise/fractalBrownianMotion.glsl

varying float vHeight;

void main() {
  vec3 newPosition = position;
  vHeight = fractalBrownianMotion(newPosition.xy);
  newPosition.z = vHeight;

  csm_Position = newPosition;
}