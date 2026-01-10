import { WagmiProvider, http, fallback, createConfig } from 'wagmi'
import { mainnet, base, arbitrum, hyperEvm } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme, connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  okxWallet,
  oneKeyWallet,
  rabbyWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets'
import type { ReactNode } from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { RPC_URLS, CHAIN_MAP } from '@/lib/morpho/constants'
import { ChainProvider } from './ChainProvider'

const CHAIN_STORAGE_KEY = 'morpho-tools-chain'

function getStoredChainId(): number {
  if (typeof window === 'undefined') return mainnet.id
  const stored = localStorage.getItem(CHAIN_STORAGE_KEY)
  if (stored) {
    const chainId = parseInt(stored, 10)
    if (CHAIN_MAP[chainId]) return chainId
  }
  return mainnet.id
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
})

// 使用 connectorsForWallets 手动配置钱包列表
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        oneKeyWallet,
        rabbyWallet,
        okxWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: 'Morpho Tools',
    // WalletConnect projectId - 生产环境应替换为真实的 projectId
    // 从 https://cloud.walletconnect.com 获取
    projectId: 'demo',
  }
)

const config = createConfig({
  connectors,
  chains: [mainnet, base, arbitrum, hyperEvm],
  transports: {
    [mainnet.id]: fallback([
      ...RPC_URLS[1].map(url => http(url)),
      http(),
    ]),
    [base.id]: fallback([
      ...RPC_URLS[8453].map(url => http(url)),
      http(),
    ]),
    [arbitrum.id]: fallback([
      ...RPC_URLS[42161].map(url => http(url)),
      http(),
    ]),
    [hyperEvm.id]: fallback([
      ...RPC_URLS[999].map(url => http(url)),
      http(),
    ]),
  },
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const initialChainId = getStoredChainId()
  const initialChain = CHAIN_MAP[initialChainId] || mainnet

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={initialChain}
          theme={darkTheme({
            accentColor: '#3b82f6',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          <ChainProvider>
            {children}
          </ChainProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
