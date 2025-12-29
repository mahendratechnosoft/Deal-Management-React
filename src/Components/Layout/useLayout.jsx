import { useMemo } from "react";

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
      return ({ children }) => <>{children}</>;
    } else if (role === "ROLE_EMPLOYEE") {
      return ({ children }) => <>{children}</>;
    } else if (role === "ROLE_SUPERADMIN") {
      return ({ children }) => <>{children}</>;
    } else if (role === "ROLE_CUSTOMER") {
      return ({ children }) => <>{children}</>;
    } else if (role === "ROLE_CONTACT") {
      return ({ children }) => <>{children}</>;
    }

    return ({ children }) => <>{children}</>;
  }, [role]);

  return { LayoutComponent, role };
};
