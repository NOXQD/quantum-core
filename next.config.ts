import type { NextConfig } from "next";

/**
 * Next.js 16 config — Quantum Core.
 *
 * - Turbopack is default in Next 16 (no flag required).
 * - We transpile three.js subpackages so RSC/SSR doesn't choke on ESM.
 * - GLSL shaders are kept as TS template-literal strings, so no custom loader needed.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js + r3f ecosystem ships pure ESM; ensure server transpiles it.
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-three/postprocessing",
    "postprocessing",
    "maath",
  ],
  experimental: {
    // Keep dev compiles fast across restarts (Next 16 fs cache, beta).
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
