import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId } from 'wagmi'
import { fetchUserPositions } from '@/lib/morpho/api'

export function useUserPositions() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  return useQuery({
    queryKey: ['positions', address, chainId],
    queryFn: () => fetchUserPositions(address!, chainId),
    enabled: isConnected && !!address,
    staleTime: 30000,
  })
}
