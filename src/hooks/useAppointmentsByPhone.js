import { useCallback, useState } from 'react'
import { fetchAppointmentsByPhone } from '../services/api'

export function useAppointmentsByPhone() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
    lastPhone: null,
  })

  const search = useCallback(async (phone) => {
    setState({ loading: true, error: null, data: null, lastPhone: phone })
    const { data, error } = await fetchAppointmentsByPhone({ phone })
    setState({ loading: false, error, data, lastPhone: phone })
  }, [])

  return { ...state, search }
}

