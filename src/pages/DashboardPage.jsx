import { useState } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Skeleton,
  ToggleButtonGroup, ToggleButton, Avatar, LinearProgress,
  Chip, Stack, Button,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useSummary } from '../hooks/useSummary'
import TransactionDialog from '../components/shared/TransactionDialog'
import dayjs from 'dayjs'

const fmt = (n) => new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
}).format(n || 0)

function MonthPicker({ value, onChange }) {
  return (
    <TextField
      type="month" size="small" value={value}
      onChange={e => onChange(e.target.value)}
      sx={{ width: 160 }}
      inputProps={{ max: dayjs().format('YYYY-MM') }}
    />
  )
}

function SummaryCard({ label, value, delta, color, loading }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary" fontSize={11}>
          {label}
        </Typography>
        {loading
          ? <Skeleton width={140} height={44} />
          : <Typography variant="h4" fontWeight={600} color={color} sx={{ mt: 0.5 }}>
              {fmt(value)}
            </Typography>}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [view, setView]   = useState('household')
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [txOpen, setTxOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)

  const { data, loading } = useSummary(view, month)

  const pieData = (data?.by_category || [])
    .filter(c => c.total > 0)
    .map(c => ({ name: c.name, value: parseFloat(c.total), color: c.color }))

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            {dayjs(month).format('MMMM YYYY')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <input type="month" value={month}
            onChange={e => setMonth(e.target.value)}
            max={dayjs().format('YYYY-MM')}
            style={{
              border: '1px solid rgba(0,0,0,0.23)', borderRadius: 8,
              padding: '6px 10px', fontSize: 14, fontFamily: 'inherit',
              background: 'transparent', color: 'inherit',
            }}
          />
          <Button variant="contained" startIcon={<AddRoundedIcon />}
            onClick={() => setTxOpen(true)} size="small">
            Add
          </Button>
        </Stack>
      </Box>

      {/* View toggle */}
      <ToggleButtonGroup
        value={view} exclusive size="small"
        onChange={(_, v) => v && setView(v)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="household">🏠 Household</ToggleButton>
        <ToggleButton value="personal">👤 My Sheet</ToggleButton>
        <ToggleButton value="full">📊 Full Picture</ToggleButton>
      </ToggleButtonGroup>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {view === 'household' && <>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="Pooled Income" value={data?.pooled_income} color="success.main" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="Shared Expenses" value={data?.shared_expenses} color="error.main" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="Allocations" value={data?.total_allocations} color="warning.main" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="Remainder" value={data?.remainder} color={data?.remainder >= 0 ? 'success.main' : 'error.main'} loading={loading} />
          </Grid>
        </>}

        {view === 'personal' && <>
          <Grid item xs={12} sm={4}>
            <SummaryCard label="Monthly Fund" value={data?.fund_amount} color="primary.main" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SummaryCard label="Spent" value={data?.fund_spent} color="error.main" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <SummaryCard label="Remaining" value={data?.fund_remaining} color={data?.fund_remaining >= 0 ? 'success.main' : 'error.main'} loading={loading} />
          </Grid>
        </>}

        {view === 'full' && <>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="Total Income" value={data?.total_income} color="success.main" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="Shared Expenses" value={data?.shared_expenses} color="warning.main" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="Personal Expenses" value={data?.personal_expenses} color="error.main" loading={loading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard label="Net" value={data?.net} color={data?.net >= 0 ? 'success.main' : 'error.main'} loading={loading} />
          </Grid>
        </>}
      </Grid>

      <Grid container spacing={2}>
        {/* Pie chart */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Spending by Category
              </Typography>
              {loading
                ? <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                : pieData.length === 0
                  ? <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography color="text.secondary" variant="body2">No expenses this month</Typography>
                    </Box>
                  : <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                          dataKey="value" paddingAngle={2}>
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => fmt(v)} />
                        <Legend iconType="circle" iconSize={8}
                          formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Personal funds (household view) */}
        {view === 'household' && (
          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Personal Funds
                </Typography>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                  {loading
                    ? [1, 2].map(i => <Skeleton key={i} height={60} />)
                    : (data?.user_funds || []).map(u => (
                        <Box key={u.id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: 12 }}>
                                {u.name[0]}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>{u.name}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {fmt(u.fund_spent)} / {fmt(u.fund_amount)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((u.fund_spent / u.fund_amount) * 100 || 0, 100)}
                            color={u.fund_spent > u.fund_amount ? 'error' : 'primary'}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {fmt(u.fund_remaining)} remaining
                          </Typography>
                        </Box>
                      ))
                  }
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Per-user personal (full view) */}
        {view === 'full' && data?.per_user_personal && (
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Personal Spending by Person
                </Typography>
                <Stack spacing={1.5}>
                  {data.per_user_personal.map(u => (
                    <Box key={u.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: 12 }}>
                          {u.name[0]}
                        </Avatar>
                        <Typography variant="body2">{u.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={500} color="error.main">
                        {fmt(u.spent)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Personal breakdown */}
        {view === 'personal' && (
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Fund Progress
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(((data?.fund_spent || 0) / (data?.fund_amount || 1)) * 100, 100)}
                    color={data?.fund_spent > data?.fund_amount ? 'error' : 'primary'}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Spent: {fmt(data?.fund_spent)}</Typography>
                    <Typography variant="caption" color="text.secondary">Budget: {fmt(data?.fund_amount)}</Typography>
                  </Box>
                </Box>
                <Stack spacing={1}>
                  {(data?.by_category || []).map(c => (
                    <Box key={c.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color }} />
                        <Typography variant="body2">{c.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={500}>{fmt(c.total)}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <TransactionDialog
        open={txOpen}
        onClose={() => setTxOpen(false)}
        onSaved={() => setRefresh(r => r + 1)}
      />
    </Box>
  )
}
