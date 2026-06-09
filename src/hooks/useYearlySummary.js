import { useState, useEffect } from 'react'
import { getYearlySummary } from '../api/yearly'
import dayjs from 'dayjs'

export function useYearlySummary(year, view = 'all') {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const resolvedYear = year || dayjs().year()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getYearlySummary(resolvedYear, view)
      .then((result) => { if (!cancelled) { setData(result); setLoading(false) } })
      .catch((e)     => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [resolvedYear, view])

  return { data, loading, error }
}
