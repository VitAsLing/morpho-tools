import { useState, useCallback } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { createPublicClient, http } from 'viem'
import { MORPHO_ABI } from '@/lib/morpho/abi'
import { getMorphoAddress, getChain, getRpcUrl } from '@/lib/morpho/constants'
import { useSelectedChainId } from '@/providers/ChainProvider'
import type { MarketParams } from '@/types'

export function useSupply() {
  const { address } = useAccount()
  const chainId = useSelectedChainId()
  const morphoAddress = getMorphoAddress(chainId)
  const [supplyHash, setSupplyHash] = useState<`0x${string}` | undefined>()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [txError, setTxError] = useState<string | undefined>()

  const { writeContractAsync, isPending: isSigning } = useWriteContract()

  const supply = useCallback(
    async (marketParams: MarketParams, amount: bigint) => {
      if (!address) throw new Error('Wallet not connected')

      const chain = getChain(chainId)
      if (!chain) throw new Error('Unsupported chain')

      setTxError(undefined)
      setSupplyHash(undefined)
      setIsSuccess(false)

      try {
        // 阶段1: 等待钱包签名
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
        setIsConfirming(true)

        // 阶段2: 等待区块确认
        const client = createPublicClient({
          chain,
          transport: http(getRpcUrl(chainId)),
        })
        const receipt = await client.waitForTransactionReceipt({ hash })
        setIsConfirming(false)

        // 检查交易是否成功
        if (receipt.status === 'reverted') {
          setTxError('Transaction reverted')
          throw new Error('Transaction reverted')
        }

        setIsSuccess(true)
        return hash
      } catch (error) {
        setIsConfirming(false)
        const message = error instanceof Error ? error.message : 'Supply failed'
        // 用户取消不设置错误状态
        if (!message.toLowerCase().includes('user rejected') && !message.toLowerCase().includes('user denied')) {
          setTxError(message)
        }
        throw error
      }
    },
    [address, chainId, morphoAddress, writeContractAsync]
  )

  const reset = useCallback(() => {
    setSupplyHash(undefined)
    setIsConfirming(false)
    setIsSuccess(false)
    setTxError(undefined)
  }, [])

  return {
    supply,
    isSigning,
    isConfirming,
    isSuccess,
    error: txError,
    hash: supplyHash,
    reset,
  }
}
