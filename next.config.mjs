/** @type {import('next').NextConfig} */
const nextConfig = {
  cleanDistDir: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["yjs", "@y-sweet/sdk"]
};

export default nextConfig;
