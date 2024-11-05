/** @type {import('next').NextConfig} */

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  webpack: config => {
    // config.module.rules.push({
    //   test: /\.sql$/,
    //   use: 'raw-loader',
    // });
    return config;
  },
};

export default nextConfig;
