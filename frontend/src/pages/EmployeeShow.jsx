import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { deleteEmployee, getEmployee } from "../api/employees.js";
import PageHeader from "../components/common/PageHeader.jsx";
import DeleteEmployeeDialog from "../components/employees/DeleteEmployeeDialog.jsx";

function statusColor(status) {
  if (status === "active") return "success";
  if (status === "onboarding") return "info";
  return "default";
}

function statusLabel(status) {
  if (status === "onboarding") return "Onboarding";
  if (status === "inactive") return "Inactive";
  return "Active";
}

function EmployeeShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployee(id)
      .then(setEmployee)
      .catch(() => navigate("/employees", {
        replace: true,
        state: { error: "Employee not found" }
      }));
  }, [id, navigate]);

  async function handleDelete() {
    setDeleting(true);

    try {
      await deleteEmployee(id);
      navigate("/employees");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Employee Profile"
        subtitle="Read-only employee assignment, salary, and status details."
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit employee">
              <Button component={RouterLink} to={`/employees/${id}/edit`} variant="contained" startIcon={<EditIcon />}>
                Edit
              </Button>
            </Tooltip>
            <Tooltip title="Delete employee">
              <Button color="error" variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </Tooltip>
          </Stack>
        }
      />

      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      <Paper
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "8px 10px 24px rgba(16, 24, 40, 0.14)"
        }}
      >
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">{employee?.full_name || "Employee"}</Typography>
            <Chip
              label={statusLabel(employee?.status)}
              color={statusColor(employee?.status)}
              sx={{ textTransform: "capitalize" }}
            />
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Employee ID" value={employee?.id || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Date of Joining" value={employee?.joining_date || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Name" value={employee?.full_name || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" value={employee?.email || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Job Title" value={employee?.job_title?.name || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Department" value={employee?.department?.name || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Country" value={employee?.country?.name || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Salary" value={employee ? `$${Number(employee.salary).toLocaleString()}` : ""} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
        </Stack>
      </Paper>
      <DeleteEmployeeDialog
        open={deleteOpen}
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default EmployeeShow;
