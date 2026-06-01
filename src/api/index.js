import axios from 'axios'
import * as mockApi from './mock'

export const useMockApi =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export const mockUser = mockApi.mockUser

const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://lambertchan.ca/budget-api/api'

const realApi = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

if (!useMockApi) {
  realApi.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        const onLoginPage = window.location.pathname === '/login'
        const isAuthRequest = err.config?.url?.includes('/auth/')

        if (!onLoginPage && !isAuthRequest) {
          window.location.replace('/login')
        }
      }
      return Promise.reject(err)
    }
  )
}

const api = useMockApi ? mockApi.api : realApi

export const login = useMockApi
  ? mockApi.login
  : (email, password) => realApi.post('/auth/login', { email, password })

export const logout = useMockApi
  ? mockApi.logout
  : () => realApi.post('/auth/logout')

export const getMe = useMockApi
  ? mockApi.getMe
  : () => realApi.get('/auth/me')

export const updateMe = useMockApi
  ? mockApi.updateMe
  : (data) => realApi.put('/auth/me', data)

export const getTransactions = useMockApi
  ? mockApi.getTransactions
  : (params) => realApi.get('/transactions', { params })

export const getTransaction = useMockApi
  ? mockApi.getTransaction
  : (id) => realApi.get(`/transactions/${id}`)

export const createTransaction = useMockApi
  ? mockApi.createTransaction
  : (data) => realApi.post('/transactions', data)

export const updateTransaction = useMockApi
  ? mockApi.updateTransaction
  : (id, data) => realApi.put(`/transactions/${id}`, data)

export const deleteTransaction = useMockApi
  ? mockApi.deleteTransaction
  : (id) => realApi.delete(`/transactions/${id}`)

export const getHouseholdSummary = useMockApi
  ? mockApi.getHouseholdSummary
  : (month) => realApi.get('/summary/household', { params: { month } })

export const getPersonalSummary = useMockApi
  ? mockApi.getPersonalSummary
  : (month) => realApi.get('/summary/personal', { params: { month } })

export const getFullSummary = useMockApi
  ? mockApi.getFullSummary
  : (month) => realApi.get('/summary/full', { params: { month } })

export const getAccounts = useMockApi
  ? mockApi.getAccounts
  : () => realApi.get('/accounts')

export const createAccount = useMockApi
  ? mockApi.createAccount
  : (data) => realApi.post('/accounts', data)

export const updateAccount = useMockApi
  ? mockApi.updateAccount
  : (id, data) => realApi.put(`/accounts/${id}`, data)

export const deleteAccount = useMockApi
  ? mockApi.deleteAccount
  : (id) => realApi.delete(`/accounts/${id}`)

export const getCategories = useMockApi
  ? mockApi.getCategories
  : (params) => realApi.get('/categories', { params })

export const createCategory = useMockApi
  ? mockApi.createCategory
  : (data) => realApi.post('/categories', data)

export const updateCategory = useMockApi
  ? mockApi.updateCategory
  : (id, data) => realApi.put(`/categories/${id}`, data)

export const deleteCategory = useMockApi
  ? mockApi.deleteCategory
  : (id) => realApi.delete(`/categories/${id}`)

export const getBudgets = useMockApi
  ? mockApi.getBudgets
  : (params) => realApi.get('/budgets', { params })

export const saveBudget = useMockApi
  ? mockApi.saveBudget
  : (data) => realApi.post('/budgets', data)

export const deleteBudget = useMockApi
  ? mockApi.deleteBudget
  : (id) => realApi.delete(`/budgets/${id}`)

export const getAllocations = useMockApi
  ? mockApi.getAllocations
  : () => realApi.get('/allocations')

export const updateAllocation = useMockApi
  ? mockApi.updateAllocation
  : (userId, data) => realApi.put(`/allocations/${userId}`, data)

export const getExchangeRates = useMockApi
  ? mockApi.getExchangeRates
  : () => realApi.get('/exchange-rates')

export const saveExchangeRate = useMockApi
  ? mockApi.saveExchangeRate
  : (data) => realApi.post('/exchange-rates', data)

export const deleteExchangeRate = useMockApi
  ? mockApi.deleteExchangeRate
  : (currency) => realApi.delete(`/exchange-rates/${currency}`)

export default api
