import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";

function SalaryStatsTable({ rows, nameKey, nameLabel, formatCurrency, defaultRowsPerPage = 8 }) {
  const [orderBy, setOrderBy] = useState("avg_salary");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

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

  const visibleRows = useMemo(
    () => sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, sortedRows]
  );

  useEffect(() => {
    setPage(0);
  }, [rows, rowsPerPage]);

  function handleSort(columnKey) {
    const nextOrder = orderBy === columnKey && order === "asc" ? "desc" : "asc";

    setOrderBy(columnKey);
    setOrder(nextOrder);
  }

  function handleRowsPerPageChange(event) {
    setRowsPerPage(Number(event.target.value));
  }

  return (
    <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align}
                  sx={{ bgcolor: "#f8fafc", fontWeight: 700, py: 1.25, whiteSpace: "nowrap" }}
                >
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
            {visibleRows.length > 0 ? (
              visibleRows.map((row, index) => (
                <TableRow
                  key={row[nameKey]}
                  hover
                  sx={{ bgcolor: index % 2 === 0 ? "background.paper" : "rgba(16, 24, 40, 0.025)" }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align} sx={{ py: 1.15, whiteSpace: "nowrap" }}>
                      {column.key === nameKey ? (
                        <Typography fontWeight={700} noWrap sx={{ maxWidth: 280 }}>
                          {column.format(row[column.key])}
                        </Typography>
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
      <TablePagination
        component="div"
        count={sortedRows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 8, 10, 25]}
        onPageChange={(_event, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Paper>
  );
}

export default SalaryStatsTable;
