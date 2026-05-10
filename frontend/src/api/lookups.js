import apiClient from "./client.js";

export async function listDepartments() {
  const response = await apiClient.get("/departments");
  return response.data;
}

export async function createDepartment(payload) {
  const response = await apiClient.post("/departments", { department: payload });
  return response.data;
}

export async function updateDepartment(id, payload) {
  const response = await apiClient.patch(`/departments/${id}`, { department: payload });
  return response.data;
}

export async function deleteDepartment(id) {
  await apiClient.delete(`/departments/${id}`);
}

export async function listJobTitles() {
  const response = await apiClient.get("/job_titles");
  return response.data;
}

export async function createJobTitle(payload) {
  const response = await apiClient.post("/job_titles", { job_title: payload });
  return response.data;
}

export async function updateJobTitle(id, payload) {
  const response = await apiClient.patch(`/job_titles/${id}`, { job_title: payload });
  return response.data;
}

export async function deleteJobTitle(id) {
  await apiClient.delete(`/job_titles/${id}`);
}

export async function listCountries() {
  const response = await apiClient.get("/countries");
  return response.data;
}

export async function createCountry(payload) {
  const response = await apiClient.post("/countries", { country: payload });
  return response.data;
}

export async function updateCountry(id, payload) {
  const response = await apiClient.patch(`/countries/${id}`, { country: payload });
  return response.data;
}

export async function deleteCountry(id) {
  await apiClient.delete(`/countries/${id}`);
}
