import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBarAdmin";
import Sidebar from "../SidebarAdmin";
import EmployeeList from "../../../Common/Employee/EmployeeList";

function EmployeeListAdmin({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSignOut = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <TopBar
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onSwitchToLogin={handleSignOut}
      />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-0" : "ml-0"
          }`}
        >
          <EmployeeList />
        </div>
      </div>
    </div>
  );
}

export default EmployeeListAdmin;
