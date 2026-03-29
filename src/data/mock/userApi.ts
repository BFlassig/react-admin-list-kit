import { seedUsers } from './users'
import type { DemoState, UserListQuery, UserListResult, UserListSort, UserListState } from '../../types/list'
import type { User } from '../../types/user'

const cloneSeed = () => seedUsers.map((user) => ({ ...user }))

let usersStore: User[] = cloneSeed()

const wait = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration))

const sortUsers = (users: User[], sort: UserListSort) => {
  const direction = sort.direction === 'asc' ? 1 : -1

  return [...users].sort((left, right) => {
    if (sort.field === 'fullName') {
      return left.fullName.localeCompare(right.fullName) * direction
    }

    if (sort.field === 'createdAt') {
      return (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * direction
    }

    const leftValue = left.lastActiveAt ? new Date(left.lastActiveAt).getTime() : 0
    const rightValue = right.lastActiveAt ? new Date(right.lastActiveAt).getTime() : 0

    return (leftValue - rightValue) * direction
  })
}

const applyQuery = (users: User[], query: UserListState) => {
  const q = query.q.trim().toLowerCase()

  const filtered = users.filter((user) => {
    const matchesSearch = q.length === 0 || user.fullName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
    const matchesRole = query.filters.role === 'all' || user.role === query.filters.role
    const matchesStatus = query.filters.status === 'all' || user.status === query.filters.status
    const matchesTeam = query.filters.team === 'all' || user.team === query.filters.team

    return matchesSearch && matchesRole && matchesStatus && matchesTeam
  })

  return sortUsers(filtered, query.sort)
}

const toPaginatedResult = (rows: User[], query: UserListState): UserListResult<User> => {
  const total = rows.length
  const pageSize = query.pageSize
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(query.page, 1), totalPages)
  const from = (page - 1) * pageSize
  const to = from + pageSize

  return {
    rows: rows.slice(from, to),
    total,
    page,
    pageSize,
    totalPages,
  }
}

const getLatency = (demoState: DemoState | undefined) => {
  if (demoState === 'loading') {
    return 1200
  }

  return 320
}

const maybeThrowDemoError = (demoState: DemoState | undefined) => {
  if (demoState === 'error') {
    throw new Error('The demo API is in error mode. Switch back to Normal to continue.')
  }
}

const setUsersStatus = (ids: string[], status: User['status']) => {
  const nowIso = new Date().toISOString()
  const idSet = new Set(ids)
  let changed = 0

  usersStore = usersStore.map((user) => {
    if (!idSet.has(user.id)) {
      return user
    }

    if (user.status !== status) {
      changed += 1
    }

    return {
      ...user,
      status,
      lastActiveAt:
        status === 'Active' || status === 'Inactive'
          ? nowIso
          : user.lastActiveAt,
    }
  })

  return changed
}

export const userApi = {
  async list(query: UserListQuery): Promise<UserListResult<User>> {
    await wait(getLatency(query.demoState))
    maybeThrowDemoError(query.demoState)

    if (query.demoState === 'empty') {
      return toPaginatedResult([], query)
    }

    const queried = applyQuery(usersStore, query)

    return toPaginatedResult(queried, query)
  },

  async listForExport(query: Omit<UserListQuery, 'page' | 'pageSize'>): Promise<User[]> {
    await wait(180)
    maybeThrowDemoError(query.demoState)

    if (query.demoState === 'empty') {
      return []
    }

    return applyQuery(usersStore, {
      ...query,
      page: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
    })
  },

  async listByIds(ids: string[]): Promise<User[]> {
    await wait(120)

    const idSet = new Set(ids)

    return usersStore.filter((user) => idSet.has(user.id))
  },

  async bulkDeactivate(ids: string[]): Promise<number> {
    await wait(260)
    return setUsersStatus(ids, 'Inactive')
  },

  async bulkActivate(ids: string[]): Promise<number> {
    await wait(260)
    return setUsersStatus(ids, 'Active')
  },

  async bulkDelete(ids: string[]): Promise<number> {
    await wait(300)
    const idSet = new Set(ids)
    const before = usersStore.length
    usersStore = usersStore.filter((user) => !idSet.has(user.id))

    return before - usersStore.length
  },

  async deactivate(id: string): Promise<void> {
    await this.bulkDeactivate([id])
  },

  async activate(id: string): Promise<void> {
    await this.bulkActivate([id])
  },

  async setStatus(id: string, status: User['status']): Promise<void> {
    if (status === 'Active') {
      await this.activate(id)
      return
    }

    if (status === 'Inactive') {
      await this.deactivate(id)
      return
    }

    await wait(220)
    setUsersStatus([id], status)
  },

  async delete(id: string): Promise<void> {
    await this.bulkDelete([id])
  },

  async reset(): Promise<void> {
    await wait(150)
    usersStore = cloneSeed()
  },
}
