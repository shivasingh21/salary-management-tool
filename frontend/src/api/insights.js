import apiClient from "./client.js";

async function getInsight(path, params = {}) {
  const response = await apiClient.get(`/insights/${path}`, { params });
  return response.data.data;
}

export function getCountrySalaryStats() {
  return getInsight("country_salary_stats");
}

export function getJobTitleSalaryStats(countryId) {
  return getInsight("job_title_salary_stats", { country_id: countryId });
}

export async function getDashboardInsights() {
  const [
    payrollSummary,
    countrySalaries,
    departmentAverage,
    jobTitleAverage,
    salaryDistribution
  ] = await Promise.all([
    getInsight("payroll_summary"),
    getInsight("country_salaries"),
    getInsight("department_average"),
    getInsight("job_title_average"),
    getInsight("salary_distribution")
  ]);

  return {
    payrollSummary,
    countrySalaries,
    departmentAverage,
    jobTitleAverage,
    salaryDistribution
  };
}
