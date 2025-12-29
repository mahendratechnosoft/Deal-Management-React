import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import RoleBasedRoute from "../Components/BaseComponet/RoleBasedRoute";

const ComplianceList = lazy(() =>
  import("../Components/Common/ContactPannel/Compliance/ComplianceList")
);
const ContactDash = lazy(() =>
  import("../Components/Common/ContactPannel/ContactDash")
);
const ContactLayout = lazy(() => import("../Components/Layout/ContactLayout"));

const ContactRoutes = () => {
  return (
    <RoleBasedRoute allowedRoles={["ROLE_CONTACT"]}>
      <Routes>
        <Route element={<ContactLayout />}>
        <Route path="ContactDash" element={<ContactDash />} />
        <Route path="ComplianceList" element={<ComplianceList />} />
        </Route>
      </Routes>
    </RoleBasedRoute>
  );
};

export default ContactRoutes;
