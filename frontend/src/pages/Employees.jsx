import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { deleteEmployee, listEmployees } from "../api/employees.js";
import { listCountries, listDepartments, listJobTitles } from "../api/lookups.js";
import PageHeader from "../components/common/PageHeader.jsx";
import DeleteEmployeeDialog from "../components/employees/DeleteEmployeeDialog.jsx";

const initialFilters = {
  id: "",
  joining_date: "",
  name: "",
  job_title_id: "",
  department_id: "",
  country_id: "",
  status: "",
  salary_range: ""
};

const salaryRanges = [
  { value: "0-50000", label: "$0 - $50,000" },
  { value: "50001-100000", label: "$50,001 - $100,000" },
  { value: "100001-200000", label: "$100,001 - $200,000" },
  { value: "200000+", label: "$200,000+" }
];

function isPageReload() {
  const navigation = window.performance?.getEntriesByType?.("navigation")?.[0];
  return navigation?.type === "reload";
}

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: 20, total_count: 0, total_pages: 0 });
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [lookups, setLookups] = useState({ departments: [], jobTitles: [], countries: [] });
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLocked, setActionLocked] = useState(false);
  const [flashError, setFlashError] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const filtersOpen = Boolean(filterAnchor);

  useEffect(() => {
    const message = location.state?.error;
    if (!message) return undefined;

    navigate(location.pathname, { replace: true, state: {} });

    if (isPageReload()) {
      setFlashError("");
      return undefined;
    }

    setFlashError(message);
    const timeout = window.setTimeout(() => setFlashError(""), 5000);

    return () => window.clearTimeout(timeout);
  }, [location.pathname, location.state?.error, navigate]);

  const loadEmployees = useCallback(() => {
    const params = {
      page: page + 1,
      per_page: 20,
      ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""))
    };

    listEmployees(params)
      .then((response) => {
        setEmployees(response.data);
        setMeta(response.meta);
      })
      .catch(() => setError("Unable to load employees. Check your API token and Rails API server."));
  }, [filters, page]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    Promise.all([listDepartments(), listJobTitles(), listCountries()])
      .then(([departments, jobTitles, countries]) => setLookups({ departments, jobTitles, countries }))
      .catch(() => setError("Unable to load filter options."));
  }, []);

  async function handleDelete() {
    if (!employeeToDelete) return;

    setDeleting(true);

    try {
      await deleteEmployee(employeeToDelete.id);
      setEmployeeToDelete(null);
      loadEmployees();
    } finally {
      setDeleting(false);
    }
  }

  function handleFilterChange(event) {
    setDraftFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSaveFilters() {
    setFilters(draftFilters);
    setPage(0);
    setFilterAnchor(null);
  }

  function handleClearFilters() {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
    setPage(0);
    setFilterAnchor(null);
  }

  function statusDotColor(status) {
    if (status === "active") return "#16a34a";
    if (status === "onboarded") return "#eab308";
    return "#98a2b3";
  }

  function statusLabel(status) {
    if (status === "onboarded") return "Onboarding";
    if (status === "inactive") return "Inactive";
    return "Active";
  }

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="Review employee profiles, salary details, and assignments."
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={(event) => {
                setDraftFilters(filters);
                setFilterAnchor(event.currentTarget);
              }}
            >
              Filters
            </Button>
            <Button
              component={RouterLink}
              to="/employees/new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ bgcolor: "#101828", "&:hover": { bgcolor: "#1d2939" } }}
            >
              New employee
            </Button>
          </Stack>
        }
      />

      {flashError ? <Typography color="error" sx={{ mb: 2 }}>{flashError}</Typography> : null}
      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider" }}>
        <Table sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={{ fontWeight: 700, textDecoration: "underline", width: "6.28%" }}>ID</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, textDecoration: "underline", width: "16.28%" }}>Name</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, textDecoration: "underline", width: "14.28%" }}>Date of Joining</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, textDecoration: "underline", width: "20.28%" }}>Job Title</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, textDecoration: "underline", width: "14.28%" }}>Country</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, textDecoration: "underline", width: "14.28%" }}>Salary</TableCell>
              <TableCell align="left" sx={{ fontWeight: 700, textDecoration: "underline", width: "14.28%" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee, index) => (
              <TableRow key={employee.id} hover sx={{ bgcolor: index % 2 === 0 ? "background.paper" : "rgba(16, 24, 40, 0.04)" }}>
                <TableCell>{employee.id}</TableCell>
                <TableCell>
                  <Box sx={{ alignItems: "center", display: "inline-flex", gap: 0.75, maxWidth: "100%" }}>
                    <Typography fontWeight={700}>{employee.full_name || "Unassigned"}</Typography>
                    <Box
                      aria-label={employee.status || "active"}
                      title={statusLabel(employee.status)}
                      component="span"
                      sx={{
                        bgcolor: statusDotColor(employee.status),
                        borderRadius: "50%",
                        display: "inline-block",
                        flex: "0 0 auto",
                        height: 10,
                        width: 10
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>{employee.joining_date}</TableCell>
                <TableCell>
                  <Typography>{employee.job_title?.name}</Typography>
                  <Typography variant="body2" sx={{ color: "#475467" }}>
                    {employee.department?.name}
                  </Typography>
                </TableCell>
                <TableCell>{employee.country?.name}</TableCell>
                <TableCell>${Number(employee.salary).toLocaleString()}</TableCell>
                <TableCell>
                  <Tooltip title="View employee">
                    <IconButton
                      component={RouterLink}
                      to={`/employees/${employee.id}`}
                      color="primary"
                      disabled={actionLocked}
                      onClick={() => setActionLocked(true)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit employee">
                    <IconButton
                      component={RouterLink}
                      to={`/employees/${employee.id}/edit`}
                      disabled={actionLocked}
                      onClick={() => setActionLocked(true)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete employee">
                    <IconButton color="error" onClick={() => setEmployeeToDelete(employee)}>
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
          count={meta.total_count}
          page={page}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
        />
      </Paper>

      <Popover
        open={filtersOpen}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { mt: 1, p: 2, width: 380, maxHeight: 460, overflowY: "auto" } }}
      >
        <Stack spacing={2}>
          <Typography variant="h6">Filters</Typography>
          <TextField label="ID" name="id" value={draftFilters.id} onChange={handleFilterChange} />
          <TextField
            label="Date of Joining"
            name="joining_date"
            type="date"
            value={draftFilters.joining_date}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField label="Name" name="name" value={draftFilters.name} onChange={handleFilterChange} />
          <TextField select label="Job Title" name="job_title_id" value={draftFilters.job_title_id} onChange={handleFilterChange}>
            <MenuItem value="">All job titles</MenuItem>
            {lookups.jobTitles.map((jobTitle) => <MenuItem key={jobTitle.id} value={jobTitle.id}>{jobTitle.name}</MenuItem>)}
          </TextField>
          <TextField select label="Department" name="department_id" value={draftFilters.department_id} onChange={handleFilterChange}>
            <MenuItem value="">All departments</MenuItem>
            {lookups.departments.map((department) => <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>)}
          </TextField>
          <TextField select label="Country" name="country_id" value={draftFilters.country_id} onChange={handleFilterChange}>
            <MenuItem value="">All countries</MenuItem>
            {lookups.countries.map((country) => <MenuItem key={country.id} value={country.id}>{country.name}</MenuItem>)}
          </TextField>
          <TextField select label="Status" name="status" value={draftFilters.status} onChange={handleFilterChange}>
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="onboarded">Onboarding</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
          <TextField select label="Salary Range" name="salary_range" value={draftFilters.salary_range} onChange={handleFilterChange}>
            <MenuItem value="">All salary ranges</MenuItem>
            {salaryRanges.map((range) => <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>)}
          </TextField>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button color="secondary" onClick={handleClearFilters}>Clear Filters</Button>
            <Button variant="contained" onClick={handleSaveFilters}>Save Filters</Button>
          </Stack>
        </Stack>
      </Popover>

      <DeleteEmployeeDialog
        open={Boolean(employeeToDelete)}
        loading={deleting}
        onCancel={() => setEmployeeToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default Employees;
