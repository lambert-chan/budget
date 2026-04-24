import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, InputAdornment, IconButton,
} from '@mui/material'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import { login } from '../api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { setUser }             = useAuth()
  const navigate                = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(email, password)
      setUser(res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      bgcolor: 'background.default', p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={600} color="primary.main" gutterBottom>
              BudgetWise
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lambert & Jessica's household finances
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email" autoFocus fullWidth
              />
              <TextField
                label="Password" type={showPw ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPw(p => !p)}>
                        {showPw
                          ? <VisibilityOffRoundedIcon fontSize="small" />
                          : <VisibilityRoundedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
              <Button
                type="submit" variant="contained" size="large"
                disabled={loading} sx={{ mt: 1 }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
