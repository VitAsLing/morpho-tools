import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import type { EnrichedUserPosition } from '@/hooks/useUserPositions'
import { ApyDisplay } from '../markets/ApyDisplay'
import { WithdrawModal } from './WithdrawModal'
import { TokenLogo } from '@/components/common/TokenLogo'
import { Button } from '@/components/ui/button'
import { TableLoading, TableEmpty, TableError, POSITIONS_SKELETON_COLUMNS } from '@/components/ui/TableState'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { ScrollHint } from '@/components/ui/ScrollHint'
import { formatUsd, formatTokenAmount, formatPercent, getMarketUrl, calculateUsdValue } from '@/lib/utils'
import { getChainConfig } from '@/lib/morpho/constants'
import { calculateCostBasis, calculateProfit } from '@/lib/transactionStore'

interface PositionsTableProps {
  positions: EnrichedUserPosition[]
  isLoading: boolean
  error: Error | null
}

export function PositionsTable({ positions, isLoading, error }: PositionsTableProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const chainConfig = getChainConfig(chainId)
  const [selectedPosition, setSelectedPosition] = useState<EnrichedUserPosition | null>(null)

  return (
    <div>
      {/* Spacer to match Markets filter section height */}
      <div className="h-[46px]" />
      <ScrollHint className="min-h-[400px]">
        <Table className="table-fixed-layout">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-base normal-case tracking-normal w-[140px]">
                Market
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[160px]">
                Average
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[160px]">
                Position
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[140px]">
                Profit
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[80px]">
                Utilization
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[70px]">
                LLTV
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[110px]">
                Net APY
              </TableHead>
              <TableHead className="text-base normal-case tracking-normal w-[100px] sticky right-0 bg-[var(--bg-primary)]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoading columns={POSITIONS_SKELETON_COLUMNS} />
            ) : error ? (
              <TableError colSpan={8} message="Failed to load positions. Please try again." />
            ) : positions.length === 0 ? (
              <TableEmpty
                colSpan={8}
                title="No positions yet"
                description="Supply to a market to see your positions here."
              />
            ) : (
              positions.map((position) => {
                const market = position.market
                const currentTokens = BigInt(position.supplyAssets)
                const supplyAmount = formatTokenAmount(currentTokens, market.loanAsset.decimals)
                const valueUsd = calculateUsdValue(position.supplyAssets, market.loanAsset.decimals, market.loanAsset.priceUsd)

                // 优先使用 API 交易数据计算，否则回退到本地存储
                const apiProfitData = position.profitData
                const hasApiData = apiProfitData !== null

                // 本地存储数据作为备选
                const costBasis = !hasApiData && address
                  ? calculateCostBasis(address, chainId, market.uniqueKey)
                  : null
                const hasLocalHistory = costBasis && costBasis.transactions.length > 0

                // 判断是否有任何数据来源
                const hasHistory = hasApiData || hasLocalHistory

                // Average (净存入量 = 总供应 - 总提取) - token 计价
                const averageDeposit = hasApiData
                  ? formatTokenAmount(apiProfitData.netDeposited, market.loanAsset.decimals)
                  : hasLocalHistory
                    ? formatTokenAmount(costBasis.netDeposited, market.loanAsset.decimals)
                    : null

                // Profit 计算 - token 计价
                let profitValue: bigint | null = null
                let profitFormatted: string | null = null
                let profitPercent: number | null = null

                if (hasApiData) {
                  profitValue = apiProfitData.profit
                  profitFormatted = formatTokenAmount(
                    profitValue >= 0n ? profitValue : -profitValue,
                    market.loanAsset.decimals
                  )
                  profitPercent = apiProfitData.profitPercent
                } else if (hasLocalHistory) {
                  const localProfit = calculateProfit(costBasis, currentTokens)
                  if (localProfit !== null) {
                    profitValue = localProfit
                    profitFormatted = formatTokenAmount(
                      localProfit >= 0n ? localProfit : -localProfit,
                      market.loanAsset.decimals
                    )
                    // Calculate profit percent from local data
                    if (costBasis.netDeposited > 0n) {
                      profitPercent = Number(localProfit * 10000n / costBasis.netDeposited) / 100
                    }
                  }
                }

                return (
                  <TableRow key={market.uniqueKey}>
                    {/* Market */}
                    <TableCell className="py-5">
                      <a
                        href={getMarketUrl(
                          chainConfig.morphoAppUrl,
                          market.uniqueKey,
                          market.loanAsset.symbol,
                          market.collateralAsset?.symbol ?? 'NONE'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2"
                      >
                        <div className="flex flex-col gap-0.5 min-h-[52px] justify-center">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <TokenLogo
                              address={market.loanAsset.address}
                              symbol={market.loanAsset.symbol}
                              logoURI={market.loanAsset.logoURI}
                              size="sm"
                            />
                            <span className="text-[var(--text-primary)] font-medium text-base group-hover:underline">
                              {market.loanAsset.symbol}
                            </span>
                          </div>
                          {market.collateralAsset && (
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <TokenLogo
                                address={market.collateralAsset.address}
                                symbol={market.collateralAsset.symbol}
                                logoURI={market.collateralAsset.logoURI}
                                size="sm"
                              />
                              <span className="text-[var(--text-secondary)] text-sm group-hover:underline">
                                {market.collateralAsset.symbol}
                              </span>
                            </div>
                          )}
                        </div>
                      </a>
                    </TableCell>
                    {/* Average (净存入量 = 总供应 - 总提取) */}
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
                    {/* Profit (收益 = 当前持有 - 净存入量) */}
                    <TableCell className={`py-5 text-base tabular-nums ${
                      profitValue !== null && profitValue > 0n
                        ? 'text-[var(--success)]'
                        : profitValue !== null && profitValue < 0n
                        ? 'text-[var(--error)]'
                        : 'text-[var(--text-secondary)]'
                    }`}>
                      {hasHistory && profitValue !== null ? (
                        <div className="flex flex-col min-h-[52px] justify-center">
                          <div className="flex items-center gap-1">
                            <TokenLogo
                              address={market.loanAsset.address}
                              symbol={market.loanAsset.symbol}
                              logoURI={market.loanAsset.logoURI}
                              size="sm"
                            />
                            <span>{profitValue >= 0n ? '+' : '-'}{profitFormatted}</span>
                          </div>
                          {profitPercent !== null && (
                            <span className="text-sm">
                              {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                            </span>
                          )}
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
                    <TableCell className="py-5 sticky right-0 bg-[var(--bg-primary)] transition-colors duration-150 group-hover:bg-[var(--bg-tertiary)]">
                      <Button onClick={() => setSelectedPosition(position)} className="w-24">
                        Withdraw
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </ScrollHint>

      {selectedPosition && (
        <WithdrawModal
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
        />
      )}
    </div>
  )
}
