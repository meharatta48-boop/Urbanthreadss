import axios from "axios";

const API_URL = "https://urbanthreadss.onrender.com/api";
const SERVER_URL = "https://urbanthreadss.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  timeout: 55000, // 55s — Render.com free tier needs up to 50s cold start
});

api.interceptors.request.use((req) => {
  try {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (authUser?.token) {
      req.headers.Authorization = `Bearer ${authUser.token}`;
    }
  } catch { /* ignore parse errors */ }
  return req;
});

// Global response error interceptor
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // 1. Handle Timeout
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      console.warn("[API] Request timed out — server may be waking up on Render.com");
    }

    // 2. Handle Unauthorized / Token Invalid
    if (error.response?.status === 401) {
      console.error("[API] Unauthorized - Token invalid or expired");
      localStorage.removeItem("authUser");
      localStorage.removeItem("authUsersList");
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);

export { SERVER_URL };
export default api;
