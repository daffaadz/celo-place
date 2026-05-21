import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { metaMask, walletConnect } from 'wagmi/connectors';

export const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: { http: ['https://forno.celo-sepolia.celo-testnet.org'] },
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
  chains: [celoMainnet],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'CeloPlace',
        url: 'https://celo-place.vercel.app',
      }
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '6781457753c100ea5a2ed86ddb6c037c',
      showQrModal: true,
    }),
  ],
  transports: {
    [celoMainnet.id]: http(),
  },
});
