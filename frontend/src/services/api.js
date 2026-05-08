import axios from "axios";

const API_URL = "https://urbanthreadss.onrender.com/api";
const SERVER_URL = "https://urbanthreadss.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
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
