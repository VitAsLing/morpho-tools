import { useAccount } from 'wagmi'
import { useUserPositions } from '@/hooks/useUserPositions'
import { PositionsTable } from '@/components/positions/PositionsTable'

export function Positions() {
  const { isConnected } = useAccount()
  const { data: positions, isLoading, error } = useUserPositions()

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--text-primary)] py-2" style={{ marginBottom: '20px' }}>
        Positions
      </h1>
      {!isConnected ? (
        <div className="text-center" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
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
