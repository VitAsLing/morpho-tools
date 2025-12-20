import { useState, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import type { Address } from 'viem'
import { ERC20_ABI } from '@/lib/morpho/abi'
import { getMorphoAddress } from '@/lib/morpho/constants'
import { useChainId } from 'wagmi'

export function useTokenApproval(tokenAddress: Address | undefined) {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const morphoAddress = getMorphoAddress(chainId)
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | undefined>()
  const [approvalError, setApprovalError] = useState<string | undefined>()

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && tokenAddress ? [address, morphoAddress] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
    },
  })

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
    },
  })

  const { writeContractAsync, isPending: isApproving } = useWriteContract()

  const { isLoading: isWaitingForApproval } = useWaitForTransactionReceipt({
    hash: approvalHash,
  })

  const approve = useCallback(
    async (amount: bigint): Promise<`0x${string}` | undefined> => {
      if (!tokenAddress || !publicClient) return undefined

      setApprovalError(undefined)

      try {
        const hash = await writeContractAsync({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [morphoAddress, amount],
        })

        setApprovalHash(hash)

        // Wait for transaction to be confirmed before refetching allowance
        await publicClient.waitForTransactionReceipt({ hash })
        await refetchAllowance()

        return hash
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Approval failed'
        // 用户取消不设置错误状态
        if (message.toLowerCase().includes('user rejected') || message.toLowerCase().includes('user denied')) {
          throw error
        }
        // 其他错误才设置错误状态
        setApprovalError('Failed')
        throw error
      }
    },
    [tokenAddress, morphoAddress, publicClient, writeContractAsync, refetchAllowance]
  )

  const needsApproval = useCallback(
    (amount: bigint): boolean => {
      if (!allowance) return true
      return allowance < amount
    },
    [allowance]
  )

  return {
    allowance: allowance ?? 0n,
    balance: balance ?? 0n,
    approve,
    needsApproval,
    isApproving: isApproving || isWaitingForApproval,
    approvalHash,
    approvalError,
    refetchAllowance,
    refetchBalance,
  }
}
