import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import { fetchMarkets } from '@/lib/morpho/api'

export function useMarkets() {
  const chainId = useChainId()

  return useQuery({
    queryKey: ['markets', chainId],
    queryFn: () => fetchMarkets(chainId),
    staleTime: 30000,
  })
}
