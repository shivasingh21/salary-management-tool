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
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const employeeColumns = [
  { key: "id", label: "ID", width: "6.28%", value: (employee) => Number(employee.id || 0), type: "number" },
  { key: "name", label: "Name", width: "16.28%", value: (employee) => employee.full_name || "" },
  { key: "joining_date", label: "Date of Joining", width: "14.28%", value: (employee) => employee.joining_date || "" },
  { key: "job_title", label: "Job Title", width: "20.28%", value: (employee) => employee.job_title?.name || "" },
  { key: "country", label: "Country", width: "14.28%", value: (employee) => employee.country?.name || "" },
  { key: "salary", label: "Salary", width: "14.28%", value: (employee) => Number(employee.salary || 0), type: "number" }
];

const headerCellSx = { fontWeight: 700, textDecoration: "underline" };

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
  const [orderBy, setOrderBy] = useState("id");
  const [order, setOrder] = useState("desc");
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

  const sortedEmployees = useMemo(() => {
    const direction = order === "asc" ? 1 : -1;
    const column = employeeColumns.find((currentColumn) => currentColumn.key === orderBy);
    if (!column) return employees;

    return [...employees].sort((first, second) => {
      const firstValue = column.value(first);
      const secondValue = column.value(second);

      if (column.type === "number") {
        return (Number(firstValue || 0) - Number(secondValue || 0)) * direction;
      }

      return String(firstValue).localeCompare(String(secondValue)) * direction;
    });
  }, [employees, order, orderBy]);

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

  function handleSort(columnKey) {
    const nextOrder = orderBy === columnKey && order === "asc" ? "desc" : "asc";

    setOrderBy(columnKey);
    setOrder(nextOrder);
  }

  function statusDotColor(status) {
    if (status === "active") return "#16a34a";
    if (status === "onboarding") return "#eab308";
    return "#98a2b3";
  }

  function statusLabel(status) {
    if (status === "onboarding") return "Onboarding";
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
              sx={{ bgcolor: "#101083ff", "&:hover": { bgcolor: "#475467" } }}
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
              {employeeColumns.map((column) => (
                <TableCell key={column.key} align="left" sx={{ ...headerCellSx, width: column.width }}>
                  <TableSortLabel
                    active={orderBy === column.key}
                    direction={orderBy === column.key ? order : "asc"}
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="left" sx={{ ...headerCellSx, width: "14.28%" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEmployees.map((employee, index) => (
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
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit employee">
                    <IconButton
                      component={RouterLink}
                      to={`/employees/${employee.id}/edit`}
                    >
                      <EditIcon sx={{ color: "#101083ff" }} />
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
            <MenuItem value="onboarding">Onboarding</MenuItem>
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
