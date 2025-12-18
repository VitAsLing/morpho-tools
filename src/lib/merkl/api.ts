import type { MerklChainRewards, MerklRewardItem, MorphoReward, MorphoRewardsResponse } from '@/types'

const MERKL_API_BASE = 'https://api.merkl.xyz/v4'
const MORPHO_REWARDS_API_BASE = 'https://rewards.morpho.org/v1'

// MORPHO token addresses per chain
export const MORPHO_TOKEN_ADDRESS: Record<number, string> = {
  1: '0x58D97B57BB95320F9a05dC918Aef65434969c2B2', // Ethereum
  8453: '0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842', // Base
  42161: '0x58D97B57BB95320F9a05dC918Aef65434969c2B2', // Arbitrum (wrapped)
}

// Aggregated reward structure (unified for both sources)
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

// Get MORPHO token logo URL
function getMorphoLogoUrl(): string {
  return 'https://cdn.morpho.org/assets/logos/morpho.svg'
}

// Fetch from Merkl API (returns array of chain rewards)
export async function fetchMerklRewards(
  userAddress: string,
  chainId: number
): Promise<MerklRewardItem[]> {
  const url = `${MERKL_API_BASE}/users/${userAddress.toLowerCase()}/rewards?chainId=${chainId}`

  const response = await fetch(url)

  if (!response.ok) {
    console.warn(`Merkl API returned ${response.status}`)
    return []
  }

  const data: MerklChainRewards[] = await response.json()

  // Extract rewards for the specific chain
  const chainData = data?.find((d) => d.chain?.id === chainId)
  return chainData?.rewards ?? []
}

// Fetch from Morpho Rewards API (different structure)
export async function fetchMorphoRewards(
  userAddress: string,
  chainId: number
): Promise<MorphoReward[]> {
  const url = `${MORPHO_REWARDS_API_BASE}/users/${userAddress.toLowerCase()}/rewards?chain_id=${chainId}`

  const response = await fetch(url)

  if (!response.ok) {
    console.warn(`Morpho Rewards API returned ${response.status}`)
    return []
  }

  const data: MorphoRewardsResponse = await response.json()
  return data?.data ?? []
}

// Aggregate Merkl rewards by token
export function aggregateMerklRewards(rewards: MerklRewardItem[]): AggregatedReward[] {
  const aggregated = new Map<string, AggregatedReward>()

  for (const reward of rewards) {
    const key = reward.token.address.toLowerCase()
    const amount = BigInt(reward.amount)
    const claimed = BigInt(reward.claimed)
    const pending = BigInt(reward.pending)
    const claimableNow = amount - claimed - pending

    const existing = aggregated.get(key)

    if (existing) {
      existing.totalEarned += amount
      existing.claimableNow += claimableNow
      existing.claimableNext += pending
      existing.claimed += claimed
    } else {
      aggregated.set(key, {
        tokenAddress: reward.token.address,
        tokenSymbol: reward.token.symbol,
        tokenDecimals: reward.token.decimals,
        tokenPrice: reward.token.price,
        tokenLogoURI: getMorphoLogoUrl(),
        chainId: reward.distributionChainId,
        totalEarned: amount,
        claimableNow,
        claimableNext: pending,
        claimed,
        proofs: reward.proofs,
        root: reward.root,
        source: 'merkl',
      })
    }
  }

  return Array.from(aggregated.values())
}

// Aggregate Morpho rewards by token (different structure)
export function aggregateMorphoRewards(rewards: MorphoReward[]): AggregatedReward[] {
  const aggregated = new Map<string, AggregatedReward>()

  for (const reward of rewards) {
    const key = reward.asset.address.toLowerCase()
    const existing = aggregated.get(key)

    if (existing) {
      existing.totalEarned += BigInt(reward.amount.total)
      existing.claimableNow += BigInt(reward.amount.claimable_now)
      existing.claimableNext += BigInt(reward.amount.claimable_next)
      existing.claimed += BigInt(reward.amount.claimed)
    } else {
      aggregated.set(key, {
        tokenAddress: reward.asset.address,
        tokenSymbol: 'MORPHO',
        tokenDecimals: 18,
        tokenPrice: 1.19, // Default price
        tokenLogoURI: getMorphoLogoUrl(),
        chainId: reward.asset.chain_id,
        totalEarned: BigInt(reward.amount.total),
        claimableNow: BigInt(reward.amount.claimable_now),
        claimableNext: BigInt(reward.amount.claimable_next),
        claimed: BigInt(reward.amount.claimed),
        proofs: [],
        root: '',
        source: 'morpho',
      })
    }
  }

  return Array.from(aggregated.values())
}

// Fetch combined rewards from both sources
export async function fetchAllRewards(
  userAddress: string,
  chainId: number
): Promise<{ merkl: AggregatedReward[]; morpho: AggregatedReward[] }> {
  const [merklRewards, morphoRewards] = await Promise.all([
    fetchMerklRewards(userAddress, chainId).catch(() => []),
    fetchMorphoRewards(userAddress, chainId).catch(() => []),
  ])

  return {
    merkl: aggregateMerklRewards(merklRewards),
    morpho: aggregateMorphoRewards(morphoRewards),
  }
}

