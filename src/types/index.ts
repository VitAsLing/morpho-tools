import type { Address } from 'viem'

export interface Token {
  address: Address
  symbol: string
  decimals: number
  priceUsd: number | null
  logoURI: string | null
}

export interface RewardInfo {
  supplyApr: number
  borrowApr: number
  asset: {
    symbol: string
    address: Address
    logoURI: string | null
  }
}

export interface MarketState {
  supplyAssets: bigint
  borrowAssets: bigint
  supplyApy: number
  borrowApy: number
  netSupplyApy: number
  utilization: number
  rewards: RewardInfo[]
}

export interface Market {
  uniqueKey: string
  lltv: bigint
  whitelisted: boolean
  loanAsset: Token
  collateralAsset: Token | null
  state: MarketState
  oracle: {
    address: Address
  }
  irmAddress: Address
}

export interface MarketParams {
  loanToken: Address
  collateralToken: Address
  oracle: Address
  irm: Address
  lltv: bigint
}

export interface UserPosition {
  market: {
    uniqueKey: string
    loanAsset: Token
    collateralAsset: Token | null
    lltv: string
    state: {
      supplyApy: number
      netSupplyApy: number
      utilization: number
      rewards: RewardInfo[]
    }
    oracle: {
      address: Address
    }
    irmAddress: Address
  }
  state: {
    supplyAssets: bigint
    supplyShares: bigint
  }
}

export interface ChainConfig {
  id: number
  name: string
  shortName: string
  morphoAddress: Address
  explorerUrl: string
  morphoAppUrl: string
  logo: string
}

export type SortField =
  | 'market'
  | 'totalSupply'
  | 'totalBorrow'
  | 'liquidity'
  | 'utilization'
  | 'lltv'
  | 'netApy'

export type SortDirection = 'asc' | 'desc'

// Merkl Rewards Types
export interface MerklToken {
  address: Address
  chainId: number
  symbol: string
  decimals: number
  price: number
}

export interface MerklRewardBreakdown {
  root: string
  distributionChainId: number
  reason: string
  amount: string
  claimed: string
  pending: string
  campaignId: string
}

export interface MerklRewardItem {
  distributionChainId: number
  root: string
  recipient: Address
  amount: string // total earned
  claimed: string // already claimed
  pending: string // pending, not yet claimable
  proofs: string[]
  token: MerklToken
  breakdowns: MerklRewardBreakdown[]
}

export interface MerklChainRewards {
  chain: {
    id: number
    name: string
    icon: string
  }
  rewards: MerklRewardItem[]
}

// Morpho Rewards API Types (different format)
export interface MorphoRewardAmount {
  total: string
  claimable_now: string
  claimable_next: string
  claimed: string
}

export interface MorphoRewardAsset {
  id: string
  address: Address
  chain_id: number
}

export interface MorphoReward {
  user: Address
  type: string
  asset: MorphoRewardAsset
  program_id: string
  amount: MorphoRewardAmount
}

export interface MorphoRewardsResponse {
  timestamp: string
  pagination: {
    per_page: number
    page: number
    total_pages: number
    next: string | null
    prev: string | null
  }
  data: MorphoReward[]
}

// User Transaction Types
export interface UserTransaction {
  type: 'MarketSupply' | 'MarketWithdraw'
  timestamp: number
  data: {
    shares: string
    assets: string
    assetsUsd: number
    market: {
      uniqueKey: string
      loanAsset: {
        address: Address
        symbol: string
        decimals: number
      }
    }
  }
}

export interface PositionProfitData {
  totalSupplied: bigint // Total tokens supplied
  totalWithdrawn: bigint // Total tokens withdrawn
  netDeposited: bigint // Net deposited = totalSupplied - totalWithdrawn
  currentValue: bigint // Current position value in tokens
  profit: bigint // Profit = currentValue - netDeposited
  profitPercent: number // Profit as percentage of netDeposited
}

// Aggregated reward structure (unified for both Merkl and Morpho sources)
export interface AggregatedReward {
  tokenAddress: string
  tokenSymbol: string
  tokenDecimals: number
  tokenPrice: number
  tokenLogoURI: string | null
  chainId: number
  totalEarned: bigint
  claimableNow: bigint // amount - claimed - pending
  claimableNext: bigint // pending
  claimed: bigint
  proofs: string[]
  root: string
  source: 'merkl' | 'morpho'
}
