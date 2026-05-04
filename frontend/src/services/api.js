import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const SERVER_URL = (import.meta.env.VITE_SERVER_URL || API_URL.replace(/\/api\/?$/i, "")).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((req) => {
  const authUser = JSON.parse(localStorage.getItem("authUser"));

  if (authUser?.token) {
    req.headers.Authorization = `Bearer ${authUser.token}`;
  }

  return req;
});

export { SERVER_URL };
export default api;
