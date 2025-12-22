import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Mtech_logo from "../../../../public/Images/Mtech_Logo.jpg";
import { hasPermission } from "../../BaseComponet/permissions";
import Mtech_logoOnly from "../../../../public/Images/Mtech_OnlyLogo.jpg";
function SidebarEmployee({ isOpen, toggleSidebar, onSwitchToLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const moduleKeyMap = {
    Lead: "lead",
    Customer: "customer",
    Proposal: "proposal",
    Proforma: "proformaInvoice",
    Invoice: "invoice",
    Payment: "payment",
    Timesheet: "timeSheet",
    Item: "item",
    Prospects: "Prospects",
    Shortlisted: "Shortlisted",
    Qualified: "Qualified",
    Donor: "Donor",
    FamilyList: "FamilyList",
    Matchingdonor: "Matchingdonor",
    Tasks: "task",
    AMC: "amc",
    Vendor: "vendor",
  };

  const navigationItems = [
    {
      name: "Lead",
      path: "/Employee/LeadList",
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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
      name: "Proposal",
      path: "/Employee/Proposal",
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: "from-cyan-500 to-emerald-500",
    },
    {
      name: "Proforma",
      path: "/Employee/Proforma",
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
            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
          />
        </svg>
      ),
      color: "from-red-500 to-yellow-500",
    },
    {
      name: "Invoice",
      path: "/Employee/Invoice",
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
            d="M9 14l-3-3m0 0l3-3m-3 3h6m3 10H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v1M9 18h6"
          />
        </svg>
      ),
      color: "from-purple-500 to-yellow-500",
    },

    {
      name: "Payment",
      path: "/Employee/Payment",
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
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: "from-emerald-500 to-lime-500", // Fresh green for financial transactions
    },

    {
      name: "AMC",
      path: "/Employee/AMC",
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14v2m0 0v2m0-2h2m-2 0h-2"
          />
        </svg>
      ),
      color: "from-emerald-500 to-green-600",
    },

    {
      name: "Vendor",
      path: "/Employee/VendorList",
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
      color: "from-amber-500 to-orange-500",
    },
    {
      name: "Item",
      path: "/Employee/Itemlist",
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      color: "from-teal-600 to-cyan-500",
    },
    {
      name: "Tasks",
      path: "/Employee/TaskList",
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
            d="M9 5l2 2 4-4M5 11h14M5 17h14"
          />
        </svg>
      ),

      color: "from-red-500 to-rose-600",
    },
    {
      name: "Timesheet",
      path: "/Employee/TimesheetList",
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-fuchsia-500 to-purple-600",
    },
    {
      name: "Under Screening",
      path: "/Employee/DonorList/UnderScreeningDonorList",
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
      color: "from-rose-500 to-pink-500",
    },
    {
      name: "Selected",
      path: "/Employee/DonorList/SelectedDonorList",
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Shortlisted",
      path: "/Employee/DonorList/ShortlistedDonorList",
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Quarantined",
      path: "/Employee/DonorList/QuarantinedDonorList",
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Qualified",
      path: "/Employee/DonorList/QualifiedDonorList",
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Donor",
      path: "/Employee/DonorList/ConfirmDonorList",
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "FamilyList",
      path: "/Employee/FamilyList",
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: "from-orange-500 to-amber-500",
    },
    {
      name: "Search Donor",
      path: "/Employee/PreviewMatchingDonors/:familyId",
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7"
          />
        </svg>
      ),
      color: "from-violet-500 to-purple-500",
    },
    {
      name: "Semen Enquiry",
      path: "/Employee/SemenEnquiryList",
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: "from-orange-500 to-amber-500",
    },
  ];

  const activeItem = navigationItems
    .filter((item) => location.pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0]; // Sort by length descending, take first

  const isActive = (path) => {
    // Only return true if this path matches the calculated 'activeItem'
    return activeItem && activeItem.path === path;
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    // Example: clear localStorage, redirect to login, etc.
    // localStorage.removeItem('token');
    // navigate('/login');
  };

  const checkModuleAccess = (moduleName, moduleKey) => {
    // Check if Donar access grants access to related modules
    if (
      [
        "Under Screening",
        "Shortlisted",
        "Qualified",
        "Donor",
        "FamilyList",
        "Search Donor",
        "Selected",
        "Quarantined",
        "Semen Enquiry",
      ].includes(moduleName)
    ) {
      const donorHasAccess = hasPermission("donor", "Access");
      const specificModuleHasAccess = hasPermission(moduleKey, "Access");
      return donorHasAccess || specificModuleHasAccess;
    }
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
                  <div className="flex items-center justify-center bg-white rounded-lg p-2 shadow-lg">
                    <img
                      src={Mtech_logo}
                      alt="Mtech Logo"
                      className="w-15 h-10 object-contain"
                    />
                  </div>
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
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors duration-300 group"
              >
                <div className="flex items-center justify-center bg-white rounded-lg p-1 shadow">
                  <img
                    src={Mtech_logoOnly}
                    alt="Mtech Logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
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

export default SidebarEmployee;
