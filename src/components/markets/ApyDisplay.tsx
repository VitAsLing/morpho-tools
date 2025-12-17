import { formatApy } from '@/lib/utils'
import { TokenLogo } from '@/components/common/TokenLogo'
import type { RewardInfo } from '@/types'

interface ApyDisplayProps {
  netApy: number
  baseApy: number
  rewards: RewardInfo[]
  loanTokenSymbol: string
  loanTokenAddress: string
  loanTokenLogoURI?: string | null
}

export function ApyDisplay({
  netApy,
  baseApy,
  rewards,
  loanTokenSymbol,
  loanTokenAddress,
  loanTokenLogoURI,
}: ApyDisplayProps) {
  return (
    <div className="flex flex-col">
      {/* Net APY */}
      <span className="text-[var(--success)] font-semibold tabular-nums text-base">
        {formatApy(netApy)}
      </span>
      {/* Base Supply APY */}
      <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
        <TokenLogo
          address={loanTokenAddress}
          symbol={loanTokenSymbol}
          logoURI={loanTokenLogoURI}
          size="sm"
        />
        <span className="tabular-nums">{formatApy(baseApy)}</span>
      </div>
      {/* Reward APYs - only show if > 0 */}
      {rewards
        .filter((reward) => reward.supplyApr > 0)
        .map((reward) => (
          <div
            key={reward.asset.address}
            className="flex items-center gap-1 text-sm text-[var(--text-secondary)]"
          >
            <TokenLogo
              address={reward.asset.address}
              symbol={reward.asset.symbol}
              logoURI={reward.asset.logoURI}
              size="sm"
            />
            <span className="tabular-nums">{formatApy(reward.supplyApr)}</span>
          </div>
        ))}
    </div>
  )
}
