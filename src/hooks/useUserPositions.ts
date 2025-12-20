import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId } from 'wagmi'
import { fetchUserPositions, fetchUserTransactions } from '@/lib/morpho/api'
import { calculatePositionProfit } from '@/lib/utils'
import type { UserPosition, UserTransaction, PositionProfitData } from '@/types'

export interface EnrichedUserPosition extends UserPosition {
  profitData: PositionProfitData | null
}

export function useUserPositions() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  return useQuery({
    queryKey: ['positions', address, chainId],
    queryFn: async (): Promise<EnrichedUserPosition[]> => {
      if (!address) return []

      // 并行获取用户仓位和交易记录
      const [positions, transactions] = await Promise.all([
        fetchUserPositions(address, chainId).catch(() => []),
        fetchUserTransactions(address, chainId).catch(() => [] as UserTransaction[]),
      ])

      // 计算每个 position 的 profit 数据
      return positions.map((pos) => {
        // 当前持仓 token 数量
        const currentTokens = BigInt(pos.supplyAssets)

        // 从交易记录计算 profit (token 计价)
        const profitData = calculatePositionProfit(transactions, pos.market.uniqueKey, currentTokens)

        return {
          ...pos,
          profitData,
        }
      })
    },
    enabled: isConnected && !!address,
    staleTime: 10000,
    refetchInterval: 30000,
  })
}
