import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { deleteEmployee, getEmployee } from "../api/employees.js";
import PageHeader from "../components/common/PageHeader.jsx";

function statusColor(status) {
  if (status === "active") return "success";
  if (status === "onboarded") return "info";
  return "default";
}

function EmployeeShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployee(id)
      .then(setEmployee)
      .catch(() => setError("Unable to load employee."));
  }, [id]);

  async function handleDelete() {
    await deleteEmployee(id);
    navigate("/employees");
  }

  return (
    <>
      <PageHeader
        title="Employee Profile"
        subtitle="Read-only employee assignment, salary, and status details."
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit employee">
              <IconButton component={RouterLink} to={`/employees/${id}/edit`} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete employee">
              <IconButton color="error" onClick={handleDelete}>
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />

      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">{employee?.full_name || "Employee"}</Typography>
            <Chip
              label={(employee?.status || "active").replace("_", " ")}
              color={statusColor(employee?.status)}
              sx={{ textTransform: "capitalize" }}
            />
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Employee ID" value={employee?.id || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="User ID" value={employee?.user_id || ""} InputProps={{ readOnly: true }} />
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
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="DOJ" value={employee?.joining_date || ""} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>

          <Button onClick={() => navigate("/employees")}>Back to employees</Button>
        </Stack>
      </Paper>
    </>
  );
}

export default EmployeeShow;
