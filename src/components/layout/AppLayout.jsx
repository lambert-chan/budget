import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Divider, IconButton,
  useMediaQuery, AppBar, Toolbar, Tooltip,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { useAuth } from '../../context/AuthContext'

const DRAWER_WIDTH = 240

const navItems = [
  { label: 'Dashboard',    icon: <DashboardRoundedIcon />,             path: '/' },
  { label: 'Transactions', icon: <ReceiptLongRoundedIcon />,           path: '/transactions' },
  { label: 'Budgets',      icon: <PieChartRoundedIcon />,              path: '/budgets' },
  { label: 'Household',    icon: <HomeRoundedIcon />,                  path: '/household' },
  { label: 'Accounts',     icon: <AccountBalanceWalletRoundedIcon />,  path: '/accounts' },
  { label: 'Settings',     icon: <SettingsRoundedIcon />,              path: '/settings' },
]

function SidebarContent({ onNav }) {
  const { user, logout } = useAuth()
  const location         = useLocation()
  const navigate         = useNavigate()
  const theme            = useTheme()

  const handleNav = (path) => {
    navigate(path)
    onNav?.()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Logo */}
      <Box sx={{ mb: 3, px: 1 }}>
        <Typography variant="h6" sx={{
          fontWeight: 600, color: 'primary.main', letterSpacing: '-0.02em'
        }}>
          BudgetWise
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Lambert & Jessica
        </Typography>
      </Box>

      {/* Nav */}
      <List disablePadding sx={{ flex: 1 }}>
        {navItems.map(item => {
          const active = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                selected={active}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 500 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* User */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={500} noWrap>{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{user?.role}</Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={handleLogout} color="inherit">
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default function AppLayout() {
  const theme    = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{ width: DRAWER_WIDTH, flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <AppBar position="fixed" elevation={0} sx={{
          bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider'
        }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setOpen(true)} sx={{ mr: 1 }}>
              <MenuRoundedIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} color="primary.main">
              BudgetWise
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: { md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        <SidebarContent onNav={() => setOpen(false)} />
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{
        flex: 1, minWidth: 0,
        pt: isMobile ? 8 : 0,
        overflow: 'auto',
      }}>
        <Outlet />
      </Box>
    </Box>
  )
}
