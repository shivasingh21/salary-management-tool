import apiClient from "./client.js";

export async function listDepartments() {
  const response = await apiClient.get("/departments");
  return response.data;
}

export async function listJobTitles() {
  const response = await apiClient.get("/job_titles");
  return response.data;
}

export async function listCountries() {
  const response = await apiClient.get("/countries");
  return response.data;
}
