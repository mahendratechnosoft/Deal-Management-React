import axios from "axios";
import Swal from "sweetalert2";
// Create an instance of Axios   baseURL: "http://147.93.19.18:9090",
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080", // Replace with your API base URL
});

// Add a request interceptor to attach the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get the token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚀 Response Interceptor → handle expired/invalid tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const result = await Swal.fire({
        title: "Your session has expired or is invalid.",
        text: "Please log in again to continue.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#386bc0",
      });

      if (result.isConfirmed) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;