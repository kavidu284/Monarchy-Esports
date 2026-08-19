import axios from "axios";
import { getValidAdminToken } from "../utils/auth";

const api = axios.create({
    baseURL: "https://esports-org.onrender.com",
 // baseURL: "http://localhost:8000",
});

api.interceptors.request.use(
  (config) => {
    const token = getValidAdminToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;