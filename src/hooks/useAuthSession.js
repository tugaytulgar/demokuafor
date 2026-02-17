import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export function useAuthSession() {
  const [state, setState] = useState({
    loading: true,
    session: null,
  })

  useEffect(() => {
    let mounted = true
    async function init() {
      if (!supabase) {
        if (mounted) setState({ loading: false, session: null })
        return
      }
      const { data } = await supabase.auth.getSession()
      if (mounted) setState({ loading: false, session: data?.session || null })
    }

    init()

    if (!supabase) return
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ loading: false, session: session || null })
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  return state
}

