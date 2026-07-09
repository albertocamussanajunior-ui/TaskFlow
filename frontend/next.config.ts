import type { NextConfig } from "next";
import path from "path";

// const nextConfig: NextConfig = {
//   /* config options here */
// };
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.BACKEND_URL ?? "https://pms-alpha-0-0-1.onrender.com/pms/v1"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
