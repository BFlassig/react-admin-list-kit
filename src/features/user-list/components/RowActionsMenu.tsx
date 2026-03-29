import { useEffect, useRef } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '../../../utils/cn'

interface RowActionsMenuProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onView: () => void
  onEdit: () => void
  statusActionLabel: string
  statusActionTone: 'activate' | 'deactivate'
  onStatusAction: () => void
  onDelete: () => void
}

export const RowActionsMenu = ({
  isOpen,
  onOpenChange,
  onView,
  onEdit,
  statusActionLabel,
  statusActionTone,
  onStatusAction,
  onDelete,
}: RowActionsMenuProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (!containerRef.current?.contains(target)) {
        onOpenChange(false)
      }
    }

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (!containerRef.current?.contains(target)) {
        onOpenChange(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onOpenChange])

  const runAction = (action: () => void) => {
    action()
    onOpenChange(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className={cn(
          'flex h-[30px] w-[30px] items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 shadow-sm transition-colors',
          isOpen ? 'border-blue-300 bg-blue-50 text-blue-700' : 'hover:bg-slate-50',
        )}
        aria-label="Open row actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-36 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onView)}
            className="block w-full rounded px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            View
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onEdit)}
            className="block w-full rounded px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onStatusAction)}
            className={cn(
              'block w-full rounded px-2 py-1.5 text-left text-sm',
              statusActionTone === 'deactivate'
                ? 'text-rose-700 hover:bg-rose-50'
                : 'text-emerald-700 hover:bg-emerald-50',
            )}
          >
            {statusActionLabel}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onDelete)}
            className="block w-full rounded px-2 py-1.5 text-left text-sm text-rose-700 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
