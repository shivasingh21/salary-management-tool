import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import WorkIcon from "@mui/icons-material/Work";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import PageHeader from "../components/common/PageHeader.jsx";

const metrics = [
  { label: "Employees", value: "10,000", icon: <GroupsIcon color="primary" /> },
  { label: "Departments", value: "30", icon: <WorkIcon color="secondary" /> },
  { label: "Countries", value: "30", icon: <PublicIcon color="primary" /> },
  { label: "Salary Range", value: "$45k-$200k", icon: <AttachMoneyIcon color="secondary" /> }
];

function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick view of workforce and salary data." />
      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} item xs={12} sm={6} lg={3}>
            <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Typography color="text.secondary">{metric.label}</Typography>
                  <Typography variant="h5">{metric.value}</Typography>
                </Stack>
                {metric.icon}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default Dashboard;
