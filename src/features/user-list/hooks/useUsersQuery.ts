import { useCallback, useEffect, useMemo, useState } from 'react'
import { userApi } from '../../../data/mock/userApi'
import type { DemoState, UserListResult, UserListState } from '../../../types/list'
import type { User } from '../../../types/user'

interface QueryState {
  key: string
  data: UserListResult<User> | null
  error: string | null
}

interface UseUsersQueryResult {
  data: UserListResult<User> | null
  isLoading: boolean
  error: string | null
  reload: () => void
}

export const useUsersQuery = (state: UserListState, demoState: DemoState): UseUsersQueryResult => {
  const [reloadKey, setReloadKey] = useState(0)

  const queryKey = useMemo(() => JSON.stringify({ state, demoState, reloadKey }), [demoState, reloadKey, state])

  const [queryState, setQueryState] = useState<QueryState>({
    key: '',
    data: null,
    error: null,
  })

  useEffect(() => {
    let active = true

    userApi
      .list({
        ...state,
        demoState,
      })
      .then((next) => {
        if (!active) {
          return
        }

        setQueryState({
          key: queryKey,
          data: next,
          error: null,
        })
      })
      .catch((err: unknown) => {
        if (!active) {
          return
        }

        setQueryState((current) => ({
          key: queryKey,
          data: current.data,
          error: err instanceof Error ? err.message : 'Unexpected API error',
        }))
      })

    return () => {
      active = false
    }
  }, [demoState, queryKey, state])

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  return {
    data: queryState.data,
    error: queryState.key === queryKey ? queryState.error : null,
    isLoading: queryState.key !== queryKey,
    reload,
  }
}
