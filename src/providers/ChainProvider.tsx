import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useChainId as useWagmiChainId, useAccount } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { CHAIN_MAP } from '@/lib/morpho/constants'

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

function setStoredChainId(chainId: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CHAIN_STORAGE_KEY, chainId.toString())
}

interface ChainContextType {
  chainId: number
  setChainId: (chainId: number) => void
}

const ChainContext = createContext<ChainContextType | null>(null)

export function ChainProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount()
  const wagmiChainId = useWagmiChainId()
  const [selectedChainId, setSelectedChainId] = useState(() => getStoredChainId())

  // 钱包连接后，同步钱包的链到本地状态
  useEffect(() => {
    if (isConnected && wagmiChainId) {
      setSelectedChainId(wagmiChainId)
      setStoredChainId(wagmiChainId)
    }
  }, [isConnected, wagmiChainId])

  // 当前使用的链：已连接用钱包链，未连接用本地选择
  const chainId = isConnected ? wagmiChainId : selectedChainId

  const setChainId = useCallback((newChainId: number) => {
    setSelectedChainId(newChainId)
    setStoredChainId(newChainId)
  }, [])

  return (
    <ChainContext.Provider value={{ chainId, setChainId }}>
      {children}
    </ChainContext.Provider>
  )
}

export function useSelectedChainId(): number {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('useSelectedChainId must be used within ChainProvider')
  }
  return context.chainId
}

export function useSetChainId(): (chainId: number) => void {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('useSetChainId must be used within ChainProvider')
  }
  return context.setChainId
}
