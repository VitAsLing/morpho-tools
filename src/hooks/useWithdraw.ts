import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { MORPHO_ABI } from '@/lib/morpho/abi'
import { getMorphoAddress } from '@/lib/morpho/constants'
import type { MarketParams } from '@/types'

export function useWithdraw() {
  const { address } = useAccount()
  const chainId = useChainId()
  const morphoAddress = getMorphoAddress(chainId)
  const [withdrawHash, setWithdrawHash] = useState<`0x${string}` | undefined>()

  const { writeContractAsync, isPending: isWithdrawing, error: withdrawError } = useWriteContract()

  const { isLoading: isWaitingForWithdraw, isSuccess } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  })

  const withdraw = useCallback(
    async (marketParams: MarketParams, amount: bigint, useShares = false) => {
      if (!address) throw new Error('Wallet not connected')

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
      return hash
    },
    [address, morphoAddress, writeContractAsync]
  )

  const reset = useCallback(() => {
    setWithdrawHash(undefined)
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
