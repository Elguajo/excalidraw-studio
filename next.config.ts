import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@excalidraw/excalidraw"],
  serverExternalPackages: ["@copilotkit/runtime"],
};

export default nextConfig;
