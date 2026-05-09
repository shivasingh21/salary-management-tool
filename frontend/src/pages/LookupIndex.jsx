import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
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
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import PageHeader from "../components/common/PageHeader.jsx";
import lookupConfig from "./lookupConfig.js";

function LookupIndex({ resource }) {
  const config = lookupConfig[resource];
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const headerCellSx = { fontWeight: 700, textDecoration: "underline" };

  const loadRecords = useCallback(() => {
    setError("");
    config.list()
      .then(setRecords)
      .catch(() => setError(`Unable to load ${config.title.toLowerCase()}.`));
  }, [config]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  async function handleDelete(record) {
    setError("");

    try {
      await config.delete(record.id);
      loadRecords();
    } catch (requestError) {
      setError(requestError.response?.data?.error || `Unable to delete ${config.singular.toLowerCase()}.`);
    }
  }

  return (
    <>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        action={
          <Button component={RouterLink} to={config.newPath} variant="contained" startIcon={<AddIcon />}>
            New {config.singular.toLowerCase()}
          </Button>
        }
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <TableContainer component={Paper} sx={{ border: "1px solid", borderColor: "divider", maxWidth: 900 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>Name</TableCell>
              <TableCell align="right" sx={headerCellSx}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell>
                  <Typography fontWeight={700}>{record.name}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={`Delete ${config.singular.toLowerCase()}`}>
                    <IconButton color="error" onClick={() => handleDelete(record)}>
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

export default LookupIndex;
