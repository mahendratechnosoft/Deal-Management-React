// App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Components/Pages/Login";
import Register from "./Components/Pages/Register";
import PageNotFound from "./Components/Pages/PageNotFound";
import CreateLead from "./Components/Common/Lead/CreateLead";
import EditLead from "./Components/Common/Lead/EditLead";
import DealList from "./Components/Common/Deals/DealList.jsx";
import EmployeeListAdmin from "./Components/Pages/Admin/Employee/EmployeeListAdmin.jsx";
import CreateEmployee from "./Components/Common/Employee/CreateEmployee.jsx";
import EditEmployee from "./Components/Common/Employee/EditEmployee.jsx";
import CustomToaster from "./Components/Common/Toaster";
import SettingsLayout from "./Components/Pages/Admin/Settings/SettingsLayout.jsx";
import Department from "./Components/Common/Settings/RoleAndDepartment/Department.jsx";
import General from "./Components/Common/Settings/General.jsx";
import RoleList from "./Components/Common/Settings/RoleAndDepartment/RoleList.JSX";

// Layout Components
import AdminLayout from "./Components/Layout/AdminLayout";
import EmployeeLayout from "./Components/Layout/EmployeeLayout";
import RoleBasedRoute from "./Components/BaseComponet/RoleBasedRoute.jsx";

// Common Components (without layout)
import LeadList from "./Components/Common/Lead/LeadList";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserRole(user.role || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleLogout();
      }
    } else {
      setIsLoggedIn(false);
      setUserRole("");
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUserRole(userData.user.role || "");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("role");
    localStorage.removeItem("rememberMe");
    setIsLoggedIn(false);
    setUserRole("");
  };

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/Admin/*"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <AdminLayout onLogout={handleLogout} />
              </RoleBasedRoute>
            }
          >
            <Route path="LeadList" element={<LeadList />} />
            <Route path="EmployeeList" element={<EmployeeListAdmin />} />
            <Route path="CreateEmployee" element={<CreateEmployee />} />
            <Route path="EditEmployee/:employeeId" element={<EditEmployee />} />
            <Route path="EditLead/:id" element={<EditLead />} />
            <Route path="Settings" element={<SettingsLayout />}>
              <Route index element={<General />} />
              <Route path="Department" element={<Department />} />
              <Route
                path="Department/:departmentId/Roles"
                element={<RoleList />}
              />
            </Route>
          </Route>

          {/* Employee Routes */}
          <Route
            path="/Employee/*"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                <EmployeeLayout onLogout={handleLogout} />
              </RoleBasedRoute>
            }
          >
            <Route path="LeadList" element={<LeadList />} />
            <Route path="CreateLead" element={<CreateLead />} />
          </Route>

          {/* Common Routes with layout detection */}
          <Route
            path="/CreateLead"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                <CreateLead />
              </RoleBasedRoute>
            }
          />

          {/* Default redirect based on role */}
          <Route
            path="/"
            element={
              <RoleBasedRoute>
                {userRole === "ROLE_ADMIN" ? (
                  <Navigate to="/Admin/LeadList" replace />
                ) : userRole === "ROLE_EMPLOYEE" ? (
                  <Navigate to="/Employee/LeadList" replace />
                ) : (
                  <Navigate to="/login" replace />
                )}
              </RoleBasedRoute>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
      <CustomToaster />
    </>
  );
}

export default App;
