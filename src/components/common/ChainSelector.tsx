import { useState, useRef, useEffect } from 'react'
import { useChainId, useSwitchChain } from 'wagmi'
import { mainnet, base, arbitrum } from 'wagmi/chains'

const chains = [mainnet, base, arbitrum]

const chainLogos: Record<number, string> = {
  [mainnet.id]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  [base.id]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
  [arbitrum.id]: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
}

export function ChainSelector() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 md:gap-2 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg md:rounded-xl px-2.5 md:px-4 py-2 md:py-3 font-medium text-[var(--text-primary)] cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--bg-tertiary)]/80 transition-colors"
      >
        <img
          src={chainLogos[currentChain.id]}
          alt={currentChain.name}
          className="w-6 h-6 md:w-8 md:h-8 rounded-full"
        />
        <svg
          className={`w-4 h-4 md:w-5 md:h-5 text-[var(--text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50">
          {chains.map((chain) => {
            const isSelected = chain.id === chainId
            return (
              <button
                key={chain.id}
                onClick={() => {
                  switchChain({ chainId: chain.id })
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--accent)]/20 hover:text-white'
                }`}
              >
                <img
                  src={chainLogos[chain.id]}
                  alt={chain.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-base font-medium">{chain.name}</span>
                {isSelected && (
                  <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
