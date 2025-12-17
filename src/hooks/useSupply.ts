import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { MORPHO_ABI } from '@/lib/morpho/abi'
import { getMorphoAddress } from '@/lib/morpho/constants'
import type { MarketParams } from '@/types'

export function useSupply() {
  const { address } = useAccount()
  const chainId = useChainId()
  const morphoAddress = getMorphoAddress(chainId)
  const [supplyHash, setSupplyHash] = useState<`0x${string}` | undefined>()

  const { writeContractAsync, isPending: isSupplying, error: supplyError } = useWriteContract()

  const { isLoading: isWaitingForSupply, isSuccess } = useWaitForTransactionReceipt({
    hash: supplyHash,
  })

  const supply = useCallback(
    async (marketParams: MarketParams, amount: bigint) => {
      if (!address) throw new Error('Wallet not connected')

      const hash = await writeContractAsync({
        address: morphoAddress,
        abi: MORPHO_ABI,
        functionName: 'supply',
        args: [
          {
            loanToken: marketParams.loanToken,
            collateralToken: marketParams.collateralToken,
            oracle: marketParams.oracle,
            irm: marketParams.irm,
            lltv: marketParams.lltv,
          },
          amount,
          0n,
          address,
          '0x' as `0x${string}`,
        ],
      })

      setSupplyHash(hash)
      return hash
    },
    [address, morphoAddress, writeContractAsync]
  )

  const reset = useCallback(() => {
    setSupplyHash(undefined)
  }, [])

  return {
    supply,
    isSupplying: isSupplying || isWaitingForSupply,
    isSuccess,
    error: supplyError,
    hash: supplyHash,
    reset,
  }
}
