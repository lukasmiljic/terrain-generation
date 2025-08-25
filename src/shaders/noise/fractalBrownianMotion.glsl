#include ./simplex.glsl

uniform float uFrequency;
uniform float uAmplitude;
uniform int uOctaves;
uniform float uLacunarity;
uniform float uPersistence;
uniform float uOctaveRotationDelta;

float fractalBrownianMotion(vec2 position) {
  float calculatedValue = 0.0;
  float currentAmplitude = uAmplitude;
  float currentFrquency = uFrequency;
  float currentAngle = 0.0;

  // simplex noise related values
  vec2 period = vec2(0.0);
  vec2 gradient;

  for (int i = 0; i < uOctaves; i++) {
    calculatedValue += psrdnoise(position * currentFrquency, period, currentAngle, gradient) * currentAmplitude;
    currentFrquency *= uLacunarity;
    currentAmplitude *= uPersistence;
    currentAngle += uOctaveRotationDelta;
  }

  return calculatedValue;
}