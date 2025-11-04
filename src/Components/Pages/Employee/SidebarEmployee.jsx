import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SidebarEmployee({ isOpen, toggleSidebar, onSwitchToLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      name: "Lead",
      path: "/Admin/LeadList",
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Customer",
      path: "/Employee/CustomerList",
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: "from-teal-500 to-green-500",
    },
    {
      name: "Account",
      path: "/accounts",
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Deals",
      path: "/DealList",
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Contact",
      path: "/contacts",
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
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      color: "from-orange-500 to-red-500",
    },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    // Example: clear localStorage, redirect to login, etc.
    // localStorage.removeItem('token');
    // navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
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
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div
            className={`p-4 border-b border-gray-700/50 ${
              !isOpen && "lg:flex lg:justify-center lg:py-4"
            }`}
          >
            {isOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-white">
                      Sales CRM
                    </h1>
                    <p className="text-gray-400 text-xs">Professional Suite</p>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors duration-300"
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
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors duration-300 group"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
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
              onClick={handleLogout}
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
                  <div
                    className="ml-3 flex-1 text-left"
                    onClick={() => navigate("/login")}
                  >
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

export default SidebarEmployee;
