import apiClient from "./client.js";

async function getInsight(path) {
  const response = await apiClient.get(`/insights/${path}`);
  return response.data.data;
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
