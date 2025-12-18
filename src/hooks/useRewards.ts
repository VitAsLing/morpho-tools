import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId } from 'wagmi'
import { fetchAllRewards, type AggregatedReward } from '@/lib/merkl/api'

export interface RewardsData {
  merkl: AggregatedReward[]
  morpho: AggregatedReward[]
  totalClaimableUsd: number
  totalNextClaimableUsd: number
}

export function useRewards() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  return useQuery({
    queryKey: ['rewards', address, chainId],
    queryFn: async (): Promise<RewardsData> => {
      try {
        const { merkl, morpho } = await fetchAllRewards(address as string, chainId)

        const allRewards = [...(merkl || []), ...(morpho || [])]

        // Calculate totals using token price from API
        let totalClaimableUsd = 0
        let totalNextClaimableUsd = 0

        for (const reward of allRewards) {
          const claimableNowTokens = Number(reward.claimableNow) / 10 ** reward.tokenDecimals
          const claimableNextTokens = Number(reward.claimableNext) / 10 ** reward.tokenDecimals
          totalClaimableUsd += claimableNowTokens * reward.tokenPrice
          totalNextClaimableUsd += claimableNextTokens * reward.tokenPrice
        }

        return {
          merkl: merkl || [],
          morpho: morpho || [],
          totalClaimableUsd,
          totalNextClaimableUsd,
        }
      } catch (err) {
        console.error('Failed to fetch rewards:', err)
        return {
          merkl: [],
          morpho: [],
          totalClaimableUsd: 0,
          totalNextClaimableUsd: 0,
        }
      }
    },
    enabled: isConnected && !!address,
    staleTime: 60000, // 1 minute
  })
}
