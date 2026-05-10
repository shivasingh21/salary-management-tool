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
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import lookupConfig from "./lookupConfig.js";

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
  const [submitting, setSubmitting] = useState(false);
  const headerCellSx = { fontWeight: 700, textDecoration: "underline" };

  const loadRecords = useCallback(() => {
    setError("");
    config.list()
      .then(setRecords)
      .catch(() => setError(`Unable to load ${config.title.toLowerCase()}.`));
  }, [config]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  async function handleDelete(record) {
    setError("");

    try {
      await config.delete(record.id);
      loadRecords();
    } catch (requestError) {
      setError(requestError.response?.data?.error || `Unable to delete ${config.singular.toLowerCase()}.`);
    }
  }

  function openDialog(record = null) {
    setEditingRecord(record);
    setName(record?.name || "");
    setDialogOpen(true);
    setError("");
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingRecord(null);
    setName("");
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

  return (
    <>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog()}
            sx={{ bgcolor: "#101828", "&:hover": { bgcolor: "#1d2939" } }}
          >
            New {config.singular.toLowerCase()}
          </Button>
        }
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Name</TableCell>
                  <TableCell align="right" sx={headerCellSx}>Employees</TableCell>
                  <TableCell align="right" sx={headerCellSx}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{record.name}</Typography>
                    </TableCell>
                    <TableCell align="right">{Number(record.employee_count || 0).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={`Edit ${config.singular.toLowerCase()}`}>
                        <IconButton onClick={() => openDialog(record)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={`Delete ${config.singular.toLowerCase()}`}>
                        <IconButton color="error" onClick={() => handleDelete(record)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6">Top employee counts</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Top 10 {config.title.toLowerCase()} by assigned employees.
            </Typography>
            <Stack spacing={1.25}>
              {topRecords.map((record, index) => (
                <Stack key={record.id} direction="row" justifyContent="space-between" spacing={2}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={700} noWrap>{index + 1}. {record.name}</Typography>
                  </Box>
                  <Typography color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                    {Number(record.employee_count || 0).toLocaleString()}
                  </Typography>
                </Stack>
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
