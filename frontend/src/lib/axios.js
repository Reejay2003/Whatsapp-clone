import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5002/api";
  }
  // In production, use environment variable or fall back to relative URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  return backendUrl ? `${backendUrl}/api` : "/api";
};

export const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials:true
})

