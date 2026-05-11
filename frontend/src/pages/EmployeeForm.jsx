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

const nameMaxLength = 50;
const emailMaxLength = 50;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const salaryPattern = /^\d+(\.\d{1,2})?$/;

function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [lookups, setLookups] = useState({ departments: [], jobTitles: [], countries: [] });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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
    const { name } = event.target;

    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
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

  function fieldError(name) {
    return fieldErrors[name] || "";
  }

  function hasFieldError(name) {
    return Boolean(fieldError(name));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.first_name.trim()) nextErrors.first_name = "First name is required.";
    if (form.first_name.length > nameMaxLength) nextErrors.first_name = "First name must be 50 characters or less.";
    if (!form.last_name.trim()) nextErrors.last_name = "Last name is required.";
    if (form.last_name.length > nameMaxLength) nextErrors.last_name = "Last name must be 50 characters or less.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (form.email.length > emailMaxLength) nextErrors.email = "Email must be 50 characters or less.";
    if (form.email && !emailPattern.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.department_id) nextErrors.department_id = "Department is required.";
    if (!form.job_title_id) nextErrors.job_title_id = "Job title is required.";
    if (!id && !form.country_id) nextErrors.country_id = "Country is required.";
    if (!form.salary) {
      nextErrors.salary = "Salary is required.";
    } else if (!salaryPattern.test(form.salary)) {
      nextErrors.salary = "Enter a valid salary amount.";
    } else if (Number(form.salary) <= 0) {
      nextErrors.salary = "Salary must be greater than 0.";
    }
    if (!form.status) nextErrors.status = "Status is required.";
    if (!form.joining_date) nextErrors.joining_date = "Date of joining is required.";

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function validationMessage(messages) {
    const normalizedMessages = Array.isArray(messages) ? messages : [messages];

    return [...new Set(normalizedMessages)].join(". ");
  }

  function handleRequestError(requestError) {
    const errors = requestError.response?.data?.errors;

    if (!errors) {
      setError(requestError.response?.data?.error || "Unable to save employee. Check the required fields and API token.");
      return;
    }

    setFieldErrors(Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [field, validationMessage(messages)])
    ));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validateForm()) return;

    try {
      if (id) {
        await updateEmployee(id, editPayload());
        navigate(`/employees/${id}`);
      } else {
        await createEmployee(form);
        navigate("/employees");
      }
    } catch (requestError) {
      handleRequestError(requestError);
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
        noValidate
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
            <TextField
              fullWidth
              required
              label="First Name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              error={hasFieldError("first_name")}
              helperText={fieldError("first_name")}
              inputProps={{ maxLength: nameMaxLength }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Last Name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              error={hasFieldError("last_name")}
              helperText={fieldError("last_name")}
              inputProps={{ maxLength: nameMaxLength }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={hasFieldError("email")}
              helperText={fieldError("email")}
              inputProps={{ maxLength: emailMaxLength }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select fullWidth required label="Job Title" name="job_title_id" value={form.job_title_id} onChange={handleChange}>
              {lookups.jobTitles.map((jobTitle) => <MenuItem key={jobTitle.id} value={jobTitle.id}>{jobTitle.name}</MenuItem>)}
            </TextField>
            {fieldError("job_title_id") ? <Typography color="error" variant="caption">{fieldError("job_title_id")}</Typography> : null}
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select fullWidth required label="Department" name="department_id" value={form.department_id} onChange={handleChange}>
              {lookups.departments.map((department) => <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>)}
            </TextField>
            {fieldError("department_id") ? <Typography color="error" variant="caption">{fieldError("department_id")}</Typography> : null}
          </Grid>
          {!id ? (
            <Grid item xs={12} md={6}>
              <TextField select fullWidth required label="Country" name="country_id" value={form.country_id} onChange={handleChange}>
                {lookups.countries.map((country) => <MenuItem key={country.id} value={country.id}>{country.name}</MenuItem>)}
              </TextField>
              {fieldError("country_id") ? <Typography color="error" variant="caption">{fieldError("country_id")}</Typography> : null}
            </Grid>
          ) : null}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Salary"
              name="salary"
              type="text"
              value={form.salary}
              onChange={handleChange}
              error={hasFieldError("salary")}
              helperText={fieldError("salary")}
              inputProps={{ inputMode: "decimal" }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select fullWidth required label="Status" name="status" value={form.status} onChange={handleChange}>
              <MenuItem value="onboarding">Onboarding</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            {fieldError("status") ? <Typography color="error" variant="caption">{fieldError("status")}</Typography> : null}
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Date of Joining"
              name="joining_date"
              type="date"
              value={form.joining_date}
              onChange={handleChange}
              error={hasFieldError("joining_date")}
              helperText={fieldError("joining_date")}
              InputLabelProps={{ shrink: true }}
            />
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
