import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Stack,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Skeleton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import { getTransactions, deleteTransaction, getCategories } from "../api";
import TransactionDialog from "../components/shared/TransactionDialog";
import dayjs from "dayjs";

const fmt = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(n || 0);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("household");
  const [from, setFrom] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD"),
  );
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [categoryId, setCategoryId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Load categories for the filter dropdown
  useEffect(() => {
    getCategories().then((r) => setCategories(r.data));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = { view, from, to, limit: 100 };
    if (categoryId) params.category_id = categoryId;
    getTransactions(params)
      .then((r) => setTransactions(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [view, from, to, categoryId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    await deleteTransaction(id);
    load();
  };

  const handleEdit = (tx) => {
    setEditing(tx);
    setDialogOpen(true);
  };
  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setFrom(dayjs().startOf("month").format("YYYY-MM-DD"));
    setTo(dayjs().format("YYYY-MM-DD"));
    setCategoryId("");
    setView("household");
  };

  const hasActiveFilters = categoryId !== "" || view !== "household";

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAdd}
          size="small"
        >
          Add
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 2.5 }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* Scope view */}
          <ToggleButtonGroup
            value={view}
            exclusive
            size="small"
            onChange={(_, v) => v && setView(v)}
          >
            <ToggleButton value="household">🏠 Household</ToggleButton>
            <ToggleButton value="personal">👤 Mine</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>

          {/* Date range */}
          <TextField
            label="From"
            type="date"
            size="small"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />

          {/* Category filter */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId}
              label="Category"
              onChange={(e) => setCategoryId(e.target.value)}
              startAdornment={
                <FilterListRoundedIcon
                  fontSize="small"
                  sx={{ ml: 0.5, mr: 0.5, color: "text.secondary" }}
                />
              }
            >
              <MenuItem value="">
                <em>All categories</em>
              </MenuItem>
              {/* Group by type */}
              {["income", "expense"].map((type) => {
                const filtered = categories.filter((c) => c.type === type);
                if (!filtered.length) return null;
                return [
                  <MenuItem
                    key={`header-${type}`}
                    disabled
                    sx={{
                      fontSize: 11,
                      opacity: 0.6,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {type}
                  </MenuItem>,
                  ...filtered.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: c.color,
                            flexShrink: 0,
                          }}
                        />
                        {c.name}
                      </Box>
                    </MenuItem>
                  )),
                ];
              })}
            </Select>
          </FormControl>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              size="small"
              variant="outlined"
              onClick={clearFilters}
              sx={{ ml: "auto" }}
            >
              Clear filters
            </Button>
          )}
        </Box>

        {/* Active filter chips */}
        {categoryId && (
          <Box
            sx={{ px: 2, pb: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}
          >
            {categoryId && (
              <Chip
                size="small"
                label={`Category: ${categories.find((c) => c.id == categoryId)?.name || ""}`}
                onDelete={() => setCategoryId("")}
                sx={{ fontSize: 12 }}
              />
            )}
          </Box>
        )}
      </Card>

      {/* Results count */}
      {!loading && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 1.5, display: "block" }}
        >
          {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""} found
        </Typography>
      )}

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
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} hover>
                    <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>
                      {dayjs(tx.date).format("MMM D")}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap>
                        {tx.description || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {tx.category_name ? (
                        <Chip
                          label={tx.category_name}
                          size="small"
                          sx={{
                            bgcolor: tx.category_color + "22",
                            color: tx.category_color,
                            fontWeight: 500,
                            fontSize: 11,
                            border: `1px solid ${tx.category_color}44`,
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          tx.scope === "shared" ? "🏠 Shared" : "👤 Personal"
                        }
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 20,
                            height: 20,
                            fontSize: 10,
                            bgcolor: "primary.main",
                          }}
                        >
                          {tx.created_by_name?.[0]}
                        </Avatar>
                        <Typography variant="caption">
                          {tx.created_by_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color={
                          tx.type === "income" ? "success.main" : "error.main"
                        }
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {fmt(tx.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(tx)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(tx.id)}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        transaction={editing}
        onSaved={load}
      />
    </Box>
  );
}
