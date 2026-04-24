import { useState, useEffect } from 'react'
import { getHouseholdSummary, getPersonalSummary, getFullSummary } from '../api'
import dayjs from 'dayjs'

export function useSummary(view = 'household', month) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const currentMonth = month || dayjs().format('YYYY-MM')

  useEffect(() => {
    setLoading(true)
    const fetcher =
      view === 'personal'  ? getPersonalSummary :
      view === 'full'      ? getFullSummary :
      getHouseholdSummary

    fetcher(currentMonth)
      .then(r => { setData(r.data); setError(null) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [view, currentMonth])

  return { data, loading, error }
}
