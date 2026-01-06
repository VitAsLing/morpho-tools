import { useState, useRef, useEffect } from 'react'
import { useChainId, useSwitchChain, useAccount } from 'wagmi'
import { mainnet, base, arbitrum } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { hyperEvm } from '@/lib/morpho/constants'
import { setStoredChainId, getStoredChainId } from '@/providers/Web3Provider'

const chains = [mainnet, base, arbitrum, hyperEvm]

const chainLogos: Record<number, string> = {
  [mainnet.id]: '/chain/ethereum.png',
  [base.id]: '/chain/base.png',
  [arbitrum.id]: '/chain/arbitrum.png',
  [hyperEvm.id]: '/chain/hyperEvm.png',
}

export function ChainSelector() {
  const { isConnected } = useAccount()
  const connectedChainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [selectedChainId, setSelectedChainId] = useState(() => getStoredChainId())

  // 钱包连接后，同步钱包的链到本地状态
  useEffect(() => {
    if (isConnected) {
      setSelectedChainId(connectedChainId)
      setStoredChainId(connectedChainId)
    }
  }, [isConnected, connectedChainId])

  // 使用：已连接时用钱包链，未连接时用本地选择的链
  const chainId = isConnected ? connectedChainId : selectedChainId
  const currentChain = chains.find((c) => c.id === chainId) || mainnet

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="hover:border-[var(--accent)]"
        style={{ padding: '6px 10px', gap: '4px', height: 'auto' }}
      >
        <img
          src={chainLogos[currentChain.id]}
          alt={currentChain.name}
          className="w-6 h-6 rounded-full"
        />
        <svg
          className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50">
          {chains.map((chain) => {
            const isSelected = chain.id === chainId
            return (
              <Button
                key={chain.id}
                variant="ghost"
                onClick={async () => {
                  try {
                    if (isConnected) {
                      await switchChain({ chainId: chain.id })
                    }
                    // 无论是否连接，都保存选择
                    setSelectedChainId(chain.id)
                    setStoredChainId(chain.id)
                  } catch (error) {
                    console.error('Failed to switch chain:', error)
                  }
                  setIsOpen(false)
                }}
                className={`w-full gap-3 px-4 py-3 rounded-none ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--accent)]/20 hover:text-white'
                }`}
                style={{ height: 'auto', justifyContent: 'flex-start', textAlign: 'left' }}
              >
                <img
                  src={chainLogos[chain.id]}
                  alt={chain.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-base font-medium">{chain.name}</span>
                {isSelected && (
                  <svg style={{ width: '24px', height: '24px', marginLeft: 'auto' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
