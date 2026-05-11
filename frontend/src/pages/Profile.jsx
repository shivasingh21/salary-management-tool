import EditIcon from "@mui/icons-material/Edit";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/auth.js";
import PageHeader from "../components/common/PageHeader.jsx";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "" });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProfile()
      .then((user) => {
        setProfile(user);
        setForm({ first_name: user.first_name || "", last_name: user.last_name || "" });
      })
      .catch(() => setError("Unable to load profile."));
  }, []);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const updated = await updateProfile(form);
      setProfile(updated);
      setEditing(false);
    } catch {
      setError("Unable to update profile name.");
    }
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  return (
    <>
      <PageHeader title="Profile" subtitle="Review your HR account details." />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={3} alignItems="center">
          <Box sx={{ position: "relative" }}>
            <Avatar sx={{ width: 96, height: 96, bgcolor: "secondary.main", fontSize: 36 }}>
              {profile?.first_name?.[0] || "H"}
            </Avatar>
            <IconButton
              size="small"
              onClick={() => setEditing(true)}
              sx={{
                bgcolor: "common.white",
                color: "#101083ff",
                position: "absolute",
                right: -4,
                bottom: 4,
                "&:hover": { bgcolor: "rgba(16, 16, 131, 0.08)" }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>

          <Grid container spacing={2} sx={{ maxWidth: 760 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                InputProps={{ readOnly: !editing }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                InputProps={{ readOnly: !editing }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" value={profile?.email || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Role" value={profile?.role || ""} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Display name" value={fullName} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="User ID" value={profile?.id || ""} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>

          {editing ? (
            <Stack direction="row" spacing={1.5}>
              <Button onClick={() => {
                setEditing(false);
                setForm({ first_name: profile?.first_name || "", last_name: profile?.last_name || "" });
              }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">Save Name</Button>
            </Stack>
          ) : null}
        </Stack>
      </Paper>
    </>
  );
}

export default Profile;
