import dayjs from 'dayjs'

const responseDelay = Number(import.meta.env.VITE_MOCK_LATENCY_MS || 120)

const clone = (value) => JSON.parse(JSON.stringify(value))
const respond = (data) =>
  new Promise(resolve =>
    setTimeout(
      () => resolve({ data: data === undefined ? undefined : clone(data) }),
      responseDelay
    )
  )

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100
const isoDate = (date) => dayjs(date).format('YYYY-MM-DD')

const monthStart = dayjs().startOf('month')
const lastMonthStart = dayjs().subtract(1, 'month').startOf('month')

export const mockUser = {
  id: 1,
  name: 'Local Tester',
  email: 'local@budgetwise.dev',
  role: 'admin',
}

const state = {
  user: { ...mockUser },
  allocations: [
    { user_id: 1, name: 'Lambert', amount: 1200, currency: 'CAD' },
    { user_id: 2, name: 'Jessica', amount: 900, currency: 'CAD' },
  ],
  categories: [
    { id: 1, name: 'Salary', type: 'income', scope: 'any', color: '#1B6B4A' },
    { id: 2, name: 'Freelance', type: 'income', scope: 'any', color: '#2878B5' },
    { id: 3, name: 'Rent', type: 'expense', scope: 'shared', color: '#D1495B' },
    { id: 4, name: 'Groceries', type: 'expense', scope: 'shared', color: '#E09F3E' },
    { id: 5, name: 'Dining Out', type: 'expense', scope: 'personal', color: '#7D5FFF' },
    { id: 6, name: 'Transit', type: 'expense', scope: 'personal', color: '#3A86FF' },
    { id: 7, name: 'Utilities', type: 'expense', scope: 'shared', color: '#4C6FFF' },
    { id: 8, name: 'Subscriptions', type: 'expense', scope: 'personal', color: '#8E7DBE' },
  ],
  accounts: [
    { id: 1, name: 'Chequing', type: 'checking', balance: 4820.35, currency: 'CAD' },
    { id: 2, name: 'Savings', type: 'savings', balance: 12940.0, currency: 'CAD' },
    { id: 3, name: 'Visa', type: 'credit', balance: 1240.22, currency: 'CAD' },
  ],
  exchangeRates: [
    { currency: 'CAD', rate_to_cad: 1, updated_at: dayjs().toISOString() },
    { currency: 'USD', rate_to_cad: 1.37, updated_at: dayjs().toISOString() },
    { currency: 'EUR', rate_to_cad: 1.48, updated_at: dayjs().toISOString() },
  ],
  transactions: [
    {
      id: 1,
      date: isoDate(monthStart.add(1, 'day')),
      description: 'Paycheque',
      category_id: 1,
      type: 'income',
      scope: 'shared',
      amount: 6400,
      currency: 'CAD',
      account_id: 1,
      created_by_name: 'Lambert',
    },
    {
      id: 2,
      date: isoDate(monthStart.add(2, 'day')),
      description: 'Rent',
      category_id: 3,
      type: 'expense',
      scope: 'shared',
      amount: 2400,
      currency: 'CAD',
      account_id: 1,
      created_by_name: 'Jessica',
    },
    {
      id: 3,
      date: isoDate(monthStart.add(5, 'day')),
      description: 'Groceries',
      category_id: 4,
      type: 'expense',
      scope: 'shared',
      amount: 312.45,
      currency: 'CAD',
      account_id: 1,
      created_by_name: 'Lambert',
    },
    {
      id: 4,
      date: isoDate(monthStart.add(7, 'day')),
      description: 'Coffee and lunch',
      category_id: 5,
      type: 'expense',
      scope: 'personal',
      amount: 64.25,
      currency: 'CAD',
      account_id: 1,
      created_by_name: 'Jessica',
    },
    {
      id: 5,
      date: isoDate(monthStart.add(9, 'day')),
      description: 'Transit pass',
      category_id: 6,
      type: 'expense',
      scope: 'personal',
      amount: 96,
      currency: 'CAD',
      account_id: 1,
      created_by_name: 'Lambert',
    },
    {
      id: 6,
      date: isoDate(monthStart.add(11, 'day')),
      description: 'Hydro bill',
      category_id: 7,
      type: 'expense',
      scope: 'shared',
      amount: 178.9,
      currency: 'CAD',
      account_id: 1,
      created_by_name: 'Jessica',
    },
    {
      id: 7,
      date: isoDate(monthStart.add(13, 'day')),
      description: 'Streaming services',
      category_id: 8,
      type: 'expense',
      scope: 'personal',
      amount: 28.99,
      currency: 'CAD',
      account_id: 1,
      created_by_name: 'Lambert',
    },
    {
      id: 8,
      date: isoDate(lastMonthStart.add(10, 'day')),
      description: 'Freelance invoice',
      category_id: 2,
      type: 'income',
      scope: 'personal',
      amount: 480,
      currency: 'CAD',
      account_id: 1,
      created_by_name: 'Jessica',
    },
  ],
  budgets: [
    { id: 1, category_id: 4, month: dayjs().format('YYYY-MM'), amount: 650 },
    { id: 2, category_id: 5, month: dayjs().format('YYYY-MM'), amount: 240 },
    { id: 3, category_id: 6, month: dayjs().format('YYYY-MM'), amount: 120 },
  ],
}

const nextId = (items) => (items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1)

const findCategory = (categoryId) =>
  state.categories.find(category => String(category.id) === String(categoryId))

const findAccount = (accountId) =>
  state.accounts.find(account => String(account.id) === String(accountId))

const findRate = (currency) =>
  state.exchangeRates.find(rate => rate.currency === String(currency || '').toUpperCase())

const amountCadFor = (amount, currency) => {
  const normalized = String(currency || 'CAD').toUpperCase()
  if (normalized === 'CAD') return round2(amount)
  const rate = findRate(normalized)
  return round2(Number(amount) * (rate?.rate_to_cad || 1))
}

const enrichTransaction = (transaction) => {
  const category = findCategory(transaction.category_id)
  const account = findAccount(transaction.account_id)
  return {
    ...clone(transaction),
    category_name: category?.name || null,
    category_color: category?.color || '#888780',
    account_name: account?.name || null,
    created_by_name: transaction.created_by_name || mockUser.name,
    amount_cad: amountCadFor(transaction.amount, transaction.currency),
  }
}

const signedAmountCad = (transaction) => {
  const amount = amountCadFor(transaction.amount, transaction.currency)
  return transaction.type === 'income' ? amount : -amount
}

const applyTransactionToAccount = (transaction, direction = 1) => {
  if (!transaction.account_id) return
  const account = findAccount(transaction.account_id)
  if (!account) return
  const delta = signedAmountCad(transaction) * direction
  account.balance = round2(Number(account.balance) + delta)
}

const monthTransactions = (month, scopeFilter = null) =>
  state.transactions.filter(transaction => {
    const sameMonth = dayjs(transaction.date).format('YYYY-MM') === month
    const scopeMatch = !scopeFilter || transaction.scope === scopeFilter
    return sameMonth && scopeMatch
  })

const categoryTotals = (transactions) => {
  const map = new Map()
  transactions.forEach(transaction => {
    if (transaction.type !== 'expense') return
    const category = findCategory(transaction.category_id)
    const key = category?.id || `uncategorized-${transaction.category_id || 'none'}`
    const current = map.get(key) || {
      name: category?.name || 'Uncategorised',
      label: category?.name || 'Uncategorised',
      color: category?.color || '#888780',
      total_cad: 0,
      total_original: 0,
      currency: transaction.currency || 'CAD',
    }
    const amount = amountCadFor(transaction.amount, transaction.currency)
    current.total_cad = round2(current.total_cad + amount)
    current.total_original = round2(current.total_original + Number(transaction.amount || 0))
    current.currency = transaction.currency || 'CAD'
    map.set(key, current)
  })
  return Array.from(map.values()).sort((a, b) => b.total_cad - a.total_cad)
}

const splitPersonalExpenses = (month) => {
  const personalExpenses = monthTransactions(month, 'personal').filter(transaction => transaction.type === 'expense')
  const totalSpent = personalExpenses.reduce((sum, transaction) => sum + amountCadFor(transaction.amount, transaction.currency), 0)
  const totalAllocation = state.allocations.reduce((sum, user) => sum + Number(user.amount || 0), 0)

  return state.allocations.map(user => {
    const ratio = totalAllocation > 0 ? Number(user.amount || 0) / totalAllocation : 0.5
    const spent = round2(totalSpent * ratio)
    return {
      ...clone(user),
      fund_amount: Number(user.amount || 0),
      fund_spent: spent,
      fund_remaining: round2(Number(user.amount || 0) - spent),
    }
  })
}

const summaryForMonth = (month, scope) => {
  const transactions = monthTransactions(month, scope === 'all' ? null : scope)
  const sharedIncome = monthTransactions(month, 'shared')
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + amountCadFor(transaction.amount, transaction.currency), 0)
  const sharedExpenses = monthTransactions(month, 'shared')
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + amountCadFor(transaction.amount, transaction.currency), 0)
  const personalExpenses = monthTransactions(month, 'personal')
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + amountCadFor(transaction.amount, transaction.currency), 0)
  const totalIncome = monthTransactions(month)
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + amountCadFor(transaction.amount, transaction.currency), 0)
  const totalAllocations = state.allocations.reduce((sum, user) => sum + Number(user.amount || 0), 0)

  const base = {
    by_category: categoryTotals(transactions),
  }

  if (scope === 'personal') {
    const allocation = state.allocations[0] || { amount: 0 }
    const personalSpent = personalExpenses > 0 ? splitPersonalExpenses(month)[0]?.fund_spent || 0 : 0
    return {
      ...base,
      fund_amount: Number(allocation.amount || 0),
      fund_spent: round2(personalSpent),
      fund_remaining: round2(Number(allocation.amount || 0) - personalSpent),
    }
  }

  if (scope === 'full') {
    return {
      ...base,
      total_income: round2(totalIncome),
      shared_expenses: round2(sharedExpenses),
      personal_expenses: round2(personalExpenses),
      net: round2(totalIncome - sharedExpenses - personalExpenses),
    }
  }

  return {
    ...base,
    pooled_income: round2(sharedIncome),
    shared_expenses: round2(sharedExpenses),
    total_allocations: round2(totalAllocations),
    remainder: round2(sharedIncome - sharedExpenses - totalAllocations),
    user_funds: splitPersonalExpenses(month),
  }
}

export const api = {
  get: async (path, config = {}) => {
    const params = config.params || {}
    if (path === '/auth/me') return respond(clone(state.user))
    if (path === '/transactions') return respond(getTransactionsData(params))
    if (path === '/summary/household') return respond(summaryForMonth(params.month, 'household'))
    if (path === '/summary/personal') return respond(summaryForMonth(params.month, 'personal'))
    if (path === '/summary/full') return respond(summaryForMonth(params.month, 'full'))
    if (path === '/accounts') return respond(state.accounts)
    if (path === '/categories') return respond(getCategoriesData(params))
    if (path === '/budgets') return respond(getBudgetsData(params))
    if (path === '/allocations') return respond(state.allocations)
    if (path === '/exchange-rates') return respond(state.exchangeRates)
    if (/^\/transactions\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop())
      const transaction = state.transactions.find(item => item.id === id)
      return respond(transaction ? enrichTransaction(transaction) : null)
    }
    return respond(null)
  },
  post: async (path, data) => {
    if (path === '/auth/login') return respond({ user: clone(state.user) })
    if (path === '/transactions') return respond(createTransactionData(data))
    if (path === '/accounts') return respond(createAccountData(data))
    if (path === '/categories') return respond(createCategoryData(data))
    if (path === '/budgets') return respond(saveBudgetData(data))
    if (path === '/exchange-rates') return respond(saveExchangeRateData(data))
    return respond(null)
  },
  put: async (path, data) => {
    if (path === '/auth/me') return respond(updateMeData(data))
    if (/^\/transactions\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop())
      return respond(updateTransactionData(id, data))
    }
    if (/^\/accounts\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop())
      return respond(updateAccountData(id, data))
    }
    if (/^\/categories\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop())
      return respond(updateCategoryData(id, data))
    }
    if (/^\/allocations\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop())
      return respond(updateAllocationData(id, data))
    }
    return respond(null)
  },
  delete: async (path) => {
    if (path === '/auth/logout') return respond({ ok: true })
    if (/^\/transactions\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop())
      return respond(deleteTransactionData(id))
    }
    if (/^\/accounts\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop())
      return respond(deleteAccountData(id))
    }
    if (/^\/categories\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop())
      return respond(deleteCategoryData(id))
    }
    if (/^\/budgets\/\d+$/.test(path)) {
      const id = Number(path.split('/').pop())
      return respond(deleteBudgetData(id))
    }
    if (/^\/exchange-rates\/[A-Za-z]{3}$/.test(path)) {
      const currency = path.split('/').pop()
      return respond(deleteExchangeRateData(currency))
    }
    return respond(null)
  },
}

export const login = (email) => respond({ user: { ...clone(state.user), email: email || state.user.email } })
export const logout = () => respond({ ok: true })
export const getMe = () => respond(state.user)
export const updateMe = (data) => respond(updateMeData(data))

export const getTransactions = (params) => respond(getTransactionsData(params))
export const getTransaction = (id) =>
  {
    const transaction = state.transactions.find(item => item.id === Number(id))
    return respond(transaction ? enrichTransaction(transaction) : null)
  }
export const createTransaction = (data) => respond(createTransactionData(data))
export const updateTransaction = (id, data) => respond(updateTransactionData(Number(id), data))
export const deleteTransaction = (id) => respond(deleteTransactionData(Number(id)))

export const getHouseholdSummary = (month) => respond(summaryForMonth(month, 'household'))
export const getPersonalSummary = (month) => respond(summaryForMonth(month, 'personal'))
export const getFullSummary = (month) => respond(summaryForMonth(month, 'full'))

export const getAccounts = () => respond(state.accounts)
export const createAccount = (data) => respond(createAccountData(data))
export const updateAccount = (id, data) => respond(updateAccountData(Number(id), data))
export const deleteAccount = (id) => respond(deleteAccountData(Number(id)))

export const getCategories = (params) => respond(getCategoriesData(params))
export const createCategory = (data) => respond(createCategoryData(data))
export const updateCategory = (id, data) => respond(updateCategoryData(Number(id), data))
export const deleteCategory = (id) => respond(deleteCategoryData(Number(id)))

export const getBudgets = (params) => respond(getBudgetsData(params))
export const saveBudget = (data) => respond(saveBudgetData(data))
export const deleteBudget = (id) => respond(deleteBudgetData(Number(id)))

export const getAllocations = () => respond(state.allocations)
export const updateAllocation = (userId, data) => respond(updateAllocationData(Number(userId), data))

export const getExchangeRates = () => respond(state.exchangeRates)
export const saveExchangeRate = (data) => respond(saveExchangeRateData(data))
export const deleteExchangeRate = (currency) => respond(deleteExchangeRateData(currency))

function getCategoriesData(params = {}) {
  let categories = state.categories
  if (params.type) categories = categories.filter(category => category.type === params.type)
  if (params.scope) categories = categories.filter(category => category.scope === params.scope || category.scope === 'any')
  return categories
}

function getTransactionsData(params = {}) {
  const view = params.view || 'all'
  let transactions = state.transactions

  if (view === 'household') transactions = transactions.filter(transaction => transaction.scope === 'shared')
  if (view === 'personal') transactions = transactions.filter(transaction => transaction.scope === 'personal')
  if (params.category_id) transactions = transactions.filter(transaction => String(transaction.category_id) === String(params.category_id))
  if (params.from) transactions = transactions.filter(transaction => dayjs(transaction.date).format('YYYY-MM-DD') >= params.from)
  if (params.to) transactions = transactions.filter(transaction => dayjs(transaction.date).format('YYYY-MM-DD') <= params.to)

  transactions = [...transactions]
    .sort((a, b) => {
      const dateCompare = dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
      if (dateCompare !== 0) return dateCompare
      return b.id - a.id
    })
    .slice(0, Number(params.limit) || transactions.length)

  return transactions.map(enrichTransaction)
}

function getBudgetsData(params = {}) {
  const month = params.month || dayjs().format('YYYY-MM')
  return state.budgets
    .filter(budget => budget.month === month)
    .map(budget => {
      const category = findCategory(budget.category_id)
      const spent = state.transactions
        .filter(transaction =>
          transaction.type === 'expense' &&
          transaction.category_id === budget.category_id &&
          dayjs(transaction.date).format('YYYY-MM') === month
        )
        .reduce((sum, transaction) => sum + amountCadFor(transaction.amount, transaction.currency), 0)
      return {
        ...clone(budget),
        category_name: category?.name || 'Uncategorised',
        color: category?.color || '#888780',
        spent: round2(spent),
      }
    })
}

function createTransactionData(data = {}) {
  const transaction = buildTransaction(data)
  state.transactions.unshift(transaction)
  applyTransactionToAccount(transaction, 1)
  return enrichTransaction(transaction)
}

function updateTransactionData(id, data = {}) {
  const index = state.transactions.findIndex(transaction => transaction.id === id)
  if (index === -1) return null

  const previous = state.transactions[index]
  applyTransactionToAccount(previous, -1)
  const updated = buildTransaction({ ...previous, ...data, id })
  state.transactions[index] = updated
  applyTransactionToAccount(updated, 1)
  return enrichTransaction(updated)
}

function deleteTransactionData(id) {
  const index = state.transactions.findIndex(transaction => transaction.id === id)
  if (index === -1) return { ok: true }
  const [removed] = state.transactions.splice(index, 1)
  applyTransactionToAccount(removed, -1)
  return { ok: true }
}

function createAccountData(data = {}) {
  const account = {
    id: nextId(state.accounts),
    name: data.name || 'New Account',
    type: data.type || 'checking',
    balance: Number(data.balance || 0),
    currency: data.currency || 'CAD',
  }
  state.accounts.push(account)
  return account
}

function updateAccountData(id, data = {}) {
  const account = findAccount(id)
  if (!account) return null
  Object.assign(account, {
    name: data.name ?? account.name,
    type: data.type ?? account.type,
    balance: data.balance !== undefined ? Number(data.balance) : account.balance,
    currency: data.currency ?? account.currency,
  })
  return clone(account)
}

function deleteAccountData(id) {
  state.accounts = state.accounts.filter(account => account.id !== id)
  return { ok: true }
}

function createCategoryData(data = {}) {
  const category = {
    id: nextId(state.categories),
    name: data.name || 'New category',
    type: data.type || 'expense',
    scope: data.scope || 'shared',
    color: data.color || '#1D9E75',
  }
  state.categories.push(category)
  return category
}

function updateCategoryData(id, data = {}) {
  const category = findCategory(id)
  if (!category) return null
  Object.assign(category, {
    name: data.name ?? category.name,
    type: data.type ?? category.type,
    scope: data.scope ?? category.scope,
    color: data.color ?? category.color,
  })
  return clone(category)
}

function deleteCategoryData(id) {
  state.categories = state.categories.filter(category => category.id !== id)
  state.budgets = state.budgets.filter(budget => budget.category_id !== id)
  return { ok: true }
}

function saveBudgetData(data = {}) {
  const month = data.month || dayjs().format('YYYY-MM')
  const categoryId = Number(data.category_id)
  const existing = state.budgets.find(budget =>
    budget.month === month && Number(budget.category_id) === categoryId
  )
  if (existing) {
    existing.amount = Number(data.amount || 0)
    return clone(existing)
  }
  const budget = {
    id: nextId(state.budgets),
    category_id: categoryId,
    month,
    amount: Number(data.amount || 0),
  }
  state.budgets.push(budget)
  return clone(budget)
}

function deleteBudgetData(id) {
  state.budgets = state.budgets.filter(budget => budget.id !== id)
  return { ok: true }
}

function updateAllocationData(userId, data = {}) {
  const allocation = state.allocations.find(item => item.user_id === Number(userId))
  if (!allocation) return null
  allocation.amount = Number(data.amount || 0)
  allocation.currency = data.currency || allocation.currency || 'CAD'
  return clone(allocation)
}

function saveExchangeRateData(data = {}) {
  const currency = String(data.currency || '').toUpperCase()
  if (!currency) return null
  const existing = state.exchangeRates.find(rate => rate.currency === currency)
  if (existing) {
    existing.rate_to_cad = Number(data.rate_to_cad || 1)
    existing.updated_at = dayjs().toISOString()
    return clone(existing)
  }
  const rate = {
    currency,
    rate_to_cad: Number(data.rate_to_cad || 1),
    updated_at: dayjs().toISOString(),
  }
  state.exchangeRates.push(rate)
  return clone(rate)
}

function deleteExchangeRateData(currency) {
  const normalized = String(currency || '').toUpperCase()
  if (normalized === 'CAD') return { ok: true }
  state.exchangeRates = state.exchangeRates.filter(rate => rate.currency !== normalized)
  return { ok: true }
}

function updateMeData(data = {}) {
  state.user = {
    ...state.user,
    name: data.name ?? state.user.name,
    email: data.email ?? state.user.email,
  }
  return clone(state.user)
}

function buildTransaction(data = {}) {
  const base = {
    id: data.id || nextId(state.transactions),
    date: data.date || dayjs().format('YYYY-MM-DD'),
    description: data.description || '',
    category_id: data.category_id ? Number(data.category_id) : '',
    type: data.type || 'expense',
    scope: data.scope || 'shared',
    amount: Number(data.amount || 0),
    currency: String(data.currency || 'CAD').toUpperCase(),
    account_id: data.account_id ? Number(data.account_id) : '',
    created_by_name: data.created_by_name || mockUser.name,
  }

  const category = findCategory(base.category_id)
  const account = findAccount(base.account_id)

  return {
    ...base,
    category_id: category?.id ?? base.category_id,
    account_id: account?.id ?? base.account_id,
  }
}
