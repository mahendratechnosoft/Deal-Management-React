import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import RoleBasedRoute from "../Components/BaseComponet/RoleBasedRoute";

const ComplianceList = lazy(() =>
  import("../Components/Common/ContactPannel/Compliance/ComplianceList")
);
const Customerdash = lazy(() =>
  import("../Components/Common/CustomerPannel/Customerdash")
);
const CustomerLayout = lazy(() => import("../Components/Layout/CustomerLayout"));

const CustomerRoutes = () => {
  return (
    <RoleBasedRoute allowedRoles={["ROLE_CUSTOMER"]}>
      <Routes>
        <Route element={<CustomerLayout />}>
        <Route path="dash" element={<Customerdash />} />
        <Route path="ComplianceList" element={<ComplianceList />} />
        </Route>
      </Routes>
    </RoleBasedRoute>
  );
};

export default CustomerRoutes;
