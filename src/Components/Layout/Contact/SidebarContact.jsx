import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Mtech_logo from "../../../../public/Images/Mtech_Logo.jpg";
import Mtech_logoOnly from "../../../../public/Images/Mtech_OnlyLogo.jpg";
import { hasPermission } from "../../BaseComponet/permissions";

function SidebarContact({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

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

export default SidebarContact;
