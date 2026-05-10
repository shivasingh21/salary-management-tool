import apiClient from "./client.js";

export async function listEmployees(params = {}) {
  const response = await apiClient.get("/employees", { params });
  return response.data;
}

export async function getEmployee(id) {
  const response = await apiClient.get(`/employees/${id}`);
  return response.data;
}

export async function createEmployee(payload) {
  const response = await apiClient.post("/employees", { employee: payload });
  return response.data;
}

export async function updateEmployee(id, payload) {
  const response = await apiClient.patch(`/employees/${id}`, { employee: payload });
  return response.data;
}

export async function deleteEmployee(id) {
  await apiClient.delete(`/employees/${id}`);
}
