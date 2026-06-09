/**
 * Client-side yearly aggregation helpers.
 * These work on top of the existing getTransactions API since the backend
 * doesn't have a dedicated yearly-summary endpoint yet.
 */
import { getTransactions } from './index'
import dayjs from 'dayjs'

const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100

/**
 * Fetch and aggregate all transactions for a given calendar year.
 * Returns { income, expenses, net, byCategory, byMonth, transactions }
 */
export async function getYearlySummary(year, view = 'all') {
  const from = `${year}-01-01`
  const to   = `${year}-12-31`

  const res = await getTransactions({ from, to, limit: 9999, view: view === 'all' ? undefined : view })
  const txs = res.data || []

  let income   = 0
  let expenses = 0
  const byCategoryMap = new Map()
  const byMonthMap    = {}

  // Pre-fill all 12 months so months with no data still render
  for (let m = 1; m <= 12; m++) {
    const key = `${year}-${String(m).padStart(2, '0')}`
    byMonthMap[key] = { month: key, income: 0, expenses: 0, net: 0 }
  }

  txs.forEach((tx) => {
    const amt     = tx.amount_cad || 0
    const monthKey = dayjs(tx.date).format('YYYY-MM')

    if (tx.type === 'income') {
      income = round2(income + amt)
      byMonthMap[monthKey].income = round2(byMonthMap[monthKey].income + amt)
    } else {
      expenses = round2(expenses + amt)
      byMonthMap[monthKey].expenses = round2(byMonthMap[monthKey].expenses + amt)

      // Category breakdown (expenses only)
      const key = tx.category_id || 'uncategorized'
      const cur = byCategoryMap.get(key) || {
        id: key,
        name: tx.category_name || 'Uncategorised',
        color: tx.category_color || '#888780',
        total: 0,
        count: 0,
      }
      cur.total = round2(cur.total + amt)
      cur.count += 1
      byCategoryMap.set(key, cur)
    }

    byMonthMap[monthKey].net = round2(byMonthMap[monthKey].income - byMonthMap[monthKey].expenses)
  })

  return {
    year,
    income,
    expenses,
    net: round2(income - expenses),
    byCategory: Array.from(byCategoryMap.values()).sort((a, b) => b.total - a.total),
    byMonth: Object.values(byMonthMap),
    transactions: txs,
  }
}

/**
 * Return an array of available years based on a first-transaction year
 * up to the current year.  Falls back to last 5 years if no data.
 */
export function getAvailableYears(transactions = []) {
  const current = dayjs().year()
  if (!transactions.length) {
    return Array.from({ length: 5 }, (_, i) => current - i)
  }
  const earliest = transactions.reduce((min, tx) => {
    const y = dayjs(tx.date).year()
    return y < min ? y : min
  }, current)
  const years = []
  for (let y = current; y >= earliest; y--) years.push(y)
  return years
}
