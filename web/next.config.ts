import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // web/src/domain re-exports app/domain (the shared canonical role/status
  // contracts), which lives outside this Next.js project's root directory.
  // externalDir permits the cross-directory import; Turbopack additionally
  // needs its own root pointed at the repo root to actually traverse there.
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
