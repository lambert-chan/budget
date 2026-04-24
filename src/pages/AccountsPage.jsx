import { useState, useEffect } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, Button,
  Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  InputAdornment, IconButton, Chip, Skeleton,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded'
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded'
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded'
import WalletRoundedIcon from '@mui/icons-material/WalletRounded'
import { getAccounts, createAccount, deleteAccount } from '../api'

const fmt = (n) => new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD',
}).format(n || 0)

const icons = {
  checking: <AccountBalanceRoundedIcon />,
  savings:  <SavingsRoundedIcon />,
  credit:   <CreditCardRoundedIcon />,
  cash:     <WalletRoundedIcon />,
}

const typeColors = {
  checking: 'primary',
  savings:  'success',
  credit:   'error',
  cash:     'warning',
}

function AddAccountDialog({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', type: 'checking', balance: '', currency: 'CAD' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.type) return
    setSaving(true)
    try {
      await createAccount({ ...form, balance: parseFloat(form.balance) || 0 })
      onSaved(); onClose()
      setForm({ name: '', type: 'checking', balance: '', currency: 'CAD' })
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>Add Account</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField label="Account name" value={form.name}
            onChange={e => set('name', e.target.value)} size="small" fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select value={form.type} label="Type" onChange={e => set('type', e.target.value)}>
              {['checking', 'savings', 'credit', 'cash'].map(t => (
                <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Opening balance" type="number" value={form.balance}
            onChange={e => set('balance', e.target.value)} size="small" fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Add Account'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [addOpen, setAddOpen]   = useState(false)

  const load = () => {
    setLoading(true)
    getAccounts().then(r => setAccounts(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const totalBalance = accounts.reduce((s, a) =>
    a.type === 'credit' ? s - parseFloat(a.balance) : s + parseFloat(a.balance), 0)

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>Accounts</Typography>
          <Typography variant="body2" color="text.secondary">
            Net worth: <strong>{fmt(totalBalance)}</strong>
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />}
          onClick={() => setAddOpen(true)} size="small">
          Add Account
        </Button>
      </Box>

      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          : accounts.map(account => (
              <Grid item xs={12} sm={6} md={4} key={account.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          p: 1, borderRadius: 2,
                          bgcolor: `${typeColors[account.type]}.main`,
                          color: 'white', display: 'flex',
                          opacity: 0.9,
                        }}>
                          {icons[account.type]}
                        </Box>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>{account.name}</Typography>
                          <Chip label={account.type} size="small"
                            color={typeColors[account.type]}
                            sx={{ fontSize: 10, height: 18, textTransform: 'capitalize' }} />
                        </Box>
                      </Box>
                      <IconButton size="small" color="error"
                        onClick={() => deleteAccount(account.id).then(load)}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="h5" fontWeight={600}
                      color={account.type === 'credit' ? 'error.main' : 'text.primary'}>
                      {fmt(account.balance)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {account.currency} · {account.type === 'credit' ? 'Balance owed' : 'Available'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
        }
      </Grid>

      <AddAccountDialog open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />
    </Box>
  )
}
