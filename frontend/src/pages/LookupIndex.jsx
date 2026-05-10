import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../components/common/PageHeader.jsx";
import lookupConfig from "./lookupConfig.js";

function RankedYAxisTick({ x, y, payload }) {
  const rank = payload.index + 1;

  return (
    <text x={x} y={y + 4} textAnchor="end" fill="#344054" fontSize={12} fontWeight={700}>
      #{rank}
    </text>
  );
}

function EmployeeCountTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const record = payload[0].payload;

  return (
    <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 1, boxShadow: 3, p: 1.25 }}>
      <Typography fontWeight={700}>{record.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {Number(record.employee_count || 0).toLocaleString()} employees
      </Typography>
    </Box>
  );
}

function formatErrors(error) {
  const errors = error.response?.data?.errors;

  if (!errors) return error.response?.data?.error || "Unable to save record.";

  return Object.entries(errors)
    .map(([field, messages]) => `${field} ${messages.join(", ")}`)
    .join(". ");
}

function LookupIndex({ resource }) {
  const config = lookupConfig[resource];
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [actionLocked, setActionLocked] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const headerCellSx = { fontWeight: 700, textDecoration: "underline", textAlign: "left" };

  const loadRecords = useCallback(() => {
    setError("");
    config.list()
      .then(setRecords)
      .catch(() => setError(`Unable to load ${config.title.toLowerCase()}.`));
  }, [config]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    if (!error) return undefined;

    const timeout = window.setTimeout(() => setError(""), 5000);

    return () => window.clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    setError("");
  }, [resource]);

  async function handleDelete(record) {
    setError("");
    setDeletingId(record.id);

    try {
      await config.delete(record.id);
      loadRecords();
    } catch (requestError) {
      setError(requestError.response?.data?.error || `Unable to delete ${config.singular.toLowerCase()}.`);
    } finally {
      setDeletingId(null);
    }
  }

  function openDialog(record = null) {
    setActionLocked(true);
    setEditingRecord(record);
    setName(record?.name || "");
    setDialogOpen(true);
    setError("");
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingRecord(null);
    setName("");
    setActionLocked(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingRecord) {
        await config.update(editingRecord.id, { name });
      } else {
        await config.create({ name });
      }
      closeDialog();
      loadRecords();
    } catch (requestError) {
      setError(formatErrors(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  const topRecords = [...records]
    .sort((first, second) => Number(second.employee_count || 0) - Number(first.employee_count || 0))
    .slice(0, 10);
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) => record.name.toLowerCase().includes(query));
  }, [records, search]);
  const visibleRecords = filteredRecords.slice(page * 20, page * 20 + 20);

  return (
    <>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        action={
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              label={`Search ${config.title.toLowerCase()}`}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openDialog()}
              disabled={actionLocked}
            >
              New {config.singular.toLowerCase()}
            </Button>
          </Stack>
        }
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider" }}>
            <Table sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{ ...headerCellSx, width: "33.33%" }}>Name</TableCell>
                  <TableCell align="left" sx={{ ...headerCellSx, width: "33.33%" }}>Employees</TableCell>
                  <TableCell align="left" sx={{ ...headerCellSx, width: "33.33%" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRecords.map((record, index) => (
                  <TableRow key={record.id} hover sx={{ bgcolor: index % 2 === 0 ? "background.paper" : "rgba(16, 24, 40, 0.04)" }}>
                    <TableCell>
                      <Typography fontWeight={700}>{record.name}</Typography>
                    </TableCell>
                    <TableCell align="left">{Number(record.employee_count || 0).toLocaleString()}</TableCell>
                    <TableCell align="left">
                      <Tooltip title={`Edit ${config.singular.toLowerCase()}`}>
                        <IconButton onClick={() => openDialog(record)} disabled={actionLocked || deletingId === record.id}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={`Delete ${config.singular.toLowerCase()}`}>
                        <IconButton color="error" onClick={() => handleDelete(record)} disabled={actionLocked || deletingId === record.id}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Paper
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderTop: 0,
              bottom: 0,
              position: "sticky",
              zIndex: 2
            }}
          >
            <TablePagination
              component="div"
              count={filteredRecords.length}
              page={page}
              rowsPerPage={20}
              rowsPerPageOptions={[20]}
              onPageChange={(_event, nextPage) => setPage(nextPage)}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6">Top employee counts</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Top 10 {config.title.toLowerCase()} by assigned employees.
            </Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRecords} layout="vertical" margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#eef2f6" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#667085", fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={34}
                    interval={0}
                    tick={<RankedYAxisTick />}
                  />
                  <ChartTooltip content={<EmployeeCountTooltip />} />
                  <Bar dataKey="employee_count" fill="#0c5dffff" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={0.75} sx={{ mt: 1.5 }}>
              {topRecords.map((record, index) => (
                <Typography key={record.id} variant="caption" color="text.secondary" noWrap>
                  #{index + 1} {record.name}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingRecord ? `Edit ${config.singular}` : `New ${config.singular}`}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              required
              fullWidth
              autoFocus
              label={`${config.singular} name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

export default LookupIndex;
