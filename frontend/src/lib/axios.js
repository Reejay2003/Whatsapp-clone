import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5002/api";
  }
  // In production, use VITE_BACKEND_URL environment variable if set, otherwise
  // fall back to relative URL "/api" which relies on Vercel rewrites in
  // vercel.json to proxy to the backend server
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  return backendUrl ? `${backendUrl}/api` : "/api";
};

export const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true
})

