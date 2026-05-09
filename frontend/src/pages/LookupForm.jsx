import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader.jsx";
import lookupConfig from "./lookupConfig.js";

function formatErrors(error) {
  const errors = error.response?.data?.errors;

  if (!errors) return error.response?.data?.error || "Unable to save record.";

  return Object.entries(errors)
    .map(([field, messages]) => `${field} ${messages.join(", ")}`)
    .join(". ");
}

function LookupForm({ resource }) {
  const config = lookupConfig[resource];
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await config.create({ name });
      navigate(config.indexPath);
    } catch (requestError) {
      setError(formatErrors(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title={`New ${config.singular}`} subtitle={config.subtitle} />

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 560, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            required
            fullWidth
            autoFocus
            label={`${config.singular} name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            <Button onClick={() => navigate(config.indexPath)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Saving..." : `Create ${config.singular.toLowerCase()}`}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
}

export default LookupForm;
