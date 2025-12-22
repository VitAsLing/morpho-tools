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
    projectId: 'demo',
  }
)

const config = createConfig({
  connectors,
  chains: [mainnet, base, arbitrum, hyperEvm],
  transports: {
    [mainnet.id]: fallback([
      http('https://eth.llamarpc.com'),
      http('https://cloudflare-eth.com'),
      http('https://1rpc.io/eth'),
      http(),
    ]),
    [base.id]: fallback([
      http('https://base.llamarpc.com'),
      http('https://mainnet.base.org'),
      http('https://1rpc.io/base'),
      http(),
    ]),
    [arbitrum.id]: fallback([
      http('https://arb1.arbitrum.io/rpc'),
      http('https://1rpc.io/arb'),
      http(),
    ]),
    [hyperEvm.id]: fallback([
      http('https://rpc.hyperliquid.xyz/evm'),
      http(),
    ]),
  },
})

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#3b82f6',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
