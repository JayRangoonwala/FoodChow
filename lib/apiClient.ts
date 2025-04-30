// lib/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://www.foodchow.com/api/",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
