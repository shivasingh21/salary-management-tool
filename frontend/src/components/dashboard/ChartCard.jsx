import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function ChartCard({ title, subtitle, children, contentSx }) {
  return (
    <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
      <Stack spacing={2} sx={{ height: "100%" }}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ flex: 1, minHeight: 280, ...contentSx }}>{children}</Box>
      </Stack>
    </Paper>
  );
}

export default ChartCard;
