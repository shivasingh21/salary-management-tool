import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GroupsIcon from "@mui/icons-material/Groups";
import PaidIcon from "@mui/icons-material/Paid";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { getDashboardInsights } from "../api/insights.js";
import ChartCard from "../components/dashboard/ChartCard.jsx";
import { chartHeightForRows, topChartRows } from "../components/dashboard/chartHelpers.js";
import InsightHorizontalBarChart from "../components/dashboard/InsightHorizontalBarChart.jsx";
import InsightMetricCard from "../components/dashboard/InsightMetricCard.jsx";
import InsightPieChart from "../components/dashboard/InsightPieChart.jsx";
import SalaryAnalyticsSection from "../components/dashboard/SalaryAnalyticsSection.jsx";
import PageHeader from "../components/common/PageHeader.jsx";

const compactCurrency = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 1,
  notation: "compact",
  style: "currency"
});

const fullCurrency = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency"
});

function formatCurrency(value) {
  return fullCurrency.format(Number(value || 0));
}

function formatCompactCurrency(value) {
  return compactCurrency.format(Number(value || 0));
}

function topRows(rows, valueKey, limit = 8) {
  return topChartRows(rows, valueKey, limit);
}

function aggregateJobTitles(rows) {
  const grouped = rows.reduce((result, row) => {
    const current = result[row.job_title] || { job_title: row.job_title, payroll: 0, employee_count: 0 };
    const employeeCount = Number(row.employee_count || 0);

    current.payroll += Number(row.avg_salary || 0) * employeeCount;
    current.employee_count += employeeCount;
    result[row.job_title] = current;

    return result;
  }, {});

  return Object.values(grouped).map((row) => ({
    job_title: row.job_title,
    avg_salary: row.employee_count > 0 ? row.payroll / row.employee_count : 0,
    employee_count: row.employee_count
  }));
}

function Dashboard() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getDashboardInsights()
      .then((data) => {
        if (active) {
          setInsights(data);
          setError("");
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load dashboard insights. Check your API token and Rails API server.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!insights) {
      return {
        countries: [],
        departments: [],
        jobTitles: [],
        salaryDistribution: []
      };
    }

    return {
      countries: topRows(insights.countrySalaries, "employee_count").map((row) => ({
        ...row,
        employee_count: Number(row.employee_count)
      })),
      departments: topRows(insights.departmentAverage, "avg_salary").map((row) => ({
        ...row,
        avg_salary: Number(row.avg_salary)
      })),
      jobTitles: topRows(aggregateJobTitles(insights.jobTitleAverage), "avg_salary").map((row) => ({
        ...row,
        avg_salary: Number(row.avg_salary)
      })),
      salaryDistribution: insights.salaryDistribution.map((row) => ({
        ...row,
        employee_count: Number(row.employee_count)
      }))
    };
  }, [insights]);
  const countryChartHeight = chartHeightForRows(chartData.countries);
  const departmentChartHeight = chartHeightForRows(chartData.departments);
  const jobTitleChartHeight = chartHeightForRows(chartData.jobTitles);

  const summary = insights?.payrollSummary || {};
  const metrics = [
    {
      label: "Total employees",
      value: Number(summary.total_employees || 0).toLocaleString(),
      icon: <GroupsIcon />,
      accentColor: "primary.main"
    },
    {
      label: "Total payroll",
      value: formatCurrency(summary.total_payroll),
      icon: <AccountBalanceWalletIcon />,
      accentColor: "secondary.main"
    },
    {
      label: "Average salary",
      value: formatCurrency(summary.average_salary),
      icon: <PaidIcon />,
      accentColor: "#475467"
    },
    {
      label: "Highest salary",
      value: formatCurrency(summary.highest_salary),
      icon: <TrendingUpIcon />,
      accentColor: "#15803d"
    },
    {
      label: "Lowest salary",
      value: formatCurrency(summary.lowest_salary),
      icon: <TrendingDownIcon />,
      accentColor: "#b45309"
    }
  ];

  return (
    <>
      <PageHeader title="Insights Dashboard" subtitle="Track payroll health and salary patterns across the workforce." />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", minHeight: 360 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">Loading salary insights...</Typography>
          </Stack>
        </Box>
      ) : null}

      {!loading && insights ? (
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            {metrics.map((metric) => (
              <Grid key={metric.label} item xs={12} sm={6} lg={metric.label === "Lowest salary" ? 4 : 2}>
                <InsightMetricCard {...metric} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={5}>
              <ChartCard title="Salary distribution" subtitle="Employees grouped by salary range">
                <InsightPieChart data={chartData.salaryDistribution} />
              </ChartCard>
            </Grid>
            <Grid item xs={12} lg={7}>
              <ChartCard
                title="Employees by country"
                subtitle="Top 8 countries by active employee count"
                contentSx={{ minHeight: countryChartHeight, height: countryChartHeight }}
              >
                <InsightHorizontalBarChart
                  data={chartData.countries}
                  xKey="employee_count"
                  yKey="country"
                  barColor="#0f766e"
                  yAxisWidth={132}
                />
              </ChartCard>
            </Grid>
            <Grid item xs={12} lg={6}>
              <ChartCard
                title="Average salary by department"
                subtitle="Top 8 department averages"
                contentSx={{ minHeight: departmentChartHeight, height: departmentChartHeight }}
              >
                <InsightHorizontalBarChart
                  data={chartData.departments}
                  xKey="avg_salary"
                  yKey="department"
                  barColor="#2563eb"
                  valueFormatter={formatCompactCurrency}
                />
              </ChartCard>
            </Grid>
            <Grid item xs={12} lg={6}>
              <ChartCard
                title="Average salary by job title"
                subtitle="Top 8 weighted averages across countries"
                contentSx={{ minHeight: jobTitleChartHeight, height: jobTitleChartHeight }}
              >
                <InsightHorizontalBarChart
                  data={chartData.jobTitles}
                  xKey="avg_salary"
                  yKey="job_title"
                  barColor="#f59e0b"
                  valueFormatter={formatCompactCurrency}
                />
              </ChartCard>
            </Grid>
          </Grid>

          <SalaryAnalyticsSection
            formatCurrency={formatCurrency}
            formatCompactCurrency={formatCompactCurrency}
          />
        </Stack>
      ) : null}
    </>
  );
}

export default Dashboard;
