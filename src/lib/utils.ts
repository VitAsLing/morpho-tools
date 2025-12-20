import type { Address } from 'viem'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { UserTransaction, PositionProfitData } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  // Handle very small values (effectively zero)
  const absValue = Math.abs(value)
  if (absValue < 0.01) return '0.00'

  if (absValue >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (absValue >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (absValue >= 1_000) return `${(value / 1_000).toFixed(2)}K`
  return value.toFixed(2)
}

export function formatUsd(value: number): string {
  return `$${formatNumber(value)}`
}

export function formatApy(apy: number): string {
  return `${(apy * 100).toFixed(2)}%`
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  displayDecimals = 6
): string {
  const divisor = BigInt(10 ** decimals)
  const integerPart = amount / divisor
  const fractionalPart = amount % divisor

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const displayFractional = fractionalStr.slice(0, displayDecimals)

  if (integerPart === 0n && fractionalPart === 0n) {
    return '0'
  }

  // Remove trailing zeros and unnecessary decimal point
  const result = `${integerPart}.${displayFractional}`
  return result.replace(/\.?0+$/, '')
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  // 移除空格
  const trimmed = amount.trim()

  // 验证输入格式：只允许数字和一个小数点
  if (!trimmed || !/^\d*\.?\d*$/.test(trimmed)) {
    return 0n
  }

  const [integerPart, fractionalPart = ''] = trimmed.split('.')
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals)
  const fullNumber = (integerPart || '0') + paddedFractional
  return BigInt(fullNumber)
}

export function getTokenLogoUrl(address: Address, logoURI?: string | null): string {
  if (logoURI) return logoURI
  return `https://tokens.1inch.io/${address.toLowerCase()}.png`
}

export function getMarketUrl(
  morphoAppUrl: string,
  uniqueKey: string,
  loanSymbol: string,
  collateralSymbol: string
): string {
  return `${morphoAppUrl}/market/${uniqueKey}/${collateralSymbol}-${loanSymbol}`
}

/**
 * Calculate profit data from transactions for a specific market (token-based)
 * @param transactions - All user transactions
 * @param marketKey - Market unique key
 * @param currentTokens - Current position value in tokens (bigint)
 * @returns PositionProfitData or null if no transactions
 */
export function calculatePositionProfit(
  transactions: UserTransaction[],
  marketKey: string,
  currentTokens: bigint
): PositionProfitData | null {
  // Filter transactions for this market (market is now inside data)
  const marketTxs = transactions.filter((tx) => tx.data?.market?.uniqueKey === marketKey)

  if (marketTxs.length === 0) {
    return null
  }

  let totalSupplied = 0n
  let totalWithdrawn = 0n
  let runningShares = 0n

  // Sort by timestamp ascending for accurate calculation
  const sortedTxs = [...marketTxs].sort((a, b) => a.timestamp - b.timestamp)

  for (const tx of sortedTxs) {
    const assets = BigInt(tx.data.assets ?? '0')
    const shares = BigInt(tx.data.shares ?? '0')

    if (tx.type === 'MarketSupply') {
      totalSupplied += assets
      runningShares += shares
    } else if (tx.type === 'MarketWithdraw') {
      totalWithdrawn += assets
      runningShares -= shares
    }

    // When shares reach zero, reset for new cycle
    if (runningShares <= 0n) {
      totalSupplied = 0n
      totalWithdrawn = 0n
      runningShares = 0n
    }
  }

  // 净存入量 = 总供应 - 总提取
  const netDeposited = totalSupplied - totalWithdrawn

  // 收益 = 当前持仓 - 净存入量
  const profit = currentTokens - netDeposited

  // 收益率 = 收益 / 净存入量 * 100
  const profitPercent = netDeposited > 0n
    ? Number(profit * 10000n / netDeposited) / 100
    : 0

  return {
    totalSupplied,
    totalWithdrawn,
    netDeposited,
    currentValue: currentTokens,
    profit,
    profitPercent,
  }
}

