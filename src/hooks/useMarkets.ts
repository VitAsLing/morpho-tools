import { useQuery } from '@tanstack/react-query'
import { useSelectedChainId } from '@/providers/ChainProvider'
import { fetchMarkets } from '@/lib/morpho/api'

export function useMarkets() {
  const chainId = useSelectedChainId()

  return useQuery({
    queryKey: ['markets', chainId],
    queryFn: () => fetchMarkets(chainId),
    staleTime: 30000,
  })
}
