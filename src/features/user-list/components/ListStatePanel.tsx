import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface ListStatePanelProps {
  variant: 'loading' | 'empty' | 'error'
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const ListStatePanel = ({ variant, title, description, actionLabel, onAction }: ListStatePanelProps) => {
  const Icon =
    variant === 'loading'
      ? LoaderCircle
      : variant === 'error'
        ? AlertTriangle
        : Inbox

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div
        className={
          variant === 'error'
            ? 'rounded-full bg-rose-100 p-3 text-rose-700'
            : variant === 'loading'
              ? 'rounded-full bg-blue-100 p-3 text-blue-700'
              : 'rounded-full bg-slate-100 p-3 text-slate-600'
        }
      >
        <Icon className={variant === 'loading' ? 'size-6 animate-spin' : 'size-6'} />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="max-w-md text-sm leading-6 text-slate-500">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button size="sm" variant={variant === 'error' ? 'primary' : 'secondary'} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
