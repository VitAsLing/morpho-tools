import type { ReactNode } from 'react'

interface TableStateProps {
  colSpan: number
}

// 骨架屏列配置
interface SkeletonColumn {
  width?: string      // 骨架宽度，如 'w-20', 'w-full'
  hasSubRow?: boolean // 是否有子行（如 Market 列有两行）
  isAction?: boolean  // 是否是 Action 列（sticky）
}

interface TableLoadingProps {
  columns: SkeletonColumn[]
  rows?: number
}

// 加载状态 - 带骨架屏效果，匹配实际数据结构
export function TableLoading({ columns, rows = 5 }: TableLoadingProps) {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[var(--border)]">
          {columns.map((col, colIndex) => (
            <td
              key={colIndex}
              className={`py-5 px-4 ${col.isAction ? 'sticky right-0 bg-[var(--bg-primary)]' : ''}`}
            >
              {col.hasSubRow ? (
                // 双行结构（如 Market 列）
                <div className="flex flex-col gap-2 min-h-[52px] justify-center" style={{ opacity: 1 - rowIndex * 0.12 }}>
                  <div className="flex items-center gap-2">
                    <div className="skeleton w-5 h-5 rounded-full shrink-0" />
                    <div className={`skeleton h-4 ${col.width || 'w-16'}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="skeleton w-5 h-5 rounded-full shrink-0" />
                    <div className="skeleton h-3 w-12" />
                  </div>
                </div>
              ) : col.isAction ? (
                // Action 按钮
                <div className="skeleton h-10 w-24 rounded-lg" style={{ opacity: 1 - rowIndex * 0.12 }} />
              ) : (
                // 普通单行
                <div className={`skeleton h-5 ${col.width || 'w-full'}`} style={{ opacity: 1 - rowIndex * 0.12 }} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// 预定义的列配置
export const MARKETS_SKELETON_COLUMNS: SkeletonColumn[] = [
  { hasSubRow: true, width: 'w-16' },  // Market
  { width: 'w-20' },                    // Total Supply
  { width: 'w-20' },                    // Total Borrow
  { width: 'w-20' },                    // Liquidity
  { width: 'w-14' },                    // Utilization
  { width: 'w-12' },                    // LLTV
  { width: 'w-16' },                    // Net APY
  { isAction: true },                   // Action
]

export const POSITIONS_SKELETON_COLUMNS: SkeletonColumn[] = [
  { hasSubRow: true, width: 'w-16' },  // Market
  { width: 'w-20' },                    // Average
  { hasSubRow: true, width: 'w-20' },  // Position (有 USD 子行)
  { hasSubRow: true, width: 'w-16' },  // Profit (有百分比子行)
  { width: 'w-14' },                    // Utilization
  { width: 'w-12' },                    // LLTV
  { width: 'w-16' },                    // Net APY
  { isAction: true },                   // Action
]

export const REWARDS_SKELETON_COLUMNS: SkeletonColumn[] = [
  { width: 'w-16' },                    // Source
  { hasSubRow: true, width: 'w-20' },  // Claimed
  { hasSubRow: true, width: 'w-20' },  // Claimable
  { hasSubRow: true, width: 'w-20' },  // Next Claimable
  { isAction: true },                   // Action
]

// 空状态
interface TableEmptyProps extends TableStateProps {
  icon?: ReactNode
  title?: string
  description?: string
}

export function TableEmpty({
  colSpan,
  icon,
  title = 'No data found',
  description = 'There is no data to display at the moment.'
}: TableEmptyProps) {
  return (
    <tr className="hover:bg-transparent">
      <td colSpan={colSpan}>
        <div className="table-state-container">
          {icon || (
            <svg className="table-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          )}
          <p className="table-state-title">{title}</p>
          <p className="table-state-description">{description}</p>
        </div>
      </td>
    </tr>
  )
}

// 错误状态
interface TableErrorProps extends TableStateProps {
  message?: string
  onRetry?: () => void
}

export function TableError({
  colSpan,
  message = 'Failed to load data. Please try again.',
  onRetry
}: TableErrorProps) {
  return (
    <tr className="hover:bg-transparent">
      <td colSpan={colSpan}>
        <div className="table-state-container">
          <svg className="table-state-icon text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="table-state-title text-[var(--error)]">Error</p>
          <p className="table-state-description">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-primary)] rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
