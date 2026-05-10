import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import { getCountrySalaryStats, getJobTitleSalaryStats } from "../../api/insights.js";
import { listCountries } from "../../api/lookups.js";
import CountrySalaryAnalytics from "./CountrySalaryAnalytics.jsx";
import JobTitleSalaryAnalytics from "./JobTitleSalaryAnalytics.jsx";

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

  const selectedCountry = countries.find((country) => String(country.id) === String(selectedCountryId));

  return (
    <Stack spacing={2.5}>
      {countryError ? <Alert severity="error">{countryError}</Alert> : null}

      <CountrySalaryAnalytics
        rows={countryStats}
        loading={countryLoading}
        formatCurrency={formatCurrency}
        formatCompactCurrency={formatCompactCurrency}
      />

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
