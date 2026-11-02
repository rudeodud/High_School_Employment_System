import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 빌드에서는 실행에 필요한 파일만 standalone 폴더에 모읍니다.
  ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" as const } : {}),
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
