import { useEffect, useState } from 'react'
import { getToasts, subscribeToasts, removeToast } from '@/lib/toastStore'

export function ToastContainer() {
  const [toasts, setToasts] = useState(getToasts())

  useEffect(() => {
    const unsubscribe = subscribeToasts(() => setToasts(getToasts()))
    return () => { unsubscribe() }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 px-4 py-3 shadow-xl w-[280px]"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          {/* 图标 */}
          {toast.type === 'success' && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500/15">
              <svg className="w-4 h-4 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {toast.type === 'error' && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-red-500/15">
              <svg className="w-4 h-4 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          {toast.type === 'info' && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500/15">
              <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}

          {/* 内容 */}
          <div className="flex-1 min-w-0 py-1">
            <p className="text-sm font-medium text-[var(--text-primary)] leading-5">{toast.message}</p>
            {toast.link && (
              <a
                href={toast.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline mt-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {toast.link.text}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={() => removeToast(toast.id)}
            className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex-shrink-0 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
