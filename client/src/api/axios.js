import axios from "axios";

function normalizeApiBase(raw) {
  const trimmed = String(raw || "").trim().replace(/\/$/, "");
  if (!trimmed) return import.meta.env.PROD ? "/api" : "http://localhost:5000/api";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const baseURL = normalizeApiBase(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default api;
