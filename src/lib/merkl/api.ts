import type { MerklChainRewards, MerklRewardItem, AggregatedReward } from '@/types'
import { MORPHO_LOGO_URL } from '@/lib/morpho/constants'

const MERKL_API_BASE = 'https://api.merkl.xyz/v4'

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
        tokenLogoURI: MORPHO_LOGO_URL,
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

// Fetch and aggregate Merkl rewards
export async function fetchAggregatedMerklRewards(
  userAddress: string,
  chainId: number
): Promise<AggregatedReward[]> {
  const rewards = await fetchMerklRewards(userAddress, chainId).catch(() => [])
  return aggregateMerklRewards(rewards)
}
