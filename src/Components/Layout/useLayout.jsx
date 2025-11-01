// Components/Layout/useLayout.jsx
import { useMemo } from "react";
import AdminLayout from "./AdminLayout";
import EmployeeLayout from "./EmployeeLayout";

export const useLayout = () => {
  const getRole = () => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        return userData.role;
      } catch (error) {
        console.error("Error parsing userData:", error);
      }
    }
    return "";
  };

  const role = getRole();

  const LayoutComponent = useMemo(() => {
    if (role === "ROLE_ADMIN") {
      return ({ children }) => <AdminLayout>{children}</AdminLayout>;
    } else if (role === "ROLE_EMPLOYEE") {
      return ({ children }) => <EmployeeLayout>{children}</EmployeeLayout>;
    }
    return ({ children }) => <>{children}</>;
  }, [role]);

  return { LayoutComponent, role };
};
