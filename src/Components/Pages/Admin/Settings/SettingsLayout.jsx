import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import TopBar from "../TopBarAdmin";
import Sidebar from "../SidebarAdmin";

// --- Icons (No Changes) ---
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

const MenuIcon = () => (
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
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
// --- End of Icons ---

const SettingsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSettingsSidebarOpen(false);
      } else {
        setSettingsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const toggleMainSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSettingsSidebar = () => {
    setSettingsSidebarOpen(!settingsSidebarOpen);
  };

  const handleSignOut = () => {
    navigate("/login");
  };

  // Close settings sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSettingsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const getNavLinkClass = ({ isActive }) => {
    const baseClasses =
      "w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden px-3 py-2.5 justify-start";

    if (isActive) {
      return `${baseClasses} bg-gradient-to-r from-blue-500 to-cyan-500 shadow transform scale-105 text-white font-medium`;
    }
    return `${baseClasses} text-gray-600 hover:bg-gray-100 hover:text-gray-900`;
  };

  return (
    <div className="min-h-screen font-sans flex flex-col">
      <TopBar
        toggleSidebar={toggleMainSidebar}
        sidebarOpen={sidebarOpen}
        onSwitchToLogin={handleSignOut}
      />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleMainSidebar} />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 overflow-x-auto ${
            sidebarOpen ? "lg:ml-0" : "ml-0"
          }`}
        >
          <div className="p-4 lg:p-6 lg:pb-0 overflow-x-auto CRM-scroll-width-none">
            {/* Mobile Settings Header */}
            <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-3 rounded-lg shadow">
              <button
                onClick={toggleSettingsSidebar}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {settingsSidebarOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
              <div className="w-10"></div> {/* Spacer for balance */}
            </div>

            {/* Main Settings Container */}
            <div className="flex flex-row flex-1 bg-white shadow-lg h-[85vh] lg:h-[90vh] overflow-hidden CRM-scroll-width-none">
              {/* Settings Sidebar with responsive behavior */}
              {settingsSidebarOpen && (
                <>
                  {/* Overlay for mobile */}
                  {isMobile && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                      onClick={() => setSettingsSidebarOpen(false)}
                    ></div>
                  )}

                  {/* Settings Sidebar */}
                  <nav
                    className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 CRM-scroll-width-none h-full overflow-y-auto transform transition-transform duration-300 ${
                      settingsSidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    } lg:translate-x-0`}
                  >
                    <div className="p-4">
                      {/* Desktop Title - Hidden on mobile */}
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 px-2 hidden lg:block">
                        Settings
                      </h2>

                      <div className="flex flex-col space-y-1">
                        <NavLink
                          to="/Admin/Settings"
                          className={getNavLinkClass}
                          end
                        >
                          <GeneralIcon />
                          <span className="ml-3 font-medium block text-xs">
                            General
                          </span>
                        </NavLink>

                        <NavLink
                          to="/Admin/Settings/Department"
                          className={getNavLinkClass}
                        >
                          <DepartmentIcon />
                          <span className="ml-3 font-medium block text-xs">
                            Department and Roles
                          </span>
                        </NavLink>
                      </div>
                    </div>
                  </nav>
                </>
              )}

              {/* Main Content Area */}
              <main
                className={`flex-1 p-4 lg:p-6 overflow-y-auto bg-white CRM-scroll-width-none ${
                  !settingsSidebarOpen ? "lg:ml-0" : ""
                }`}
              >
                {/* Mobile toggle button when sidebar is closed */}
                {!settingsSidebarOpen && (
                  <button
                    onClick={toggleSettingsSidebar}
                    className="lg:hidden mb-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <MenuIcon />
                  </button>
                )}
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
