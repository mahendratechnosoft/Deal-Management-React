import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Load Route Modules
const AdminRoutes = lazy(() => import("./AdminRoutes"));
const EmployeeRoutes = lazy(() => import("./EmployeeRoutes"));
const SuperAdminRoutes = lazy(() => import("./SuperAdminRoutes"));
const CustomerRoutes = lazy(() => import("./CustomerRoutes"));
const PublicRoutes = lazy(() => import("./PublicRoutes"));
const ContactRoutes = lazy(() => import("./ContactRoutes"));

const LoadingFallback = () => (
  <div className="p-4 text-center">Loading Application...</div>
);

const AppRoutes = ({ userRole, isLoggedIn, onLogin }) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/*"
          element={<PublicRoutes onLogin={onLogin} />}
        />
        <Route path="/SuperAdmin/*" element={<SuperAdminRoutes />} />
        <Route path="/Admin/*" element={<AdminRoutes />} />
        <Route path="/Employee/*" element={<EmployeeRoutes />} />
        <Route path="/Customer/*" element={<CustomerRoutes />} />
        <Route path="/Contact/*" element={<ContactRoutes />} />

        <Route
          path="/"
          element={
            isLoggedIn ? (
              userRole === "ROLE_ADMIN" ? (
                <Navigate to="/Admin/LeadList" replace />
              ) : userRole === "ROLE_EMPLOYEE" ? (
                <Navigate to="/Employee/LeadList" replace />
              ) : userRole === "ROLE_CUSTOMER" ? (
                <Navigate to="/Customer/dash" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
