import { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Skeleton, ToggleButtonGroup,
  ToggleButton, Select, MenuItem, FormControl, InputLabel, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Stack, Divider, useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from 'recharts'
import { useYearlySummary } from '../hooks/useYearlySummary'
import { getAvailableYears } from '../api/yearly'
import { getTransactions } from '../api'
import dayjs from 'dayjs'

/* ── formatters ─────────────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n || 0)

const fmtFull = (n) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n || 0)

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/* ── stat card ──────────────────────────────────────────────── */
function StatCard({ label, value, icon, color = 'text.primary', loading, note }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Box sx={{ color: color, display: 'flex', alignItems: 'center' }}>{icon}</Box>
          <Typography variant="overline" color="text.secondary" fontSize={11} lineHeight={1}>
            {label}
          </Typography>
        </Stack>
        {loading
          ? <Skeleton width={160} height={44} />
          : <Typography variant="h4" fontWeight={600} color={color} sx={{ mt: 0.5 }}>
              {fmt(value)}
            </Typography>}
        {note && !loading && (
          <Typography variant="caption" color="text.secondary">{note}</Typography>
        )}
      </CardContent>
    </Card>
  )
}

/* ── monthly bar chart ──────────────────────────────────────── */
function MonthlyChart({ byMonth, loading, showFuture }) {
  const theme = useTheme()
  const currentMonth = dayjs().month() // 0-indexed

  if (loading) return <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />

  const data = (byMonth || []).map((m, i) => ({
    label: MONTH_LABELS[i],
    Income:   m.income,
    Expenses: m.expenses,
    isFuture: !showFuture && i > currentMonth,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="30%" barGap={4}>
        <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={48}
        />
        <Tooltip
          formatter={(v, name) => [fmtFull(v), name]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }}
        />
        <Bar dataKey="Income" fill={theme.palette.success.main} radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isFuture ? theme.palette.action.disabled : theme.palette.success.main} />
          ))}
        </Bar>
        <Bar dataKey="Expenses" fill={theme.palette.error.main} radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isFuture ? theme.palette.action.disabled : theme.palette.error.main} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── category pie ───────────────────────────────────────────── */
function CategoryPie({ byCategory, loading }) {
  const theme = useTheme()
  if (loading) return <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
  if (!byCategory?.length)
    return <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>No expense data</Typography>

  const data = byCategory.slice(0, 8).map((c) => ({ name: c.name, value: c.total, color: c.color }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
          dataKey="value" paddingAngle={2}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(v) => fmtFull(v)}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
        <Legend iconType="circle" iconSize={8}
          formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

/* ── category table ─────────────────────────────────────────── */
function CategoryTable({ byCategory, totalExpenses, loading }) {
  if (loading) return (
    <Stack spacing={1}>
      {[1,2,3,4,5].map(i => <Skeleton key={i} height={36} />)}
    </Stack>
  )
  if (!byCategory?.length)
    return <Typography color="text.secondary" variant="body2">No expense data</Typography>

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Category</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: 12 }}>Amount</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: 12 }}>% of Total</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: 12 }}># Tx</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {byCategory.map((cat) => {
            const pct = totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(1) : '0.0'
            return (
              <TableRow key={cat.id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cat.color, flexShrink: 0 }} />
                    <Typography variant="body2">{cat.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500}>{fmtFull(cat.total)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip label={`${pct}%`} size="small"
                    sx={{ fontSize: 11, height: 20, bgcolor: 'action.hover' }} />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">{cat.count}</Typography>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

/* ── monthly breakdown table ────────────────────────────────── */
function MonthlyTable({ byMonth, loading, showFuture, totals }) {
  const currentMonth = dayjs().month() // 0-indexed

  if (loading) return (
    <Stack spacing={1}>
      {[1,2,3,4,5,6].map(i => <Skeleton key={i} height={36} />)}
    </Stack>
  )

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Month</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: 12, color: 'success.main' }}>Income</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: 12, color: 'error.main' }}>Expenses</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, fontSize: 12 }}>Net</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(byMonth || []).map((m, i) => {
            const isFuture = i > currentMonth
            // In YTD mode, skip future months entirely
            if (!showFuture && isFuture) return null
            const net = m.net
            return (
              <TableRow key={m.month} hover sx={{ opacity: isFuture ? 0.4 : 1 }}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight={i === currentMonth ? 600 : 400}>
                      {MONTH_LABELS[i]}
                    </Typography>
                    {isFuture && (
                      <Chip label="upcoming" size="small"
                        sx={{ fontSize: 10, height: 16, px: 0.5 }} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color={m.income > 0 ? 'success.main' : 'text.secondary'}>
                    {fmtFull(m.income)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" color={m.expenses > 0 ? 'error.main' : 'text.secondary'}>
                    {fmtFull(m.expenses)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500}
                    color={net >= 0 ? 'success.main' : 'error.main'}>
                    {net >= 0 ? '+' : ''}{fmtFull(net)}
                  </Typography>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

/* ── main page ──────────────────────────────────────────────── */
export default function YearlySummaryPage() {
  const theme    = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const currentYear  = dayjs().year()
  const currentMonth = dayjs().month() // 0-indexed

  const [year, setYear]           = useState(currentYear)
  const [view, setView]           = useState('all')
  // 'ytd' | 'full' — only relevant when viewing the current year
  const [rangeMode, setRangeMode] = useState('ytd')
  const [availableYears, setAvailableYears] = useState([currentYear])

  const isCurrentYear = year === currentYear
  // When viewing a past year, always show full year
  const showFuture = !isCurrentYear || rangeMode === 'full'

  const { data, loading } = useYearlySummary(year, view)

  // Load available years from earliest transaction
  useEffect(() => {
    getTransactions({ limit: 9999 })
      .then((r) => setAvailableYears(getAvailableYears(r.data || [])))
      .catch(() => {})
  }, [])

  // Compute stats — in YTD mode only count months up to today
  const income   = data?.income   || 0
  const expenses = data?.expenses || 0
  const net      = data?.net      || 0

  // Avg monthly: months elapsed in YTD mode, 12 for full/past year
  const monthsForAvg = isCurrentYear && rangeMode === 'ytd' ? currentMonth + 1 : 12
  const avgMonthlyExpenses = monthsForAvg > 0 ? expenses / monthsForAvg : 0

  // Subtitle label
  const periodLabel = !isCurrentYear
    ? `Full year ${year}`
    : rangeMode === 'ytd'
      ? `Jan 1 – ${dayjs().format('MMM D, YYYY')} (YTD)`
      : `Full year ${year}`

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* ── header ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}
        justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Yearly Summary</Typography>
          <Typography variant="body2" color="text.secondary">{periodLabel}</Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
          {/* Year picker */}
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year" onChange={(e) => setYear(Number(e.target.value))}>
              {availableYears.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* YTD / Full Year toggle — only shown for current year */}
          {isCurrentYear && (
            <ToggleButtonGroup
              value={rangeMode} exclusive size="small"
              onChange={(_, v) => { if (v) setRangeMode(v) }}
            >
              <ToggleButton value="ytd">YTD</ToggleButton>
              <ToggleButton value="full">Full Year</ToggleButton>
            </ToggleButtonGroup>
          )}

          {/* Household / Personal view toggle */}
          <ToggleButtonGroup
            value={view} exclusive size="small"
            onChange={(_, v) => { if (v) setView(v) }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="household">Household</ToggleButton>
            <ToggleButton value="personal">Personal</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* ── stat cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Income"
            value={income}
            icon={<TrendingUpRoundedIcon fontSize="small" />}
            color="success.main"
            loading={loading}
            note={periodLabel}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Expenses"
            value={expenses}
            icon={<TrendingDownRoundedIcon fontSize="small" />}
            color="error.main"
            loading={loading}
            note={periodLabel}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Net Savings"
            value={net}
            icon={<AccountBalanceRoundedIcon fontSize="small" />}
            color={net >= 0 ? 'success.main' : 'error.main'}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Avg Monthly Expenses"
            value={avgMonthlyExpenses}
            icon={<CalendarTodayRoundedIcon fontSize="small" />}
            color="text.primary"
            loading={loading}
            note={`Based on ${monthsForAvg} month${monthsForAvg !== 1 ? 's' : ''}`}
          />
        </Grid>
      </Grid>

      {/* ── monthly chart + category pie ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Income vs Expenses by Month
              </Typography>
              <MonthlyChart byMonth={data?.byMonth} loading={loading} showFuture={showFuture} />
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: 'success.main' }} />
                  <Typography variant="caption" color="text.secondary">Income</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: 'error.main' }} />
                  <Typography variant="caption" color="text.secondary">Expenses</Typography>
                </Stack>
                {showFuture && isCurrentYear && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: 'action.disabled' }} />
                    <Typography variant="caption" color="text.secondary">Upcoming</Typography>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Expenses by Category
              </Typography>
              <CategoryPie byCategory={data?.byCategory} loading={loading} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── detail tables ── */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Category Breakdown
              </Typography>
              <CategoryTable
                byCategory={data?.byCategory}
                totalExpenses={expenses}
                loading={loading}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Month-by-Month
              </Typography>
              <MonthlyTable
                byMonth={data?.byMonth}
                loading={loading}
                showFuture={showFuture}
              />

              {!loading && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={600}>Total</Typography>
                    <Stack direction="row" spacing={3}>
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        {fmtFull(income)}
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight={600}>
                        {fmtFull(expenses)}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}
                        color={net >= 0 ? 'success.main' : 'error.main'}>
                        {net >= 0 ? '+' : ''}{fmtFull(net)}
                      </Typography>
                    </Stack>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
