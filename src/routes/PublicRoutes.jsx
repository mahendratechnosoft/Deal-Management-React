import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";



const Login = lazy(() => import("../Components/Pages/Login"));
const PageNotFound = lazy(() => import("../Components/Pages/PageNotFound"));
const Register = lazy(() => import("../Components/Pages/Register"));
const ForgetPassword = lazy(() => import("../Components/Pages/Forgetpassword"));
const PublicForm = lazy(() => import("../Components/Common/Settings/DynamicForm/PublicForm"));
const PublicPFForm = lazy(() => import("../Components/Common/ContactPannel/Compliance/PublicPFForm"));
const PublicEsicForm = lazy(() => import("../Components/Common/ContactPannel/Compliance/Esic/PublicEsicForm"));

const PublicRoutes = ({ onLogin }) => {
  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/public-form/:adminId/:formId" element={<PublicForm />} />
      <Route
        path="/public-pf-form/:contactId/:formId"
        element={<PublicPFForm />}
      />
      <Route
        path="/public-esic-form/:contactId/:formId"
        element={<PublicEsicForm />}
      />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default PublicRoutes;
