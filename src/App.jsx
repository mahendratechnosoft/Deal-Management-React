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
import EditEmployee from "./Components/Common/Employee/EditEmployee.jsx";
import CustomToaster from "./Components/Common/Toaster";
import SettingsLayout from "./Components/Layout/Admin/SettingsLayout.jsx";
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
import ProformaList from "./Components/Common/Proforma/ProformaList.jsx";
import CreateProforma from "./Components/Common/Proforma/CreateProforma.jsx";
import EditProforma from "./Components/Common/Proforma/EditProforma.jsx";
import DynamicFormBase from "./Components/Common/Settings/DynamicForm/DynamicFormBase.jsx";
import PublicForm from "./Components/Common/Settings/DynamicForm/PublicForm.jsx";
import PaymentList from "./Components/Common/Payment/PaymentList.jsx";
import PaymentPreview from "./Components/Common/Payment/PaymentPreview.jsx";
import EditPayment from "./Components/Common/Payment/EditPayment.jsx";
import ProformaPreview from "./Components/Common/Proforma/ProformaPreview.jsx";
import DonorList from "./Components/Common/Donor/DonorList.jsx";
import EditDonar from "./Components/Common/Donor/EditDonar.jsx";
import SelectedDonarList from "./Components/Common/Donor/SelectedDonarList.jsx";

import TimeSheetList from "./Components/Common/Timesheet/TimeSheetList.jsx";
import InvoiceList from "./Components/Common/Invoice/InvoiceList.jsx";
import InvoicePreview from "./Components/Common/Invoice/InvoicePreview.jsx";
import FamilyList from "./Components/Common/Donor/FamilyList.jsx";
import DonorMatchingFilter from "./Components/Common/Donor/DonorMatchingFilter.jsx";
import EditFamily from "./Components/Common/Donor/EditFamily.jsx";
import Itemlist from "./Components/Common/Item/Itemlists.jsx";
import AdminList from "./Components/Common/SuperAdmin/AdminList.jsx";
import EditAdmin from "./Components/Common/SuperAdmin/EditAdmin.jsx";
import EmployeeList from "./Components/Common/Employee/EmployeeList.jsx";
import TaskList from "./Components/Common/Task/TaskList.jsx";
import { TaskTimerProvider } from "./Components/BaseComponet/TaskTimerContext.jsx";

import AmcList from "./Components/Common/AMC/AmcList.jsx";
import PaymentModeList from "./Components/Common/Settings/Finance/PaymentMode/PaymentModeList.jsx";
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
    localStorage.removeItem("superAdminData");
    localStorage.removeItem("role");
    localStorage.removeItem("rememberMe");
    setIsLoggedIn(false);
    setUserRole("");
  };

  return (
    <>
      <Router>
        <TaskTimerProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />

            {/* SUPER ADMIN Models */}
            <Route
              path="/SuperAdmin/AdminList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_SUPERADMIN"]}>
                  <AdminList />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/SuperAdmin/EditAdmin/:adminId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_SUPERADMIN"]}>
                  <EditAdmin />
                </RoleBasedRoute>
              }
            />

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
                  <EmployeeList />
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

            <Route
              path="/Admin/Payment"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <PaymentList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/EditPayment/:paymentId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <EditPayment />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/ViewPayment/:paymentId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <PaymentPreview />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/DonorList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <DonorList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/DonorEdit/:donorId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <EditDonar />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/DonorList/:pageName"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <SelectedDonarList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/FamilyList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <FamilyList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/PreviewMatchingDonors/:familyId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <DonorMatchingFilter />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/EditFamily/:familyInfoId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <EditFamily />
                </RoleBasedRoute>
              }
            />

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
              path="/Proforma"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <ProformaList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Proforma/Create"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                  <CreateProforma />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Proforma/Edit/:proformaInvoiceId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                  <EditProforma />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Proforma/Preview/:proformaInvoiceId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                  <ProformaPreview />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/TimesheetList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <TimeSheetList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/Invoice"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <InvoiceList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/ItemList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <Itemlist />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Invoice/Preview/:proformaInvoiceId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN", "ROLE_EMPLOYEE"]}>
                  <InvoicePreview />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/TaskList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <TaskList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Admin/AMC"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_ADMIN"]}>
                  <AmcList />
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

            <Route
              path="/Employee/Payment"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <PaymentList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/EditPayment/:paymentId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <EditPayment />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/DonorList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <DonorList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/DonorEdit/:donorId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <EditDonar />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/DonorList/:pageName"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <SelectedDonarList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/FamilyList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <FamilyList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/PreviewMatchingDonors/:familyId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <DonorMatchingFilter />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/EditFamily/:familyInfoId"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <EditFamily />
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
              path="/Employee/Proforma"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <ProformaList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/TimesheetList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <TimeSheetList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/Invoice"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <InvoiceList />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/ItemList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <Itemlist />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/Employee/TaskList"
              element={
                <RoleBasedRoute allowedRoles={["ROLE_EMPLOYEE"]}>
                  <TaskList />
                </RoleBasedRoute>
              }
            />
            {/* Settings Routes */}
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

              {/* --- FINANCE SECTION --- */}
              <Route path="Finance">
                <Route path="PaymentMode" element={<PaymentModeList />} />
                {/* <Route path="TaxRate" element={<TaxRate />} /> */}
              </Route>
              {/* --------------------------- */}

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
        </TaskTimerProvider>
      </Router>
      <CustomToaster />
    </>
  );
}

export default App;
