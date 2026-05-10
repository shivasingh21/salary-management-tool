import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import ChartCard from "./ChartCard.jsx";
import { chartHeightForRows, topChartRows } from "./chartHelpers.js";
import InsightHorizontalBarChart from "./InsightHorizontalBarChart.jsx";
import InsightMetricCard from "./InsightMetricCard.jsx";
import SalaryStatsTable from "./SalaryStatsTable.jsx";

function calculateCountryKpis(rows) {
  const totalEmployees = rows.reduce((sum, row) => sum + Number(row.employee_count || 0), 0);
  const weightedPayroll = rows.reduce(
    (sum, row) => sum + Number(row.avg_salary || 0) * Number(row.employee_count || 0),
    0
  );
  const highestSalary = rows.length > 0 ? Math.max(...rows.map((row) => Number(row.max_salary || 0))) : 0;

  return {
    countryCount: rows.length,
    totalEmployees,
    averageSalary: totalEmployees > 0 ? weightedPayroll / totalEmployees : 0,
    highestSalary
  };
}

function CountryInsightsPanel({ rows, formatCurrency }) {
  const topRows = topChartRows(rows, "avg_salary", 5);

  return (
    <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", height: "100%" }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="h6">Country insights</Typography>
          <Typography variant="body2" color="text.secondary">
            Highest average salary markets
          </Typography>
        </Box>
        <Divider />
        {topRows.map((row, index) => (
          <Stack key={row.country} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
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
                <Typography fontWeight={700} noWrap>{row.country}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Number(row.employee_count || 0).toLocaleString()} employees
                </Typography>
              </Box>
            </Stack>
            <Typography fontWeight={700} sx={{ whiteSpace: "nowrap" }}>
              {formatCurrency(row.avg_salary)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

function CountrySalaryAnalytics({ rows, loading, formatCurrency, formatCompactCurrency }) {
  const chartRows = useMemo(
    () => topChartRows(rows, "avg_salary").map((row) => ({
      ...row,
      avg_salary: Number(row.avg_salary || 0),
      employee_count: Number(row.employee_count || 0)
    })),
    [rows]
  );
  const kpis = useMemo(() => calculateCountryKpis(rows), [rows]);
  const chartHeight = chartHeightForRows(chartRows, { min: 300, max: 340, rowHeight: 40 });
  const metrics = [
    {
      label: "Countries",
      value: kpis.countryCount.toLocaleString(),
      icon: <PublicIcon fontSize="small" />,
      accentColor: "primary.main"
    },
    {
      label: "Employees",
      value: kpis.totalEmployees.toLocaleString(),
      icon: <GroupsIcon fontSize="small" />,
      accentColor: "secondary.main"
    },
    {
      label: "Weighted avg salary",
      value: formatCurrency(kpis.averageSalary),
      icon: <AccountBalanceWalletIcon fontSize="small" />,
      accentColor: "#475467"
    },
    {
      label: "Highest salary",
      value: formatCurrency(kpis.highestSalary),
      icon: <TrendingUpIcon fontSize="small" />,
      accentColor: "#15803d"
    }
  ];

  return (
    <Stack spacing={1.75}>
      <Box>
        <Typography variant="h5">Salary analytics</Typography>
        <Typography color="text.secondary">
          Summary-focused country salary trends with detailed data kept in the table.
        </Typography>
      </Box>

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
            title="Average salary by country"
            subtitle="Top 8 countries by average salary"
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
                yKey="country"
                barColor="#2563eb"
                valueFormatter={formatCompactCurrency}
                yAxisWidth={132}
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
            <CountryInsightsPanel rows={rows} formatCurrency={formatCurrency} />
          )}
        </Grid>
      </Grid>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Country salary details
        </Typography>
        {loading ? (
          <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress size={28} />
              <Typography color="text.secondary">Loading country details...</Typography>
            </Stack>
          </Paper>
        ) : (
          <SalaryStatsTable
            rows={rows}
            nameKey="country"
            nameLabel="Country"
            formatCurrency={formatCurrency}
          />
        )}
      </Box>
    </Stack>
  );
}

export default CountrySalaryAnalytics;
