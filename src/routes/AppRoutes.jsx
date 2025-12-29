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
  <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
    {/* Sidebar Skeleton */}
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Skeleton */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Dashboard Content Skeleton */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts/Tables Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 w-full bg-gray-50 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
             <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6" />
             <div className="flex justify-center items-center h-64">
                <div className="h-48 w-48 rounded-full border-8 border-gray-100 animate-pulse border-t-gray-200" />
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
