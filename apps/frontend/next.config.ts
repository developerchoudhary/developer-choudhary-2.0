import type { NextConfig } from "next";

const api = process.env.API_URL ?? "http://localhost:8080";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // In development uploads come from http://localhost:8080, which resolves to a private IP that the
    // optimizer blocks by default. Production serves uploads from the public site origin.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    qualities: [60, 75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      // local development: the Go API serves /uploads on :8080 and Next proxies it on :3000
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "localhost", port: "8080" },
      { protocol: "http", hostname: "localhost", port: "3000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8080" },
      // in-cluster service name, any port
      { protocol: "http", hostname: "portfolio-backend" },
      { protocol: "http", hostname: "portfolio-backend", port: "8080" },
    ],
  },
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${api}/api/v1/:path*` },
      { source: "/uploads/:path*", destination: `${api}/uploads/:path*` },
      // The favicon is drawn in the active theme's colours (src/app/brand/[asset]/route.tsx).
      { source: "/favicon.ico", destination: "/brand/favicon.ico" },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
