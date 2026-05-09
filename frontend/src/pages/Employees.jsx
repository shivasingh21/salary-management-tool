import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { listEmployees } from "../api/employees.js";
import PageHeader from "../components/common/PageHeader.jsx";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listEmployees()
      .then(setEmployees)
      .catch(() => setError("Unable to load employees. Check your API token and Rails API server."));
  }, []);

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="Review employee profiles, salary details, and assignments."
        action={
          <Button component={RouterLink} to="/employees/new" variant="contained" startIcon={<AddIcon />}>
            New employee
          </Button>
        }
      />

      {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

      <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Job Title</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.slice(0, 50).map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>
                  <Typography fontWeight={700}>{employee.full_name || "Unassigned"}</Typography>
                  <Typography variant="body2" color="text.secondary">{employee.email}</Typography>
                </TableCell>
                <TableCell>{employee.job_title?.name}</TableCell>
                <TableCell>{employee.department?.name}</TableCell>
                <TableCell>{employee.country?.name}</TableCell>
                <TableCell>${Number(employee.salary).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip size="small" color={employee.active ? "success" : "default"} label={employee.active ? "Active" : "Inactive"} />
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
