import { useState, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Address } from 'viem'
import { ERC20_ABI } from '@/lib/morpho/abi'
import { getMorphoAddress } from '@/lib/morpho/constants'
import { useChainId } from 'wagmi'

export function useTokenApproval(tokenAddress: Address | undefined) {
  const { address } = useAccount()
  const chainId = useChainId()
  const morphoAddress = getMorphoAddress(chainId)
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | undefined>()

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
    async (amount: bigint) => {
      if (!tokenAddress) return

      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [morphoAddress, amount],
      })

      setApprovalHash(hash)
      await refetchAllowance()
    },
    [tokenAddress, morphoAddress, writeContractAsync, refetchAllowance]
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
    refetchAllowance,
    refetchBalance,
  }
}
