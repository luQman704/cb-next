import type { NextConfig } from "next";

const LARAVEL_API = process.env.LARAVEL_API_URL || "http://cb-laravel.ddev.site";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy /api/* to Laravel, keeping session cookies on the same origin.
        // This avoids cross-origin SameSite cookie restrictions for guest carts.
        source: "/api/:path*",
        destination: `${LARAVEL_API}/api/:path*`,
      },
      {
        // Proxy /storage/* so product images are served from the same origin too.
        source: "/storage/:path*",
        destination: `${LARAVEL_API}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
