import { useMarkets } from '@/hooks/useMarkets'
import { MarketsTable } from '@/components/markets/MarketsTable'

export function Markets() {
  const { data: markets, isLoading, error } = useMarkets()

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--text-primary)] py-2" style={{ marginBottom: '20px' }}>
        Markets
      </h1>
      <MarketsTable markets={markets ?? []} isLoading={isLoading} error={error as Error | null} />
    </div>
  )
}
