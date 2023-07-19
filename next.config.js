/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive-thirdparty.googleusercontent.com',
      },
    ],
  },
}

module.exports = nextConfig
