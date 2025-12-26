import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Mtech_logo from "../../../../public/Images/Mtech_Logo.jpg";
import Mtech_logoOnly from "../../../../public/Images/Mtech_OnlyLogo.jpg";
import { hasPermission } from "../../BaseComponet/permissions";

function SidebarCustomer({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

    const userData = JSON.parse(localStorage.getItem("userData")) || {};
  // Module key mapping for permission checks
  const moduleKeyMap = {
    Dashboard: "dashboard",
    Profile: "profile",
    Projects: "projects",
    Invoices: "invoices",
    Payments: "payments",
    Support: "support",
    Settings: "settings",
  };

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/Customer/dash",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "My Profile",
      path: "/Customer/profile",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      color: "from-teal-500 to-green-500",
    },
    {
      name: "My Projects",
      path: "/Customer/projects",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Invoices",
      path: "/Customer/invoices",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: "from-amber-500 to-orange-500",
    },
    {
      name: "Payments",
      path: "/Customer/payments",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-emerald-500 to-green-500",
    },
    {
      name: "Support",
      path: "/Customer/support",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: "from-indigo-500 to-purple-500",
    },
    {
      name: "Settings",
      path: "/Customer/settings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      color: "from-gray-600 to-gray-800",
    },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // Add your logout logic here
    // localStorage.removeItem("token");
    // localStorage.removeItem("userRole");
  };

  const checkModuleAccess = (moduleName, moduleKey) => {
    return hasPermission(moduleKey, "Access");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl transform transition-all duration-500 ease-in-out ${
          isOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        <div className="flex flex-col h-[90vh] overflow-y-auto CRM-scroll-width-none">
          {/* Sidebar Header */}
          <div
            className={`p-4 border-b border-gray-700/50 ${
              !isOpen && "lg:flex lg:justify-center lg:py-4"
            }`}
          >
            {isOpen ? (
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  {/* Logo with proper background */}
                  {userData?.logo && (
                    <div className="flex items-center justify-center bg-white rounded-lg p-2 shadow-lg">
                      <img
                        src={`data:image/png;base64,${userData?.logo}`}
                        alt="Mtech Logo"
                        className="w-15 h-10 object-contain"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors duration-300 mx-3"
                >
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors duration-300 group w-full flex justify-center"
              >
                {userData?.logo && (
                  <div className="flex items-center justify-center bg-white rounded-lg p-1 shadow">
                    <img
                      src={`data:;base64,${userData?.logo}`}
                      alt="Mtech Logo"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                )}
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems
                .filter((item) =>
                  checkModuleAccess(item.name, moduleKeyMap[item.name])
                )
                .map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                    className={`w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive(item.path)
                        ? `bg-gradient-to-r ${item.color} shadow transform scale-105`
                        : "bg-gray-800/50 hover:bg-gray-700/70 hover:transform hover:scale-105"
                    } ${
                      isOpen
                        ? "px-3 py-2.5 justify-start"
                        : "px-2 py-2.5 justify-center"
                    }`}
                    title={!isOpen ? item.name : ""}
                  >
                    {/* Background Glow Effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${
                        item.color
                      } opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                        isActive(item.path) && "opacity-20"
                      }`}
                    ></div>

                    <div
                      className={`relative z-10 flex items-center ${
                        isOpen ? "w-full" : "justify-center"
                      }`}
                    >
                      <div
                        className={`transition-all duration-300 ${
                          isActive(item.path)
                            ? "text-white scale-105"
                            : "text-gray-400 group-hover:text-white group-hover:scale-105"
                        }`}
                      >
                        {item.icon}
                      </div>

                      {isOpen && (
                        <div className="ml-3 flex-1 text-left">
                          <span
                            className={`font-medium block text-xs transition-colors duration-300 ${
                              isActive(item.path)
                                ? "text-white"
                                : "text-gray-300 group-hover:text-white"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Active Indicator */}
                    {isActive(item.path) && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </nav>

          {/* Sidebar Footer - Logout Button */}
          <div
            className={`p-4 border-t border-gray-700/50 ${
              !isOpen && "lg:flex lg:justify-center"
            }`}
          >
            <button
              onClick={() => {
                handleLogout();
                navigate("/login");
              }}
              className={`w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden bg-gray-800/50 hover:bg-red-500/20 hover:transform hover:scale-105 ${
                isOpen
                  ? "px-3 py-2.5 justify-start"
                  : "px-2 py-2.5 justify-center"
              }`}
              title={!isOpen ? "Logout" : ""}
            >
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <div
                className={`relative z-10 flex items-center ${
                  isOpen ? "w-full" : "justify-center"
                }`}
              >
                <div className="text-gray-400 group-hover:text-red-400 transition-all duration-300 group-hover:scale-105">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>

                {isOpen && (
                  <div className="ml-3 flex-1 text-left">
                    <span className="font-medium block text-xs text-gray-300 group-hover:text-red-400 transition-colors duration-300">
                      Logout
                    </span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SidebarCustomer;
