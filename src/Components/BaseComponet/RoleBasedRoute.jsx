// Components/BaseComponent/RoleBasedRoute.jsx
import { Navigate } from "react-router-dom";

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userData);
    const userRole = user.role;

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on actual role
      if (userRole === "ROLE_ADMIN") {
        return <Navigate to="/Admin/LeadList" replace />;
      } else if (userRole === "ROLE_EMPLOYEE") {
        return <Navigate to="/Employee/LeadList" replace />;
      }
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRoute;
