/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['proshno-shared'],
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/builder',
        destination: '/create',
        permanent: true,
      },
      {
        source: '/generate',
        destination: '/create',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
