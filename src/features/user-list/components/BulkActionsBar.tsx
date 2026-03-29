import { Download, Power, Trash2, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface BulkActionsBarProps {
  selectedCount: number
  onExport: () => void
  onDeactivate: () => void
  onDelete: () => void
  onClear: () => void
  isBusy?: boolean
}

export const BulkActionsBar = ({
  selectedCount,
  onExport,
  onDeactivate,
  onDelete,
  onClear,
  isBusy = false,
}: BulkActionsBarProps) => (
  <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-blue-50/60 px-4 py-2.5">
    <span className="rounded-md border border-blue-200 bg-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-800">
      {selectedCount} selected
    </span>

    <Button size="sm" variant="secondary" onClick={onExport} disabled={isBusy}>
      <Download className="size-4" />
      Export selected
    </Button>

    <Button size="sm" variant="secondary" onClick={onDeactivate} disabled={isBusy}>
      <Power className="size-4" />
      Deactivate
    </Button>

    <Button size="sm" variant="danger" onClick={onDelete} disabled={isBusy}>
      <Trash2 className="size-4" />
      Delete
    </Button>

    <Button size="sm" variant="ghost" onClick={onClear} className="ml-auto" disabled={isBusy}>
      <X className="size-4" />
      Clear
    </Button>
  </div>
)
