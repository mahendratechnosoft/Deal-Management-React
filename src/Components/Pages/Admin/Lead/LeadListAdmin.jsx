import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeadList from "../../../Common/Lead/LeadList";
import Sidebar from "../SidebarAdmin";
import TopBar from "../TopBarAdmin";

function LeadListAdmin({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSignOut = () => {
    // Call the logout function from App.js
    if (onLogout) {
      onLogout();
    }
    // Navigate to login page
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
          className={`flex-1 flex flex-col transition-all duration-300 overflow-x-auto w-[88vw] ${
            sidebarOpen ? "ml-0 lg:ml-5" : "ml-0"
          }`}
        >
          <LeadList />
        </div>
      </div>
    </div>
  );
}

export default LeadListAdmin;
