import axios from "axios";
import { getToken, clearAuth } from "../utils/auth";
import toast from "react-hot-toast";

console.log("API BASE URL =", import.meta.env.VITE_API_GATEWAY_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL,
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || "";
    const isAuthLoginRequest = url.includes("/auth/login");

    if (status === 401 && !isAuthLoginRequest) {
      clearAuth();
      toast.error("Session expired. Please login again.");
      window.location.href = "/login";
    }
    if (status === 503) {
      const msg =
        err.response?.data?.message ||
        "Service temporarily unavailable. Please try again later.";
      toast.error(msg);
    }
    return Promise.reject(err);
  }
);

export default api;
