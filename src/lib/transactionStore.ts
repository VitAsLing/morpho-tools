import type { Address } from 'viem'

export interface TransactionRecord {
  type: 'supply' | 'withdraw'
  marketKey: string
  tokenAddress: Address
  tokenSymbol: string
  amount: string // token amount (raw bigint as string)
  decimals: number
  timestamp: number
  txHash?: string
}

export interface MarketCostBasis {
  totalSupplied: bigint // 总共存入的代币数量
  totalWithdrawn: bigint // 总共取出的代币数量
  netDeposited: bigint // 净存入 = totalSupplied - totalWithdrawn
  transactions: TransactionRecord[]
}

const STORAGE_KEY = 'morpho-tools-transactions'

function getStorageKey(address: string, chainId: number): string {
  return `${STORAGE_KEY}-${address.toLowerCase()}-${chainId}`
}

export function getTransactions(address: string, chainId: number): TransactionRecord[] {
  if (typeof window === 'undefined') return []
  const key = getStorageKey(address, chainId)
  const stored = localStorage.getItem(key)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function addTransaction(
  address: string,
  chainId: number,
  transaction: TransactionRecord
): void {
  const transactions = getTransactions(address, chainId)
  transactions.push(transaction)
  const key = getStorageKey(address, chainId)
  localStorage.setItem(key, JSON.stringify(transactions))
}

export function getMarketTransactions(
  address: string,
  chainId: number,
  marketKey: string
): TransactionRecord[] {
  const transactions = getTransactions(address, chainId)
  return transactions.filter((tx) => tx.marketKey === marketKey)
}

export function calculateCostBasis(
  address: string,
  chainId: number,
  marketKey: string
): MarketCostBasis {
  const transactions = getMarketTransactions(address, chainId, marketKey)

  let totalSupplied = 0n
  let totalWithdrawn = 0n

  for (const tx of transactions) {
    if (tx.type === 'supply') {
      totalSupplied += BigInt(tx.amount)
    } else {
      totalWithdrawn += BigInt(tx.amount)
    }
  }

  const netDeposited = totalSupplied - totalWithdrawn

  return {
    totalSupplied,
    totalWithdrawn,
    netDeposited,
    transactions,
  }
}

// 计算收益（代币数量）
// profit = 当前持有量 - 净存入量
export function calculateProfit(
  costBasis: MarketCostBasis,
  currentTokens: bigint
): bigint {
  // 如果没有记录的交易，无法计算收益
  if (costBasis.transactions.length === 0) {
    return 0n
  }

  return currentTokens - costBasis.netDeposited
}

