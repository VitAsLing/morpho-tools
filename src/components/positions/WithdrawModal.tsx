import { useState, useEffect, useRef } from 'react'
import { useAccount, useChainId } from 'wagmi'
import type { UserPosition, MarketParams } from '@/types'
import { useWithdraw } from '@/hooks/useWithdraw'
import { addTransaction } from '@/lib/transactionStore'
import {
  formatTokenAmount,
  parseTokenAmount,
  getTokenLogoUrl,
  formatPercent,
  formatApy,
} from '@/lib/utils'

interface WithdrawModalProps {
  position: UserPosition
  onClose: () => void
}

export function WithdrawModal({ position, onClose }: WithdrawModalProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [amount, setAmount] = useState('')
  const { withdraw, isWithdrawing, isSuccess, reset, hash } = useWithdraw()
  const recordedRef = useRef(false)

  const market = position.market
  const parsedAmount = amount
    ? parseTokenAmount(amount, market.loanAsset.decimals)
    : 0n
  const maxAmount = position.supplyAssets

  const marketParams: MarketParams = {
    loanToken: market.loanAsset.address,
    collateralToken: market.collateralAsset?.address ?? '0x0000000000000000000000000000000000000000',
    oracle: (market as { oracleAddress?: string }).oracleAddress as `0x${string}` || '0x0000000000000000000000000000000000000000',
    irm: (market as { irmAddress?: string }).irmAddress as `0x${string}` || '0x0000000000000000000000000000000000000000',
    lltv: BigInt((market as { lltv?: string }).lltv || 0),
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    if (isSuccess && address && !recordedRef.current) {
      recordedRef.current = true
      // 记录 withdraw 交易到本地存储
      addTransaction(address, chainId, {
        type: 'withdraw',
        marketKey: market.uniqueKey,
        tokenAddress: market.loanAsset.address,
        tokenSymbol: market.loanAsset.symbol,
        amount: parsedAmount.toString(),
        decimals: market.loanAsset.decimals,
        timestamp: Date.now(),
        txHash: hash,
      })
      setTimeout(() => {
        reset()
        onClose()
      }, 2000)
    }
  }, [isSuccess, address, chainId, market, parsedAmount, hash, reset, onClose])

  const handleWithdraw = async () => {
    try {
      await withdraw(marketParams, parsedAmount)
    } catch (error) {
      console.error('Withdraw failed:', error)
    }
  }

  const handleMaxClick = () => {
    setAmount(
      formatTokenAmount(
        BigInt(maxAmount),
        market.loanAsset.decimals,
        market.loanAsset.decimals
      )
    )
  }

  const isValidAmount = parsedAmount > 0n && parsedAmount <= BigInt(maxAmount)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
          <div className="flex items-center gap-3">
            <img
              src={getTokenLogoUrl(market.loanAsset.address, market.loanAsset.logoURI)}
              alt={market.loanAsset.symbol}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Withdraw {market.loanAsset.symbol}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Market</span>
            <div className="flex items-center gap-2">
              <img
                src={getTokenLogoUrl(market.loanAsset.address, market.loanAsset.logoURI)}
                alt={market.loanAsset.symbol}
                className="w-5 h-5 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              <span className="text-[var(--text-primary)]">{market.loanAsset.symbol}</span>
              {market.collateralAsset && (
                <>
                  <span className="text-[var(--text-secondary)]">/</span>
                  <img
                    src={getTokenLogoUrl(market.collateralAsset.address, market.collateralAsset.logoURI)}
                    alt={market.collateralAsset.symbol}
                    className="w-5 h-5 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  <span className="text-[var(--text-primary)]">{market.collateralAsset.symbol}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Your Supply</span>
            <span className="text-[var(--success)] font-semibold">
              {formatTokenAmount(BigInt(maxAmount), market.loanAsset.decimals)} {market.loanAsset.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Utilization</span>
            <span className="text-[var(--text-primary)]">{formatPercent(market.state.utilization)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">LLTV</span>
            <span className="text-[var(--text-primary)]">{formatPercent(Number(market.lltv) / 1e18)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Net APY</span>
            <span className="text-[var(--success)] font-semibold">{formatApy(market.state.netSupplyApy)}</span>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label className="block text-sm text-[var(--text-secondary)]" style={{ marginBottom: '5px', marginTop: '5px' }}>Amount</label>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input pr-24 py-4"
              disabled={!isConnected}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={handleMaxClick}
                className="text-[var(--accent)] hover:text-[var(--accent-hover)] hover:opacity-80 text-sm font-medium cursor-pointer transition-all"
              >
                MAX
              </button>
              <span className="text-[var(--text-secondary)]">{market.loanAsset.symbol}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          {!isConnected ? (
            <button className="btn btn-primary w-full" disabled>
              Connect Wallet
            </button>
          ) : isSuccess ? (
            <button className="btn btn-primary w-full bg-[var(--success)]" disabled>
              Success!
            </button>
          ) : (
            <button
              onClick={handleWithdraw}
              disabled={!isValidAmount || isWithdrawing}
              className="btn btn-primary w-full"
            >
              {isWithdrawing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 spinner" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Withdrawing...
                </span>
              ) : (
                `Withdraw ${market.loanAsset.symbol}`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
