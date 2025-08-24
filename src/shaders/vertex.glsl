#include ./noise/simplex.glsl

uniform float uFrequency;
uniform float uAmplitude;
uniform int uOctaves;
uniform float uLacunarity;
uniform float uPersistance;

varying float vHeight;

void main() {
  vec3 pos = position;

  vec2 samplePoint = pos.xy * uFrequency;
  vec2 period = vec2(0.0);
  float alpha = 0.0;
  vec2 gradient;

  vHeight = psrdnoise(samplePoint, period, alpha, gradient) * uAmplitude;

  pos.z = vHeight;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}