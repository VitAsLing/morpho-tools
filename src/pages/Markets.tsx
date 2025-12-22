import { useMarkets } from '@/hooks/useMarkets'
import { MarketsTable } from '@/components/markets/MarketsTable'

export function Markets() {
  const { data: markets, isLoading, error } = useMarkets()

  return (
    <div>
      <div className="h-16 md:h-[66px]" />
      <MarketsTable markets={markets ?? []} isLoading={isLoading} error={error as Error | null} />
    </div>
  )
}
