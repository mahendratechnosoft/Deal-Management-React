import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import RoleBasedRoute from "../Components/BaseComponet/RoleBasedRoute";

const AdminList = lazy(() =>
  import("../Components/Common/SuperAdmin/AdminList")
);
const EditAdmin = lazy(() =>
  import("../Components/Common/SuperAdmin/EditAdmin")
);
const SuperAdminLayout = lazy(() =>
  import("../Components/Layout/SuperAdminLayout")
);

const ContactRoutes = () => {
  return (
    <RoleBasedRoute allowedRoles={["ROLE_SUPERADMIN"]}>
      <Routes>
        <Route element={<SuperAdminLayout />}>
        <Route path="AdminList" element={<AdminList />} />
        <Route path="EditAdmin/:adminId" element={<EditAdmin />} />
        </Route>
      </Routes>
    </RoleBasedRoute>
  );
};

export default ContactRoutes;
