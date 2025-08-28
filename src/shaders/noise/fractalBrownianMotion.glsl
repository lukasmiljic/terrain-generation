#include ./simplex.glsl

uniform float uScale;
uniform int uOctaves;
uniform float uLacunarity;
uniform float uPersistence;
uniform float uOctaveRotationDelta;
uniform bool uIsRidged;
uniform bool uSharpen;

varying float vHeight;

float convertToRidged(float inputValue) {
  return 1.0 - abs(inputValue);
}

float sharpen(float inputValue) {
  return pow(inputValue, 2.0);
}

float fractalBrownianMotion(vec2 position) {
  float calculatedValue = 0.0;
  float currentAmplitude = 1.0;
  float currentFrquency = 0.5;
  float currentAngle = 0.0;

  // simplex noise related values
  vec2 period = vec2(0.0);
  vec2 gradient;

  for (int i = 0; i < uOctaves; i++) {
    calculatedValue += psrdnoise(position * currentFrquency * uScale, period, currentAngle, gradient) * currentAmplitude;
    currentFrquency *= uLacunarity;
    currentAmplitude *= uPersistence;
    currentAngle += uOctaveRotationDelta;
  }

  if (uIsRidged == true) {
    calculatedValue = convertToRidged(calculatedValue);
  }

  if (uSharpen == true) {
    calculatedValue = sharpen(calculatedValue);
  }

  vHeight = calculatedValue;
  return vHeight;
}