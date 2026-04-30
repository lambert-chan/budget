import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, LinearProgress,
  Button, Stack, Skeleton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem,
  Select, FormControl, InputLabel, InputAdornment, IconButton,
  Tooltip,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import { getBudgets, saveBudget, deleteBudget, getCategories } from '../api'
import dayjs from 'dayjs'

const fmt = (n) => new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
}).format(n || 0)

function BudgetCard({ budget, onDelete }) {
  const pct  = Math.min((budget.spent / budget.amount) * 100, 100) || 0
  const over = budget.spent > budget.amount
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: budget.color, flexShrink: 0 }} />
            <Typography variant="body1" fontWeight={500}>{budget.category_name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {over && <Chip label="Over budget" color="error" size="small" sx={{ fontSize: 10 }} />}
            <Tooltip title="Delete budget">
              <IconButton size="small" color="error" onClick={() => onDelete(budget.id)}>
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate" value={pct}
          color={over ? 'error' : pct > 80 ? 'warning' : 'primary'}
          sx={{ height: 6, borderRadius: 3, mb: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Spent: <strong>{fmt(budget.spent)}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Budget: <strong>{fmt(budget.amount)}</strong>
          </Typography>
        </Box>
        <Typography variant="caption" color={over ? 'error.main' : 'text.secondary'}>
          {over
            ? `${fmt(budget.spent - budget.amount)} over`
            : `${fmt(budget.amount - budget.spent)} remaining`}
        </Typography>
      </CardContent>
    </Card>
  )
}

function AddBudgetDialog({ open, onClose, onSaved, month }) {
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount]         = useState('')
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    if (open) getCategories({ type: 'expense' }).then(r => setCategories(r.data))
  }, [open])

  const handleSave = async () => {
    if (!categoryId || !amount) return
    setSaving(true)
    try {
      await saveBudget({ category_id: categoryId, month, amount: parseFloat(amount) })
      onSaved()
      onClose()
      setCategoryId(''); setAmount('')
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>Set Budget</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select value={categoryId} label="Category" onChange={e => setCategoryId(e.target.value)}>
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color }} />
                    {c.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box
            component="input"
            type="number"
            placeholder="Monthly limit"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', fontSize: 14,
              border: '1px solid rgba(128,128,128,0.3)', borderRadius: 8,
              background: 'transparent', color: 'inherit', fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function BudgetsPage() {
  const [month, setMonth]     = useState(dayjs().format('YYYY-MM'))
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  const load = () => {
    setLoading(true)
    getBudgets({ month }).then(r => setBudgets(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [month])

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return
    await deleteBudget(id)
    load()
  }

  const totalBudget = budgets.reduce((s, b) => s + parseFloat(b.amount), 0)
  const totalSpent  = budgets.reduce((s, b) => s + parseFloat(b.spent),  0)

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={600}>Budgets</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <input type="month" value={month}
            onChange={e => setMonth(e.target.value)}
            max={dayjs().format('YYYY-MM')}
            style={{
              border: '1px solid rgba(128,128,128,0.4)', borderRadius: 8,
              padding: '6px 10px', fontSize: 14, fontFamily: 'inherit',
              background: 'transparent', color: 'inherit',
              colorScheme: 'light dark'
            }}
          />
          <Button variant="contained" startIcon={<AddRoundedIcon />}
            onClick={() => setAddOpen(true)} size="small">
            Set Budget
          </Button>
        </Stack>
      </Box>

      {/* Overall progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={500}>Total household budget</Typography>
            <Typography variant="body2" color="text.secondary">
              {fmt(totalSpent)} / {fmt(totalBudget)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min((totalSpent / totalBudget) * 100 || 0, 100)}
            color={totalSpent > totalBudget ? 'error' : 'primary'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      {/* Budget cards */}
      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          : budgets.length === 0
            ? <Grid item xs={12}>
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No budgets set for this month.
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setAddOpen(true)}>
                    Set your first budget
                  </Button>
                </Box>
              </Grid>
            : budgets.map(b => (
                <Grid item xs={12} sm={6} md={4} key={b.id}>
                  <BudgetCard budget={b} onDelete={handleDelete} />
                </Grid>
              ))
        }
      </Grid>

      <AddBudgetDialog
        open={addOpen} onClose={() => setAddOpen(false)}
        onSaved={load} month={month}
      />
    </Box>
  )
}