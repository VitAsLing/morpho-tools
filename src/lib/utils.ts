import type { Address } from 'viem'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`
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
  displayDecimals = 4
): string {
  const divisor = BigInt(10 ** decimals)
  const integerPart = amount / divisor
  const fractionalPart = amount % divisor

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const displayFractional = fractionalStr.slice(0, displayDecimals)

  if (integerPart === 0n && fractionalPart === 0n) {
    return '0'
  }

  return `${integerPart}.${displayFractional}`
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [integerPart, fractionalPart = ''] = amount.split('.')
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals)
  const fullNumber = integerPart + paddedFractional
  return BigInt(fullNumber || '0')
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
  return `${morphoAppUrl}/market/${uniqueKey}/${loanSymbol}-${collateralSymbol}`
}

