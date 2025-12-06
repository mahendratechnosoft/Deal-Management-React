import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { hasPermission } from "../../BaseComponet/permissions";

function TopBar({ toggleSidebar, sidebarOpen, onSwitchToLogin }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAttendanceList, setShowAttendanceList] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const navigate = useNavigate();

  // Refs for dropdown containers
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const attendanceRef = useRef(null);
  const userButtonRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const attendanceButtonRef = useRef(null);

  // Get user data from localStorage
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

  // Function to fetch today's attendance data
  const fetchTodayAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axiosInstance.get(
        `getAttendanceBetween?fromDate=${today}&toDate=${today}`
      );

      let processedData = [];

      if (typeof response.data === "object" && response.data !== null) {
        Object.keys(response.data).forEach((employeeName) => {
          const employeeData = response.data[employeeName];
          const todayKey = Object.keys(employeeData).find((key) =>
            key.includes(today)
          );

          if (todayKey && employeeData[todayKey]) {
            const records = employeeData[todayKey];
            const sortedRecords = [...records].sort(
              (a, b) => a.timeStamp - b.timeStamp
            );

            // Get latest record
            let status = "not-checked-in";
            let lastTime = null;

            if (sortedRecords.length > 0) {
              const lastRecord = sortedRecords[sortedRecords.length - 1];
              status = lastRecord.status ? "checked-in" : "checked-out";
              lastTime = new Date(lastRecord.timeStamp);
            }

            processedData.push({
              employeeName,
              status,
              lastTime,
            });
          } else {
            processedData.push({
              employeeName,
              status: "not-checked-in",
              lastTime: null,
            });
          }
        });
      }

      // Sort: checked-in first, then checked-out, then not-checked-in
      processedData.sort((a, b) => {
        const statusOrder = {
          "checked-in": 1,
          "checked-out": 2,
          "not-checked-in": 3,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      });

      setAttendanceData(processedData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Function to toggle attendance list
  const toggleAttendanceList = () => {
    if (!showAttendanceList) {
      fetchTodayAttendance();
    }
    setShowAttendanceList(!showAttendanceList);

    if (showUserMenu) setShowUserMenu(false);
    if (showNotifications) setShowNotifications(false);
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user menu
      if (
        showUserMenu &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }

      // Close notifications
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      // Close attendance list
      if (
        showAttendanceList &&
        attendanceRef.current &&
        !attendanceRef.current.contains(event.target) &&
        attendanceButtonRef.current &&
        !attendanceButtonRef.current.contains(event.target)
      ) {
        setShowAttendanceList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu, showNotifications, showAttendanceList]);

  // Function to format time (e.g., "9:32 am")
  const formatTime = (date) => {
    if (!date) return "";
    return date
      .toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "checked-in":
        return "bg-green-100 text-green-800 border-green-200";
      case "checked-out":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "checked-in":
        return "🟢"; // Green circle
      case "checked-out":
        return "🔵"; // Blue circle
      default:
        return "⚪"; // White/gray circle
    }
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

  // Rest of your existing functions remain the same
  const truncateText = (text, maxLength = 20) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const truncateEmail = (email, maxNameLength = 12) => {
    if (!email || email.length <= maxNameLength + 10) return email;
    const [username, domain] = email.split("@");
    if (!domain) return truncateText(email, maxNameLength + 10);
    if (username.length > maxNameLength) {
      return `${username.substring(0, maxNameLength)}...@${domain}`;
    }
    return email;
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    navigate("/Admin/Settings");
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    navigate("/Admin/Settings");
  };

  const handleSignOut = () => {
    setShowUserMenu(false);
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  const toggleNotifications = () => {
    if (showUserMenu) setShowUserMenu(false);
    if (showAttendanceList) setShowAttendanceList(false);
    setShowNotifications(!showNotifications);
    if (!showNotifications && notificationCount > 0) {
      setNotificationCount(0);
    }
  };

  const toggleUserMenu = () => {
    if (showNotifications) setShowNotifications(false);
    if (showAttendanceList) setShowAttendanceList(false);
    setShowUserMenu(!showUserMenu);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow z-40">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
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
          {/* Attendance Status Button */}
          {!hasPermission("donor", "Access") && (
            <div className="relative">
              <button
                ref={attendanceButtonRef}
                onClick={toggleAttendanceList}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group relative"
                title="Today's Attendance Status"
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              {/* Attendance List Dropdown - SIMPLIFIED */}
              {showAttendanceList && (
                <div
                  ref={attendanceRef}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-0 z-50 overflow-hidden"
                >
                  {/* Header - Simplified */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
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
                        <h3 className="font-semibold text-gray-800 text-sm">
                          Today's Status
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Employee List - Compact */}
                  <div className="max-h-80 overflow-y-auto">
                    {loadingAttendance ? (
                      <div className="flex justify-center items-center py-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    ) : attendanceData.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-gray-500 text-sm">
                          No attendance data
                        </p>
                      </div>
                    ) : (
                      <div className="px-3 py-2">
                        {attendanceData.map((employee, index) => (
                          <div key={index} className="py-2 px-1">
                            {/* Visual separator line between different status groups */}
                            {index > 0 &&
                              attendanceData[index].status !==
                                attendanceData[index - 1].status && (
                                <div className="my-2 border-t border-gray-200 border-dashed"></div>
                              )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {/* Small profile circle */}
                                <div className="relative">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium text-xs">
                                      {employee.employeeName
                                        ?.charAt(0)
                                        ?.toUpperCase() || "E"}
                                    </span>
                                  </div>
                                  {/* Tiny status dot */}
                                  <div
                                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                                      employee.status === "checked-in"
                                        ? "bg-green-500"
                                        : employee.status === "checked-out"
                                        ? "bg-blue-500"
                                        : "bg-gray-400"
                                    }`}
                                  ></div>
                                </div>

                                {/* Name */}
                                <span className="text-sm text-gray-800 font-medium truncate max-w-[100px]">
                                  {employee.employeeName}
                                </span>
                              </div>

                              {/* Status & Time - Compact */}
                              <div className="text-right">
                                {employee.status === "checked-in" &&
                                  employee.lastTime && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                      <span className="text-xs text-gray-600">
                                        at {formatTime(employee.lastTime)}
                                      </span>
                                    </div>
                                  )}
                                {employee.status === "checked-out" &&
                                  employee.lastTime && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                      <span className="text-xs text-gray-600">
                                        at {formatTime(employee.lastTime)}
                                      </span>
                                    </div>
                                  )}
                                {employee.status === "not-checked-in" && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                    <span className="text-xs text-gray-500">
                                      Not in
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {!hasPermission("donor", "Access") && (
            <div className="flex items-center space-x-1">
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

                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div
                    ref={notificationRef}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        Notifications
                      </h3>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {notificationCount} new
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {/* Sample notifications */}
                      <div className="px-4 py-3 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-medium">
                              New lead assigned
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              You have been assigned a new lead from website
                              inquiry.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              2 minutes ago
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-medium">
                              Meeting reminder
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Team meeting starts in 30 minutes.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              1 hour ago
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 hover:bg-blue-50 transition-colors duration-200">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800 font-medium">
                              System update
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              New features available in the latest update.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              3 hours ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button className="w-full text-center text-xs text-blue-600 hover:text-blue-800 font-medium py-2">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                <p
                  className="text-white font-medium text-xs truncate max-w-[120px]"
                  title={userData?.loginUserName || "User Name"}
                >
                  {truncateText(userData?.loginUserName || "User Name", 15)}
                </p>
                <p
                  className="text-blue-200 text-xs truncate max-w-[120px]"
                  title={userData?.loginEmail || "Administrator"}
                >
                  {truncateEmail(userData?.loginEmail || "Administrator", 10)}
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
                  <p
                    className="font-medium text-gray-800 text-sm truncate"
                    title={userData?.loginUserName || "User Name"}
                  >
                    {truncateText(userData?.loginUserName || "User Name", 25)}
                  </p>
                  <p
                    className="text-xs text-gray-600 truncate"
                    title={userData?.loginEmail || "admin@example.com"}
                  >
                    {truncateEmail(
                      userData?.loginEmail || "admin@example.com",
                      15
                    )}
                  </p>
                </div>
                <div className="py-1">
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
                </div>
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

export default TopBar;
