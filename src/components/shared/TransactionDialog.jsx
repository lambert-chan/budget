import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, FormControl, InputLabel,
  Select, ToggleButtonGroup, ToggleButton, Box, Typography,
  InputAdornment, Stack,
} from '@mui/material'
import { createTransaction, updateTransaction, getCategories, getAccounts } from '../../api'
import dayjs from 'dayjs'

const defaultForm = {
  type: 'expense', scope: 'shared', amount: '',
  description: '', date: dayjs().format('YYYY-MM-DD'),
  category_id: '', account_id: '',
}

export default function TransactionDialog({ open, onClose, transaction, onSaved }) {
  const [form, setForm]         = useState(defaultForm)
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!open) return
    Promise.all([getCategories(), getAccounts()]).then(([cats, accs]) => {
      setCategories(cats.data)
      setAccounts(accs.data)
    })
    if (transaction) {
      setForm({
        type: transaction.type,
        scope: transaction.scope,
        amount: transaction.amount,
        description: transaction.description || '',
        date: transaction.date?.slice(0, 10),
        category_id: transaction.category_id || '',
        account_id: transaction.account_id || '',
      })
    } else {
      setForm(defaultForm)
    }
    setError('')
  }, [open, transaction])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const filteredCategories = categories.filter(c =>
    c.type === form.type && (c.scope === form.scope || c.scope === 'any')
  )

  const handleSave = async () => {
    if (!form.amount || !form.date || !form.account_id) {
      setError('Amount, date and account are required')
      return
    }
    setSaving(true)
    try {
      if (transaction) {
        await updateTransaction(transaction.id, form)
      } else {
        await createTransaction(form)
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        {transaction ? 'Edit Transaction' : 'Add Transaction'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>

          {/* Type */}
          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
              Type
            </Typography>
            <ToggleButtonGroup
              value={form.type} exclusive size="small"
              onChange={(_, v) => v && set('type', v)}
              fullWidth
            >
              <ToggleButton value="income">Income</ToggleButton>
              <ToggleButton value="expense">Expense</ToggleButton>
              <ToggleButton value="transfer">Transfer</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Scope — only for expenses */}
          {form.type === 'expense' && (
            <Box>
              <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                Who is this for?
              </Typography>
              <ToggleButtonGroup
                value={form.scope} exclusive size="small"
                onChange={(_, v) => v && set('scope', v)}
                fullWidth
              >
                <ToggleButton value="shared">🏠 Household</ToggleButton>
                <ToggleButton value="personal">👤 Personal</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          {/* Amount */}
          <TextField
            label="Amount" type="number" value={form.amount}
            onChange={e => set('amount', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            fullWidth
          />

          {/* Description */}
          <TextField
            label="Description" value={form.description}
            onChange={e => set('description', e.target.value)}
            fullWidth
          />

          {/* Date */}
          <TextField
            label="Date" type="date" value={form.date}
            onChange={e => set('date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* Account */}
          <FormControl fullWidth size="small">
            <InputLabel>Account</InputLabel>
            <Select value={form.account_id} label="Account"
              onChange={e => set('account_id', e.target.value)}>
              {accounts.map(a => (
                <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Category */}
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select value={form.category_id} label="Category"
              onChange={e => set('category_id', e.target.value)}>
              <MenuItem value=""><em>None</em></MenuItem>
              {filteredCategories.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color }} />
                    {c.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {error && (
            <Typography color="error" variant="caption">{error}</Typography>
          )}
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
