import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { deleteEmployee, listEmployees } from "../api/employees.js";
import PageHeader from "../components/common/PageHeader.jsx";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listEmployees()
      .then(setEmployees)
      .catch(() => setError("Unable to load employees. Check your API token and Rails API server."));
  }, []);

  async function handleDelete(employeeId) {
    await deleteEmployee(employeeId);
    setEmployees((current) => current.filter((employee) => employee.id !== employeeId));
  }

  function statusColor(status) {
    if (status === "active") return "success";
    if (status === "onboarded") return "info";
    return "default";
  }

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="Review employee profiles, salary details, and assignments."
        action={
          <Button
            component={RouterLink}
            to="/employees/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: "#101828", "&:hover": { bgcolor: "#1d2939" } }}
          >
            New employee
          </Button>
        }
      />

      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, textDecoration: "underline" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, textDecoration: "underline" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, textDecoration: "underline" }}>Job Title</TableCell>
              <TableCell sx={{ fontWeight: 700, textDecoration: "underline" }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700, textDecoration: "underline" }}>Country</TableCell>
              <TableCell sx={{ fontWeight: 700, textDecoration: "underline" }}>Salary</TableCell>
              <TableCell sx={{ fontWeight: 700, textDecoration: "underline" }}>DOJ</TableCell>
              <TableCell sx={{ fontWeight: 700, textDecoration: "underline" }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textDecoration: "underline" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.slice(0, 50).map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>
                  <Typography fontWeight={700}>{employee.full_name || "Unassigned"}</Typography>
                </TableCell>
                <TableCell>{employee.id}</TableCell>
                <TableCell>{employee.job_title?.name}</TableCell>
                <TableCell>{employee.department?.name}</TableCell>
                <TableCell>{employee.country?.name}</TableCell>
                <TableCell>${Number(employee.salary).toLocaleString()}</TableCell>
                <TableCell>{employee.joining_date}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={statusColor(employee.status)}
                    label={(employee.status || "active").replace("_", " ")}
                    sx={{ textTransform: "capitalize" }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View employee">
                    <IconButton component={RouterLink} to={`/employees/${employee.id}`} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit employee">
                    <IconButton component={RouterLink} to={`/employees/${employee.id}/edit`}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete employee">
                    <IconButton color="error" onClick={() => handleDelete(employee.id)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default Employees;
