import apiClient from "./client.js";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export async function signIn({ email, password }) {
  const response = await apiClient.post("/auth/sign_in", { email, password });
  const token = response.data.token || response.headers.authorization?.replace("Bearer ", "");

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

  return response.data.user;
}

export async function signOut() {
  try {
    await apiClient.delete("/auth/sign_out");
  } finally {
    clearSession();
  }
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(window.localStorage.getItem(TOKEN_KEY));
}

export function currentUser() {
  const user = window.localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}
