#include ../noise/simplex.glsl

uniform float uTime;
uniform float uWaveAmplitude;
uniform float uWaveSpeed;
uniform float uWaveScale;

varying vec3 vPosition;

void main() {
  vec3 basePosition = position;
  float falloffStart = 50.0;
  float falloffEnd = 100.0;
  float distanceFromCenter = length(basePosition.xy);
  float heightFalloff = smoothstep(falloffEnd, falloffStart, distanceFromCenter);

  vec2 animatedPosition = basePosition.xy + uTime * uWaveScale * uWaveSpeed;
  vec2 period = vec2(0.0);
  float rotation = 0.0;
  vec2 partialDerivative;

  float noiseHeight = psrdnoise(animatedPosition, period, rotation, partialDerivative);
  vPosition = vec3(basePosition.xy, noiseHeight);
  noiseHeight *= heightFalloff * uWaveAmplitude;

  vec3 surfaceNormal = normalize(vec3(-partialDerivative.x * uWaveAmplitude * 0.1, -partialDerivative.y * uWaveAmplitude * 0.1, 1.0));

  csm_Normal = surfaceNormal;
  csm_Position = vec3(basePosition.xy, noiseHeight);
}
