import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@zenpomo/core", "@zenpomo/supabase"],
};

export default nextConfig;
