import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { getCountrySalaryStats, getJobTitleSalaryStats } from "../../api/insights.js";
import { listCountries } from "../../api/lookups.js";
import ChartCard from "./ChartCard.jsx";
import InsightBarChart from "./InsightBarChart.jsx";
import JobTitleSalaryAnalytics from "./JobTitleSalaryAnalytics.jsx";
import SalaryStatsTable from "./SalaryStatsTable.jsx";

function toChartRows(rows, nameKey) {
  return rows.map((row) => ({
    ...row,
    [nameKey]: row[nameKey],
    avg_salary: Number(row.avg_salary || 0),
    employee_count: Number(row.employee_count || 0)
  }));
}

function SalaryAnalyticsSection({ formatCurrency, formatCompactCurrency }) {
  const [countries, setCountries] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [countryStats, setCountryStats] = useState([]);
  const [jobTitleStats, setJobTitleStats] = useState([]);
  const [countryLoading, setCountryLoading] = useState(true);
  const [jobTitleLoading, setJobTitleLoading] = useState(false);
  const [countryError, setCountryError] = useState("");
  const [jobTitleError, setJobTitleError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([getCountrySalaryStats(), listCountries()])
      .then(([stats, countryOptions]) => {
        if (!active) {
          return;
        }

        setCountryStats(stats);
        setCountries(countryOptions);
        setSelectedCountryId((currentId) => currentId || countryOptions[0]?.id || "");
        setCountryError("");
      })
      .catch(() => {
        if (active) {
          setCountryError("Unable to load country salary analytics.");
        }
      })
      .finally(() => {
        if (active) {
          setCountryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCountryId) {
      setJobTitleStats([]);
      return;
    }

    let active = true;

    setJobTitleLoading(true);
    getJobTitleSalaryStats(selectedCountryId)
      .then((stats) => {
        if (active) {
          setJobTitleStats(stats);
          setJobTitleError("");
        }
      })
      .catch(() => {
        if (active) {
          setJobTitleError("Unable to load job title salary analytics for the selected country.");
        }
      })
      .finally(() => {
        if (active) {
          setJobTitleLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedCountryId]);

  const countryChartRows = useMemo(() => toChartRows(countryStats, "country"), [countryStats]);
  const selectedCountry = countries.find((country) => String(country.id) === String(selectedCountryId));

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5">Salary analytics</Typography>
        <Typography color="text.secondary">
          Compare salary ranges by country and drill into job title patterns within a country.
        </Typography>
      </Box>

      {countryError ? <Alert severity="error">{countryError}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <ChartCard title="Average salary by country" subtitle="Min, max, average, and active employee counts">
            {countryLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <CircularProgress />
              </Stack>
            ) : (
              <InsightBarChart
                data={countryChartRows}
                xKey="country"
                yKey="avg_salary"
                barColor="#2563eb"
                valueFormatter={formatCompactCurrency}
              />
            )}
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          {countryLoading ? (
            <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", minHeight: 280 }}>
              <CircularProgress />
            </Box>
          ) : (
            <SalaryStatsTable
              rows={countryStats}
              nameKey="country"
              nameLabel="Country"
              formatCurrency={formatCurrency}
            />
          )}
        </Grid>
      </Grid>

      <JobTitleSalaryAnalytics
        countries={countries}
        selectedCountry={selectedCountry}
        selectedCountryId={selectedCountryId}
        onCountryChange={setSelectedCountryId}
        rows={jobTitleStats}
        loading={jobTitleLoading}
        error={jobTitleError}
        formatCurrency={formatCurrency}
        formatCompactCurrency={formatCompactCurrency}
      />
    </Stack>
  );
}

export default SalaryAnalyticsSection;
