import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useChainId } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { MORPHO_ABI } from '@/lib/morpho/abi'
import { getMorphoAddress, getChain, getRpcUrl } from '@/lib/morpho/constants'
import type { MarketParams } from '@/types'

export function useWithdraw() {
  const { address } = useAccount()
  const chainId = useChainId()
  const morphoAddress = getMorphoAddress(chainId)
  const [withdrawHash, setWithdrawHash] = useState<`0x${string}` | undefined>()
  const [isWaitingForWithdraw, setIsWaitingForWithdraw] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { writeContractAsync, isPending: isWithdrawing, error: withdrawError } = useWriteContract()

  const withdraw = useCallback(
    async (marketParams: MarketParams, amount: bigint, useShares = false) => {
      if (!address) throw new Error('Wallet not connected')

      const chain = getChain(chainId)
      if (!chain) throw new Error('Unsupported chain')

      const hash = await writeContractAsync({
        address: morphoAddress,
        abi: MORPHO_ABI,
        functionName: 'withdraw',
        args: [
          {
            loanToken: marketParams.loanToken,
            collateralToken: marketParams.collateralToken,
            oracle: marketParams.oracle,
            irm: marketParams.irm,
            lltv: marketParams.lltv,
          },
          useShares ? 0n : amount,
          useShares ? amount : 0n,
          address,
          address,
        ],
      })

      setWithdrawHash(hash)
      setIsWaitingForWithdraw(true)

      // 用独立的 viem client 等待交易确认
      const client = createPublicClient({
        chain,
        transport: http(getRpcUrl(chainId)),
      })
      await client.waitForTransactionReceipt({ hash })
      setIsWaitingForWithdraw(false)
      setIsSuccess(true)

      return hash
    },
    [address, chainId, morphoAddress, writeContractAsync]
  )

  const reset = useCallback(() => {
    setWithdrawHash(undefined)
    setIsWaitingForWithdraw(false)
    setIsSuccess(false)
  }, [])

  return {
    withdraw,
    isWithdrawing: isWithdrawing || isWaitingForWithdraw,
    isSuccess,
    error: withdrawError,
    hash: withdrawHash,
    reset,
  }
}
