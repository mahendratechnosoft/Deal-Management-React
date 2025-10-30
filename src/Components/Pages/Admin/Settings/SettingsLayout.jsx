import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import TopBar from "../TopBarAdmin";
import Sidebar from "../SidebarAdmin";

// --- Icons for the Settings Links ---
// I've borrowed the "Settings" and "Account" (building) icons from your Sidebar.js
const GeneralIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const DepartmentIcon = () => (
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
);
// --- End of Icons ---

const SettingsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSignOut = () => {
    navigate("/login");
  };

  // This function now returns the styles from your main Sidebar
  const getNavLinkClass = ({ isActive }) => {
    const baseClasses =
      "w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden px-3 py-2.5 justify-start";

    if (isActive) {
      // Active styles: Blue gradient, shadow, scale, white text
      // Note: I picked a color gradient from your Sidebar items.
      return `${baseClasses} bg-gradient-to-r from-blue-500 to-cyan-500 shadow transform scale-105 text-white font-medium`;
    }
    // Inactive styles: Dark bg, hover effect, gray text
    return `${baseClasses} bg-gray-800/50 hover:bg-gray-700/70 hover:transform hover:scale-105 text-gray-300 group-hover:text-white`;
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
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "ml-0 lg:ml-0" : "ml-0"
          } p-2`}
        >
          {/* Main content wrapper: Removed bg-white, added overflow-hidden */}
          <div className="flex flex-row flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Settings Nav: Applied dark gradient, new padding, and text colors */}
            <nav className="w-64 p-4 bg-gradient-to-b from-gray-900 to-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4 px-2">
                Settings
              </h2>

              {/* Links wrapper: changed to space-y-1 to match Sidebar */}
              <div className="flex flex-col space-y-1">
                <NavLink to="/Admin/Settings" className={getNavLinkClass} end>
                  <div className="transition-colors duration-300 text-gray-400 group-hover:text-white">
                    <GeneralIcon />
                  </div>
                  <span className="ml-3 font-medium block text-xs">
                    General
                  </span>
                </NavLink>

                <NavLink
                  to="/Admin/Settings/Department"
                  className={getNavLinkClass}
                >
                  <div className="transition-colors duration-300 text-gray-400 group-hover:text-white">
                    <DepartmentIcon />
                  </div>
                  <span className="ml-3 font-medium block text-xs">
                    Department and Roles
                  </span>
                </NavLink>
              </div>
            </nav>

            {/* Main Content Area: Set background to white */}
            <main className="flex-1 p-1 overflow-y-auto bg-white">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
