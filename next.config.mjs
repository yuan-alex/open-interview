/** @type {import('next').NextConfig} */
const nextConfig = {
  cleanDistDir: true,
  productionBrowserSourceMaps: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["yjs", "@y-sweet/sdk"],
  },
};

export default nextConfig;
