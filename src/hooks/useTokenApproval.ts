import { useState, useCallback, useEffect } from 'react'
import { useAccount, useWriteContract, useChainId } from 'wagmi'
import { createPublicClient, http, type Address } from 'viem'
import { ERC20_ABI } from '@/lib/morpho/abi'
import { getMorphoAddress, getChain, getRpcUrl } from '@/lib/morpho/constants'

export function useTokenApproval(tokenAddress: Address | undefined) {
  const { address } = useAccount()
  const chainId = useChainId()
  const morphoAddress = getMorphoAddress(chainId)
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | undefined>()
  const [approvalError, setApprovalError] = useState<string | undefined>()
  const [balance, setBalance] = useState<bigint>(0n)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)

  // 创建独立的 viem client 读取数据（避免 wagmi client 链不匹配的问题）
  const fetchDataFromChain = useCallback(async () => {
    if (!tokenAddress || !address) {
      return { balance: 0n, allowance: 0n }
    }
    const chain = getChain(chainId)
    if (!chain) {
      return { balance: 0n, allowance: 0n }
    }
    try {
      const client = createPublicClient({
        chain,
        transport: http(getRpcUrl(chainId)),
      })
      const [balanceResult, allowanceResult] = await Promise.all([
        client.readContract({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        }),
        client.readContract({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, morphoAddress],
        }),
      ])
      return {
        balance: balanceResult as bigint,
        allowance: allowanceResult as bigint,
      }
    } catch (error) {
      console.error('[useTokenApproval] Error reading data:', error)
      return { balance: 0n, allowance: 0n }
    }
  }, [chainId, tokenAddress, address, morphoAddress])

  useEffect(() => {
    fetchDataFromChain().then(({ balance, allowance }) => {
      setBalance(balance)
      setAllowance(allowance)
    })
  }, [fetchDataFromChain])

  const refetchBalance = useCallback(async () => {
    const { balance } = await fetchDataFromChain()
    setBalance(balance)
  }, [fetchDataFromChain])

  const refetchAllowance = useCallback(async () => {
    const { allowance } = await fetchDataFromChain()
    setAllowance(allowance)
  }, [fetchDataFromChain])

  const { writeContractAsync, isPending: isApproving } = useWriteContract()

  const approve = useCallback(
    async (amount: bigint): Promise<`0x${string}` | undefined> => {
      if (!tokenAddress) return undefined

      const chain = getChain(chainId)
      if (!chain) return undefined

      setApprovalError(undefined)

      try {
        const hash = await writeContractAsync({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [morphoAddress, amount],
        })

        setApprovalHash(hash)
        setIsWaitingForApproval(true)

        // 用独立的 viem client 等待交易确认
        const client = createPublicClient({
          chain,
          transport: http(getRpcUrl(chainId)),
        })
        await client.waitForTransactionReceipt({ hash })
        setIsWaitingForApproval(false)
        await refetchAllowance()

        return hash
      } catch (error) {
        setIsWaitingForApproval(false)
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
    [tokenAddress, morphoAddress, chainId, writeContractAsync, refetchAllowance]
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
