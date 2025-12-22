import { useAccount } from 'wagmi'
import { useUserPositions } from '@/hooks/useUserPositions'
import { PositionsTable } from '@/components/positions/PositionsTable'

export function Positions() {
  const { isConnected } = useAccount()
  const { data: positions, isLoading, error } = useUserPositions()

  return (
    <div>
      <div className="h-16 md:h-[66px]" />
      {!isConnected ? (
        <div className="text-center py-20">
          <p className="text-[var(--text-secondary)] text-lg">
            Connect your wallet to view your positions.
          </p>
        </div>
      ) : (
        <PositionsTable
          positions={positions ?? []}
          isLoading={isLoading}
          error={error as Error | null}
        />
      )}
    </div>
  )
}
