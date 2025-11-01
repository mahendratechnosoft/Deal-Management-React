import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEmployee from "../Pages/Employee/SidebarEmployee";
import TopBarEmployee from "../Pages/Employee/TopBarEmployee";

const EmployeeLayout = ({ children, onLogout }) => {
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
      <TopBarEmployee
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onSwitchToLogin={handleSignOut}
      />
      <div className="flex flex-1">
        <SidebarEmployee isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 overflow-x-auto ${
            sidebarOpen ? "ml-0" : "ml-0"
          }`}
        >
          {/* This is where the page content will be rendered */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
