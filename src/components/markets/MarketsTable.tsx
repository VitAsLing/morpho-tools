import { useState, useMemo } from 'react'
import { useChainId } from 'wagmi'
import type { Market, SortField, SortDirection } from '@/types'
import { ApyDisplay } from './ApyDisplay'
import { SupplyModal } from './SupplyModal'
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
import { Slider } from '@/components/ui/slider'
import { formatUsd, formatPercent, getMarketUrl } from '@/lib/utils'
import { getChainConfig } from '@/lib/morpho/constants'

interface MarketsTableProps {
  markets: Market[]
  isLoading: boolean
  error: Error | null
}

export function MarketsTable({ markets, isLoading, error }: MarketsTableProps) {
  const chainId = useChainId()
  const chainConfig = getChainConfig(chainId)
  const [sortField, setSortField] = useState<SortField>('totalSupply')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [minSupply, setMinSupply] = useState(10)
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
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

      const supplyUsd =
        (Number(m.state.supplyAssets) / 10 ** m.loanAsset.decimals) *
        (m.loanAsset.priceUsd ?? 0)
      return supplyUsd >= minSupply * 1_000_000
    })

    result.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortField) {
        case 'market':
          aValue = a.loanAsset.symbol.localeCompare(b.loanAsset.symbol)
          bValue = 0
          break
        case 'totalSupply':
          aValue =
            (Number(a.state.supplyAssets) / 10 ** a.loanAsset.decimals) *
            (a.loanAsset.priceUsd ?? 0)
          bValue =
            (Number(b.state.supplyAssets) / 10 ** b.loanAsset.decimals) *
            (b.loanAsset.priceUsd ?? 0)
          break
        case 'totalBorrow':
          aValue =
            (Number(a.state.borrowAssets) / 10 ** a.loanAsset.decimals) *
            (a.loanAsset.priceUsd ?? 0)
          bValue =
            (Number(b.state.borrowAssets) / 10 ** b.loanAsset.decimals) *
            (b.loanAsset.priceUsd ?? 0)
          break
        case 'liquidity':
          aValue =
            ((Number(a.state.supplyAssets) - Number(a.state.borrowAssets)) /
              10 ** a.loanAsset.decimals) *
            (a.loanAsset.priceUsd ?? 0)
          bValue =
            ((Number(b.state.supplyAssets) - Number(b.state.borrowAssets)) /
              10 ** b.loanAsset.decimals) *
            (b.loanAsset.priceUsd ?? 0)
          break
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
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-4" style={{ height: '36px', marginBottom: '10px' }}>
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base text-[var(--text-secondary)] whitespace-nowrap">Min Supply:</span>
          <Slider
            value={[minSupply]}
            onValueChange={(value) => setMinSupply(value[0])}
            min={0}
            max={100}
            step={10}
            className="w-24 sm:w-40"
          />
          <span className="text-sm sm:text-base text-[var(--text-primary)] w-12 sm:w-14">${minSupply}M</span>
        </div>
      </div>

      <div className="overflow-x-auto" style={{ minHeight: '400px' }}>
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
              <TableHead className="text-base normal-case tracking-normal w-[80px]">
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
                    Loading markets...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="text-center py-12 text-[var(--error)]">
                  Failed to load markets. Please try again.
                </TableCell>
              </TableRow>
            ) : filteredAndSortedMarkets.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="text-center py-12 text-[var(--text-secondary)]">
                  No markets found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedMarkets.map((market) => {
                const totalSupplyUsd =
                  (Number(market.state.supplyAssets) / 10 ** market.loanAsset.decimals) *
                  (market.loanAsset.priceUsd ?? 0)
                const totalBorrowUsd =
                  (Number(market.state.borrowAssets) / 10 ** market.loanAsset.decimals) *
                  (market.loanAsset.priceUsd ?? 0)
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
                          <div className="flex items-center gap-2">
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
                            <div className="flex items-center gap-2">
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
                    <TableCell className="py-5">
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
      </div>

      {selectedMarket && (
        <SupplyModal market={selectedMarket} onClose={() => setSelectedMarket(null)} />
      )}
    </div>
  )
}
