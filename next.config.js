/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["vercel-blob.com", "localhost:3000", "abhinav-baldha.vercel.app"],
  },
};

module.exports = nextConfig;
