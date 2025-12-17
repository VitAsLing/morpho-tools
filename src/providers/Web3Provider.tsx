import { WagmiProvider, http, fallback } from 'wagmi'
import { mainnet, base, arbitrum } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
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

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

const config = getDefaultConfig({
  appName: 'Morpho Tools',
  projectId,
  chains: [mainnet, base, arbitrum],
  transports: {
    [mainnet.id]: fallback([
      http('https://eth.llamarpc.com'),
      http('https://rpc.ankr.com/eth'),
      http('https://cloudflare-eth.com'),
      http(),
    ]),
    [base.id]: fallback([
      http('https://base.llamarpc.com'),
      http('https://rpc.ankr.com/base'),
      http(),
    ]),
    [arbitrum.id]: fallback([
      http('https://arbitrum.llamarpc.com'),
      http('https://rpc.ankr.com/arbitrum'),
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
