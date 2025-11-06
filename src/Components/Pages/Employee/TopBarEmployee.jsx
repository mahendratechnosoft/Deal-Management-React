import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Mtech_logo from "../../../../public/Images/Mtech_Logo.jpg";

function TopBarEmployee({ toggleSidebar, sidebarOpen, onSwitchToLogin }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Get user data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Get initials from user name
  const getUserInitials = () => {
    if (!userData?.loginUserName) return "UN";

    const name = userData.loginUserName.trim();
    if (name.length === 0) return "UN";

    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Handle navigation to settings
  const handleSettings = () => {
    setShowUserMenu(false);
    navigate("/Employee/Settings");
  };

  // Handle navigation to profile
  const handleProfile = () => {
    setShowUserMenu(false);
    navigate("/Employee/Settings"); // Same link for both as requested
  };

  // Handle sign out
  const handleSignOut = () => {
    setShowUserMenu(false);
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow z-40">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <svg
              className={`w-4 h-4 text-white transform transition-transform duration-300 ${
                sidebarOpen ? "rotate-0" : "rotate-180"
              } group-hover:scale-110`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <img src={Mtech_logo} alt="" className="w-20" />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="flex items-center space-x-1">
            {/* Notifications */}
            <div className="relative">
              {/* Notification button code remains the same */}
              {showNotifications && (
                <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow border border-gray-200 py-1 z-50">
                  <div className="px-3 py-1.5 border-b border-gray-100">
                    <h3 className="font-medium text-gray-800 text-sm">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="px-3 py-2 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-50 last:border-b-0"
                      >
                        <p className="text-xs text-gray-700">
                          New lead assigned to you
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          2 minutes ago
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-medium shadow group-hover:scale-105 transition-transform duration-300 text-xs">
                {getUserInitials()}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-white font-medium text-xs">
                  {userData?.loginUserName || "User Name"}
                </p>
                <p className="text-blue-200 text-xs">
                  {userData?.role === "ROLE_EMPLOYEE" ? "Employee" : "User"}
                </p>
              </div>
              <svg
                className={`w-3 h-3 text-blue-200 transform transition-transform duration-300 ${
                  showUserMenu ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow border border-gray-200 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="font-medium text-gray-800 text-sm">
                    {userData?.loginUserName || "User Name"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {userData?.loginEmail || "employee@example.com"}
                  </p>
                </div>
                {/* <div className="py-1">
                  <button
                    onClick={handleProfile}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleSettings}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                  >
                    Settings
                  </button>
                </div> */}
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBarEmployee;
