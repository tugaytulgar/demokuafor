import { useCallback, useState } from 'react'
import { fetchAppointmentByTrackingCode } from '../services/api'

export function useAppointmentByTrackingCode() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
    lastCode: null,
  })

  const search = useCallback(async (code) => {
    const trimmed = String(code || '').trim()
    setState({ loading: true, error: null, data: null, lastCode: trimmed })
    const { data, error } = await fetchAppointmentByTrackingCode({ code: trimmed })
    setState({ loading: false, error, data, lastCode: trimmed })
  }, [])

  return { ...state, search }
}

