import { useAccount } from 'wagmi'
import { useRewards } from '@/hooks/useRewards'
import { RewardsTable } from '@/components/rewards/RewardsTable'
import type { AggregatedReward } from '@/lib/merkl/api'

export function Rewards() {
  const { isConnected } = useAccount()
  const { data, isLoading, error } = useRewards()

  // Morpho claims redirect to their app (same as Merkl)
  const handleClaim = (_source: 'merkl' | 'morpho', _reward: AggregatedReward) => {
    window.open('https://app.morpho.org/', '_blank')
  }

  return (
    <div>
      <h1
        className="text-3xl font-bold text-[var(--text-primary)]"
        style={{ marginBottom: '25px' }}
      >
        Rewards
      </h1>
      {!isConnected ? (
        <div className="text-center" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
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
