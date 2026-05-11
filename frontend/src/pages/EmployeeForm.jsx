import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEmployee, deleteEmployee, getEmployee, updateEmployee } from "../api/employees.js";
import { listCountries, listDepartments, listJobTitles } from "../api/lookups.js";
import PageHeader from "../components/common/PageHeader.jsx";
import DeleteEmployeeDialog from "../components/employees/DeleteEmployeeDialog.jsx";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  department_id: "",
  job_title_id: "",
  country_id: "",
  salary: "",
  joining_date: "",
  status: "active"
};

function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [lookups, setLookups] = useState({ departments: [], jobTitles: [], countries: [] });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listDepartments(), listJobTitles(), listCountries()])
      .then(([departments, jobTitles, countries]) => setLookups({ departments, jobTitles, countries }))
      .catch(() => setError("Unable to load form options."));
  }, []);

  useEffect(() => {
    if (!id) return;

    getEmployee(id).then((employee) => {
      setForm({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        department_id: employee.department?.id || "",
        job_title_id: employee.job_title?.id || "",
        country_id: employee.country?.id || "",
        salary: employee.salary || "",
        joining_date: employee.joining_date || "",
        status: employee.status || "active"
      });
    }).catch(() => navigate("/employees", {
      replace: true,
      state: { error: "Employee not found" }
    }));
  }, [id, navigate]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function editPayload() {
    return {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      salary: form.salary,
      joining_date: form.joining_date,
      department_id: form.department_id,
      job_title_id: form.job_title_id,
      status: form.status
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (id) {
        await updateEmployee(id, editPayload());
        navigate(`/employees/${id}`);
      } else {
        await createEmployee(form);
        navigate("/employees");
      }
    } catch {
      setError("Unable to save employee. Check the required fields and API token.");
    }
  }

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
        title={id ? "Edit Employee" : "New Employee"}
        subtitle="Manage salary, location, department, job assignment, and status."
        action={id ? (
          <Tooltip title="Delete employee">
            <IconButton color="error" onClick={() => setDeleteOpen(true)}>
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      />

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "8px 10px 24px rgba(16, 24, 40, 0.14)"
        }}
      >
        {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth required label="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth required label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth required label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select fullWidth required label="Job Title" name="job_title_id" value={form.job_title_id} onChange={handleChange}>
              {lookups.jobTitles.map((jobTitle) => <MenuItem key={jobTitle.id} value={jobTitle.id}>{jobTitle.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select fullWidth required label="Department" name="department_id" value={form.department_id} onChange={handleChange}>
              {lookups.departments.map((department) => <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>)}
            </TextField>
          </Grid>
          {!id ? (
            <Grid item xs={12} md={6}>
              <TextField select fullWidth required label="Country" name="country_id" value={form.country_id} onChange={handleChange}>
                {lookups.countries.map((country) => <MenuItem key={country.id} value={country.id}>{country.name}</MenuItem>)}
              </TextField>
            </Grid>
          ) : null}
          <Grid item xs={12} md={6}>
            <TextField fullWidth required label="Salary" name="salary" type="number" value={form.salary} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select fullWidth required label="Status" name="status" value={form.status} onChange={handleChange}>
              <MenuItem value="onboarding">Onboarding</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth required label="Date of Joining" name="joining_date" type="date" value={form.joining_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button onClick={() => navigate("/employees")}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: "#101083ff", "&:hover": { bgcolor: "#475467" } }}>
            {id ? "Save changes" : "Save employee"}
          </Button>
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

export default EmployeeForm;
