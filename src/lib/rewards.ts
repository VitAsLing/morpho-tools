import type { AggregatedReward } from '@/types'
import { fetchAggregatedMerklRewards } from '@/lib/merkl/api'
import { fetchAggregatedMorphoRewards } from '@/lib/morpho/rewards'

// Fetch combined rewards from both Merkl and Morpho sources
export async function fetchAllRewards(
  userAddress: string,
  chainId: number
): Promise<{ merkl: AggregatedReward[]; morpho: AggregatedReward[] }> {
  const [merkl, morpho] = await Promise.all([
    fetchAggregatedMerklRewards(userAddress, chainId),
    fetchAggregatedMorphoRewards(userAddress, chainId),
  ])

  return { merkl, morpho }
}

export type { AggregatedReward }
