import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  RotateCcw,
  UserPlus,
} from 'lucide-react'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
  type VisibilityState,
} from '@tanstack/react-table'
import { userApi } from '../../data/mock/userApi'
import { roleOptions, statusOptions, teamOptions } from '../../data/mock/users'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Checkbox } from '../../components/ui/Checkbox'
import { Select } from '../../components/ui/Select'
import { ToastStack, type ToastItem } from '../../components/ui/ToastStack'
import { buildUsersCsv, downloadCsv } from '../../utils/csv'
import { formatDate, formatLastActive } from '../../utils/date'
import { cn } from '../../utils/cn'
import type { DemoState, SortField } from '../../types/list'
import type { User } from '../../types/user'
import { BulkActionsBar } from './components/BulkActionsBar'
import { ColumnVisibilityMenu } from './components/ColumnVisibilityMenu'
import { RowActionsMenu } from './components/RowActionsMenu'
import { SavedViewsBar } from './components/SavedViewsBar'
import { TablePagination } from './components/TablePagination'
import { UserListToolbar } from './components/UserListToolbar'
import { UserAvatar } from './components/UserAvatar'
import { UsersTable } from './components/UsersTable'
import { defaultUserListState, useUserListUrlState } from './hooks/useUserListUrlState'
import { useUsersQuery } from './hooks/useUsersQuery'
import { resolveSavedView, savedViews } from './savedViews'

const columnHelper = createColumnHelper<User>()

interface SortHeaderProps {
  label: string
  field: SortField
  activeField: SortField
  direction: 'asc' | 'desc'
  onToggle: (field: SortField) => void
}

const SortHeader = ({ label, field, activeField, direction, onToggle }: SortHeaderProps) => {
  const isActive = field === activeField
  const Icon = !isActive ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
      className={cn(
        'inline-flex items-center gap-1.5 text-left text-sm font-semibold transition-colors',
        isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900',
      )}
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  )
}

const DEMO_STATE_OPTIONS: Array<{ value: DemoState; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'loading', label: 'Loading' },
  { value: 'empty', label: 'Empty' },
  { value: 'error', label: 'Error' },
]

const DEMO_STATE_HINT: Record<DemoState, string> = {
  normal: 'Using standard API latency.',
  loading: 'Forces longer loading to preview skeleton and refresh states.',
  empty: 'Returns an empty list regardless of filters.',
  error: 'Returns an API error for list and export requests.',
}

export const UserManagementPage = () => {
  const {
    state,
    pageSizeOptions,
    setSearch,
    setFilter,
    toggleSort,
    setPage,
    setPageSize,
    applySavedView,
    clearFilters,
    resetView,
  } = useUserListUrlState()

  const [demoState, setDemoState] = useState<DemoState>('normal')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [stickyHeaderEnabled, setStickyHeaderEnabled] = useState(true)
  const [openRowActionId, setOpenRowActionId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [isBulkBusy, setIsBulkBusy] = useState(false)
  const toastIdRef = useRef(1)

  const { data, isLoading, error, reload } = useUsersQuery(state, demoState)

  useEffect(() => {
    if (!data || isLoading || error) {
      return
    }

    if (data.page !== state.page) {
      setPage(data.page)
    }
  }, [data, error, isLoading, setPage, state.page])

  useEffect(() => {
    if (!data) {
      return
    }

    const visibleIds = new Set(data.rows.map((row) => row.id))

    setRowSelection((current) => {
      const nextEntries = Object.entries(current).filter(([id, selected]) => selected && visibleIds.has(id))

      if (nextEntries.length === Object.keys(current).length) {
        return current
      }

      return Object.fromEntries(nextEntries)
    })
  }, [data])

  useEffect(() => {
    if (!data || !openRowActionId) {
      return
    }

    if (!data.rows.some((row) => row.id === openRowActionId)) {
      setOpenRowActionId(null)
    }
  }, [data, openRowActionId])

  const selectedIds = useMemo(
    () => Object.entries(rowSelection).filter((entry) => entry[1]).map((entry) => entry[0]),
    [rowSelection],
  )

  const selectedCount = selectedIds.length

  const pushToast = useCallback((tone: ToastItem['tone'], message: string) => {
    const id = toastIdRef.current
    toastIdRef.current += 1
    setToasts((current) => [...current, { id, tone, message }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const downloadRows = useCallback(
    (rows: User[], name: string) => {
      const stamp = new Date().toISOString().slice(0, 10)
      const csv = buildUsersCsv(rows)
      downloadCsv(`${name}-${stamp}.csv`, csv)
    },
    [],
  )

  const handleExportFiltered = useCallback(async () => {
    try {
      const rows = await userApi.listForExport({
        q: state.q,
        filters: state.filters,
        sort: state.sort,
        demoState,
      })

      if (rows.length === 0) {
        pushToast('info', 'Nothing to export for the current list state.')
        return
      }

      downloadRows(rows, 'users-filtered')
      pushToast('success', `Exported ${rows.length} users.`)
    } catch {
      pushToast('error', 'Export failed. Switch demo state back to Normal and retry.')
    }
  }, [demoState, downloadRows, pushToast, state.filters, state.q, state.sort])

  const handleExportSelected = useCallback(async () => {
    if (selectedCount === 0) {
      return
    }

    const rows = await userApi.listByIds(selectedIds)

    if (rows.length === 0) {
      pushToast('info', 'No selected rows available for export.')
      return
    }

    downloadRows(rows, 'users-selected')
    pushToast('success', `Exported ${rows.length} selected users.`)
  }, [downloadRows, pushToast, selectedCount, selectedIds])

  const clearSelection = useCallback(() => {
    setRowSelection({})
  }, [])

  const clearSelectionForUser = useCallback((id: string) => {
    setRowSelection((current) => {
      if (!current[id]) {
        return current
      }

      const next = { ...current }
      delete next[id]
      return next
    })
  }, [])

  const clearListFilters = useCallback(() => {
    clearSelection()
    clearFilters()
  }, [clearFilters, clearSelection])

  const resetListView = useCallback(() => {
    clearSelection()
    setOpenRowActionId(null)
    resetView()
  }, [clearSelection, resetView])

  const handleDeactivateSelected = useCallback(async () => {
    if (selectedCount === 0) {
      return
    }

    setIsBulkBusy(true)

    try {
      const changed = await userApi.bulkDeactivate(selectedIds)
      clearSelection()
      reload()
      pushToast('success', `Deactivated ${changed} selected users.`)
    } finally {
      setIsBulkBusy(false)
    }
  }, [clearSelection, pushToast, reload, selectedCount, selectedIds])

  const handleDeleteSelected = useCallback(async () => {
    if (selectedCount === 0) {
      return
    }

    const confirmed = window.confirm(`Delete ${selectedCount} users from this demo dataset?`)

    if (!confirmed) {
      return
    }

    setIsBulkBusy(true)

    try {
      const deleted = await userApi.bulkDelete(selectedIds)
      clearSelection()
      reload()
      pushToast('success', `Deleted ${deleted} users from the demo list.`)
    } finally {
      setIsBulkBusy(false)
    }
  }, [clearSelection, pushToast, reload, selectedCount, selectedIds])

  const handleRowSetStatus = useCallback(
    async (user: User, nextStatus: User['status']) => {
      await userApi.setStatus(user.id, nextStatus)
      reload()
      pushToast('success', `${user.fullName} was set to ${nextStatus}.`)
    },
    [pushToast, reload],
  )

  const handleRowDelete = useCallback(
    async (user: User) => {
      const confirmed = window.confirm(`Delete ${user.fullName} from this demo dataset?`)

      if (!confirmed) {
        return
      }

      await userApi.delete(user.id)
      clearSelectionForUser(user.id)
      reload()
      pushToast('success', `${user.fullName} was deleted.`)
    },
    [clearSelectionForUser, pushToast, reload],
  )

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        meta: { className: 'w-12' },
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all users on this page"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select ${row.original.fullName}`}
          />
        ),
      }),
      columnHelper.accessor('fullName', {
        id: 'fullName',
        meta: { className: 'min-w-[260px]' },
        enableHiding: true,
        header: () => (
          <SortHeader
            label="Name"
            field="fullName"
            activeField={state.sort.field}
            direction={state.sort.direction}
            onToggle={toggleSort}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <UserAvatar fullName={row.original.fullName} src={row.original.avatar} />
            <div>
              <p className="text-[15px] font-semibold leading-5 text-slate-900">{row.original.fullName}</p>
              <p className="mt-0.5 text-xs leading-4 text-slate-500">{row.original.email}</p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('role', {
        id: 'role',
        meta: { className: 'min-w-[110px]' },
        enableHiding: true,
        header: () => <span>Role</span>,
        cell: ({ getValue }) => <span>{getValue()}</span>,
      }),
      columnHelper.accessor('status', {
        id: 'status',
        meta: { className: 'min-w-[110px]' },
        enableHiding: true,
        header: () => <span>Status</span>,
        cell: ({ getValue }) => <Badge status={getValue()} />,
      }),
      columnHelper.accessor('team', {
        id: 'team',
        meta: { className: 'min-w-[120px]' },
        enableHiding: true,
        header: () => <span>Team</span>,
        cell: ({ getValue }) => <span>{getValue()}</span>,
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        meta: { className: 'min-w-[120px]' },
        enableHiding: true,
        header: () => (
          <SortHeader
            label="Created"
            field="createdAt"
            activeField={state.sort.field}
            direction={state.sort.direction}
            onToggle={toggleSort}
          />
        ),
        cell: ({ getValue }) => <span>{formatDate(getValue())}</span>,
      }),
      columnHelper.accessor('lastActiveAt', {
        id: 'lastActiveAt',
        meta: { className: 'min-w-[130px]' },
        enableHiding: true,
        header: () => (
          <SortHeader
            label="Last active"
            field="lastActiveAt"
            activeField={state.sort.field}
            direction={state.sort.direction}
            onToggle={toggleSort}
          />
        ),
        cell: ({ getValue }) => <span>{formatLastActive(getValue())}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        meta: { className: 'w-[74px] pr-1.5 text-right' },
        enableHiding: false,
        header: () => <span>Actions</span>,
        cell: ({ row }) => {
          const isInactive = row.original.status === 'Inactive'
          const statusActionLabel = isInactive ? 'Activate' : 'Deactivate'
          const statusActionTone = isInactive ? 'activate' : 'deactivate'
          const nextStatus = isInactive ? 'Active' : 'Inactive'

          return (
            <div className="flex justify-end">
              <RowActionsMenu
                isOpen={openRowActionId === row.original.id}
                onOpenChange={(open) => setOpenRowActionId(open ? row.original.id : null)}
                onView={() => pushToast('info', `Opening profile for ${row.original.fullName}.`)}
                onEdit={() => pushToast('info', `Opening edit flow for ${row.original.fullName}.`)}
                statusActionLabel={statusActionLabel}
                statusActionTone={statusActionTone}
                onStatusAction={() => {
                  void handleRowSetStatus(row.original, nextStatus)
                }}
                onDelete={() => {
                  void handleRowDelete(row.original)
                }}
              />
            </div>
          )
        },
      }),
    ],
    [handleRowDelete, handleRowSetStatus, openRowActionId, pushToast, state.sort.direction, state.sort.field, toggleSort],
  )

  const table = useReactTable({
    data: data?.rows ?? [],
    columns,
    state: {
      rowSelection,
      columnVisibility,
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    manualPagination: true,
  })

  const activeView = resolveSavedView(state)
  const hasActiveFilters =
    state.q.trim().length > 0 ||
    state.filters.role !== defaultUserListState.filters.role ||
    state.filters.status !== defaultUserListState.filters.status ||
    state.filters.team !== defaultUserListState.filters.team
  const hasCustomView =
    hasActiveFilters ||
    state.sort.field !== defaultUserListState.sort.field ||
    state.sort.direction !== defaultUserListState.sort.direction ||
    state.page !== defaultUserListState.page ||
    state.pageSize !== defaultUserListState.pageSize

  const page = data?.page ?? state.page
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const handleResetData = async () => {
    await userApi.reset()
    clearSelection()
    reload()
    pushToast('info', 'Dataset reset complete.')
  }

  return (
    <main className="mx-auto max-w-[1320px] px-4 py-8 lg:px-8 lg:py-10">
      <header className="mb-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="mt-2 text-[15px] text-slate-600">
            Manage team members, roles, status, and access across your workspace.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
          <Select
            value={demoState}
            onChange={(event) => setDemoState(event.target.value as DemoState)}
            className="w-full sm:w-44 lg:w-52"
            title={DEMO_STATE_HINT[demoState]}
          >
            {DEMO_STATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Button onClick={handleResetData} className="w-full sm:w-auto">
            <RotateCcw className="size-4" />
            Reset data
          </Button>

          <label className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm sm:w-auto sm:justify-start">
            <Checkbox
              checked={stickyHeaderEnabled}
              onChange={(event) => setStickyHeaderEnabled(event.target.checked)}
              aria-label="Enable sticky header"
            />
            Sticky header
          </label>

          <Button
            variant="primary"
            onClick={() => pushToast('info', 'Invite flow is simulated in this demo.')}
            className="w-full sm:w-auto"
          >
            <UserPlus className="size-4" />
            Invite user
          </Button>
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel">
        <div className="space-y-4 border-b border-slate-200 p-4 lg:p-5">
          <SavedViewsBar views={savedViews} activeViewId={activeView?.id} onSelect={applySavedView} />

          <UserListToolbar
            search={state.q}
            role={state.filters.role}
            status={state.filters.status}
            team={state.filters.team}
            roleOptions={roleOptions}
            statusOptions={statusOptions}
            teamOptions={teamOptions}
            onSearchChange={setSearch}
            onSearchReset={() => setSearch('')}
            onRoleChange={(value) => setFilter('role', value)}
            onStatusChange={(value) => setFilter('status', value)}
            onTeamChange={(value) => setFilter('team', value)}
            onResetView={resetListView}
            hasCustomView={hasCustomView}
            onExportFiltered={() => {
              void handleExportFiltered()
            }}
            columnVisibilityControl={<ColumnVisibilityMenu table={table} />}
          />
        </div>

        {selectedCount > 0 && (
          <BulkActionsBar
            selectedCount={selectedCount}
            onExport={() => {
              void handleExportSelected()
            }}
            onDeactivate={() => {
              void handleDeactivateSelected()
            }}
            onDelete={() => {
              void handleDeleteSelected()
            }}
            onClear={clearSelection}
            isBusy={isBulkBusy}
          />
        )}

        <UsersTable
          table={table}
          isLoading={isLoading}
          error={error}
          stickyHeader={stickyHeaderEnabled}
          onRetry={reload}
          onClearFilters={clearListFilters}
        />

        {!error && (
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={state.pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </section>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </main>
  )
}
