import axios from "axios";

// Axios instance with proper baseURL
export const axiosInstance = axios.create({
  baseURL: 
    import.meta.env.MODE === "development" 
      ? "http://localhost:5001/api" 
      : "/api",
  withCredentials: true, // Ensures cookies are sent with requests if needed
  headers: {
    "Content-Type": "application/json", // Ensures backend processes JSON
    Accept: "application/json", // Accepts JSON responses
  },
});