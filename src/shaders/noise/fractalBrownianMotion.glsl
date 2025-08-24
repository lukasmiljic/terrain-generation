#include ./simplex.glsl

uniform float uFrequency;
uniform float uAmplitude;
uniform int uOctaves;
uniform float uLacunarity;
uniform float uPersistance;

float fractalBrownianMotion(vec2 position) {
  float calculatedValue = 0.0;
  float currentAmplitude = uAmplitude;
  float currentFrquency = uFrequency;

  // simplex noise related values
  vec2 period = vec2(0.0);
  float alpha = 0.0;
  vec2 gradient;

  for (int i = 0; i < uOctaves; i++) {
    calculatedValue += psrdnoise(position * currentFrquency, period, alpha, gradient) * currentAmplitude;
    currentFrquency *= uLacunarity;
    currentAmplitude *= uPersistance;
  }

  return calculatedValue;
}