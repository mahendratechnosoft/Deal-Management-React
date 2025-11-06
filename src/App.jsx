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
import RoleListCompo from "./Components/Common/Settings/RoleAndDepartment/RoleListCompo.jsx";
import RoleBasedRoute from "./Components/BaseComponet/RoleBasedRoute.jsx";
import LeadList from "./Components/Common/Lead/LeadList";
import ProposalList from "./Components/Common/Proposal/ProposalList.jsx";
import CreateProposal from "./Components/Common/Proposal/CreateProposal.jsx";
import EditProposal from "./Components/Common/Proposal/EditProposal.jsx";
import CustomerList from "./Components/Common/Customer/CustomerList.jsx";
import CreateCustomer from "./Components/Common/Customer/CreateCustomer.jsx";
import EditCustomer from "./Components/Common/Customer/EditCustomer.jsx";
import ProposalPreview from "./Components/Common/Proposal/ProposalPreview.jsx";
import DynamicFormBase from "./Components/Common/Settings/DynamicForm/DynamicFormBase.jsx";
import PublicForm from "./Components/Common/Settings/DynamicForm/PublicForm.jsx";
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

          {/* Admin Routes - Individual routes with layout */}
          <Route
            path="/Admin/LeadList"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <LeadList />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Admin/CreateLead"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <CreateLead />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Admin/EmployeeList"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <EmployeeListAdmin />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Admin/CreateEmployee"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <CreateEmployee />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Admin/EditEmployee/:employeeId"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <EditEmployee />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Admin/EditLead/:id"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <EditLead />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Admin/CustomerList"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <CustomerList />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Admin/CreateCustomer"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <CreateCustomer />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/Admin/EditCustomer/:customerId"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <EditCustomer />
              </RoleBasedRoute>
            }
          />

          {/* Employee Routes - Individual routes with layout */}
          <Route
            path="/Employee/LeadList"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                <LeadList />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Employee/CreateLead"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                <CreateLead />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Employee/EditLead/:id"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                <EditLead />
              </RoleBasedRoute>
            }
          />

          {/* Common Routes */}
          {/* <Route
            path="/Employee/CreateLead"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                <CreateLead />
              </RoleBasedRoute>
            }
          /> */}
          {/* Common Routes - Use this for both Admin and Employee */}
          {/* <Route
            path="/EditLead/:id"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                <EditLead />
              </RoleBasedRoute>
            }
          /> */}

          <Route
            path="/Employee/CustomerList"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                <CustomerList />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Employee/CreateCustomer"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                <CreateCustomer />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Employee/EditCustomer/:customerId"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                <EditCustomer />
              </RoleBasedRoute>
            }
          />

          {/* Settings Routes */}
          <Route
            path="/Proposal"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <ProposalList />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/Proposal/Create"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                <CreateProposal />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/Proposal/Edit/:proposalId"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                <EditProposal />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/Proposal/Preview/:proposalId"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                <ProposalPreview />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/Employee/Proposal"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                <ProposalList />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/Admin/Settings"
            element={
              <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                <SettingsLayout />
              </RoleBasedRoute>
            }
          >
            <Route index element={<General />} />
            <Route path="Department" element={<Department />} />
            <Route
              path="Department/:departmentId/Roles"
              element={<RoleListCompo />}
            />
            <Route path="Form" element={<DynamicFormBase />} />
          </Route>

          <Route
            path="/public-form/:adminId/:formId"
            element={<PublicForm />}
          />

          {/* Default redirect based on role */}
          <Route
            path="/"
            element={
              userRole === "ROLE_ADMIN" ? (
                <Navigate to="/Admin/LeadList" replace />
              ) : userRole === "ROLE_EMPLOYEE" ? (
                <Navigate to="/Employee/LeadList" replace />
              ) : (
                <Navigate to="/login" replace />
              )
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
