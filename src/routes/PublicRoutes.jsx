import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../Components/Pages/Login";
import Register from "../Components/Pages/Register";
import PublicForm from "../Components/Common/Settings/DynamicForm/PublicForm";
import PublicPFForm from "../Components/Common/ContactPannel/Compliance/PublicPFForm";
import PublicEsicForm from "../Components/Common/ContactPannel/Compliance/Esic/PublicEsicForm";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register />} />
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
