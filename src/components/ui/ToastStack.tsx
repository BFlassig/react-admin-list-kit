import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface ToastItem {
  id: number
  tone: 'success' | 'info' | 'error'
  message: string
}

interface ToastStackProps {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

const toneStyles = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-900',
  },
  error: {
    icon: AlertCircle,
    className: 'border-rose-200 bg-rose-50 text-rose-900',
  },
}

export const ToastStack = ({ toasts, onDismiss }: ToastStackProps) => {
  useEffect(() => {
    if (toasts.length === 0) {
      return
    }

    const timeoutIds = toasts.map((toast) =>
      window.setTimeout(() => {
        onDismiss(toast.id)
      }, 3200),
    )

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id))
    }
  }, [toasts, onDismiss])

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => {
        const style = toneStyles[toast.tone]
        const Icon = style.icon

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg shadow-slate-900/5',
              style.className,
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <p>{toast.message}</p>
          </div>
        )
      })}
    </div>
  )
}
