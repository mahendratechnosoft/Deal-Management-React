import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

import TopbarContact from "./Contact/TopbarContact";
import SidebarContact from "./Contact/SidebarContact";

const ContactLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userToggled, setUserToggled] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkScreenSize = () => {
      const largeScreen = window.innerWidth >= 768;
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
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <TopbarContact
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onSwitchToLogin={handleSignOut}
      />
      <div className="flex flex-1">
        <SidebarContact
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onSwitchToLogin={handleSignOut}
        />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 overflow-x-auto ${
            sidebarOpen ? "md:ml-0" : "ml-0"
          }`}
        >
          {<Outlet />}
        </div>
      </div>
    </div>
  );
};

export default ContactLayout;
