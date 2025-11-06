// Components/BaseComponent/axiosInstance.js
import axios from "axios";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
  // baseURL: "http://localhost:8080",
  baseURL: "http://91.203.133.210:9091",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add role validation for sensitive endpoints
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const url = config.url.toLowerCase();

        // Prevent employee from accessing admin endpoints
        if (user.role === "ROLE_EMPLOYEE" && url.includes("admin/")) {
          throw new Error("Access denied: Insufficient permissions");
        }

        // Auto-prefix based on role for non-prefixed endpoints
        if (
          !url.startsWith("/") &&
          !url.includes("admin/") &&
          !url.includes("employee/")
        ) {
          if (user.role === "ROLE_ADMIN") {
            config.url = `admin/${config.url}`;
          } else if (user.role === "ROLE_EMPLOYEE") {
            config.url = `employee/${config.url}`;
          }
        }
      } catch (error) {
        console.error("Role validation error:", error);
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Skip session expiration handling for login endpoint
    if (error.config?.url?.includes("/signin")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      await Swal.fire({
        title: "Session Expired",
        text: "Please log in again to continue.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#386bc0",
      });

      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
