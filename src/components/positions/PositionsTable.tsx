import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import type { UserPosition } from '@/types'
import { ApyDisplay } from '../markets/ApyDisplay'
import { WithdrawModal } from './WithdrawModal'
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
        <Table className="table-fixed-layout">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-base normal-case tracking-normal w-[160px]">
                Market
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[100px]">
                Average
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[120px]">
                Position
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[100px]">
                Profit
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[100px]">
                Utilization
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[80px]">
                LLTV
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[120px]">
                Net APY
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[100px]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="text-center py-12">
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
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="text-center py-12 text-[var(--error)]">
                  Failed to load positions. Please try again.
                </TableCell>
              </TableRow>
            ) : positions.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="text-center py-12 text-[var(--text-secondary)]">
                  No positions found. Supply to a market to see your positions here.
                </TableCell>
              </TableRow>
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
                  <TableRow key={market.uniqueKey}>
                    {/* Market */}
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-0.5 min-h-[52px] justify-center">
                        <div className="flex items-center gap-2">
                          <TokenLogo
                            address={market.loanAsset.address}
                            symbol={market.loanAsset.symbol}
                            logoURI={market.loanAsset.logoURI}
                            size="sm"
                          />
                          <span className="text-[var(--text-primary)] font-medium text-base">
                            {market.loanAsset.symbol}
                          </span>
                        </div>
                        {market.collateralAsset && (
                          <div className="flex items-center gap-2">
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
                    </TableCell>
                    {/* Average (净存入量) */}
                    <TableCell className="py-5 text-[var(--text-primary)] text-base tabular-nums">
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
                    </TableCell>
                    {/* Position (当前仓位) */}
                    <TableCell className="py-5 text-[var(--text-primary)] text-base tabular-nums">
                      <div className="flex flex-col min-h-[52px] justify-center">
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
                    </TableCell>
                    {/* Profit (收益 = 当前持有 - 净存入) */}
                    <TableCell className={`py-5 text-base tabular-nums ${
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
                    </TableCell>
                    {/* Utilization */}
                    <TableCell className="py-5 text-[var(--text-primary)] text-base tabular-nums">
                      {formatPercent(market.state.utilization)}
                    </TableCell>
                    {/* LLTV */}
                    <TableCell className="py-5 text-[var(--text-primary)] text-base tabular-nums">
                      {formatPercent(Number(market.lltv) / 1e18)}
                    </TableCell>
                    {/* Net APY */}
                    <TableCell className="py-5">
                      <ApyDisplay
                        netApy={market.state.netSupplyApy}
                        baseApy={market.state.supplyApy}
                        rewards={market.state.rewards}
                        loanTokenSymbol={market.loanAsset.symbol}
                        loanTokenAddress={market.loanAsset.address}
                        loanTokenLogoURI={market.loanAsset.logoURI}
                      />
                    </TableCell>
                    {/* Action */}
                    <TableCell className="py-5">
                      <Button onClick={() => setSelectedPosition(position)}>
                        Withdraw
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
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
