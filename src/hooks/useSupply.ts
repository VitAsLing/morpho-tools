import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useChainId } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { MORPHO_ABI } from '@/lib/morpho/abi'
import { getMorphoAddress, getChain, getRpcUrl } from '@/lib/morpho/constants'
import type { MarketParams } from '@/types'

export function useSupply() {
  const { address } = useAccount()
  const chainId = useChainId()
  const morphoAddress = getMorphoAddress(chainId)
  const [supplyHash, setSupplyHash] = useState<`0x${string}` | undefined>()
  const [isWaitingForSupply, setIsWaitingForSupply] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { writeContractAsync, isPending: isSupplying, error: supplyError } = useWriteContract()

  const supply = useCallback(
    async (marketParams: MarketParams, amount: bigint) => {
      if (!address) throw new Error('Wallet not connected')

      const chain = getChain(chainId)
      if (!chain) throw new Error('Unsupported chain')

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
      setIsWaitingForSupply(true)

      // 用独立的 viem client 等待交易确认
      const client = createPublicClient({
        chain,
        transport: http(getRpcUrl(chainId)),
      })
      await client.waitForTransactionReceipt({ hash })
      setIsWaitingForSupply(false)
      setIsSuccess(true)

      return hash
    },
    [address, chainId, morphoAddress, writeContractAsync]
  )

  const reset = useCallback(() => {
    setSupplyHash(undefined)
    setIsWaitingForSupply(false)
    setIsSuccess(false)
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
