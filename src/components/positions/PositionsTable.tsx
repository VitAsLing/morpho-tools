import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import type { UserPosition } from '@/types'
import { ApyDisplay } from '../markets/ApyDisplay'
import { WithdrawModal } from './WithdrawModal'
import { TokenLogo } from '@/components/common/TokenLogo'
import { formatUsd, formatTokenAmount, formatPercent } from '@/lib/utils'
import { calculateCostBasis, calculateProfit } from '@/lib/transactionStore'

interface PositionsTableProps {
  positions: UserPosition[]
  isLoading: boolean
  error: Error | null
}

export function PositionsTable({ positions, isLoading, error }: PositionsTableProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const [selectedPosition, setSelectedPosition] = useState<UserPosition | null>(null)

  return (
    <div>
      {/* Spacer to match Markets filter section height */}
      <div style={{ height: '46px' }} />
      <div className="overflow-x-auto" style={{ minHeight: '400px' }}>
        <table className="table-fixed-layout">
          <thead className="border-b border-[var(--border)]">
            <tr>
              <th className="px-4 py-3 text-left text-lg font-semibold text-[var(--text-secondary)] w-[160px]">
                Market
              </th>
              <th className="px-4 py-3 text-left text-lg font-semibold text-[var(--text-secondary)] w-[100px]">
                Average
              </th>
              <th className="px-4 py-3 text-left text-lg font-semibold text-[var(--text-secondary)] w-[120px]">
                Position
              </th>
              <th className="px-4 py-3 text-left text-lg font-semibold text-[var(--text-secondary)] w-[100px]">
                Profit
              </th>
              <th className="px-4 py-3 text-left text-lg font-semibold text-[var(--text-secondary)] w-[100px]">
                Utilization
              </th>
              <th className="px-4 py-3 text-left text-lg font-semibold text-[var(--text-secondary)] w-[80px]">
                LLTV
              </th>
              <th className="px-4 py-3 text-left text-lg font-semibold text-[var(--text-secondary)] w-[120px]">
                Net APY
              </th>
              <th className="px-4 py-3 text-left text-lg font-semibold text-[var(--text-secondary)] w-[100px]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 !text-center">
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
                    Loading positions...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 !text-center text-[var(--error)]">
                  Failed to load positions. Please try again.
                </td>
              </tr>
            ) : positions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 !text-center text-[var(--text-secondary)]">
                  No positions found. Supply to a market to see your positions here.
                </td>
              </tr>
            ) : (
              positions.map((position) => {
                const market = position.market
                const currentTokens = BigInt(position.supplyAssets)
                const supplyAmount = formatTokenAmount(
                  currentTokens,
                  market.loanAsset.decimals
                )
                const valueUsd =
                  (Number(position.supplyAssets) / 10 ** market.loanAsset.decimals) *
                  (market.loanAsset.priceUsd ?? 0)

                // 从本地存储计算 Average 和 Profit
                const costBasis = address
                  ? calculateCostBasis(address, chainId, market.uniqueKey)
                  : null
                const hasHistory = costBasis && costBasis.transactions.length > 0
                const averageDeposit = hasHistory
                  ? formatTokenAmount(costBasis.netDeposited, market.loanAsset.decimals)
                  : null
                const profit = hasHistory
                  ? calculateProfit(costBasis, currentTokens)
                  : null
                const profitFormatted = profit !== null
                  ? formatTokenAmount(profit > 0n ? profit : -profit, market.loanAsset.decimals)
                  : null

                return (
                  <tr
                    key={market.uniqueKey}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)]"
                  >
                    {/* Market */}
                    <td className="px-4 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <TokenLogo
                            address={market.loanAsset.address}
                            symbol={market.loanAsset.symbol}
                            logoURI={market.loanAsset.logoURI}
                            size="md"
                          />
                          <span className="text-[var(--text-primary)] font-medium text-base">
                            {market.loanAsset.symbol}
                          </span>
                        </div>
                        {market.collateralAsset && (
                          <div className="flex items-center gap-1.5">
                            <TokenLogo
                              address={market.collateralAsset.address}
                              symbol={market.collateralAsset.symbol}
                              logoURI={market.collateralAsset.logoURI}
                              size="sm"
                            />
                            <span className="text-[var(--text-secondary)] text-sm">
                              {market.collateralAsset.symbol}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Average (净存入量) */}
                    <td className="px-4 py-5 text-[var(--text-primary)] text-base tabular-nums">
                      {hasHistory ? (
                        <div className="flex items-center gap-1">
                          <TokenLogo
                            address={market.loanAsset.address}
                            symbol={market.loanAsset.symbol}
                            logoURI={market.loanAsset.logoURI}
                            size="sm"
                          />
                          <span>{averageDeposit}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-secondary)]">—</span>
                      )}
                    </td>
                    {/* Position (当前仓位) */}
                    <td className="px-4 py-5 text-[var(--text-primary)] text-base tabular-nums">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <TokenLogo
                            address={market.loanAsset.address}
                            symbol={market.loanAsset.symbol}
                            logoURI={market.loanAsset.logoURI}
                            size="sm"
                          />
                          <span>{supplyAmount}</span>
                        </div>
                        <span className="text-sm text-[var(--text-secondary)]">{formatUsd(valueUsd)}</span>
                      </div>
                    </td>
                    {/* Profit (收益 = 当前持有 - 净存入) */}
                    <td className={`px-4 py-5 text-base tabular-nums ${
                      profit !== null && profit > 0n
                        ? 'text-[var(--success)]'
                        : profit !== null && profit < 0n
                        ? 'text-[var(--error)]'
                        : 'text-[var(--text-secondary)]'
                    }`}>
                      {hasHistory && profit !== null ? (
                        <div className="flex items-center gap-1">
                          <TokenLogo
                            address={market.loanAsset.address}
                            symbol={market.loanAsset.symbol}
                            logoURI={market.loanAsset.logoURI}
                            size="sm"
                          />
                          <span>{profit >= 0n ? '+' : '-'}{profitFormatted}</span>
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    {/* Utilization */}
                    <td className="px-4 py-5 text-[var(--text-primary)] text-base tabular-nums">
                      {formatPercent(market.state.utilization)}
                    </td>
                    {/* LLTV */}
                    <td className="px-4 py-5 text-[var(--text-primary)] text-base tabular-nums">
                      {formatPercent(Number(market.lltv) / 1e18)}
                    </td>
                    {/* Net APY */}
                    <td className="px-4 py-5">
                      <ApyDisplay
                        netApy={market.state.netSupplyApy}
                        baseApy={market.state.supplyApy}
                        rewards={market.state.rewards}
                        loanTokenSymbol={market.loanAsset.symbol}
                        loanTokenAddress={market.loanAsset.address}
                        loanTokenLogoURI={market.loanAsset.logoURI}
                      />
                    </td>
                    {/* Action */}
                    <td className="px-4 py-5">
                      <button
                        onClick={() => setSelectedPosition(position)}
                        className="btn btn-secondary text-base py-2 px-4"
                      >
                        Withdraw
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedPosition && (
        <WithdrawModal
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
        />
      )}
    </div>
  )
}
