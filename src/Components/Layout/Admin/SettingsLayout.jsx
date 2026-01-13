import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { hasPermission } from "../../BaseComponet/permissions";

// --- Icons (updated Email Template icon) ---
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

export const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
    />
  </svg>
);

export const DepartmentIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 21h18M4 21V7a2 2 0 012-2h4v16M10 5h4a2 2 0 012 2v14M14 9h1M14 13h1M7 9h1M7 13h1M9 21v-3a2 2 0 012-2h2a2 2 0 012 2v3"
    />
  </svg>
);

export const DynamicFormIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 6h8M8 12h4M8 18h8M4 4h16a2 2 0 012 2v3a2 2 0 01-2 2H4M4 11h16M4 11v9a2 2 0 002 2h12a2 2 0 002-2v-9"
    />
  </svg>
);

const FinanceIcon = () => (
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
);

// New Email Template Icon
const EmailTemplateIcon = () => (
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
      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
    />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
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
// --- End Icons ---

const SettingsLayout = () => {
  const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const MENU_ITEMS = [
    {
      title: "General",
      path: "/Admin/Settings",
      icon: <GeneralIcon />,
      end: true,
    },
    {
      title: "Email Configuration",
      path: "/Admin/Settings/Email",
      icon: <EmailIcon />,
    },
    {
      title: "Department and Roles",
      path: "/Admin/Settings/Department",
      icon: <DepartmentIcon />,
    },
    {
      title: "Finance",
      id: "finance",
      icon: <FinanceIcon />,
      submenu: [
        { title: "Proposal", path: "/Admin/Settings/Finance/Proposal" },
        { title: "Proforma", path: "/Admin/Settings/Finance/Proforma" },
        { title: "Invoice", path: "/Admin/Settings/Finance/Invoice" },
        { title: "Vendor", path: "/Admin/Settings/Finance/Vendor" },
        { title: "Payment Mode", path: "/Admin/Settings/Finance/PaymentMode" },
      ],
    },
    {
      title: "Email Template",
      id: "template",
      icon: <EmailTemplateIcon />, // Changed icon here
      submenu: [
        {
          title: "Task",
          path: "/Admin/Settings/EmailTemplate/Task",
        },
        {
          title: "Sales",
          path: "/Admin/Settings/EmailTemplate/Sales",
        },
        {
          title: "Attendance",
          path: "/Admin/Settings/EmailTemplate/Attendance",
        },
        {
          title: "Leads",
          path: "/Admin/Settings/EmailTemplate/Leads",
        },
      ],
    },
    {
      title: "Dynamic Form",
      path: "/Admin/Settings/Form",
      icon: <DynamicFormIcon />,
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenMenus = { ...openMenus };
    MENU_ITEMS.forEach((item) => {
      if (
        item.submenu &&
        item.submenu.some((sub) => currentPath.includes(sub.path))
      ) {
        newOpenMenus[item.id] = true;
      }
    });
    setOpenMenus(newOpenMenus);
  }, [location.pathname]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSettingsSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSettingsSidebar = () =>
    setSettingsSidebarOpen(!settingsSidebarOpen);

  useEffect(() => {
    if (isMobile) setSettingsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const toggleMenu = (id) =>
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 p-4 lg:p-6 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={toggleSettingsSidebar}
            className="p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 border border-blue-200"
            aria-label={settingsSidebarOpen ? "Close menu" : "Open menu"}
          >
            {settingsSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex flex-row flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[85vh] lg:h-[86vh]">
          {/* Settings Sidebar - Reduced size */}
          {settingsSidebarOpen && (
            <>
              {/* Mobile Overlay */}
              {isMobile && (
                <div
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
                  onClick={() => setSettingsSidebarOpen(false)}
                ></div>
              )}

              <nav
                className={`fixed lg:relative inset-y-0 left-0 z-50 w-56 lg:w-64 bg-white border-r border-gray-200 h-full overflow-y-auto transform transition-all duration-300 ease-out ${
                  settingsSidebarOpen
                    ? "translate-x-0 shadow-xl lg:shadow-none"
                    : "-translate-x-full"
                } lg:translate-x-0`}
              >
                <div className="p-4 lg:p-5">
                  {/* Desktop Title */}
                  <div className="hidden lg:block mb-5">
                    <h2 className="text-lg font-bold text-gray-900">
                      Settings
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Manage system configurations
                    </p>
                  </div>

                  <div className="flex flex-col space-y-1">
                    {MENU_ITEMS.map((item, index) => {
                      // Permission check
                      if (
                        hasPermission("donor", "Access") &&
                        (item.title === "Dynamic Form" ||
                          item.title === "Finance")
                      )
                        return null;

                      // Submenu items
                      if (item.submenu) {
                        const isOpen = openMenus[item.id];
                        const isChildActive = item.submenu.some((sub) =>
                          location.pathname.includes(sub.path)
                        );

                        return (
                          <div key={index} className="flex flex-col">
                            {/* Parent Menu Item */}
                            <div
                              onClick={() => toggleMenu(item.id)}
                              className={`flex items-center justify-between w-full px-2.5 py-2.5 rounded-lg transition-all duration-300 cursor-pointer group ${
                                isChildActive
                                  ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  className={`p-1.5 rounded-md transition-colors ${
                                    isChildActive
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                                  }`}
                                >
                                  {item.icon}
                                </div>
                                <span className="ml-2.5 font-medium text-sm">
                                  {item.title}
                                </span>
                              </div>
                              <ChevronDownIcon
                                className={`w-3.5 h-3.5 transition-transform duration-300 flex-shrink-0 ${
                                  isOpen ? "rotate-180" : ""
                                } ${
                                  isChildActive
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>

                            {/* Submenu Items - Fixed alignment */}
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                isOpen
                                  ? "max-h-96 opacity-100 mt-1"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              <div className="ml-8 flex">
                                {/* Left border line - aligned with dots */}
                                <div className="w-0.5 bg-gray-200 mr-2.5 flex-shrink-0"></div>
                                <div className="flex-1 py-1 space-y-0.5">
                                  {item.submenu.map((sub, subIdx) => (
                                    <NavLink
                                      key={subIdx}
                                      to={sub.path}
                                      className={({ isActive }) =>
                                        `block w-full px-2.5 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                                        ${
                                          isActive
                                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm transform scale-[1.02]"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-0.5"
                                        }`
                                      }
                                      onClick={() => {
                                        if (isMobile) {
                                          setSettingsSidebarOpen(false);
                                        }
                                      }}
                                    >
                                      <div className="flex items-center">
                                        {/* Dot - properly aligned with text */}
                                        <div
                                          className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${
                                            location.pathname.includes(sub.path)
                                              ? "bg-white"
                                              : "bg-gray-400"
                                          }`}
                                        ></div>
                                        <span className="truncate">
                                          {sub.title}
                                        </span>
                                      </div>
                                    </NavLink>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Regular menu items
                      return (
                        <NavLink
                          key={index}
                          to={item.path}
                          end={item.end}
                          className={({ isActive }) =>
                            `flex items-center w-full px-2.5 py-2.5 rounded-lg transition-all duration-300 group ${
                              isActive
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm transform scale-[1.02]"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
                            }`
                          }
                          onClick={() => {
                            if (isMobile) {
                              setSettingsSidebarOpen(false);
                            }
                          }}
                        >
                          <div
                            className={`p-1.5 rounded-md transition-colors ${
                              location.pathname === item.path ||
                              (item.end && location.pathname === item.path)
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                            }`}
                          >
                            {item.icon}
                          </div>
                          <span className="ml-2.5 font-medium text-sm truncate">
                            {item.title}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>

               
                </div>
              </nav>
            </>
          )}

          {/* Main Content Area */}
          <main
            className={`flex-1 overflow-hidden flex flex-col ${
              !settingsSidebarOpen ? "lg:ml-0" : ""
            }`}
          >
            {/* Toggle button when sidebar is closed (desktop) */}
            {!settingsSidebarOpen && (
              <div className="hidden lg:flex p-3 border-b border-gray-200">
                <button
                  onClick={toggleSettingsSidebar}
                  className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 border border-blue-200"
                  aria-label="Open settings menu"
                >
                  <MenuIcon />
                </button>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-5 bg-gradient-to-b from-gray-50/50 to-white CRM-scroll-width-none">
              <div className="max-w-8xl mx-auto">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
