import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Stack, Button,
  TextField, Divider, Alert, InputAdornment, Avatar,
  Grid, Chip,
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { getAllocations, updateAllocation, updateMe } from '../api'

const fmt = (n) => new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
}).format(n || 0)

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

function ProfileCard() {
  const { user, setUser } = useAuth()
  const [name, setName]               = useState(user?.name || '')
  const [currentPw, setCurrentPw]     = useState('')
  const [newPw, setNewPw]             = useState('')
  const [saving, setSaving]           = useState(false)
  const [message, setMessage]         = useState(null)

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

export default function SettingsPage() {
  const [allocations, setAllocations] = useState([])

  const loadAllocations = () => {
    getAllocations().then(r => setAllocations(r.data))
  }

  useEffect(() => { loadAllocations() }, [])

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>Settings</Typography>

      {/* Personal funds */}
      <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        Personal fund allocations
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        {allocations.map(u => (
          <AllocationCard key={u.user_id} user={u} onSaved={loadAllocations} />
        ))}
      </Stack>

      {/* Profile */}
      <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        Your account
      </Typography>
      <ProfileCard />

      {/* About */}
      <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.disabled">
          BudgetWise v2 · Lambert & Jessica's household finance tracker
        </Typography>
      </Box>
    </Box>
  )
}
