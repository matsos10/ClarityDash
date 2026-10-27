import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/offline", revision: process.env.SOURCE_COMMIT ?? String(Date.now()) }],
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
  async rewrites() {
    // Digital Asset Links pour l'APK TWA
    return [{ source: "/.well-known/assetlinks.json", destination: "/api/assetlinks" }];
  },
};

export default withSerwist(nextConfig);
