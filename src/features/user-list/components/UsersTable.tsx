import { flexRender, type Table } from '@tanstack/react-table'
import { LoaderCircle } from 'lucide-react'
import { ListStatePanel } from './ListStatePanel'
import type { User } from '../../../types/user'
import { cn } from '../../../utils/cn'

interface UsersTableProps {
  table: Table<User>
  isLoading: boolean
  error: string | null
  stickyHeader: boolean
  onRetry: () => void
  onClearFilters: () => void
}

export const UsersTable = ({ table, isLoading, error, stickyHeader, onRetry, onClearFilters }: UsersTableProps) => {
  if (error) {
    return (
      <ListStatePanel
        variant="error"
        title="Unable to load users"
        description={error}
        actionLabel="Retry"
        onAction={onRetry}
      />
    )
  }

  const rows = table.getRowModel().rows

  if (isLoading && rows.length === 0) {
    return (
      <ListStatePanel
        variant="loading"
        title="Loading users"
        description="Pulling the latest list state from the demo API."
      />
    )
  }

  if (!isLoading && rows.length === 0) {
    return (
      <ListStatePanel
        variant="empty"
        title="No users found"
        description="No users match this combination of search and filters."
        actionLabel="Clear filters"
        onAction={onClearFilters}
      />
    )
  }

  return (
    <div className="relative max-h-[560px] overflow-auto">
      <table className="w-full min-w-[980px] border-separate border-spacing-0">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold text-slate-600',
                    stickyHeader &&
                      'sticky top-0 z-30 bg-slate-50 shadow-[inset_0_-1px_0_0_rgba(226,232,240,1),0_1px_0_0_rgba(148,163,184,0.28)]',
                    header.column.columnDef.meta?.className,
                  )}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                'bg-white transition-colors hover:bg-slate-50/70',
                row.getIsSelected() && 'bg-blue-50 hover:bg-blue-50',
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    'border-b border-slate-200 px-3 py-2 align-middle text-sm text-slate-800',
                    cell.column.columnDef.meta?.className,
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {isLoading && (
        <div className="absolute inset-x-0 top-0 flex h-11 items-center justify-center border-b border-slate-200 bg-white/65 backdrop-blur-[1px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <LoaderCircle className="size-3.5 animate-spin" />
            Refreshing
          </span>
        </div>
      )}
    </div>
  )
}
