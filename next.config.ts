import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/cpf",
        destination: "/accompagnements",
        permanent: true,
      },
      {
        source: "/cpf/:path*",
        destination: "/accompagnements",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
