import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Stack, Button,
  TextField, Divider, Alert, InputAdornment, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, IconButton,
  ToggleButtonGroup, ToggleButton, Chip,
} from '@mui/material'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { useAuth } from '../context/AuthContext'
import {
  getAllocations, updateAllocation, updateMe,
  getCategories, createCategory, deleteCategory,
} from '../api'

// ── Colour options ────────────────────────────────────────────────────────────
const COLOURS = [
  '#1D9E75', '#0F6E56', '#378ADD', '#185FA5', '#534AB7',
  '#7F77DD', '#BA7517', '#D85A30', '#993C1D', '#639922',
  '#D4537E', '#993556', '#ED93B1', '#888780', '#E74C3C',
]

// ── Add category dialog ───────────────────────────────────────────────────────
function AddCategoryDialog({ open, onClose, onSaved }) {
  const [name, setName]     = useState('')
  const [type, setType]     = useState('expense')
  const [scope, setScope]   = useState('shared')
  const [color, setColor]   = useState(COLOURS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    try {
      await createCategory({ name: name.trim(), type, scope, color })
      onSaved()
      onClose()
      setName(''); setType('expense'); setScope('shared'); setColor(COLOURS[0]); setError('')
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
            <Typography variant="caption" color="text.secondary" mb={0.75} display="block">
              Type
            </Typography>
            <ToggleButtonGroup value={type} exclusive size="small" fullWidth
              onChange={(_, v) => v && setType(v)}>
              <ToggleButton value="income">Income</ToggleButton>
              <ToggleButton value="expense">Expense</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.75} display="block">
              Scope
            </Typography>
            <ToggleButtonGroup value={scope} exclusive size="small" fullWidth
              onChange={(_, v) => v && setScope(v)}>
              <ToggleButton value="shared">🏠 Household</ToggleButton>
              <ToggleButton value="personal">👤 Personal</ToggleButton>
              <ToggleButton value="any">Both</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" mb={0.75} display="block">
              Colour
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {COLOURS.map(c => (
                <Box key={c} onClick={() => setColor(c)} sx={{
                  width: 28, height: 28, borderRadius: '50%', bgcolor: c,
                  cursor: 'pointer',
                  outline: color === c ? '3px solid' : '2px solid transparent',
                  outlineColor: color === c ? 'text.primary' : 'transparent',
                  outlineOffset: 2,
                  transition: 'transform 0.1s',
                  '&:hover': { transform: 'scale(1.15)' },
                }} />
              ))}
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
    await deleteCategory(id)
    load()
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
              onClick={() => setAddOpen(true)}>
              Add
            </Button>
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
              <Box key={cat.id} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                py: 0.75, px: 1, borderRadius: 2,
                '&:hover': { bgcolor: 'action.hover' },
              }}>
                <Box sx={{
                  width: 12, height: 12, borderRadius: '50%',
                  bgcolor: cat.color, flexShrink: 0,
                }} />
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

      <AddCategoryDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={load}
      />
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
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved()
    } finally { setSaving(false) }
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            {user.name[0]}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={500}>{user.name}</Typography>
            <Typography variant="caption" color="text.secondary">Monthly personal fund</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            size="small" type="number" value={amount}
            onChange={e => setAmount(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            sx={{ width: 160 }}
          />
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
    setSaving(true)
    setMessage(null)
    try {
      await updateMe({
        name,
        ...(newPw ? { current_password: currentPw, new_password: newPw } : {}),
      })
      setUser(u => ({ ...u, name }))
      setCurrentPw(''); setNewPw('')
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
          <TextField label="Display name" value={name}
            onChange={e => setName(e.target.value)} size="small" />
          <TextField label="Email" value={user?.email || ''} size="small" disabled />
          <Divider />
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Change password (leave blank to keep current)
          </Typography>
          <TextField label="Current password" type="password" value={currentPw}
            onChange={e => setCurrentPw(e.target.value)} size="small" />
          <TextField label="New password" type="password" value={newPw}
            onChange={e => setNewPw(e.target.value)} size="small" />
          {message && (
            <Alert severity={message.type} sx={{ borderRadius: 2 }}>{message.text}</Alert>
          )}
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