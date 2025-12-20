import type { MorphoReward, MorphoRewardsResponse, AggregatedReward } from '@/types'
import { fetchMorphoPrice } from '@/lib/price'
import { MORPHO_LOGO_URL } from '@/lib/morpho/constants'

const MORPHO_REWARDS_API_BASE = 'https://rewards.morpho.org/v1'

// Fetch from Morpho Rewards API
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

// Aggregate Morpho rewards by token
export function aggregateMorphoRewards(
  rewards: MorphoReward[],
  morphoPrice: number
): AggregatedReward[] {
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
        tokenPrice: morphoPrice,
        tokenLogoURI: MORPHO_LOGO_URL,
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

// Fetch and aggregate Morpho rewards with price
export async function fetchAggregatedMorphoRewards(
  userAddress: string,
  chainId: number
): Promise<AggregatedReward[]> {
  const [rewards, price] = await Promise.all([
    fetchMorphoRewards(userAddress, chainId).catch(() => []),
    fetchMorphoPrice().catch(() => 0),
  ])

  return aggregateMorphoRewards(rewards, price)
}
