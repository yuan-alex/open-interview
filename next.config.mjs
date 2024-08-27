/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["yjs", "libsql", "@y-sweet/sdk"],
  },
};

export default nextConfig;
