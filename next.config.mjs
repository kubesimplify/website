/** @type {import('next').NextConfig} */
const nextConfig = {
  // static export only for builds; 'export' breaks dynamic routes under `next dev`
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
