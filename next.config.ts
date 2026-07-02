import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    // pdfjs-dist optionally depends on `canvas` (Node.js-only).
    // Alias it to false so the client bundle doesn't try to resolve it.
    resolveAlias: {
      canvas: { browser: "./empty-module.js" },
    },
  },
  webpack: (config) => {
    // Fallback for production builds which still use webpack
    config.resolve.alias.canvas = false;
    return config;
  },
  allowedDevOrigins: [
    // "http://localhost:3000",
    // "https://digi-kelas.vercel.app",
    "loving-liger-previously.ngrok-free.app",
  ],
};

export default nextConfig;
