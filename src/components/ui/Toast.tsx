import { useEffect, useState } from 'react'
import { getToasts, subscribeToasts, removeToast, type Toast } from '@/lib/toastStore'

function ToastItem({ toast }: { toast: Toast }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => removeToast(toast.id), 200)
  }

  const borderColor = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
  }[toast.type]

  const iconBg = {
    success: 'bg-green-500/15',
    error: 'bg-red-500/15',
    info: 'bg-blue-500/15',
  }[toast.type]

  const iconColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  }[toast.type]

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 w-[320px] rounded-xl border backdrop-blur-sm
        shadow-lg shadow-black/20
        transition-all duration-200 ease-out
        animate-slide-in
        ${borderColor}
        ${isExiting ? 'opacity-0 translate-x-4' : ''}
      `}
      style={{
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {/* 图标 */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {toast.type === 'success' && (
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {toast.type === 'error' && (
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {toast.type === 'info' && (
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-medium text-[var(--text-primary)] leading-5">{toast.message}</p>
        {toast.link && (
          <a
            href={toast.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] mt-2 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{toast.link.text}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={handleClose}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] flex-shrink-0 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState(getToasts())

  useEffect(() => {
    const unsubscribe = subscribeToasts(() => setToasts(getToasts()))
    return () => { unsubscribe() }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
