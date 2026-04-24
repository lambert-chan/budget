import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useMemo } from 'react'
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material'
import { buildTheme } from './theme'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/layout/RequireAuth'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'
import BudgetsPage from './pages/BudgetsPage'
import HouseholdPage from './pages/HouseholdPage'
import AccountsPage from './pages/AccountsPage'
import SettingsPage from './pages/SettingsPage'

function ThemedApp() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(() => buildTheme(prefersDark ? 'dark' : 'light'), [prefersDark])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="budgets" element={<BudgetsPage />} />
                <Route path="household" element={<HouseholdPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default ThemedApp
