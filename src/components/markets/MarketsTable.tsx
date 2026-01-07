import { useState, useMemo } from 'react'
import { useSelectedChainId } from '@/providers/ChainProvider'
import type { Market, SortField, SortDirection } from '@/types'
import { ApyDisplay } from './ApyDisplay'
import { SupplyModal } from './SupplyModal'
import { TokenLogo } from '@/components/common/TokenLogo'
import { Button } from '@/components/ui/button'
import { TableLoading, TableEmpty, TableError, MARKETS_SKELETON_COLUMNS } from '@/components/ui/TableState'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Slider } from '@/components/ui/slider'
import { ScrollHint } from '@/components/ui/ScrollHint'
import { formatUsd, formatPercent, getMarketUrl, calculateUsdValue } from '@/lib/utils'
import { getChainConfig } from '@/lib/morpho/constants'

interface MarketsTableProps {
  markets: Market[]
  isLoading: boolean
  error: Error | null
}

const MIN_SUPPLY_KEY = 'morpho-tools-min-supply'
const SORT_FIELD_KEY = 'morpho-tools-markets-sort-field'
const SORT_DIRECTION_KEY = 'morpho-tools-markets-sort-direction'

export function MarketsTable({ markets, isLoading, error }: MarketsTableProps) {
  const chainId = useSelectedChainId()
  const chainConfig = getChainConfig(chainId)
  const [sortField, setSortField] = useState<SortField>(() => {
    try {
      const saved = localStorage.getItem(SORT_FIELD_KEY)
      if (saved && ['market', 'totalSupply', 'totalBorrow', 'liquidity', 'utilization', 'lltv', 'netApy'].includes(saved)) {
        return saved as SortField
      }
    } catch {
      // localStorage 不可用时忽略
    }
    return 'totalSupply'
  })
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    try {
      const saved = localStorage.getItem(SORT_DIRECTION_KEY)
      if (saved === 'asc' || saved === 'desc') {
        return saved
      }
    } catch {
      // localStorage 不可用时忽略
    }
    return 'desc'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [minSupply, setMinSupply] = useState(() => {
    try {
      const saved = localStorage.getItem(MIN_SUPPLY_KEY)
      if (saved) {
        const value = Number(saved)
        // 验证是有效数字且在合理范围内
        if (!Number.isNaN(value) && value >= 0 && value <= 100) {
          return value
        }
      }
    } catch {
      // localStorage 不可用时忽略
    }
    return 10
  })
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)

  const handleMinSupplyChange = (value: number[]) => {
    const newValue = value[0]
    setMinSupply(newValue)
    try {
      localStorage.setItem(MIN_SUPPLY_KEY, String(newValue))
    } catch {
      // localStorage 不可用时忽略
    }
  }

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'desc'
    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      setSortDirection(newDirection)
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    try {
      localStorage.setItem(SORT_FIELD_KEY, field)
      localStorage.setItem(SORT_DIRECTION_KEY, sortField === field ? newDirection : 'desc')
    } catch {
      // localStorage 不可用时忽略
    }
  }

  const filteredAndSortedMarkets = useMemo(() => {
    let result = [...markets]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.loanAsset.symbol.toLowerCase().includes(query) ||
          m.collateralAsset?.symbol.toLowerCase().includes(query)
      )
    }

    result = result.filter((m) => {
      // 排除没有抵押品或 LLTV 为 0 的市场（idle market）
      if (!m.collateralAsset || Number(m.lltv) === 0) return false

      const supplyUsd = calculateUsdValue(m.state.supplyAssets, m.loanAsset.decimals, m.loanAsset.priceUsd)
      return supplyUsd >= minSupply * 1_000_000
    })

    // Helper to get market USD values for sorting
    const getMarketValues = (m: Market) => ({
      supplyUsd: calculateUsdValue(m.state.supplyAssets, m.loanAsset.decimals, m.loanAsset.priceUsd),
      borrowUsd: calculateUsdValue(m.state.borrowAssets, m.loanAsset.decimals, m.loanAsset.priceUsd),
    })

    result.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortField) {
        case 'market':
          aValue = a.loanAsset.symbol.localeCompare(b.loanAsset.symbol)
          bValue = 0
          break
        case 'totalSupply': {
          aValue = getMarketValues(a).supplyUsd
          bValue = getMarketValues(b).supplyUsd
          break
        }
        case 'totalBorrow': {
          aValue = getMarketValues(a).borrowUsd
          bValue = getMarketValues(b).borrowUsd
          break
        }
        case 'liquidity': {
          const aVals = getMarketValues(a)
          const bVals = getMarketValues(b)
          aValue = aVals.supplyUsd - aVals.borrowUsd
          bValue = bVals.supplyUsd - bVals.borrowUsd
          break
        }
        case 'utilization':
          aValue = a.state.utilization
          bValue = b.state.utilization
          break
        case 'lltv':
          aValue = Number(a.lltv)
          bValue = Number(b.lltv)
          break
        case 'netApy':
          aValue = a.state.netSupplyApy
          bValue = b.state.netSupplyApy
          break
        default:
          aValue = 0
          bValue = 0
      }

      if (sortField === 'market') {
        return sortDirection === 'asc' ? aValue : -aValue
      }
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    })

    return result
  }, [markets, searchQuery, minSupply, sortField, sortDirection])

  const SortHeader = ({
    field,
    children,
    className = '',
  }: {
    field: SortField
    children: React.ReactNode
    className?: string
  }) => (
    <TableHead
      className={`text-base normal-case tracking-normal cursor-pointer hover:text-[var(--text-primary)] ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-[var(--accent)]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </TableHead>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-4 h-9 mb-2.5">
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base text-[var(--text-secondary)] whitespace-nowrap">Min Supply:</span>
          <Slider
            value={[minSupply]}
            onValueChange={handleMinSupplyChange}
            min={0}
            max={100}
            step={10}
            className="w-24 sm:w-40"
          />
          <span className="text-sm sm:text-base text-[var(--text-primary)] w-12 sm:w-14">${minSupply}M</span>
        </div>
      </div>

      <ScrollHint className="min-h-[400px]">
        <Table className="table-fixed-layout">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-base normal-case tracking-normal w-[140px] group/search">
                <div className="relative h-7 flex items-center">
                  <span className={`flex items-center gap-1 text-base font-semibold text-[var(--text-secondary)] transition-opacity pointer-events-none ${searchQuery ? 'opacity-0' : 'group-hover/search:opacity-0 group-focus-within/search:opacity-0'}`}>
                    Market
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`absolute inset-0 bg-transparent border-none outline-none text-base font-semibold text-[var(--text-secondary)] transition-opacity ${searchQuery ? 'opacity-100' : 'opacity-0 group-hover/search:opacity-100 focus:opacity-100'}`}
                  />
                </div>
              </TableHead>
              <SortHeader field="totalSupply" className="w-[100px]">
                Total Supply
              </SortHeader>
              <SortHeader field="totalBorrow" className="w-[100px]">
                Total Borrow
              </SortHeader>
              <SortHeader field="liquidity" className="w-[100px]">
                Liquidity
              </SortHeader>
              <SortHeader field="utilization" className="w-[80px]">
                Utilization
              </SortHeader>
              <SortHeader field="lltv" className="w-[60px]">
                LLTV
              </SortHeader>
              <SortHeader field="netApy" className="w-[120px]">
                Net APY
              </SortHeader>
              <TableHead className="text-base normal-case tracking-normal w-[100px] sticky right-0 bg-[var(--bg-primary)]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoading columns={MARKETS_SKELETON_COLUMNS} />
            ) : error ? (
              <TableError colSpan={8} message="Failed to load markets. Please try again." />
            ) : filteredAndSortedMarkets.length === 0 ? (
              <TableEmpty
                colSpan={8}
                title="No markets found"
                description="Try adjusting your search or filter settings."
              />
            ) : (
              filteredAndSortedMarkets.map((market) => {
                const totalSupplyUsd = calculateUsdValue(market.state.supplyAssets, market.loanAsset.decimals, market.loanAsset.priceUsd)
                const totalBorrowUsd = calculateUsdValue(market.state.borrowAssets, market.loanAsset.decimals, market.loanAsset.priceUsd)
                const liquidityUsd = totalSupplyUsd - totalBorrowUsd

                return (
                  <TableRow key={market.uniqueKey}>
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
                    <TableCell className="py-5 text-base tabular-nums">
                      {formatUsd(totalSupplyUsd)}
                    </TableCell>
                    <TableCell className="py-5 text-base tabular-nums">
                      {formatUsd(totalBorrowUsd)}
                    </TableCell>
                    <TableCell className="py-5 text-[var(--success)] text-base tabular-nums">
                      {formatUsd(liquidityUsd)}
                    </TableCell>
                    <TableCell className="py-5 text-base tabular-nums">
                      {formatPercent(market.state.utilization)}
                    </TableCell>
                    <TableCell className="py-5 text-base tabular-nums">
                      {formatPercent(Number(market.lltv) / 1e18)}
                    </TableCell>
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
                    <TableCell className="py-5 sticky right-0 bg-[var(--bg-primary)] transition-colors duration-150 group-hover:bg-[var(--bg-tertiary)]">
                      <Button onClick={() => setSelectedMarket(market)} className="w-24">
                        Supply
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </ScrollHint>

      {selectedMarket && (
        <SupplyModal market={selectedMarket} onClose={() => setSelectedMarket(null)} />
      )}
    </div>
  )
}
