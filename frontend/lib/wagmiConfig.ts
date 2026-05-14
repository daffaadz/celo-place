import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { metaMask } from 'wagmi/connectors';

export const celoSepolia = defineChain({
  id: 44787,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: { http: ['https://alfajores-forno.celo-testnet.org'] },
  },
  blockExplorers: {
    default: { name: 'CeloScan', url: 'https://alfajores.celoscan.io' },
  },
});

export const celoMainnet = defineChain({
  id: 42220,
  name: 'Celo Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: { http: ['https://forno.celo.org'] },
  },
  blockExplorers: {
    default: { name: 'CeloScan', url: 'https://celoscan.io' },
  },
});

export const config = createConfig({
  chains: [celoSepolia, celoMainnet],
  connectors: [
    metaMask(),
  ],
  transports: {
    [celoSepolia.id]: http(),
    [celoMainnet.id]: http(),
  },
});
