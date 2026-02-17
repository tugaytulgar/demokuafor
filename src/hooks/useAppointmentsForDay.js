import { useCallback, useEffect, useState } from 'react'
import { fetchAppointmentsForDay } from '../services/api'

export function useAppointmentsForDay({ date, barberId, enabled }) {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
  })

  const refetch = useCallback(async () => {
    if (!enabled) {
      setState({ loading: false, error: null, data: null })
      return
    }

    setState((p) => ({ ...p, loading: true, error: null }))
    const { data, error } = await fetchAppointmentsForDay({ date, barberId })
    setState({ loading: false, error, data })
  }, [enabled, date, barberId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { ...state, refetch }
}

