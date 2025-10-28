import React, { useState } from "react";

function TopBar({ toggleSidebar, sidebarOpen, onSwitchToLogin }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
          {/* Search Bar */}
          <div className="relative hidden xl:block">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search leads, contacts..."
                className="pl-10 pr-3 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:ring-1 focus:ring-white/30 focus:border-white/30 outline-none transition-all duration-300 text-white placeholder-blue-200 w-64 backdrop-blur-sm text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-blue-200 group-focus-within:text-white transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1">
            <button className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group relative">
              <svg
                className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group relative"
              >
                <svg
                  className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-7.5 1 1 0 00-1.2-1.2 7.97 7.97 0 006.16 10.02 1 1 0 001.7 0 5.97 5.97 0 010-1.32z"
                  />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full border border-blue-600"></span>
              </button>

              {/* Notifications Dropdown */}
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
                UN
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-white font-medium text-xs">User Name</p>
                <p className="text-blue-200 text-xs">Administrator</p>
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
                  <p className="font-medium text-gray-800 text-sm">User Name</p>
                  <p className="text-xs text-gray-600">admin@example.com</p>
                </div>
                <div className="py-1">
                  {["Profile", "Settings", "Team", "Billing"].map((item) => (
                    <button
                      key={item}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-1">
                  <button
                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors duration-200"
                    onClick={onSwitchToLogin}
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

export default TopBar;
