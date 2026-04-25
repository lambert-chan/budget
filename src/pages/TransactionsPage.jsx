import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Card, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Button, ToggleButtonGroup, ToggleButton, Avatar,
  Skeleton, Tooltip,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import { getTransactions, deleteTransaction } from '../api'
import TransactionDialog from '../components/shared/TransactionDialog'
import dayjs from 'dayjs'

const fmt = (n) => new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD',
}).format(n || 0)

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [view, setView]                 = useState('household')
  const [from, setFrom]                 = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [to, setTo]                     = useState(dayjs().format('YYYY-MM-DD'))
  const [dialogOpen, setDialogOpen]     = useState(false)
  const [editing, setEditing]           = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    getTransactions({ view, from, to, limit: 100 })
      .then(r => setTransactions(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [view, from, to])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
    load()
  }

  const handleEdit = (tx) => { setEditing(tx); setDialogOpen(true) }
  const handleAdd  = () => { setEditing(null); setDialogOpen(true) }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>Transactions</Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleAdd} size="small">
            Add
          </Button>
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
            <DatePicker
              label="From"
              value={from ? dayjs(from) : null}
              onChange={(value) => setFrom(value ? value.format('YYYY-MM-DD') : '')}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="To"
              value={to ? dayjs(to) : null}
              onChange={(value) => setTo(value ? value.format('YYYY-MM-DD') : '')}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
        </Card>

        {/* Table */}
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
                    : transactions.map(tx => (
                        <TableRow key={tx.id} hover>
                          <TableCell sx={{ color: 'text.secondary', fontSize: 13 }}>
                            {dayjs(tx.date).format('MMM D')}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }}>
                            <Typography variant="body2" noWrap>
                              {tx.description || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {tx.category_name
                              ? <Chip label={tx.category_name} size="small"
                                  sx={{ bgcolor: tx.category_color + '22', color: tx.category_color,
                                    fontWeight: 500, fontSize: 11, border: `1px solid ${tx.category_color}44` }} />
                              : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tx.scope === 'shared' ? '🏠 Shared' : '👤 Personal'}
                              size="small" variant="outlined"
                              sx={{ fontSize: 11 }}
                            />
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
                              {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEdit(tx)}>
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
                      ))
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
    </LocalizationProvider>
  )
}
