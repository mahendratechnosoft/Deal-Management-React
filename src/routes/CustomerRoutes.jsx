import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import RoleBasedRoute from "../Components/BaseComponet/RoleBasedRoute";

const ComplianceList = lazy(() =>
  import("../Components/Common/ContactPannel/Compliance/ComplianceList")
);
const Customerdash = lazy(() =>
  import("../Components/Common/CustomerPannel/Customerdash")
);

const CustomerRoutes = () => {
  return (
    <RoleBasedRoute allowedRoles={["ROLE_CUSTOMER"]}>
      <Routes>
        <Route path="dash" element={<Customerdash />} />
        <Route path="ComplianceList" element={<ComplianceList />} />
      </Routes>
    </RoleBasedRoute>
  );
};

export default CustomerRoutes;
