import { useState, useEffect, useRef, type ReactNode } from 'react'

interface ScrollHintProps {
  children: ReactNode
  className?: string
}

export function ScrollHint({ children, className = '' }: ScrollHintProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftHint, setShowLeftHint] = useState(false)
  const [showRightHint, setShowRightHint] = useState(false)

  const checkScroll = () => {
    const el = containerRef.current
    if (!el) return

    const canScrollLeft = el.scrollLeft > 0
    const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1

    setShowLeftHint(canScrollLeft)
    setShowRightHint(canScrollRight)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // 初始检查
    checkScroll()

    // 监听滚动
    el.addEventListener('scroll', checkScroll)

    // 监听 resize
    const resizeObserver = new ResizeObserver(checkScroll)
    resizeObserver.observe(el)

    return () => {
      el.removeEventListener('scroll', checkScroll)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* 左侧渐变提示 */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--bg-primary)] to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
          showLeftHint ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 右侧渐变提示 */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none z-10 transition-opacity duration-200 ${
          showRightHint ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 可滚动内容 */}
      <div
        ref={containerRef}
        className="overflow-x-auto"
      >
        {children}
      </div>
    </div>
  )
}
