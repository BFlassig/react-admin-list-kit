import type { Team, UserRole, UserStatus } from './user'

export type SortField = 'fullName' | 'createdAt' | 'lastActiveAt'
export type SortDirection = 'asc' | 'desc'
export type DemoState = 'normal' | 'loading' | 'error' | 'empty'

export interface UserListFilters {
  role: UserRole | 'all'
  status: UserStatus | 'all'
  team: Team | 'all'
}

export interface UserListSort {
  field: SortField
  direction: SortDirection
}

export interface UserListState {
  q: string
  filters: UserListFilters
  sort: UserListSort
  page: number
  pageSize: number
}

export interface UserListQuery extends UserListState {
  demoState?: DemoState
}

export interface UserListResult<T> {
  rows: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
