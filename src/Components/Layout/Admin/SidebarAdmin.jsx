import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hasPermission } from "../../BaseComponet/permissions";

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [salesOpen, setSalesOpen] = useState(true); // State for sales dropdown

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

  // Module key mapping for permission checks
  const moduleKeyMap = {
    Lead: "lead",
    Customer: "customer",
    Proposal: "proposal",
    Invoices: "proformaInvoice",
    Tax_Invoices: "invoice",
    Payment: "payment",
    Timesheet: "timeSheet",
    Item: "item",
    Setting: "setting",
    Employee: "employee",
    Prospects: "Prospects",
    Shortlisted: "Shortlisted",
    Qualified: "Qualified",
    Donor: "Donor",
    FamilyList: "FamilyList",
    Matchingdonor: "Matchingdonor",
    Tasks: "task",
    AMC: "amc",
    Vendor: "vendor",
    Compliance: "compliance",
    Reminder: "Reminder",
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Check if any sales item is active
  const isSalesActive = () => {
    return salesItems.some((item) => isActive(item.path));
  };

  const handleLogout = () => {
    console.log("Logging out...");
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
        "Prospects",
        "Semen Enquiry",
      ].includes(moduleName)
    ) {
      const donorHasAccess = hasPermission("donor", "Access");
      const specificModuleHasAccess = hasPermission(moduleKey, "Access");
      return donorHasAccess || specificModuleHasAccess;
    }
    return hasPermission(moduleKey, "Access");
  };

  // Sales dropdown items (Proposal, Proforma, Invoice, Payment)
  const salesItems = [
    {
      name: "Proposal",
      path: "/Admin/Proposal",
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
    },
    {
      name: "Invoices",
      path: "/Admin/Proforma",
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
    },
    {
      name: "Tax_Invoices",
      path: "/Admin/Invoice",
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
    },
    {
      name: "Payment",
      path: "/Admin/Payment",
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
    },
  ];

  // Main navigation items - organized in the correct order
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
    },
    {
      name: "Reminder",
      path: "/Admin/ReminderList",
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
    },
    {
      name: "Customer",
      path: "/Admin/CustomerList",
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
    },
    // AMC and other items after sales
    {
      name: "AMC",
      path: "/Admin/AMC",
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
    },
    {
      name: "Vendor",
      path: "/Admin/VendorList",
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
    },
    {
      name: "Item",
      path: "/Admin/ItemList",
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
    },
    {
      name: "Tasks",
      path: "/Admin/TaskList",
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
    },
    {
      name: "Timesheet",
      path: "/Admin/TimesheetList",
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
    },
    {
      name: "Compliance",
      path: "/Admin/ComplianceList",
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
    },
    {
      name: "Prospects",
      path: "/Admin/donorList",
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
    },
    {
      name: "Under Screening",
      path: "/Admin/DonorList/UnderScreeningDonorList",
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
    },
    {
      name: "Selected",
      path: "/Admin/DonorList/SelectedDonorList",
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
    },
    {
      name: "Shortlisted",
      path: "/Admin/DonorList/ShortlistedDonorList",
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
    },
    {
      name: "Quarantined",
      path: "/Admin/DonorList/QuarantinedDonorList",
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
    },
    {
      name: "Qualified",
      path: "/Admin/DonorList/QualifiedDonorList",
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
    },
    {
      name: "Donor",
      path: "/Admin/DonorList/ConfirmDonorList",
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
    },
    {
      name: "FamilyList",
      path: "/Admin/FamilyList",
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
    },
    {
      name: "Search Donor",
      path: "/Admin/PreviewMatchingDonors/:familyId",
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
    },
    {
      name: "Semen Enquiry",
      path: "/Admin/SemenEnquiryList",
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
    },
    {
      name: "Employee",
      path: "/Admin/EmployeeList",
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
    {
      name: "Setting",
      path: "/Admin/Settings",
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
    },
  ];

  // Check if any sales item should be visible based on permissions
  const hasSalesAccess = () => {
    return salesItems.some((item) =>
      checkModuleAccess(item.name, moduleKeyMap[item.name])
    );
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
                {/* Mini logo for collapsed state */}
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
              {/* Lead Item */}
              {checkModuleAccess("Lead", moduleKeyMap["Lead"]) && (
                <button
                  onClick={() => {
                    navigate("/Admin/LeadList");
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                  className={`w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive("/Admin/LeadList")
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg transform scale-105"
                      : "bg-gray-800/50 hover:bg-gray-700/70 hover:transform hover:scale-105"
                  } ${
                    isOpen
                      ? "px-3 py-2.5 justify-start"
                      : "px-2 py-2.5 justify-center"
                  }`}
                  title={!isOpen ? "Lead" : ""}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                      isActive("/Admin/LeadList") && "opacity-20"
                    }`}
                  ></div>
                  <div
                    className={`relative z-10 flex items-center ${
                      isOpen ? "w-full" : "justify-center"
                    }`}
                  >
                    <div
                      className={`transition-all duration-300 ${
                        isActive("/Admin/LeadList")
                          ? "text-white scale-105"
                          : "text-gray-400 group-hover:text-white group-hover:scale-105"
                      }`}
                    >
                      {
                        navigationItems.find((item) => item.name === "Lead")
                          ?.icon
                      }
                    </div>
                    {isOpen && (
                      <div className="ml-3 flex-1 text-left">
                        <span
                          className={`font-medium block text-xs transition-colors duration-300 ${
                            isActive("/Admin/LeadList")
                              ? "text-white"
                              : "text-gray-300 group-hover:text-white"
                          }`}
                        >
                          Lead
                        </span>
                      </div>
                    )}
                  </div>
                  {isActive("/Admin/LeadList") && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              )}

              {/* Reminder Item */}
              {checkModuleAccess("Reminder", moduleKeyMap["Reminder"]) && (
                <button
                  onClick={() => {
                    navigate("/Admin/ReminderList");
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                  className={`w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive("/Admin/ReminderList")
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg transform scale-105"
                      : "bg-gray-800/50 hover:bg-gray-700/70 hover:transform hover:scale-105"
                  } ${
                    isOpen
                      ? "px-3 py-2.5 justify-start"
                      : "px-2 py-2.5 justify-center"
                  }`}
                  title={!isOpen ? "Reminder" : ""}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                      isActive("/Admin/ReminderList") && "opacity-20"
                    }`}
                  ></div>
                  <div
                    className={`relative z-10 flex items-center ${
                      isOpen ? "w-full" : "justify-center"
                    }`}
                  >
                    <div
                      className={`transition-all duration-300 ${
                        isActive("/Admin/ReminderList")
                          ? "text-white scale-105"
                          : "text-gray-400 group-hover:text-white group-hover:scale-105"
                      }`}
                    >
                      {
                        navigationItems.find((item) => item.name === "Reminder")
                          ?.icon
                      }
                    </div>
                    {isOpen && (
                      <div className="ml-3 flex-1 text-left">
                        <span
                          className={`font-medium block text-xs transition-colors duration-300 ${
                            isActive("/Admin/ReminderList")
                              ? "text-white"
                              : "text-gray-300 group-hover:text-white"
                          }`}
                        >
                          Reminder
                        </span>
                      </div>
                    )}
                  </div>
                  {isActive("/Admin/ReminderList") && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              )}

              {/* Customer Item */}
              {checkModuleAccess("Customer", moduleKeyMap["Customer"]) && (
                <button
                  onClick={() => {
                    navigate("/Admin/CustomerList");
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                  className={`w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive("/Admin/CustomerList")
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg transform scale-105"
                      : "bg-gray-800/50 hover:bg-gray-700/70 hover:transform hover:scale-105"
                  } ${
                    isOpen
                      ? "px-3 py-2.5 justify-start"
                      : "px-2 py-2.5 justify-center"
                  }`}
                  title={!isOpen ? "Customer" : ""}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                      isActive("/Admin/CustomerList") && "opacity-20"
                    }`}
                  ></div>
                  <div
                    className={`relative z-10 flex items-center ${
                      isOpen ? "w-full" : "justify-center"
                    }`}
                  >
                    <div
                      className={`transition-all duration-300 ${
                        isActive("/Admin/CustomerList")
                          ? "text-white scale-105"
                          : "text-gray-400 group-hover:text-white group-hover:scale-105"
                      }`}
                    >
                      {
                        navigationItems.find((item) => item.name === "Customer")
                          ?.icon
                      }
                    </div>
                    {isOpen && (
                      <div className="ml-3 flex-1 text-left">
                        <span
                          className={`font-medium block text-xs transition-colors duration-300 ${
                            isActive("/Admin/CustomerList")
                              ? "text-white"
                              : "text-gray-300 group-hover:text-white"
                          }`}
                        >
                          Customer
                        </span>
                      </div>
                    )}
                  </div>
                  {isActive("/Admin/CustomerList") && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              )}

              {/* Sales Dropdown - Right after Customer */}
              {hasSalesAccess() && (
                <div className="mb-2">
                  {/* Sales Dropdown Header */}
                  <button
                    onClick={() => isOpen && setSalesOpen(!salesOpen)}
                    className={`w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isSalesActive()
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg transform scale-105"
                        : salesOpen
                        ? "bg-gray-700/70"
                        : "bg-gray-800/50 hover:bg-gray-700/70 hover:transform hover:scale-105"
                    } ${
                      isOpen
                        ? "px-3 py-2.5 justify-start"
                        : "px-2 py-2.5 justify-center"
                    }`}
                    title={!isOpen ? "Sales" : ""}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                        isSalesActive() && "opacity-20"
                      }`}
                    ></div>

                    <div
                      className={`relative z-10 flex items-center ${
                        isOpen ? "w-full" : "justify-center"
                      }`}
                    >
                      <div
                        className={`transition-all duration-300 ${
                          isSalesActive()
                            ? "text-white scale-105"
                            : salesOpen
                            ? "text-white scale-105"
                            : "text-gray-400 group-hover:text-white group-hover:scale-105"
                        }`}
                      >
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>

                      {isOpen && (
                        <div className="ml-3 flex-1 text-left flex justify-between items-center">
                          <span
                            className={`font-medium block text-xs transition-colors duration-300 ${
                              isSalesActive()
                                ? "text-white"
                                : salesOpen
                                ? "text-white"
                                : "text-gray-300 group-hover:text-white"
                            }`}
                          >
                            Sales
                          </span>
                          <svg
                            className={`w-4 h-4 transition-transform duration-300 mr-2 ${
                              salesOpen ? "rotate-180" : ""
                            } ${
                              isSalesActive() ? "text-white" : "text-gray-400"
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
                        </div>
                      )}
                    </div>

                    {isSalesActive() && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>

                  {/* Sales Dropdown Items */}
                  {isOpen && salesOpen && (
                    <div className="ml-6 mt-1 space-y-1 pl-3 border-l border-gray-700/50">
                      {salesItems
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
                                ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 shadow-lg"
                                : "bg-gray-800/30 hover:bg-gray-700/50"
                            } px-3 py-2.5 justify-start`}
                          >
                            <div
                              className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                                isActive(item.path) && "opacity-20"
                              }`}
                            ></div>

                            <div className="relative z-10 flex items-center w-full">
                              <div
                                className={`transition-all duration-300 ${
                                  isActive(item.path)
                                    ? "text-white scale-105"
                                    : "text-gray-400 group-hover:text-white group-hover:scale-105"
                                }`}
                              >
                                {item.icon}
                              </div>

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
                            </div>

                            {isActive(item.path) && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Rest of navigation items (AMC onwards) */}
              {navigationItems
                .filter(
                  (item) =>
                    !["Lead", "Reminder", "Customer"].includes(item.name) &&
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
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg transform scale-105"
                        : "bg-gray-800/50 hover:bg-gray-700/70 hover:transform hover:scale-105"
                    } ${
                      isOpen
                        ? "px-3 py-2.5 justify-start"
                        : "px-2 py-2.5 justify-center"
                    }`}
                    title={!isOpen ? item.name : ""}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
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

export default Sidebar;
