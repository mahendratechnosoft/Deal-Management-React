import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import CheckInOutButton from "../../Common/Timesheet/CheckInOutButton";
import { hasPermission } from "../../BaseComponet/permissions";
import { useTimer } from "../../BaseComponet/TaskTimerContext";
import { formatDuration } from "../../BaseComponet/UtilFunctions";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { FINAL_KEYWORD_URL } from "../../BaseComponet/finalKeyWord";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  showAutoCloseSuccess,
  showCustomAlert,
  showErrorAlert,
} from "../../BaseComponet/alertUtils";

dayjs.extend(relativeTime);

function TopBarEmployee({ toggleSidebar, sidebarOpen, onSwitchToLogin }) {
  // Timer Context
  const { activeTimer, elapsedTime, fetchActiveTimer } = useTimer();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAttendanceList, setShowAttendanceList] = useState(false);
  const [showTimerDropdown, setShowTimerDropdown] = useState(false);

  const [userData, setUserData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const pageSize = 10;

  const navigate = useNavigate();

  // Refs for dropdown containers
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const attendanceRef = useRef(null);
  const timerRef = useRef(null);
  const userButtonRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const attendanceButtonRef = useRef(null);
  const timerButtonRef = useRef(null);

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

  // Fetch active timer on mount
  useEffect(() => {
    fetchActiveTimer();
    fetchNotificationCount();
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    const employeeId = user?.employeeId;

    if (!employeeId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${FINAL_KEYWORD_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/notifications/${employeeId}`, (message) => {
          handleNotification(message);
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  const handleNotification = (message) => {
    let data;
    try {
      data = JSON.parse(message.body);
      const audio = new Audio("/notification.mp3");
      audio
        .play()
        .catch((error) =>
          console.error("Error playing notification sound:", error)
        );
    } catch {
      data = 0;
    }
    setNotificationCount(data);
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await axiosInstance.get("getUnreadNotificationCount");
      if (response.data !== undefined) {
        setNotificationCount(response.data);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const fetchNotifications = async (pageNum = 0) => {
    if (loadingNotifications && pageNum !== 0) return;

    setLoadingNotifications(true);
    try {
      const response = await axiosInstance.get(
        `getNotifications/${pageNum}/${pageSize}`
      );
      const data = response.data;
      const newItems = Array.isArray(data.content) ? data.content : [];

      setNotifications((prev) => {
        if (pageNum === 0) return newItems;
        const existingIds = new Set(prev.map((n) => n.notificationId));
        const filteredNewItems = newItems.filter(
          (n) => !existingIds.has(n.notificationId)
        );
        return [...prev, ...filteredNewItems];
      });

      if (data.totalPages !== undefined) {
        setHasMore(pageNum + 1 < data.totalPages);
      } else {
        setHasMore(newItems.length === pageSize);
      }

      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 20) {
      if (hasMore && !loadingNotifications) {
        fetchNotifications(page + 1);
      }
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`markNotificationAsRead/${notificationId}`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, read: true } : n
        )
      );
      fetchNotificationCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation(); // Prevent click from bubbling to the parent
    try {
      await axiosInstance.delete(`deleteNotification/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId)
      );
      fetchNotificationCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.put("markAllNotificationsAsRead");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setNotificationCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

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

  // --- Toggles ---

  const toggleAttendanceList = () => {
    if (!showAttendanceList) {
      fetchTodayAttendance();
    }
    setShowAttendanceList(!showAttendanceList);

    if (showUserMenu) setShowUserMenu(false);
    if (showNotifications) setShowNotifications(false);
    if (showTimerDropdown) setShowTimerDropdown(false);
  };

  const toggleNotifications = () => {
    const isOpening = !showNotifications;
    setShowNotifications(isOpening);

    if (showUserMenu) setShowUserMenu(false);
    if (showAttendanceList) setShowAttendanceList(false);
    if (showTimerDropdown) setShowTimerDropdown(false);

    if (isOpening) {
      setPage(0);
      setHasMore(true);
      fetchNotifications(0);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
    if (showAttendanceList) setShowAttendanceList(false);
    if (showTimerDropdown) setShowTimerDropdown(false);
  };

  const toggleTimerDropdown = () => {
    if (activeTimer) {
      setShowTimerDropdown(!showTimerDropdown);
      setShowUserMenu(false);
      setShowNotifications(false);
      setShowAttendanceList(false);
    }
  };

  // --- Handle Click Outside ---
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

      // Close Timer Dropdown
      if (
        showTimerDropdown &&
        timerRef.current &&
        !timerRef.current.contains(event.target) &&
        timerButtonRef.current &&
        !timerButtonRef.current.contains(event.target)
      ) {
        setShowTimerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu, showNotifications, showAttendanceList, showTimerDropdown]);

  // --- Logic Functions ---

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
    navigate("/Employee/Settings");
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    navigate("/Employee/Settings");
  };

  const handleSignOut = () => {
    setShowUserMenu(false);
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer || !activeTimer.taskId) {
      return;
    }

    try {
      setShowTimerDropdown(false);

      const result = await showCustomAlert(
        `
        <div class="p-4">
          <div class="flex items-center justify-center mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          
          <h3 class="text-lg font-bold text-center text-gray-900 mb-1">Time Log Note</h3>
          <p class="text-center text-gray-600 mb-4">Please add a note to complete your time entry</p>
          
          <div class="space-y-3">
            <div>
              <label for="timeLogNote" class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> Note (required):
              </label>
            <textarea 
              id="timeLogNote" 
              maxlength="1000"
              oninput="document.getElementById('charCount').innerText = this.value.length + ' / 1000'"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition duration-200 resize-none" 
              rows="4" 
              placeholder="What did you work on? Describe your task completion..."
              autofocus></textarea>
            
            <div id="charCount" class="text-right text-xs text-gray-500 mt-1">
              0 / 1000
            </div>
      
            <div class="mt-1 text-xs text-gray-500 flex items-center">
              <svg class="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              This note is required to complete your time entry
            </div>
          </div>
              
            <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div class="flex items-center gap-2 mb-1">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium text-blue-800">Session Duration</span>
              </div>
              <div class="text-2xl font-bold text-blue-900 font-mono text-center">${formatDuration(
                elapsedTime
              )}</div>
            </div>
          </div>
        </div>
          `,
        "",
        {
          showCancelButton: true,
          confirmButtonText: "Complete Time Entry",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#ef4444",
          width: "500px",
          customClass: {
            popup: "rounded-xl shadow-2xl",
            title: "hidden",
            htmlContainer: "p-0",
            confirmButton:
              "bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
            cancelButton:
              "bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
          },
          preConfirm: () => {
            const noteInput = document.getElementById("timeLogNote");
            const value = noteInput?.value.trim();

            if (!value) {
              if (typeof showErrorAlert === "function") {
                showErrorAlert(
                  "Please enter a note to complete your time entry"
                );
              } else {
                alert("Please enter a note to complete your time entry");
              }
              return false;
            }

            if (value.length > 1000) {
              if (typeof showErrorAlert === "function") {
                showErrorAlert("Note cannot exceed 1000 characters");
              }
              return false;
            }

            return value;
          },

          didOpen: () => {
            const noteInput = document.getElementById("timeLogNote");
            if (noteInput) {
              noteInput.focus();
            }
          },
        }
      );

      if (result.isConfirmed) {
        const endNote = result.value;
        const response = await axiosInstance.post("stopTimerOfTask", {
          taskId: activeTimer.taskId,
          endNote: endNote,
        });

        if (response.data) {
          showAutoCloseSuccess("Timer stopped successfully");
          await fetchActiveTimer();
        }
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
      if (typeof showErrorAlert === "function") {
        showErrorAlert("Failed to stop timer");
      }
    }
  };

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
          {/* TIMER SECTION START */}
          {hasPermission("task", "Access") && (
            <div className="relative">
              <button
                ref={timerButtonRef}
                onClick={toggleTimerDropdown}
                disabled={!activeTimer}
                className={`p-2 rounded-lg transition-all duration-300 backdrop-blur-sm group relative ${
                  activeTimer
                    ? "bg-white/10 hover:bg-white/20 cursor-pointer"
                    : "bg-transparent cursor-default opacity-60"
                }`}
                title={activeTimer ? "View Active Timer" : "No Active Timer"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  style={{ animationDuration: "2s" }}
                  className={`w-5 h-5 text-white transition-transform duration-1000 ${
                    activeTimer ? "animate-spin" : ""
                  }`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {activeTimer && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>

              {showTimerDropdown && activeTimer && (
                <div
                  ref={timerRef}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-0 z-50 animate-fadeIn overflow-hidden"
                >
                  <div className="p-4">
                    {/* Time Display */}
                    <div className="text-center mb-4">
                      <div className="text-3xl font-mono font-bold text-gray-800 tracking-tight">
                        {formatDuration(elapsedTime)}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                        Elapsed Duration
                      </div>
                    </div>

                    {/* Task Info */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-4">
                      <p className="text-[10px] text-gray-500 font-semibold mb-1 uppercase">
                        Current Task
                      </p>
                      <p className="text-sm text-gray-800 font-medium break-words leading-snug">
                        {activeTimer.taskSubject || "No Subject"}
                      </p>
                    </div>

                    {/* STOP BUTTON */}
                    <button
                      onClick={handleStopTimer}
                      className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Stop Timer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* TIMER SECTION END */}

          {/* Quick Actions */}
          {!hasPermission("donor", "Access") && (
            <>
              <div className="flex items-center space-x-1">
                <div className="relative">
                  <button
                    ref={attendanceButtonRef}
                    onClick={toggleAttendanceList}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group relative"
                    title="Today's Attendance Status"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      />
                    </svg>
                  </button>

                  {/* Attendance List Dropdown */}
                  {showAttendanceList && (
                    <div
                      ref={attendanceRef}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-0 z-50 overflow-hidden"
                    >
                      {/* Header */}
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

                      {/* Employee List */}
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
                                {/* Visual separator line */}
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

                {/* Notifications */}
                <div className="relative">
                  <button
                    ref={notificationButtonRef}
                    onClick={toggleNotifications}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group relative"
                    title="Notifications"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
                      />
                    </svg>

                    {/* Notification Badge */}
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
                      className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          Notifications
                        </h3>
                        {notificationCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div
                        className="max-h-80 overflow-y-auto"
                        onScroll={handleNotificationScroll}
                      >
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.notificationId}
                              onClick={() =>
                                handleMarkAsRead(notif.notificationId)
                              }
                              className={`px-4 py-3 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-50 cursor-pointer ${
                                !notif.read ? "bg-blue-50" : ""
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                    !notif.read ? "bg-blue-500" : "bg-gray-300"
                                  }`}
                                ></div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <p
                                      className={`text-sm font-medium ${
                                        !notif.read
                                          ? "text-gray-800"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {notif.title || "New Notification"}
                                    </p>
                                    <button
                                      onClick={(e) =>
                                        handleDeleteNotification(
                                          notif.notificationId,
                                          e
                                        )
                                      }
                                      className="text-gray-400 hover:text-red-500 ml-2 p-1 -mt-1 -mr-1"
                                      title="Delete Notification"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
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
                                  <p
                                    className={`text-xs mt-1 ${
                                      !notif.read
                                        ? "text-gray-600"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {notif.message}
                                  </p>
                                  <p
                                    className={`text-[10px] mt-1 ${
                                      !notif.read
                                        ? "text-gray-500"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {dayjs(notif.createdAt).fromNow()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 text-xs">
                            {!loadingNotifications && "You're all caught up!"}
                          </div>
                        )}

                        {loadingNotifications && (
                          <div className="flex justify-center items-center py-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <CheckInOutButton />
            </>
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
                <p className="text-blue-200 text-xs truncate max-w-[120px]">
                  {userData?.role === "ROLE_EMPLOYEE" ? "Employee" : "User"}
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
                    title={userData?.loginEmail || "employee@example.com"}
                  >
                    {truncateEmail(
                      userData?.loginEmail || "employee@example.com",
                      15
                    )}
                  </p>
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

export default TopBarEmployee;
