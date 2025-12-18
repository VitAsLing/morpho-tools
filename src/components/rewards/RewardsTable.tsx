import { TokenLogo } from '@/components/common/TokenLogo'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatTokenAmount, formatUsd } from '@/lib/utils'
import type { AggregatedReward } from '@/lib/merkl/api'
import type { RewardsData } from '@/hooks/useRewards'
import { useAccount } from 'wagmi'

interface RewardsTableProps {
  data: RewardsData | undefined
  isLoading: boolean
  error: Error | null
  onClaim: (source: 'merkl' | 'morpho', reward: AggregatedReward) => void
  isClaiming: boolean
}

export function RewardsTable({
  data,
  isLoading,
  error,
  onClaim,
  isClaiming,
}: RewardsTableProps) {
  const { address } = useAccount()

  // Combine rewards from both sources
  const allRewards = [...(data?.merkl || []), ...(data?.morpho || [])]

  const handleClaim = (reward: AggregatedReward) => {
    if (reward.source === 'merkl' && address) {
      window.open(`https://app.merkl.xyz/users/${address}`, '_blank')
    } else {
      onClaim(reward.source, reward)
    }
  }

  // Use totals from hook (already calculated with token prices)
  const totalClaimableNowUsd = data?.totalClaimableUsd ?? 0
  const totalClaimableNextUsd = data?.totalNextClaimableUsd ?? 0

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center justify-end gap-6" style={{ height: '36px', marginBottom: '10px' }}>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)]">Claimable:</span>
          <span className="text-[var(--success)] font-semibold">{formatUsd(totalClaimableNowUsd)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)]">Next Claimable:</span>
          <span className="text-[var(--text-primary)] font-semibold">{formatUsd(totalClaimableNextUsd)}</span>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="overflow-x-auto" style={{ minHeight: '300px' }}>
        <Table className="table-fixed-layout">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-base normal-case tracking-normal w-[120px]">
                Source
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[150px]">
                Claimed
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[200px]">
                Claimable
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[150px]">
                Next Claimable
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[100px]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 spinner" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading rewards...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-12 text-[var(--error)]">
                  Failed to load rewards. Please try again.
                </TableCell>
              </TableRow>
            ) : allRewards.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-12 text-[var(--text-secondary)]">
                  No rewards found. Supply to incentivized markets to earn rewards.
                </TableCell>
              </TableRow>
            ) : (
              allRewards.map((reward) => {
                const decimals = reward.tokenDecimals
                const claimedAmount = formatTokenAmount(reward.claimed, decimals)
                const claimableNowAmount = formatTokenAmount(reward.claimableNow, decimals)
                const claimableNextAmount = formatTokenAmount(reward.claimableNext, decimals)
                const claimableNowUsd =
                  (Number(reward.claimableNow) / 10 ** decimals) * reward.tokenPrice
                const hasClaimable = reward.claimableNow > 0n

                return (
                  <TableRow key={`${reward.source}-${reward.tokenAddress}`}>
                    {/* Source */}
                    <TableCell className="py-5 text-[var(--text-primary)] text-base">
                      {reward.source.toUpperCase()}
                    </TableCell>
                    {/* Claimed */}
                    <TableCell className="py-5 text-[var(--text-primary)] text-base tabular-nums">
                      <div className="flex flex-col min-h-[52px] justify-center">
                        <div className="flex items-center gap-1">
                          <TokenLogo
                            address={reward.tokenAddress}
                            symbol={reward.tokenSymbol}
                            logoURI={reward.tokenLogoURI}
                            size="sm"
                          />
                          <span>{claimedAmount}</span>
                        </div>
                      </div>
                    </TableCell>
                    {/* Claimable */}
                    <TableCell className="py-5">
                      <div className="flex flex-col min-h-[52px] justify-center">
                        <div className="flex items-center gap-1 text-[var(--success)] text-base tabular-nums">
                          <TokenLogo
                            address={reward.tokenAddress}
                            symbol={reward.tokenSymbol}
                            logoURI={reward.tokenLogoURI}
                            size="sm"
                          />
                          <span>{claimableNowAmount}</span>
                        </div>
                        <span className="text-sm text-[var(--text-secondary)]">{formatUsd(claimableNowUsd)}</span>
                      </div>
                    </TableCell>
                    {/* Next Claimable */}
                    <TableCell className="py-5 text-[var(--text-secondary)] text-base tabular-nums">
                      <div className="flex flex-col min-h-[52px] justify-center">
                        <div className="flex items-center gap-1">
                          <TokenLogo
                            address={reward.tokenAddress}
                            symbol={reward.tokenSymbol}
                            logoURI={reward.tokenLogoURI}
                            size="sm"
                          />
                          <span>{claimableNextAmount}</span>
                        </div>
                      </div>
                    </TableCell>
                    {/* Action */}
                    <TableCell className="py-5 align-middle">
                      <Button
                        onClick={() => handleClaim(reward)}
                        disabled={!hasClaimable || (reward.source === 'morpho' && isClaiming)}
                        variant={hasClaimable ? 'default' : 'secondary'}
                      >
                        {reward.source === 'morpho' && isClaiming ? 'Claiming...' : 'Claim'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
