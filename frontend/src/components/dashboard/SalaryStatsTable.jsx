import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";

function SalaryStatsTable({ rows, nameKey, nameLabel, formatCurrency }) {
  const [orderBy, setOrderBy] = useState("avg_salary");
  const [order, setOrder] = useState("desc");

  const columns = [
    { key: nameKey, label: nameLabel, align: "left", format: (value) => value },
    { key: "employee_count", label: "Employees", align: "right", format: (value) => Number(value || 0).toLocaleString() },
    { key: "min_salary", label: "Min salary", align: "right", format: formatCurrency },
    { key: "avg_salary", label: "Avg salary", align: "right", format: formatCurrency },
    { key: "max_salary", label: "Max salary", align: "right", format: formatCurrency }
  ];

  const sortedRows = useMemo(() => {
    const direction = order === "asc" ? 1 : -1;

    return [...rows].sort((first, second) => {
      const firstValue = first[orderBy];
      const secondValue = second[orderBy];

      if (orderBy === nameKey) {
        return String(firstValue).localeCompare(String(secondValue)) * direction;
      }

      return (Number(firstValue || 0) - Number(secondValue || 0)) * direction;
    });
  }, [nameKey, order, orderBy, rows]);

  function handleSort(columnKey) {
    const nextOrder = orderBy === columnKey && order === "asc" ? "desc" : "asc";

    setOrderBy(columnKey);
    setOrder(nextOrder);
  }

  return (
    <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                <TableSortLabel
                  active={orderBy === column.key}
                  direction={orderBy === column.key ? order : "asc"}
                  onClick={() => handleSort(column.key)}
                >
                  {column.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.length > 0 ? (
            sortedRows.map((row, index) => (
              <TableRow
                key={row[nameKey]}
                hover
                sx={{ bgcolor: index % 2 === 0 ? "background.paper" : "rgba(16, 24, 40, 0.025)" }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align} sx={{ py: 1.25, whiteSpace: "nowrap" }}>
                    {column.key === nameKey ? (
                      <Typography fontWeight={700}>{column.format(row[column.key])}</Typography>
                    ) : (
                      column.format(row[column.key])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  No salary stats available.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SalaryStatsTable;
