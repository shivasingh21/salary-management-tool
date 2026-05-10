import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function InsightMetricCard({ label, value, icon, accentColor = "primary.main" }) {
  return (
    <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack spacing={0.75}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </Stack>
        <Box
          sx={{
            alignItems: "center",
            bgcolor: accentColor,
            borderRadius: 2,
            color: "common.white",
            display: "flex",
            height: 44,
            justifyContent: "center",
            width: 44
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

export default InsightMetricCard;
