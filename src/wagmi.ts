import { http, createConfig, fallback } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

const projectId = '2bc8afd6aed2c8968b70a0bb374c87cd';

// 自定义本地链配置
export const localhost = defineChain({
  id: 31337, // Hardhat默认链ID
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: '' },
  },
});

export const config = createConfig({
  chains: [localhost, mainnet, sepolia],
  connectors: [injected(), metaMask(), walletConnect({ projectId })],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545', {
      timeout: 10000, // 10秒超时
    }),
    [mainnet.id]: http('https://ethereum.publicnode.com', {
      timeout: 10000,
      retryCount: 3,
    }),
    [sepolia.id]: fallback(
      [
        http('https://ethereum-sepolia.publicnode.com', {
          timeout: 15000,
          retryCount: 2,
        }),
        http('https://sepolia.infura.io/v3/d6150d4bab92441bb828dd5674ec7766', {
          timeout: 10000,
          retryCount: 2,
        }),
        http('https://rpc.sepolia.org', {
          timeout: 10000,
          retryCount: 2,
        }),
      ],
      { rank: false },
    ),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
