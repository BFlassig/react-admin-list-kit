import type { ReactNode } from 'react'
import { Download, Search, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import type { Team, UserRole, UserStatus } from '../../../types/user'
import { cn } from '../../../utils/cn'

interface UserListToolbarProps {
  search: string
  role: UserRole | 'all'
  status: UserStatus | 'all'
  team: Team | 'all'
  roleOptions: Array<UserRole | 'all'>
  statusOptions: Array<UserStatus | 'all'>
  teamOptions: Array<Team | 'all'>
  onSearchChange: (value: string) => void
  onSearchReset: () => void
  onRoleChange: (value: UserRole | 'all') => void
  onStatusChange: (value: UserStatus | 'all') => void
  onTeamChange: (value: Team | 'all') => void
  onResetView: () => void
  hasCustomView: boolean
  onExportFiltered: () => void
  columnVisibilityControl: ReactNode
}

const toLabel = (value: string) => (value === 'all' ? 'All' : value)

interface FilterSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  className?: string
}

const FilterSelect = ({ label, value, options, onChange, className }: FilterSelectProps) => (
  <div className={cn('space-y-1', className)}>
    <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <Select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {toLabel(option)}
        </option>
      ))}
    </Select>
  </div>
)

export const UserListToolbar = ({
  search,
  role,
  status,
  team,
  roleOptions,
  statusOptions,
  teamOptions,
  onSearchChange,
  onSearchReset,
  onRoleChange,
  onStatusChange,
  onTeamChange,
  onResetView,
  hasCustomView,
  onExportFiltered,
  columnVisibilityControl,
}: UserListToolbarProps) => (
  <div className="space-y-3">
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[260px] grow basis-full space-y-1 xl:basis-[340px]">
        <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Search</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search users by name or email"
            className="pl-9 pr-10"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={onSearchReset}
              className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <FilterSelect
        label="Role"
        value={role}
        options={roleOptions}
        className="w-full sm:w-[180px]"
        onChange={(value) => onRoleChange(value as UserRole | 'all')}
      />

      <FilterSelect
        label="Status"
        value={status}
        options={statusOptions}
        className="w-full sm:w-[180px]"
        onChange={(value) => onStatusChange(value as UserStatus | 'all')}
      />

      <FilterSelect
        label="Team"
        value={team}
        options={teamOptions}
        className="w-full sm:w-[180px]"
        onChange={(value) => onTeamChange(value as Team | 'all')}
      />

      <div className="w-full space-y-1 sm:w-auto sm:ml-auto xl:ml-0">
        <p className="invisible px-1 text-xs font-semibold uppercase tracking-wide">Columns</p>
        {columnVisibilityControl}
      </div>

      <div className="w-full space-y-1 sm:w-auto">
        <p className="invisible px-1 text-xs font-semibold uppercase tracking-wide">Export</p>
        <Button variant="secondary" onClick={onExportFiltered} className="w-full sm:w-auto">
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>
    </div>

    {hasCustomView && (
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" onClick={onResetView}>
          Reset view
        </Button>
      </div>
    )}
  </div>
)
