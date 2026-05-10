import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signIn } from "../api/auth.js";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "hr1@example.com", password: "Password@123" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn(form);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 2 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 420, p: 4, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2.5} alignItems="stretch">
          <Stack spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5">Log In</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Use an HR account to access salary management.
            </Typography>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField required fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          <TextField required fullWidth label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? "Logging in..." : "Log In"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Login;
