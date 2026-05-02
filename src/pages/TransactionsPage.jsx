import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Button, Stack, TextField, ToggleButtonGroup, ToggleButton,
  Avatar, Skeleton, Tooltip, FormControl, InputLabel,
  Select, MenuItem,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded'
import { getTransactions, deleteTransaction, getCategories } from '../api'
import TransactionDialog from '../components/shared/TransactionDialog'
import dayjs from 'dayjs'

const fmtCAD = (n) => new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD',
}).format(n || 0)

const fmtAmt = (amount, currency) => new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: currency || 'CAD',
  minimumFractionDigits: 2,
}).format(amount || 0)

function exportToCSV(transactions, filters) {
  const headers = ['Date','Description','Category','Type','Scope','Added By','Currency','Amount','Amount (CAD)']
  const rows = transactions.map(tx => [
    dayjs(tx.date).format('YYYY-MM-DD'),
    tx.description || '',
    tx.category_name || '',
    tx.type,
    tx.scope,
    tx.created_by_name || '',
    tx.currency || 'CAD',
    tx.type === 'income' ? tx.amount : -tx.amount,
    tx.type === 'income' ? tx.amount_cad : -tx.amount_cad,
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `transactions_${filters.from}_to_${filters.to}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [view, setView]                 = useState('household')
  const [from, setFrom]                 = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [to, setTo]                     = useState(dayjs().format('YYYY-MM-DD'))
  const [categoryId, setCategoryId]     = useState('')
  const [dialogOpen, setDialogOpen]     = useState(false)
  const [editing, setEditing]           = useState(null)
  const [exporting, setExporting]       = useState(false)

  useEffect(() => { getCategories().then(r => setCategories(r.data)) }, [])

  const load = useCallback(() => {
    setLoading(true)
    const params = { view, from, to, limit: 100 }
    if (categoryId) params.category_id = categoryId
    getTransactions(params)
      .then(r => setTransactions(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [view, from, to, categoryId])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id); load()
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = { view, from, to, limit: 9999 }
      if (categoryId) params.category_id = categoryId
      const res = await getTransactions(params)
      exportToCSV(res.data, { from, to })
    } finally { setExporting(false) }
  }

  const clearFilters = () => {
    setFrom(dayjs().startOf('month').format('YYYY-MM-DD'))
    setTo(dayjs().format('YYYY-MM-DD'))
    setCategoryId(''); setView('household')
  }

  const hasActiveFilters = categoryId !== '' || view !== 'household'

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Transactions</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />}
            onClick={handleExport} disabled={exporting || loading || transactions.length === 0} size="small">
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />}
            onClick={() => { setEditing(null); setDialogOpen(true) }} size="small">
            Add
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2.5 }}>
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup value={view} exclusive size="small"
            onChange={(_, v) => v && setView(v)}>
            <ToggleButton value="household">🏠 Household</ToggleButton>
            <ToggleButton value="personal">👤 Mine</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
          <TextField label="From" type="date" size="small" value={from}
            onChange={e => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
          <TextField label="To" type="date" size="small" value={to}
            onChange={e => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryId} label="Category"
              onChange={e => setCategoryId(e.target.value)}
              startAdornment={<FilterListRoundedIcon fontSize="small" sx={{ ml: 0.5, mr: 0.5, color: 'text.secondary' }} />}>
              <MenuItem value=""><em>All categories</em></MenuItem>
              {['income','expense'].map(type => {
                const filtered = categories.filter(c => c.type === type)
                if (!filtered.length) return null
                return [
                  <MenuItem key={`hdr-${type}`} disabled
                    sx={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {type}
                  </MenuItem>,
                  ...filtered.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                        {c.name}
                      </Box>
                    </MenuItem>
                  ))
                ]
              })}
            </Select>
          </FormControl>
          {hasActiveFilters && (
            <Button size="small" variant="outlined" onClick={clearFilters} sx={{ ml: 'auto' }}>
              Clear filters
            </Button>
          )}
        </Box>
        {categoryId && (
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Chip size="small"
              label={`Category: ${categories.find(c => c.id == categoryId)?.name || ''}`}
              onDelete={() => setCategoryId('')} sx={{ fontSize: 12 }} />
          </Box>
        )}
      </Card>

      {!loading && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
        </Typography>
      )}

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Added by</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : transactions.length === 0
                  ? <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        No transactions found
                      </TableCell>
                    </TableRow>
                  : transactions.map(tx => {
                      const isForeign = tx.currency && tx.currency !== 'CAD'
                      return (
                        <TableRow key={tx.id} hover>
                          <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                            {dayjs(tx.date).format('MMM D')}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 180 }}>
                            <Typography variant="body2" noWrap>{tx.description || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            {tx.category_name
                              ? <Chip label={tx.category_name} size="small" sx={{
                                  bgcolor: tx.category_color + '22', color: tx.category_color,
                                  fontWeight: 500, fontSize: 11,
                                  border: `1px solid ${tx.category_color}44`,
                                }} />
                              : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell>
                            <Chip label={tx.scope === 'shared' ? '🏠 Shared' : '👤 Personal'}
                              size="small" variant="outlined" sx={{ fontSize: 11 }} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'primary.main' }}>
                                {tx.created_by_name?.[0]}
                              </Avatar>
                              <Typography variant="caption">{tx.created_by_name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={500}
                              color={tx.type === 'income' ? 'success.main' : 'error.main'}>
                              {tx.type === 'income' ? '+' : '-'}
                              {fmtAmt(tx.amount, tx.currency)}
                            </Typography>
                            {isForeign && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                ≈ {tx.type === 'income' ? '+' : '-'}{fmtCAD(tx.amount_cad)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => { setEditing(tx); setDialogOpen(true) }}>
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => handleDelete(tx.id)}>
                                <DeleteRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })
              }
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null) }}
        transaction={editing}
        onSaved={load}
      />
    </Box>
  )
}
