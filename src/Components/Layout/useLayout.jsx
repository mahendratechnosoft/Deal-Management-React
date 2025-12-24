// Components/Layout/useLayout.jsx
import { useMemo } from "react";
import AdminLayout from "./AdminLayout";
import EmployeeLayout from "./EmployeeLayout";
import SuperAdminLayout from "./SuperAdminLayout";
import CustomerLayout from "./CustomerLayout";
import ContactLayout from "./ContactLayout";

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
    } else if (role === "ROLE_SUPERADMIN") {
      return ({ children }) => <SuperAdminLayout>{children}</SuperAdminLayout>;
    } else if (role === "ROLE_CUSTOMER") {
      return ({ children }) => <CustomerLayout>{children}</CustomerLayout>;
    } else if (role === "ROLE_CONTACT") {
      return ({ children }) => <ContactLayout>{children}</ContactLayout>;
    }
    return ({ children }) => <>{children}</>;
  }, [role]);

  return { LayoutComponent, role };
};
