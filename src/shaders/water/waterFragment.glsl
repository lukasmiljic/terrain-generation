uniform vec3 uColor;
uniform float uOpacityFadeStart;
uniform float uOpacity;
uniform float uBlendWidth;

varying vec3 vPosition;

void main() {
  float distance = length(vPosition.xy);
  float alphaBlendFactor = smoothstep(uOpacityFadeStart - uBlendWidth, uOpacityFadeStart + uBlendWidth, distance);
  float alpha = mix(uOpacity, 1.0, alphaBlendFactor);

  csm_DiffuseColor = vec4(uColor, alpha);
}