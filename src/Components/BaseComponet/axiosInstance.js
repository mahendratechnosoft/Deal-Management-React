import axios from "axios";
import Swal from "sweetalert2";

// Base configuration
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

// Add a request interceptor to attach the token and handle role-based endpoints
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // FIXED: changed from "token" to "authToken"
    const role = localStorage.getItem("role");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Automatically prepend role-based prefix to URLs that don't start with /
    if (role && config.url && !config.url.startsWith("/")) {
      if (role === "ROLE_ADMIN") {
        config.url = `admin/${config.url}`;
      } else if (role === "ROLE_EMPLOYEE") {
        config.url = `employee/${config.url}`;
      }
    }

    console.log("Axios Interceptor - Final URL:", config.url); // Debug log
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor → handle expired/invalid tokens
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
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
