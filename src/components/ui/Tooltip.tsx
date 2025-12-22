import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      let x = 0
      let y = 0

      switch (position) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
          y = triggerRect.top - tooltipRect.height - 8
          break
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
          y = triggerRect.bottom + 8
          break
        case 'left':
          x = triggerRect.left - tooltipRect.width - 8
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
          break
        case 'right':
          x = triggerRect.right + 8
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
          break
      }

      // 确保不超出视口
      x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8))
      y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8))

      setCoords({ x, y })
    }
  }, [isVisible, position])

  const tooltipElement = isVisible ? (
    <div
      ref={tooltipRef}
      className={cn(
        'fixed z-50 px-3 py-2 text-sm rounded-lg shadow-lg',
        'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border)]',
        'max-w-xs',
        className
      )}
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
      }}
    >
      {content}
    </div>
  ) : null

  return (
    <span
      ref={triggerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className="inline-flex items-center cursor-help"
    >
      {children}
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </span>
  )
}

// 带问号图标的 InfoTooltip
interface InfoTooltipProps {
  content: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function InfoTooltip({ content, position = 'top' }: InfoTooltipProps) {
  return (
    <Tooltip content={content} position={position}>
      <svg
        className="w-4 h-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </Tooltip>
  )
}
