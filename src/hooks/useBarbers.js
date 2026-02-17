import { useCallback, useEffect, useState } from 'react'
import { fetchBarbers } from '../services/api'

export function useBarbers() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  })

  const refetch = useCallback(async () => {
    setState((p) => ({ ...p, loading: true, error: null }))
    const { data, error } = await fetchBarbers()
    setState({ loading: false, error, data })
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { ...state, refetch }
}

