/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The nurse hotline number is read from the NURSE_HOTLINE env var at build time
  // and exposed to the browser so the Hotline screen can render a tel: link.
  env: {
    NEXT_PUBLIC_NURSE_HOTLINE: process.env.NURSE_HOTLINE || "1800 123 4567",
  },
};

export default nextConfig;
