import type { UserListFilters, UserListSort, UserListState } from '../../types/list'

export interface SavedView {
  id: string
  label: string
  q: string
  filters: UserListFilters
  sort: UserListSort
}

const allFilters: UserListFilters = {
  role: 'all',
  status: 'all',
  team: 'all',
}

export const savedViews: SavedView[] = [
  {
    id: 'all-users',
    label: 'All Users',
    q: '',
    filters: allFilters,
    sort: {
      field: 'fullName',
      direction: 'asc',
    },
  },
  {
    id: 'active-admins',
    label: 'Active Admins',
    q: '',
    filters: {
      role: 'Admin',
      status: 'Active',
      team: 'all',
    },
    sort: {
      field: 'lastActiveAt',
      direction: 'desc',
    },
  },
  {
    id: 'pending-reviews',
    label: 'Pending Reviews',
    q: '',
    filters: {
      role: 'all',
      status: 'Pending',
      team: 'all',
    },
    sort: {
      field: 'createdAt',
      direction: 'desc',
    },
  },
  {
    id: 'recently-added',
    label: 'Recently Added',
    q: '',
    filters: allFilters,
    sort: {
      field: 'createdAt',
      direction: 'desc',
    },
  },
]

const sameFilters = (left: UserListFilters, right: UserListFilters) =>
  left.role === right.role && left.status === right.status && left.team === right.team

const sameSort = (left: UserListSort, right: UserListSort) => left.field === right.field && left.direction === right.direction

export const resolveSavedView = (state: UserListState) =>
  savedViews.find((view) => view.q === state.q && sameFilters(view.filters, state.filters) && sameSort(view.sort, state.sort))
