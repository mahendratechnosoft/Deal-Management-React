// Components/Layout/AdminLayout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../Pages/Admin/SidebarAdmin";
import TopBarAdmin from "../Pages/Admin/TopBarAdmin";

const AdminLayout = ({ children, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSignOut = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <TopBarAdmin
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onSwitchToLogin={handleSignOut}
      />
      <div className="flex flex-1">
        <SidebarAdmin isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 overflow-x-auto ${
            sidebarOpen ? "ml-0 lg:ml-64" : "ml-0"
          }`}
        >
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
