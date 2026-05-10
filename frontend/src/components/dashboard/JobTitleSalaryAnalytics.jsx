import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import ChartCard from "./ChartCard.jsx";
import InsightHorizontalBarChart from "./InsightHorizontalBarChart.jsx";
import InsightMetricCard from "./InsightMetricCard.jsx";
import SalaryStatsTable from "./SalaryStatsTable.jsx";

function calculateKpis(rows) {
  const totalEmployees = rows.reduce((sum, row) => sum + Number(row.employee_count || 0), 0);
  const totalPayroll = rows.reduce(
    (sum, row) => sum + Number(row.avg_salary || 0) * Number(row.employee_count || 0),
    0
  );
  const salaryRows = rows.filter((row) => Number(row.employee_count || 0) > 0);

  return {
    totalEmployees,
    averageSalary: totalEmployees > 0 ? totalPayroll / totalEmployees : 0,
    highestSalary: salaryRows.length > 0 ? Math.max(...salaryRows.map((row) => Number(row.max_salary || 0))) : 0,
    lowestSalary: salaryRows.length > 0 ? Math.min(...salaryRows.map((row) => Number(row.min_salary || 0))) : 0
  };
}

function TopPayingJobTitles({ rows, formatCurrency }) {
  const topRows = [...rows]
    .sort((first, second) => Number(second.avg_salary || 0) - Number(first.avg_salary || 0))
    .slice(0, 5);

  return (
    <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="h6">Top paying job titles</Typography>
          <Typography variant="body2" color="text.secondary">
            Ranked by average salary
          </Typography>
        </Box>
        <Divider />
        {topRows.length > 0 ? (
          topRows.map((row, index) => (
            <Stack key={row.job_title} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    alignItems: "center",
                    bgcolor: "rgba(37, 99, 235, 0.1)",
                    borderRadius: 1.5,
                    color: "primary.main",
                    display: "flex",
                    flex: "0 0 auto",
                    fontSize: 13,
                    fontWeight: 700,
                    height: 28,
                    justifyContent: "center",
                    width: 28
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>{row.job_title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Number(row.employee_count || 0).toLocaleString()} employees
                  </Typography>
                </Box>
              </Stack>
              <Typography fontWeight={700} sx={{ whiteSpace: "nowrap" }}>
                {formatCurrency(row.avg_salary)}
              </Typography>
            </Stack>
          ))
        ) : (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No job title salary stats available.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

function JobTitleSalaryAnalytics({
  countries,
  selectedCountry,
  selectedCountryId,
  onCountryChange,
  rows,
  loading,
  error,
  formatCurrency,
  formatCompactCurrency
}) {
  const kpis = useMemo(() => calculateKpis(rows), [rows]);
  const chartRows = useMemo(
    () => [...rows]
      .sort((first, second) => Number(second.avg_salary || 0) - Number(first.avg_salary || 0))
      .map((row) => ({ ...row, avg_salary: Number(row.avg_salary || 0) })),
    [rows]
  );
  const chartHeight = chartRows.length <= 1 ? 220 : Math.min(350, Math.max(300, chartRows.length * 44));

  const metrics = [
    {
      label: "Total employees",
      value: kpis.totalEmployees.toLocaleString(),
      icon: <GroupsIcon fontSize="small" />,
      accentColor: "primary.main"
    },
    {
      label: "Average salary",
      value: formatCurrency(kpis.averageSalary),
      icon: <AccountBalanceWalletIcon fontSize="small" />,
      accentColor: "secondary.main"
    },
    {
      label: "Highest salary",
      value: formatCurrency(kpis.highestSalary),
      icon: <TrendingUpIcon fontSize="small" />,
      accentColor: "#15803d"
    },
    {
      label: "Lowest salary",
      value: formatCurrency(kpis.lowestSalary),
      icon: <TrendingDownIcon fontSize="small" />,
      accentColor: "#b45309"
    }
  ];

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h5">Salary by Job Title within Country</Typography>
            <Typography color="text.secondary">
              {selectedCountry ? `Focused salary spread for ${selectedCountry.name}` : "Select a country to review salary spread by role"}
            </Typography>
          </Box>
          <TextField
            select
            size="small"
            label="Country"
            value={selectedCountryId}
            onChange={(event) => onCountryChange(event.target.value)}
            disabled={countries.length === 0}
            sx={{ minWidth: { xs: "100%", md: 260 } }}
          >
            {countries.map((country) => (
              <MenuItem key={country.id} value={country.id}>
                {country.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={1.5}>
        {metrics.map((metric) => (
          <Grid key={metric.label} item xs={12} sm={6} lg={3}>
            <InsightMetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} lg={8}>
          <ChartCard
            title="Average salary by job title"
            subtitle="Horizontal view keeps long role names readable"
            contentSx={{ minHeight: chartHeight, height: chartHeight }}
          >
            {loading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <CircularProgress />
              </Stack>
            ) : (
              <InsightHorizontalBarChart
                data={chartRows}
                xKey="avg_salary"
                yKey="job_title"
                barColor="#0f766e"
                valueFormatter={formatCompactCurrency}
              />
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          {loading ? (
            <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
              <Stack alignItems="center" justifyContent="center" sx={{ minHeight: chartHeight }}>
                <CircularProgress />
              </Stack>
            </Paper>
          ) : (
            <TopPayingJobTitles rows={rows} formatCurrency={formatCurrency} />
          )}
        </Grid>
      </Grid>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Detailed analytics
        </Typography>
        {loading ? (
          <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress size={28} />
              <Typography color="text.secondary">Loading job title details...</Typography>
            </Stack>
          </Paper>
        ) : (
          <SalaryStatsTable
            rows={rows}
            nameKey="job_title"
            nameLabel="Job title"
            formatCurrency={formatCurrency}
          />
        )}
      </Box>
    </Stack>
  );
}

export default JobTitleSalaryAnalytics;
