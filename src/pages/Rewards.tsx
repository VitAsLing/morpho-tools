import { useAccount } from 'wagmi'
import { useRewards } from '@/hooks/useRewards'
import { RewardsTable } from '@/components/rewards/RewardsTable'
import type { AggregatedReward } from '@/types'

export function Rewards() {
  const { isConnected } = useAccount()
  const { data, isLoading, error } = useRewards()

  // Morpho claims redirect to their app (same as Merkl)
  const handleClaim = (_source: 'merkl' | 'morpho', _reward: AggregatedReward) => {
    window.open('https://app.morpho.org/', '_blank')
  }

  return (
    <div>
      <div className="h-16 md:h-[66px]" />
      {!isConnected ? (
        <div className="text-center py-20">
          <p className="text-[var(--text-secondary)] text-lg">
            Connect your wallet to view your rewards.
          </p>
        </div>
      ) : (
        <RewardsTable
          data={data}
          isLoading={isLoading}
          error={error as Error | null}
          onClaim={handleClaim}
          isClaiming={false}
        />
      )}
    </div>
  )
}
