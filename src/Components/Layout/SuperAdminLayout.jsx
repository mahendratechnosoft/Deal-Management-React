import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import SidebarSuperAdmin from "./SuperAdmin/SidebarSuperAdmin";
import TopbarSuperAdmin from "./SuperAdmin/TopbarSuperAdmin";

const SuperAdminLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userToggled, setUserToggled] = useState(false);
  const navigate = useNavigate();

  // Detect screen size and handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const largeScreen = window.innerWidth >= 1024;

      if (!userToggled) {
        if (!largeScreen && sidebarOpen) {
          setSidebarOpen(false);
        } else if (largeScreen && !sidebarOpen) {
          setSidebarOpen(true);
        }
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [sidebarOpen, userToggled]);

  const toggleSidebar = () => {
    setUserToggled(true);
    setSidebarOpen(!sidebarOpen);
  };

  const handleSignOut = () => {
    // Clear superadmin specific data
    localStorage.removeItem("superAdminData");
    localStorage.removeItem("superAdminToken");
    localStorage.removeItem("authToken");

    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <TopbarSuperAdmin
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onSwitchToLogin={handleSignOut}
      />

      <div className="flex flex-1">
        <SidebarSuperAdmin
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onSwitchToLogin={handleSignOut}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 overflow-auto ${
            sidebarOpen ? "lg:ml-0" : "ml-0"
          }`}
        >
          {<Outlet />}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
