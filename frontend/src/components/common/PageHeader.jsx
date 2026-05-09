import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function PageHeader({ title, subtitle, action }) {
  return (
    <Box sx={{ display: "flex", alignItems: { sm: "center" }, justifyContent: "space-between", gap: 2, mb: 3, flexDirection: { xs: "column", sm: "row" } }}>
      <Box>
        <Typography variant="h4">{title}</Typography>
        <Typography color="text.secondary">{subtitle}</Typography>
      </Box>
      {action}
    </Box>
  );
}

export default PageHeader;
