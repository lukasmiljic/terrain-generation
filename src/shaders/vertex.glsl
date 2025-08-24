#include ./noise/fractalBrownianMotion.glsl

varying float vHeight;

void main() {
  vec3 pos = position;
  vHeight = fractalBrownianMotion(pos.xy);
  pos.z = vHeight;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}