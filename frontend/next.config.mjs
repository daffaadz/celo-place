/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // wagmi v2 bundles ALL connectors together, each with optional peer deps.
    // We only use metaMask, so we stub out all unused connector peer deps.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "porto": false,
      "porto/internal": false,
      "@base-org/account": false,
      "@coinbase/wallet-sdk": false,
      "@metamask/connect-evm": false,
      "@safe-global/safe-apps-sdk": false,
      "encoding": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
