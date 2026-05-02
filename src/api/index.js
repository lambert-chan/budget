import axios from 'axios'

const api = axios.create({
  baseURL: 'https://lambertchan.ca/budget-api/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const onLoginPage = window.location.pathname === '/login'
      const isAuthRequest = err.config?.url?.includes('/auth/')

      // Let the login screen handle its own auth failures instead of forcing a full reload loop.
      if (!onLoginPage && !isAuthRequest) {
        window.location.replace('/login')
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const logout = () => api.post('/auth/logout')

export const getMe = () => api.get('/auth/me')

export const updateMe = (data) => api.put('/auth/me', data)

// ── Transactions ──────────────────────────────────────────────────────────────
export const getTransactions = (params) =>
  api.get('/transactions', { params })

export const getTransaction = (id) => api.get(`/transactions/${id}`)

export const createTransaction = (data) => api.post('/transactions', data)

export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data)

export const deleteTransaction = (id) => api.delete(`/transactions/${id}`)

// ── Summary ───────────────────────────────────────────────────────────────────
export const getHouseholdSummary = (month) =>
  api.get('/summary/household', { params: { month } })

export const getPersonalSummary = (month) =>
  api.get('/summary/personal', { params: { month } })

export const getFullSummary = (month) =>
  api.get('/summary/full', { params: { month } })

// ── Accounts ──────────────────────────────────────────────────────────────────
export const getAccounts = () => api.get('/accounts')

export const createAccount = (data) => api.post('/accounts', data)

export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data)

export const deleteAccount = (id) => api.delete(`/accounts/${id}`)

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = (params) =>
  api.get('/categories', { params })

export const createCategory = (data) => api.post('/categories', data)

export const updateCategory = (id, data) => api.put(`/categories/${id}`, data)

export const deleteCategory = (id) => api.delete(`/categories/${id}`)

// ── Budgets ───────────────────────────────────────────────────────────────────
export const getBudgets = (params) => api.get('/budgets', { params })

export const saveBudget = (data) => api.post('/budgets', data)

export const deleteBudget = (id) => api.delete(`/budgets/${id}`)

// ── Allocations ───────────────────────────────────────────────────────────────
export const getAllocations = () => api.get('/allocations')

export const updateAllocation = (userId, data) =>
  api.put(`/allocations/${userId}`, data)

export default api

// ── Exchange rates ─────────────────────────────────────────────────────────────
export const getExchangeRates = () => api.get('/exchange-rates')

export const saveExchangeRate = (data) => api.post('/exchange-rates', data)

export const deleteExchangeRate = (currency) => api.delete(`/exchange-rates/${currency}`)
