import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Mtech_logo from "../../../../public/Images/Mtech_Logo.jpg";
import CheckInOutButton from "../../Common/Timesheet/CheckInOutButton";

function TopBarEmployee({ toggleSidebar, sidebarOpen, onSwitchToLogin }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3); // Example count
  const navigate = useNavigate();

  // Refs for dropdown containers
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const userButtonRef = useRef(null);
  const notificationButtonRef = useRef(null);

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

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user menu if clicked outside
      if (
        showUserMenu &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }

      // Close notifications if clicked outside
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);

  // Function to truncate text if it's too long
  const truncateText = (text, maxLength = 20) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Function to truncate email - show first part and domain
  const truncateEmail = (email, maxNameLength = 12) => {
    if (!email || email.length <= maxNameLength + 10) return email;
    
    const [username, domain] = email.split('@');
    if (!domain) return truncateText(email, maxNameLength + 10);
    
    if (username.length > maxNameLength) {
      return `${username.substring(0, maxNameLength)}...@${domain}`;
    }
    return email;
  };

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

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    // Close user menu if open
    if (showUserMenu) {
      setShowUserMenu(false);
    }
    setShowNotifications(!showNotifications);
    // If opening notifications, you might want to clear the count
    if (!showNotifications && notificationCount > 0) {
      setNotificationCount(0);
    }
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    // Close notifications if open
    if (showNotifications) {
      setShowNotifications(false);
    }
    setShowUserMenu(!showUserMenu);
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
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Quick Actions */}
          <div className="flex items-center space-x-1">
            {/* Notifications */}
            <div className="relative">
              <button
                ref={notificationButtonRef}
                onClick={toggleNotifications}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group relative"
                title="Notifications"
              >
                <svg
                  className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                
                {/* Notification Badge */}
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div 
                  ref={notificationRef}
                  className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow border border-gray-200 py-1 z-50"
                >
                  <div className="px-3 py-1.5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-medium text-gray-800 text-sm">
                      Notifications
                    </h3>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {notificationCount} new
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {/* Sample notifications */}
                    <div className="px-3 py-2 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-50">
                      <p className="text-xs text-gray-700 font-medium">
                        New task assigned
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        You have been assigned a new project task.
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        2 minutes ago
                      </p>
                    </div>
                    
                    <div className="px-3 py-2 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-50">
                      <p className="text-xs text-gray-700 font-medium">
                        Meeting reminder
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Team meeting starts in 30 minutes.
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        1 hour ago
                      </p>
                    </div>
                    
                    <div className="px-3 py-2 hover:bg-blue-50 transition-colors duration-200">
                      <p className="text-xs text-gray-700 font-medium">
                        Timesheet approved
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Your weekly timesheet has been approved.
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        3 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-medium py-2">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <CheckInOutButton />
          
          {/* User Profile */}
          <div className="relative">
            <button
              ref={userButtonRef}
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-medium shadow group-hover:scale-105 transition-transform duration-300 text-xs">
                {getUserInitials()}
              </div>
              <div className="text-left hidden lg:block min-w-0">
                <p className="text-white font-medium text-xs truncate max-w-[120px]" 
                   title={userData?.loginUserName || "User Name"}>
                  {truncateText(userData?.loginUserName || "User Name", 15)}
                </p>
                <p className="text-blue-200 text-xs truncate max-w-[120px]">
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
              <div 
                ref={userMenuRef}
                className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow border border-gray-200 py-1 z-50"
              >
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="font-medium text-gray-800 text-sm truncate"
                     title={userData?.loginUserName || "User Name"}>
                    {truncateText(userData?.loginUserName || "User Name", 25)}
                  </p>
                  <p className="text-xs text-gray-600 truncate"
                     title={userData?.loginEmail || "employee@example.com"}>
                    {truncateEmail(userData?.loginEmail || "employee@example.com", 15)}
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