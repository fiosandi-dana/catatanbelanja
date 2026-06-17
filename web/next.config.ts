import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin file-tracing root to this app so Next doesn't get confused by an
  // unrelated lockfile in a parent directory (e.g. ~/package-lock.json).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
