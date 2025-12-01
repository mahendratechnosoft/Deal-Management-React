// Components/BaseComponent/axiosInstance.js
import axios from "axios";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
   baseURL: "http://localhost:8080",
  //baseURL: "https://api.mtechnosoft.xpertbizsolutions.com",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    const superAdminData = localStorage.getItem("superAdminData");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add role validation for sensitive endpoints
    if (userData || superAdminData) {
      try {
        let user = null;
        let role = "";

        // Check for superadmin first
        if (superAdminData) {
          user = JSON.parse(superAdminData);
          role = "ROLE_SUPERADMIN";
        } else if (userData) {
          user = JSON.parse(userData);
          role = user.role;
        }

        const url = config.url.toLowerCase();

        // Prevent employee from accessing admin endpoints
        if (role === "ROLE_EMPLOYEE" && url.includes("admin/")) {
          throw new Error("Access denied: Insufficient permissions");
        }

        // Prevent regular admin from accessing superadmin endpoints
        if (role === "ROLE_ADMIN" && url.includes("super/")) {
          throw new Error("Access denied: Super Admin privileges required");
        }

        // Auto-prefix based on role for non-prefixed endpoints
        // Updated axios interceptor logic
        if (
          !url.startsWith("/") &&
          !url.startsWith("admin/") &&
          !url.startsWith("employee/") &&
          !url.startsWith("super/")
        ) {
          if (role === "ROLE_SUPERADMIN") {
            config.url = `super/${config.url}`;
          } else if (role === "ROLE_ADMIN") {
            config.url = `admin/${config.url}`;
          } else if (role === "ROLE_EMPLOYEE") {
            config.url = `employee/${config.url}`;
          }
        }

        // Add role header for backend validation
        if (role) {
          config.headers["X-User-Role"] = role;
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

      // Clear all authentication data
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("superAdminData");
      localStorage.removeItem("role");

      // Redirect to appropriate login page
      const superAdminData = localStorage.getItem("superAdminData");
      if (superAdminData) {
        window.location.href = "/login";
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;