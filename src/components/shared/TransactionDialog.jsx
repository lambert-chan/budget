import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, FormControl, InputLabel,
  Select, ToggleButtonGroup, ToggleButton, Box, Typography,
  InputAdornment, Stack, Autocomplete,
} from '@mui/material'
import { createTransaction, updateTransaction, getCategories, getAccounts, getExchangeRates } from '../../api'
import dayjs from 'dayjs'

// Common ISO currency codes for autocomplete suggestions
const COMMON_CURRENCIES = [
  'CAD','USD','EUR','GBP','JPY','AUD','CHF','CNY','HKD','SGD',
  'MXN','BRL','INR','KRW','NOK','SEK','DKK','NZD','ZAR','AED',
]

const defaultForm = {
  type: 'expense', scope: 'shared', amount: '',
  currency: 'CAD', description: '',
  date: dayjs().format('YYYY-MM-DD'),
  category_id: '', account_id: '',
}

export default function TransactionDialog({ open, onClose, transaction, onSaved }) {
  const [form, setForm]             = useState(defaultForm)
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts]     = useState([])
  const [rates, setRates]           = useState([])
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    if (!open) return
    Promise.all([getCategories(), getAccounts(), getExchangeRates()]).then(([cats, accs, rts]) => {
      setCategories(cats.data)
      setAccounts(accs.data)
      setRates(rts.data)
    })
    if (transaction) {
      setForm({
        type:        transaction.type,
        scope:       transaction.scope,
        amount:      transaction.amount,
        currency:    transaction.currency || 'CAD',
        description: transaction.description || '',
        date:        transaction.date?.slice(0, 10),
        category_id: transaction.category_id || '',
        account_id:  transaction.account_id || '',
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

  // Find rate for selected currency
  const selectedRate = rates.find(r => r.currency === form.currency.toUpperCase())
  const amountCad    = form.amount && selectedRate
    ? (parseFloat(form.amount) * parseFloat(selectedRate.rate_to_cad)).toFixed(2)
    : form.currency === 'CAD' ? form.amount : null

  const rateKnown    = form.currency === 'CAD' || !!selectedRate
  const currencyOptions = [
    ...new Set([...COMMON_CURRENCIES, ...rates.map(r => r.currency)])
  ].sort()

  const handleSave = async () => {
    if (!form.amount || !form.date || !form.account_id) {
      setError('Amount, date and account are required')
      return
    }
    if (!rateKnown) {
      setError(`No exchange rate found for ${form.currency}. Add it in Settings → Exchange Rates first.`)
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
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">Type</Typography>
            <ToggleButtonGroup value={form.type} exclusive size="small"
              onChange={(_, v) => v && set('type', v)} fullWidth>
              <ToggleButton value="income">Income</ToggleButton>
              <ToggleButton value="expense">Expense</ToggleButton>
              <ToggleButton value="transfer">Transfer</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Scope */}
          {form.type === 'expense' && (
            <Box>
              <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                Who is this for?
              </Typography>
              <ToggleButtonGroup value={form.scope} exclusive size="small"
                onChange={(_, v) => v && set('scope', v)} fullWidth>
                <ToggleButton value="shared">🏠 Household</ToggleButton>
                <ToggleButton value="personal">👤 Personal</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          {/* Amount + Currency */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <TextField
              label="Amount" type="number" value={form.amount}
              onChange={e => set('amount', e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  {form.currency || 'CAD'}
                </InputAdornment>,
              }}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              freeSolo
              options={currencyOptions}
              value={form.currency}
              onInputChange={(_, v) => set('currency', v.toUpperCase())}
              sx={{ width: 120 }}
              renderInput={(params) => (
                <TextField {...params} label="Currency" size="small"
                  inputProps={{ ...params.inputProps, maxLength: 3,
                    style: { textTransform: 'uppercase' } }} />
              )}
            />
          </Box>

          {/* CAD equivalent preview */}
          {form.currency !== 'CAD' && form.amount && (
            <Box sx={{
              px: 1.5, py: 1, borderRadius: 2,
              bgcolor: rateKnown ? 'action.hover' : 'error.main',
              opacity: rateKnown ? 1 : 0.9,
            }}>
              {rateKnown
                ? <Typography variant="caption" color="text.secondary">
                    ≈ <strong>${amountCad} CAD</strong>
                    {' '}(rate: 1 {form.currency} = {selectedRate?.rate_to_cad} CAD)
                  </Typography>
                : <Typography variant="caption" color="white">
                    ⚠ No rate for {form.currency} — add it in Settings → Exchange Rates
                  </Typography>
              }
            </Box>
          )}

          {/* Description */}
          <TextField label="Description" value={form.description}
            onChange={e => set('description', e.target.value)} fullWidth />

          {/* Date */}
          <TextField label="Date" type="date" value={form.date}
            onChange={e => set('date', e.target.value)}
            InputLabelProps={{ shrink: true }} fullWidth />

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
        <Button variant="contained" onClick={handleSave} disabled={saving || !rateKnown}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
