/**
 * Plasma ring shader — applied to thin TorusGeometry rings around the core.
 * Produces an emissive flowing band with hot streaks racing along its length.
 */

export const plasmaVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const plasmaFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uSpeed;
  uniform float uIntensity;

  // Cheap hash + noise — no expensive simplex needed for a 1D streak field
  float hash(float n){return fract(sin(n)*43758.5453);}
  float n1d(float x){
    float i=floor(x); float f=fract(x);
    return mix(hash(i),hash(i+1.0),smoothstep(0.0,1.0,f));
  }

  void main() {
    // Streaks travel around the ring along U
    float t = uTime * uSpeed;
    float streaks = 0.0;
    streaks += pow(n1d(vUv.x * 14.0 + t * 1.0), 8.0);
    streaks += pow(n1d(vUv.x * 28.0 - t * 1.5), 12.0) * 0.7;
    streaks += pow(n1d(vUv.x * 56.0 + t * 2.0), 16.0) * 0.4;

    // Cross-section falloff (bright center of the torus tube)
    float band = 1.0 - smoothstep(0.0, 0.5, abs(vUv.y - 0.5) * 2.0);
    band = pow(band, 2.0);

    float a = clamp(streaks * band, 0.0, 1.0);
    vec3 col = uColor * a * uIntensity;

    gl_FragColor = vec4(col, a);
  }
`;
