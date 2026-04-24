import { useState } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Stack,
  Avatar, LinearProgress, Divider, Button, Chip,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'
import { useSummary } from '../hooks/useSummary'
import TransactionDialog from '../components/shared/TransactionDialog'
import dayjs from 'dayjs'

const fmt = (n) => new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
}).format(n || 0)

export default function HouseholdPage() {
  const [month, setMonth]   = useState(dayjs().format('YYYY-MM'))
  const [txOpen, setTxOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)

  const { data, loading } = useSummary('household', month)

  const barData = (data?.by_category || []).slice(0, 8).map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
    amount: parseFloat(c.total),
    color: c.color,
  }))

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>Household</Typography>
          <Typography variant="body2" color="text.secondary">
            Shared finances — {dayjs(month).format('MMMM YYYY')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <input type="month" value={month}
            onChange={e => setMonth(e.target.value)}
            style={{
              border: '1px solid rgba(0,0,0,0.23)', borderRadius: 8,
              padding: '6px 10px', fontSize: 14, fontFamily: 'inherit',
              background: 'transparent', color: 'inherit',
            }}
          />
          <Button variant="contained" startIcon={<AddRoundedIcon />}
            onClick={() => setTxOpen(true)} size="small">
            Add expense
          </Button>
        </Stack>
      </Box>

      {/* Money flow summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Pooled Income', value: data?.pooled_income, color: 'success.main' },
          { label: 'Shared Expenses', value: data?.shared_expenses, color: 'error.main' },
          { label: 'Personal Allocations', value: data?.total_allocations, color: 'warning.main' },
          { label: 'Remainder / Savings', value: data?.remainder, color: data?.remainder >= 0 ? 'success.main' : 'error.main' },
        ].map(item => (
          <Grid item xs={6} md={3} key={item.label}>
            <Card>
              <CardContent sx={{ pb: '12px !important' }}>
                <Typography variant="overline" color="text.secondary" fontSize={10}>
                  {item.label}
                </Typography>
                <Typography variant="h5" fontWeight={600} color={item.color} sx={{ mt: 0.25 }}>
                  {loading ? '—' : fmt(item.value)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* Spending breakdown bar chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Shared Spending Breakdown
              </Typography>
              {barData.length === 0
                ? <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography color="text.secondary" variant="body2">No shared expenses this month</Typography>
                  </Box>
                : <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                      <Tooltip formatter={v => fmt(v)} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#1B6B4A" />
                    </BarChart>
                  </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Personal fund status */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Personal Funds
              </Typography>
              <Stack spacing={3} divider={<Divider />}>
                {(data?.user_funds || [{ name: 'Lambert', fund_amount: 0, fund_spent: 0, fund_remaining: 0 }, { name: 'Jessica', fund_amount: 0, fund_spent: 0, fund_remaining: 0 }]).map(u => (
                  <Box key={u.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                        {u.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{u.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fmt(u.fund_amount)} / month
                        </Typography>
                      </Box>
                      {u.fund_spent > u.fund_amount && (
                        <Chip label="Over" color="error" size="small" sx={{ ml: 'auto', fontSize: 10 }} />
                      )}
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((u.fund_spent / u.fund_amount) * 100 || 0, 100)}
                      color={u.fund_spent > u.fund_amount ? 'error' : 'primary'}
                      sx={{ height: 6, borderRadius: 3, mb: 0.75 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Spent: {fmt(u.fund_spent)}</Typography>
                      <Typography variant="caption"
                        color={u.fund_remaining < 0 ? 'error.main' : 'text.secondary'}>
                        Left: {fmt(u.fund_remaining)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Category list */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                All Shared Categories This Month
              </Typography>
              <Stack spacing={1}>
                {(data?.by_category || []).map(c => (
                  <Box key={c.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color }} />
                      <Typography variant="body2">{c.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500} color="error.main">
                      {fmt(c.total)}
                    </Typography>
                  </Box>
                ))}
                {!data?.by_category?.length && !loading && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No shared expenses recorded yet
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TransactionDialog
        open={txOpen}
        onClose={() => setTxOpen(false)}
        onSaved={() => setRefresh(r => r + 1)}
      />
    </Box>
  )
}
