import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Stack, Button,
  TextField, Divider, Alert, InputAdornment, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, ToggleButtonGroup, ToggleButton, Chip, Table,
  TableBody, TableCell, TableHead, TableRow,
} from '@mui/material'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useAuth } from '../context/AuthContext'
import {
  getAllocations, updateAllocation, updateMe,
  getCategories, createCategory, deleteCategory,
  getExchangeRates, saveExchangeRate, deleteExchangeRate,
} from '../api'

// ── Exchange rates card ───────────────────────────────────────────────────────
function ExchangeRatesCard() {
  const [rates, setRates]       = useState([])
  const [currency, setCurrency] = useState('')
  const [rate, setRate]         = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const load = () => getExchangeRates().then(r => setRates(r.data))
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!currency || !rate) { setError('Both fields are required'); return }
    if (!/^[A-Za-z]{3}$/.test(currency)) { setError('Currency must be 3 letters e.g. USD'); return }
    setSaving(true)
    setError('')
    try {
      await saveExchangeRate({ currency: currency.toUpperCase(), rate_to_cad: parseFloat(rate) })
      setCurrency(''); setRate('')
      load()
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save rate')
    } finally { setSaving(false) }
  }

  const handleDelete = async (cur) => {
    if (!confirm(`Delete rate for ${cur}?`)) return
    await deleteExchangeRate(cur)
    load()
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>
          Exchange Rates to CAD
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Rates are locked at the time of each transaction. Update here to apply to future entries only.
        </Typography>

        {/* Add new rate */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TextField
            label="Currency code" value={currency} size="small"
            onChange={e => setCurrency(e.target.value.toUpperCase())}
            inputProps={{ maxLength: 3, style: { textTransform: 'uppercase' } }}
            placeholder="USD" sx={{ width: 130 }}
          />
          <TextField
            label="1 unit = ? CAD" value={rate} size="small" type="number"
            onChange={e => setRate(e.target.value)}
            placeholder="1.38" sx={{ width: 150 }}
            InputProps={{ startAdornment: <InputAdornment position="start">×</InputAdornment> }}
          />
          <Button variant="contained" size="small" onClick={handleAdd}
            disabled={saving} startIcon={<AddRoundedIcon />}>
            {saving ? 'Saving…' : 'Add / Update'}
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{error}</Alert>}

        {/* Rates table */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Currency</TableCell>
              <TableCell>Rate to CAD</TableCell>
              <TableCell>Last updated</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rates.map(r => (
              <TableRow key={r.currency}>
                <TableCell>
                  <Chip label={r.currency} size="small"
                    color={r.currency === 'CAD' ? 'primary' : 'default'}
                    sx={{ fontFamily: 'monospace', fontWeight: 500 }} />
                </TableCell>
                <TableCell>
                  1 {r.currency} = <strong>{parseFloat(r.rate_to_cad).toFixed(6)}</strong> CAD
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>
                  {new Date(r.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  {r.currency !== 'CAD' && (
                    <IconButton size="small" color="error" onClick={() => handleDelete(r.currency)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rates.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                  No rates added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ── Add category dialog ───────────────────────────────────────────────────────
function AddCategoryDialog({ open, onClose, onSaved }) {
  const [name, setName]     = useState('')
  const [type, setType]     = useState('expense')
  const [scope, setScope]   = useState('shared')
  const [color, setColor]   = useState('#1D9E75')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    try {
      await createCategory({ name: name.trim(), type, scope, color })
      onSaved(); onClose()
      setName(''); setType('expense'); setScope('shared'); setColor('#1D9E75'); setError('')
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create category')
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>Add Category</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)}
            size="small" fullWidth autoFocus />
          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.75} display="block">Type</Typography>
            <ToggleButtonGroup value={type} exclusive size="small" fullWidth
              onChange={(_, v) => v && setType(v)}>
              <ToggleButton value="income">Income</ToggleButton>
              <ToggleButton value="expense">Expense</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.75} display="block">Scope</Typography>
            <ToggleButtonGroup value={scope} exclusive size="small" fullWidth
              onChange={(_, v) => v && setScope(v)}>
              <ToggleButton value="shared">🏠 Household</ToggleButton>
              <ToggleButton value="personal">👤 Personal</ToggleButton>
              <ToggleButton value="any">Both</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.75} display="block">Colour</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box component="input" type="color" value={color}
                onChange={e => setColor(e.target.value)}
                sx={{
                  width: 48, height: 48, border: '1px solid', borderColor: 'divider',
                  borderRadius: 2, cursor: 'pointer', padding: '2px', bgcolor: 'background.paper',
                }} />
              <Box>
                <Typography variant="body2" fontWeight={500}>{color.toUpperCase()}</Typography>
                <Typography variant="caption" color="text.secondary">Click to open colour picker</Typography>
              </Box>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: color,
                border: '2px solid', borderColor: 'divider', ml: 'auto' }} />
            </Box>
          </Box>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Add Category'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ── Categories card ───────────────────────────────────────────────────────────
function CategoriesCard() {
  const [categories, setCategories] = useState([])
  const [addOpen, setAddOpen]       = useState(false)
  const [filter, setFilter]         = useState('expense')

  const load = () => getCategories().then(r => setCategories(r.data))
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Existing transactions will lose their category.')) return
    await deleteCategory(id); load()
  }

  const filtered = categories.filter(c => c.type === filter)

  const scopeChip = (scope) => {
    if (scope === 'shared')   return <Chip label="🏠 Household" size="small" color="primary"   sx={{ fontSize: 10, height: 20 }} />
    if (scope === 'personal') return <Chip label="👤 Personal"  size="small" color="secondary" sx={{ fontSize: 10, height: 20 }} />
    return                           <Chip label="Both"          size="small"                   sx={{ fontSize: 10, height: 20 }} />
  }

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={500}>Categories</Typography>
            <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />}
              onClick={() => setAddOpen(true)}>Add</Button>
          </Box>
          <ToggleButtonGroup value={filter} exclusive size="small"
            onChange={(_, v) => v && setFilter(v)} sx={{ mb: 2 }}>
            <ToggleButton value="expense">Expenses</ToggleButton>
            <ToggleButton value="income">Income</ToggleButton>
          </ToggleButtonGroup>
          <Stack spacing={0.5}>
            {filtered.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No {filter} categories
              </Typography>
            )}
            {filtered.map(cat => (
              <Box key={cat.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                py: 0.75, px: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cat.color, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ flex: 1 }}>{cat.name}</Typography>
                {scopeChip(cat.scope)}
                <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}>
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
      <AddCategoryDialog open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />
    </>
  )
}

// ── Allocation card ───────────────────────────────────────────────────────────
function AllocationCard({ user, onSaved }) {
  const [amount, setAmount] = useState(user.amount || 0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAllocation(user.user_id, { amount: parseFloat(amount), currency: 'CAD' })
      setSaved(true); setTimeout(() => setSaved(false), 2000); onSaved()
    } finally { setSaving(false) }
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>{user.name[0]}</Avatar>
          <Box>
            <Typography variant="body1" fontWeight={500}>{user.name}</Typography>
            <Typography variant="caption" color="text.secondary">Monthly personal fund</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField size="small" type="number" value={amount}
            onChange={e => setAmount(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ width: 160 }} />
          <Button variant="contained" size="small" onClick={handleSave} disabled={saving}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Update'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

// ── Profile card ──────────────────────────────────────────────────────────────
function ProfileCard() {
  const { user, setUser }         = useAuth()
  const [name, setName]           = useState(user?.name || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [message, setMessage]     = useState(null)

  const handleSave = async () => {
    setSaving(true); setMessage(null)
    try {
      await updateMe({ name, ...(newPw ? { current_password: currentPw, new_password: newPw } : {}) })
      setUser(u => ({ ...u, name })); setCurrentPw(''); setNewPw('')
      setMessage({ type: 'success', text: 'Profile updated' })
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Failed to update' })
    } finally { setSaving(false) }
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" fontWeight={500} gutterBottom>Your profile</Typography>
        <Stack spacing={2}>
          <TextField label="Display name" value={name} onChange={e => setName(e.target.value)} size="small" />
          <TextField label="Email" value={user?.email || ''} size="small" disabled />
          <Divider />
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Change password (leave blank to keep current)
          </Typography>
          <TextField label="Current password" type="password" value={currentPw}
            onChange={e => setCurrentPw(e.target.value)} size="small" />
          <TextField label="New password" type="password" value={newPw}
            onChange={e => setNewPw(e.target.value)} size="small" />
          {message && <Alert severity={message.type} sx={{ borderRadius: 2 }}>{message.text}</Alert>}
          <Box>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [allocations, setAllocations] = useState([])
  const loadAllocations = () => getAllocations().then(r => setAllocations(r.data))
  useEffect(() => { loadAllocations() }, [])

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>Settings</Typography>

      <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        Personal fund allocations
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        {allocations.map(u => (
          <AllocationCard key={u.user_id} user={u} onSaved={loadAllocations} />
        ))}
      </Stack>

      <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        Exchange rates
      </Typography>
      <Box sx={{ mb: 4 }}>
        <ExchangeRatesCard />
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        Categories
      </Typography>
      <Box sx={{ mb: 4 }}>
        <CategoriesCard />
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        Your account
      </Typography>
      <ProfileCard />

      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.disabled">
          BudgetWise v2 · Lambert & Jessica's household finance tracker
        </Typography>
      </Box>
    </Box>
  )
}
