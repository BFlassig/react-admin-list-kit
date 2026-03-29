import type { Table } from '@tanstack/react-table'
import { SlidersHorizontal } from 'lucide-react'
import { Checkbox } from '../../../components/ui/Checkbox'
import type { User } from '../../../types/user'

interface ColumnVisibilityMenuProps {
  table: Table<User>
}

const labelMap: Record<string, string> = {
  fullName: 'Name',
  role: 'Role',
  status: 'Status',
  team: 'Team',
  createdAt: 'Created',
  lastActiveAt: 'Last active',
}

export const ColumnVisibilityMenu = ({ table }: ColumnVisibilityMenuProps) => {
  const columns = table.getAllLeafColumns().filter((column) => column.getCanHide())

  return (
    <details className="group relative">
      <summary className="flex h-10 w-full cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto group-open:border-blue-300 group-open:bg-blue-50/70">
        <SlidersHorizontal className="size-4" />
        Columns
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/10">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Visible columns</p>
        {columns.map((column) => (
          <label
            key={column.id}
            className="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <span>{labelMap[column.id] ?? column.id}</span>
            <Checkbox checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()} />
          </label>
        ))}
      </div>
    </details>
  )
}
