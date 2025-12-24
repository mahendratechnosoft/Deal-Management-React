

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBarCustomer from "./Customer/TopBarCustomer";
import SidebarCustomer from "./Customer/SidebarCustomer";

const CustomerLayout = ({ children, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [userToggled, setUserToggled] = useState(false);
  const navigate = useNavigate();

  // Detect screen size and handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const largeScreen = window.innerWidth >= 768;
      setIsLargeScreen(largeScreen);

      // Only auto-manage sidebar if user hasn't manually toggled it
      if (!userToggled) {
        if (!largeScreen && sidebarOpen) {
          setSidebarOpen(false);
        } else if (largeScreen && !sidebarOpen) {
          setSidebarOpen(true);
        }
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener for resize
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
      <TopBarCustomer
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onSwitchToLogin={handleSignOut}
      />
      <div className="flex flex-1">
        <SidebarCustomer
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onSwitchToLogin={handleSignOut}
        />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 overflow-x-auto ${
            sidebarOpen ? "md:ml-0" : "ml-0"
          }`}
        >
          {/* This is where the page content will be rendered */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
