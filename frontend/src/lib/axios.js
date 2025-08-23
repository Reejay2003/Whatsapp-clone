import axios from "axios";

const getBaseURL = () => {
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5002/api";
  }
  return import.meta.env.VITE_API_URL || "/api";
};

export const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true
});