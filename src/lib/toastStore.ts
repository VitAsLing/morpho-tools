type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  link?: {
    url: string
    text: string
  }
}

type Listener = () => void

let toasts: Toast[] = []
const listeners: Set<Listener> = new Set()

function notify() {
  listeners.forEach((listener) => listener())
}

export function addToast(
  type: ToastType,
  message: string,
  link?: { url: string; text: string }
) {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { id, type, message, link }]
  notify()

  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(id)
  }, 5000)
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  notify()
}

export function getToasts() {
  return toasts
}

export function subscribeToasts(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
