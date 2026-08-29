/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permet à Next.js de compiler le package interne écrit en TypeScript
  transpilePackages: ["@carthage-clean/types"],
};

export default nextConfig;
