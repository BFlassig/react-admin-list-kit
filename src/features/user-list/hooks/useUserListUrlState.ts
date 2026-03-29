import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SortField, SortDirection, UserListFilters, UserListSort, UserListState } from '../../../types/list'
import type { Team, UserRole, UserStatus } from '../../../types/user'
import type { SavedView } from '../savedViews'

const pageSizeOptions = [10, 20, 30, 50]

const roleValues = new Set<UserRole | 'all'>(['all', 'Admin', 'Manager', 'Editor', 'Member'])
const statusValues = new Set<UserStatus | 'all'>(['all', 'Active', 'Pending', 'Inactive', 'Suspended'])
const teamValues = new Set<Team | 'all'>(['all', 'Engineering', 'Product', 'Marketing', 'Sales', 'Support', 'Finance', 'Operations', 'HR'])
const sortFieldValues = new Set<SortField>(['fullName', 'createdAt', 'lastActiveAt'])
const sortDirectionValues = new Set<SortDirection>(['asc', 'desc'])

export const defaultUserListState: UserListState = {
  q: '',
  filters: {
    role: 'all',
    status: 'all',
    team: 'all',
  },
  sort: {
    field: 'fullName',
    direction: 'asc',
  },
  page: 1,
  pageSize: 10,
}

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return parsed
}

const parseFilters = (params: URLSearchParams): UserListFilters => {
  const role = params.get('role') as UserRole | 'all' | null
  const status = params.get('status') as UserStatus | 'all' | null
  const team = params.get('team') as Team | 'all' | null

  return {
    role: role && roleValues.has(role) ? role : defaultUserListState.filters.role,
    status: status && statusValues.has(status) ? status : defaultUserListState.filters.status,
    team: team && teamValues.has(team) ? team : defaultUserListState.filters.team,
  }
}

const parseSort = (params: URLSearchParams): UserListSort => {
  const field = params.get('sort') as SortField | null
  const direction = params.get('dir') as SortDirection | null

  return {
    field: field && sortFieldValues.has(field) ? field : defaultUserListState.sort.field,
    direction: direction && sortDirectionValues.has(direction) ? direction : defaultUserListState.sort.direction,
  }
}

const parseState = (params: URLSearchParams): UserListState => {
  const page = Math.max(1, parseNumber(params.get('page'), defaultUserListState.page))
  const pageSizeRaw = parseNumber(params.get('size'), defaultUserListState.pageSize)
  const pageSize = pageSizeOptions.includes(pageSizeRaw) ? pageSizeRaw : defaultUserListState.pageSize

  return {
    q: params.get('q') ?? defaultUserListState.q,
    filters: parseFilters(params),
    sort: parseSort(params),
    page,
    pageSize,
  }
}

const buildSearchParams = (state: UserListState) => {
  const params = new URLSearchParams()

  if (state.q.trim().length > 0) {
    params.set('q', state.q.trim())
  }

  if (state.filters.role !== defaultUserListState.filters.role) {
    params.set('role', state.filters.role)
  }

  if (state.filters.status !== defaultUserListState.filters.status) {
    params.set('status', state.filters.status)
  }

  if (state.filters.team !== defaultUserListState.filters.team) {
    params.set('team', state.filters.team)
  }

  if (state.sort.field !== defaultUserListState.sort.field) {
    params.set('sort', state.sort.field)
  }

  if (state.sort.direction !== defaultUserListState.sort.direction) {
    params.set('dir', state.sort.direction)
  }

  if (state.page !== defaultUserListState.page) {
    params.set('page', String(state.page))
  }

  if (state.pageSize !== defaultUserListState.pageSize) {
    params.set('size', String(state.pageSize))
  }

  return params
}

interface StatePatch {
  q?: string
  filters?: Partial<UserListFilters>
  sort?: Partial<UserListSort>
  page?: number
  pageSize?: number
}

const mergeState = (state: UserListState, patch: StatePatch): UserListState => ({
  ...state,
  ...patch,
  filters: {
    ...state.filters,
    ...patch.filters,
  },
  sort: {
    ...state.sort,
    ...patch.sort,
  },
})

export const useUserListUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo(() => parseState(searchParams), [searchParams])

  const patch = useCallback(
    (nextPatch: StatePatch) => {
      const nextState = mergeState(state, nextPatch)
      setSearchParams(buildSearchParams(nextState), { replace: true })
    },
    [setSearchParams, state],
  )

  const setSearch = useCallback(
    (q: string) => {
      patch({ q, page: 1 })
    },
    [patch],
  )

  const setFilter = useCallback(
    <K extends keyof UserListFilters>(key: K, value: UserListFilters[K]) => {
      patch({
        filters: {
          [key]: value,
        },
        page: 1,
      })
    },
    [patch],
  )

  const toggleSort = useCallback(
    (field: SortField) => {
      if (state.sort.field !== field) {
        patch({
          sort: {
            field,
            direction: field === 'fullName' ? 'asc' : 'desc',
          },
          page: 1,
        })
        return
      }

      patch({
        sort: {
          direction: state.sort.direction === 'asc' ? 'desc' : 'asc',
        },
        page: 1,
      })
    },
    [patch, state.sort.direction, state.sort.field],
  )

  const setPage = useCallback(
    (page: number) => {
      patch({ page: Math.max(1, page) })
    },
    [patch],
  )

  const setPageSize = useCallback(
    (pageSize: number) => {
      patch({ pageSize, page: 1 })
    },
    [patch],
  )

  const applySavedView = useCallback(
    (view: SavedView) => {
      patch({
        q: view.q,
        filters: view.filters,
        sort: view.sort,
        page: 1,
      })
    },
    [patch],
  )

  const clearFilters = useCallback(() => {
    patch({
      q: '',
      filters: defaultUserListState.filters,
      page: 1,
    })
  }, [patch])

  const resetView = useCallback(() => {
    setSearchParams(buildSearchParams(defaultUserListState), { replace: true })
  }, [setSearchParams])

  return {
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
  }
}
