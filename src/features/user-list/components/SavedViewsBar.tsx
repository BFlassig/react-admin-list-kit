import type { SavedView } from '../savedViews'
import { cn } from '../../../utils/cn'

interface SavedViewsBarProps {
  views: SavedView[]
  activeViewId?: string
  onSelect: (view: SavedView) => void
}

export const SavedViewsBar = ({ views, activeViewId, onSelect }: SavedViewsBarProps) => (
  <div className="flex flex-wrap items-center gap-2">
    {views.map((view) => {
      const isActive = view.id === activeViewId

      return (
        <button
          key={view.id}
          type="button"
          onClick={() => onSelect(view)}
          className={cn(
            'rounded-md border px-3.5 py-2 text-sm font-semibold transition-colors',
            isActive
              ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm'
              : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
          )}
          aria-pressed={isActive}
        >
          {view.label}
        </button>
      )
    })}
  </div>
)
