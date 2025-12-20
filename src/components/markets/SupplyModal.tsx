import { useState, useEffect, useRef } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { maxUint256 } from 'viem'
import type { Market, MarketParams } from '@/types'
import { useTokenApproval } from '@/hooks/useTokenApproval'
import { useSupply } from '@/hooks/useSupply'
import { addTransaction } from '@/lib/transactionStore'
import { addToast } from '@/lib/toastStore'
import { getChainConfig } from '@/lib/morpho/constants'
import { Button } from '@/components/ui/button'
import {
  formatUsd,
  formatPercent,
  formatApy,
  formatTokenAmount,
  parseTokenAmount,
  getTokenLogoUrl,
} from '@/lib/utils'

interface SupplyModalProps {
  market: Market
  onClose: () => void
}

export function SupplyModal({ market, onClose }: SupplyModalProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [amount, setAmount] = useState('')
  const { balance, approve, needsApproval, refetchBalance } = useTokenApproval(
    market.loanAsset.address
  )
  const chainConfig = getChainConfig(chainId)
  const { supply, isSupplying, isSuccess, reset, hash } = useSupply()
  const recordedRef = useRef(false)
  const [approvalState, setApprovalState] = useState<'idle' | 'pending' | 'success'>('idle')

  const parsedAmount = amount ? parseTokenAmount(amount, market.loanAsset.decimals) : 0n
  const requiresApproval = parsedAmount > 0n && needsApproval(parsedAmount)

  const totalSupplyUsd =
    (Number(market.state.supplyAssets) / 10 ** market.loanAsset.decimals) *
    (market.loanAsset.priceUsd ?? 0)
  const totalBorrowUsd =
    (Number(market.state.borrowAssets) / 10 ** market.loanAsset.decimals) *
    (market.loanAsset.priceUsd ?? 0)
  const liquidityUsd = totalSupplyUsd - totalBorrowUsd

  const marketParams: MarketParams = {
    loanToken: market.loanAsset.address,
    collateralToken: market.collateralAsset?.address ?? '0x0000000000000000000000000000000000000000',
    oracle: market.oracleAddress,
    irm: market.irmAddress,
    lltv: BigInt(market.lltv),
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
      // 记录 supply 交易到本地存储
      addTransaction(address, chainId, {
        type: 'supply',
        marketKey: market.uniqueKey,
        tokenAddress: market.loanAsset.address,
        tokenSymbol: market.loanAsset.symbol,
        amount: parsedAmount.toString(),
        decimals: market.loanAsset.decimals,
        timestamp: Date.now(),
        txHash: hash,
      })
      // Toast 通知
      addToast('success', `Supplied ${formatTokenAmount(parsedAmount, market.loanAsset.decimals)} ${market.loanAsset.symbol}`, {
        url: `${chainConfig.explorerUrl}/tx/${hash}`,
        text: 'View transaction',
      })
      refetchBalance()
      setTimeout(() => {
        reset()
        onClose()
      }, 2000)
    }
  }, [isSuccess, address, chainId, market, parsedAmount, hash, refetchBalance, reset, onClose, chainConfig.explorerUrl])

  const handleApprove = async () => {
    try {
      setApprovalState('pending')
      const hash = await approve(maxUint256)
      if (hash) {
        setApprovalState('success')
        addToast('success', 'Approved successfully', {
          url: `${chainConfig.explorerUrl}/tx/${hash}`,
          text: 'View transaction',
        })
        // 1.5秒后恢复 idle 状态
        setTimeout(() => setApprovalState('idle'), 1500)
      }
    } catch (error) {
      setApprovalState('idle')
      // 用户取消不显示错误
      const message = error instanceof Error ? error.message : ''
      if (message.toLowerCase().includes('user rejected') || message.toLowerCase().includes('user denied')) {
        return
      }
      console.error('Approval failed:', error)
      addToast('error', 'Approval failed. Please try again.')
    }
  }

  const handleSupply = async () => {
    try {
      await supply(marketParams, parsedAmount)
    } catch (error) {
      // 用户取消不显示错误
      const message = error instanceof Error ? error.message : ''
      if (message.toLowerCase().includes('user rejected') || message.toLowerCase().includes('user denied')) {
        return
      }
      console.error('Supply failed:', error)
      addToast('error', 'Supply failed. Please try again.')
    }
  }

  const handleMaxClick = () => {
    setAmount(formatTokenAmount(balance, market.loanAsset.decimals, market.loanAsset.decimals))
  }

  const isValidAmount = parsedAmount > 0n && parsedAmount <= balance

  // 错误提示
  const getErrorMessage = () => {
    const trimmed = amount.trim()
    if (!trimmed) return null
    // 检查是否是有效数字格式（只允许数字和一个小数点）
    if (!/^\d*\.?\d*$/.test(trimmed)) return 'Invalid number'
    if (parsedAmount > balance) return 'Exceeds balance'
    return null
  }
  const errorMessage = getErrorMessage()

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
              Supply {market.loanAsset.symbol}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
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
            <span className="text-[var(--text-secondary)]">Total Supply</span>
            <span className="text-[var(--text-primary)]">{formatUsd(totalSupplyUsd)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Total Borrow</span>
            <span className="text-[var(--text-primary)]">{formatUsd(totalBorrowUsd)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Liquidity</span>
            <span className="text-[var(--success)]">{formatUsd(liquidityUsd)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Utilization</span>
            <span className="text-[var(--text-primary)]">{formatPercent(market.state.utilization)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">LLTV</span>
            <span className="text-[var(--text-primary)]">{formatPercent(Number(market.lltv) / 1e18)}</span>
          </div>
          <div className="border-t border-[var(--border)] pt-5">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Supply APY</span>
              <span className="text-[var(--success)] text-lg font-semibold">
                {formatApy(market.state.netSupplyApy)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label
            className={`block text-sm ${errorMessage ? 'text-[var(--error)]' : 'text-[var(--text-secondary)]'}`}
            style={{ marginBottom: '5px', marginTop: '5px' }}
          >
            Amount {errorMessage && `- ${errorMessage}`}
          </label>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`input pr-24 py-4 ${errorMessage ? 'input-error' : ''}`}
              disabled={!isConnected}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button
                variant="link"
                onClick={handleMaxClick}
                className="text-sm font-medium"
              >
                MAX
              </Button>
              <span className="text-[var(--text-secondary)]">{market.loanAsset.symbol}</span>
            </div>
          </div>
          <p
            className="text-sm text-[var(--text-secondary)]"
            style={{ marginTop: '5px', marginBottom: '5px' }}
          >
            Balance: {formatTokenAmount(balance, market.loanAsset.decimals)} {market.loanAsset.symbol}
          </p>
        </div>

        <div style={{ marginTop: '16px' }}>
          {!isConnected ? (
            <Button className="w-full" disabled>
              Connect Wallet
            </Button>
          ) : isSuccess ? (
            <Button variant="success" className="w-full" disabled>
              Success!
            </Button>
          ) : requiresApproval || approvalState !== 'idle' ? (
            <Button
              onClick={handleApprove}
              disabled={!isValidAmount || approvalState !== 'idle'}
              className="w-full"
              variant={approvalState === 'success' ? 'success' : 'default'}
            >
              {approvalState === 'success' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Approved
                </span>
              ) : approvalState === 'pending' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 spinner" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Approving...
                </span>
              ) : (
                `Approve ${market.loanAsset.symbol}`
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSupply}
              disabled={!isValidAmount || isSupplying}
              className="w-full"
            >
              {isSupplying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 spinner" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Supplying...
                </span>
              ) : (
                `Supply ${market.loanAsset.symbol}`
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
