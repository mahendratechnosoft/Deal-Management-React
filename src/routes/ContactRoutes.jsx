import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import RoleBasedRoute from "../Components/BaseComponet/RoleBasedRoute";

const ComplianceList = lazy(() =>
  import("../Components/Common/ContactPannel/Compliance/ComplianceList")
);
const ContactDash = lazy(() =>
  import("../Components/Common/ContactPannel/ContactDash")
);

const ContactRoutes = () => {
  return (
    <RoleBasedRoute allowedRoles={["ROLE_CONTACT"]}>
      <Routes>
        <Route path="ContactDash" element={<ContactDash />} />
        <Route path="ComplianceList" element={<ComplianceList />} />
      </Routes>
    </RoleBasedRoute>
  );
};

export default ContactRoutes;
