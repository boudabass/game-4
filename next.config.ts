import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Appliquer cette règle à toutes les pages de l'application
        source: "/(.*)",
        headers: [
          {
            // Autorise l'intégration de cette app dans n'importe quel iframe (Odoo, Dyad, etc.)
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;