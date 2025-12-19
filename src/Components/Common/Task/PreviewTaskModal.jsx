import React, { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import {
  showSuccessAlert,
  showErrorAlert,
  showAutoCloseSuccess,
  showCustomAlert,
} from "../../BaseComponet/alertUtils";
import Chart from "chart.js/auto";
import TaskComments from "./TaskComments";
import CircularAssigneesSelector from "./CircularAssigneesSelector";
import TaskAttachments from "./TaskAttachments";
import { useTimer } from "../../BaseComponet/TaskTimerContext";

function PreviewTaskModal({
  taskId,
  onClose,
  onStatusUpdate,
  onAssigneeUpdate,
  onFollowerUpdate,
}) {
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState("timelogs");
  const [activeTimerLog, setActiveTimerLog] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [timeLogs, setTimeLogs] = useState([]);
  const timerRef = useRef(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [openNoteId, setOpenNoteId] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canStartTimer, setCanStartTimer] = useState(false);

  const { fetchActiveTimer } = useTimer();

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Fetch task details when taskId changes
  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
      fetchTimeLogs();
      checkActiveTimerForCurrentUser(); // Add this line
    }
  }, [taskId]);

  // Timer interval effect
  useEffect(() => {
    if (isTimerRunning && activeTimerLog) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          const startTime = new Date(activeTimerLog.startTime);
          const now = new Date();
          return Math.floor((now - startTime) / 1000);
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, activeTimerLog]);

  // Chart initialization effect
  useEffect(() => {
    if (activeTab === "statistics" && chartRef.current && timeLogs.length > 0) {
      initChart();
    }
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [activeTab, timeLogs]);

  // Close note on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenNoteId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchTeamMembers = async () => {
    setLoadingTeam(true);
    try {
      const response = await axiosInstance.get("getEmployeeNameAndId");
      if (response.data && Array.isArray(response.data)) {
        const formattedTeamMembers = response.data.map((member) => ({
          value: member.employeeId,
          label: member.name,
        }));
        setTeamMembers(formattedTeamMembers);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      showErrorAlert("Failed to load team members");
    } finally {
      setLoadingTeam(false);
    }
  };

  // Add this function after fetchTimeLogs
  const checkActiveTimerForCurrentUser = async () => {
    if (!taskId) return;

    try {
      const response = await axiosInstance.get(
        `getActiveTimerForTask/${taskId}`
      );

      // If we get a valid response with taskLogId, show Stop button
      if (response.data && response.data.taskLogId) {
        setActiveTimerLog(response.data);
        setIsTimerRunning(true);

        // Calculate elapsed time from startTime to now
        const startTime = new Date(response.data.startTime);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setTimerSeconds(elapsedSeconds);
      } else {
        // If we get no data (blank/empty response), show Start button
        setActiveTimerLog(null);
        setIsTimerRunning(false);
        setTimerSeconds(0);
      }
    } catch (error) {
      console.error("Error checking active timer:", error);
      // If API returns error or 204 No Content, show Start button
      setActiveTimerLog(null);
      setIsTimerRunning(false);
      setTimerSeconds(0);
    }
  };

  const fetchTimeLogs = async () => {
    if (!taskId) return;

    try {
      const response = await axiosInstance.get(`getAllTimerLogs/${taskId}`);
      if (response.data && Array.isArray(response.data)) {
        // Set ALL time logs (including active ones)
        setTimeLogs(response.data);

        // REMOVE the active timer check from here - we're using separate API
        // Don't set activeTimerLog here anymore
      }
    } catch (error) {
      console.error("Error fetching time logs:", error);
    }
  };

  const initChart = useCallback(() => {
    if (chartInstance.current) chartInstance.current.destroy();

    const weeklyData = processWeeklyTimeData(timeLogs);

    const ctx = chartRef.current.getContext("2d");
    const data = {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Time Spent (hours)",
          data: weeklyData,
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(14, 165, 233, 0.8)",
            "rgba(236, 72, 153, 0.8)",
          ],
          borderColor: [
            "rgb(59, 130, 246)",
            "rgb(16, 185, 129)",
            "rgb(245, 158, 11)",
            "rgb(239, 68, 68)",
            "rgb(139, 92, 246)",
            "rgb(14, 165, 233)",
            "rgb(236, 72, 153)",
          ],
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              label += context.parsed.y.toFixed(1) + " hours";
              return label;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Hours",
          },
          ticks: {
            callback: function (value) {
              return value.toFixed(1) + "h";
            },
          },
          grid: { color: "rgba(0, 0, 0, 0.03)" },
        },
        x: {
          grid: { display: false },
        },
      },
    };

    chartInstance.current = new Chart(ctx, { type: "bar", data, options });
  }, [timeLogs]);

  const processWeeklyTimeData = (logs) => {
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];

    logs.forEach((log) => {
      if (log.startTime && log.durationInMinutes) {
        const startDate = new Date(log.startTime);
        const dayOfWeek = startDate.getDay();
        const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const hours = log.durationInMinutes / 60;
        weeklyData[mondayIndex] += hours;
      }
    });

    return weeklyData;
  };

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`getTaskByItemId/${taskId}`);

      if (response.data) {
        const taskData = response.data.task;
        setCanEdit(response.data.canEdit || false);
        setCanStartTimer(response.data.canStartTimer);
        const formatDate = (dateString) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
          } catch (e) {
            console.error("Error parsing date:", dateString, e);
            return "";
          }
        };

        const formattedAttachments = taskData.attachments || [];

        const assigneeIds = taskData.assignedEmployees
          ? taskData.assignedEmployees.map((emp) => emp.employeeId)
          : [];

        const followerIds = taskData.followersEmployees
          ? taskData.followersEmployees.map((emp) => emp.employeeId)
          : [];

        setTask({
          taskId: taskData.taskId,
          adminId: taskData.adminId || "",
          subject: taskData.subject || "",
          description: taskData.description || "",
          hourlyRate: taskData.hourlyRate || 0,
          startDate: formatDate(taskData.startDate),
          dueDate: formatDate(taskData.endDate),
          priority: taskData.priority || "Medium",
          status: (taskData.status || "NOT_STARTED").toUpperCase(),
          relatedTo: taskData.relatedTo || "",
          relatedId: taskData.relatedToId || "",
          relatedName: taskData.relatedToName || "",
          assignees: assigneeIds,
          followers: followerIds,
          estimateHours: taskData.estimatedHours || 0,
          isBillable: taskData.isBillable || false,
          isPublic: taskData.isPublic || false,
          totalLoggedTime: 0,
          createdAt: taskData.createdAt || "",
          createdBy: taskData.createdBy || "",
          projectName: taskData.projectName || "No Project",
          projectId: taskData.projectId || "N/A",
        });

        setAttachments(formattedAttachments);
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      showErrorAlert("Failed to load task details");
      setCanEdit(false);

      // Set canEdit to false for mock data
      setCanEdit(false);
      const mockTask = {
        id: taskId,
        subject: "Sample Task",
        description: "No description for this task",
        status: "in-progress",
        priority: "medium",
        assignees: [],
        followers: [],
        startDate: "25-11-2024",
        dueDate: "30-11-2024",
        hourlyRate: 0.0,
        isBillable: true,
        isPublic: false,
        totalLoggedTime: 166080,
        projectName: "Sample Project",
        projectId: "#101",
        createdBy: "Admin",
        createdAt: "2024-11-25",
      };

      setTask(mockTask);
    } finally {
      setLoading(false);
    }
  };

  // In PreviewTaskModal.js - Update handleStartTimer function

  const handleStartTimer = async () => {
    if (!taskId) {
      showErrorAlert("No task selected");
      return;
    }

    try {
      const response = await axiosInstance.post("startTimerOfTask", {
        taskId: taskId,
      });

      if (response.data) {
        showAutoCloseSuccess("Timer started");

        // 🔥 UPDATE: Only notify parent about status change, don't update modal state
        if (task && task.status === "NOT_STARTED") {
          // Call parent callback to update TaskList ONLY
          if (onStatusUpdate) {
            onStatusUpdate(taskId, "IN_PROGRESS");
          }

          // DON'T update modal state - keep it as is
          // The modal will show the old status until closed, but that's OK
        }

        checkActiveTimerForCurrentUser();
        fetchTimeLogs();
        fetchActiveTimer();
      }
    } catch (error) {
      console.error("Error starting timer:", error);
      showErrorAlert("Failed to start timer");
    }
  };

  // Add status change handler for modal
  const handleStatusChangeInModal = async (newStatus) => {
    if (!taskId || !task || task.status === newStatus) {
      return;
    }

    const oldStatus = task.status;

    try {
      setStatusLoading(true);

      // Optimistic update: Update local task state immediately
      setTask((prev) => ({
        ...prev,
        status: newStatus,
      }));

      // Call API to update status
      await axiosInstance.put(`updateTaskStatus/${taskId}/${newStatus}`);

      // Notify parent component about the status change
      if (onStatusUpdate) {
        onStatusUpdate(taskId, newStatus);
      }

      showAutoCloseSuccess("Task status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      showErrorAlert("Failed to update status");

      // Revert optimistic update on error
      setTask((prev) => ({
        ...prev,
        status: oldStatus,
      }));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleStopTimer = async () => {
    if (!taskId || !activeTimerLog) {
      showErrorAlert("No active timer to stop");
      return;
    }

    try {
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
              <div class="text-2xl font-bold text-blue-900 font-mono text-center">${formatTime(
                timerSeconds
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
              showErrorAlert("Please enter a note to complete your time entry");
              return false;
            }

            if (value.length > 1000) {
              showErrorAlert("Note cannot exceed 1000 characters");
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

      if (!result.isConfirmed) {
        return;
      }

      const endNote = result.value;

      const response = await axiosInstance.post("stopTimerOfTask", {
        taskId: taskId,
        endNote: endNote,
      });

      if (response.data) {
        showAutoCloseSuccess("Time entry completed successfully");
        setIsTimerRunning(false);
        setActiveTimerLog(null);
        setTimerSeconds(0);
        fetchTimeLogs();
        fetchActiveTimer();
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
      showErrorAlert("Failed to stop timer");
    }
  };

  const handleAssigneesChange = (selectedIds) => {
    if (task) {
      setTask((prev) => ({
        ...prev,
        assignees: selectedIds,
      }));

      // Call parent callback if provided
      if (onAssigneeUpdate) {
        onAssigneeUpdate(selectedIds);
      }
    }
  };

  // Update the handleFollowersChange function
  const handleFollowersChange = (selectedIds) => {
    if (task) {
      setTask((prev) => ({
        ...prev,
        followers: selectedIds,
      }));

      // Call parent callback if provided
      if (onFollowerUpdate) {
        onFollowerUpdate(selectedIds);
      }
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Error formatting date:", dateTimeString, e);
      return dateTimeString;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETE":
        return "bg-green-500 text-white";
      case "IN_PROGRESS":
        return "bg-blue-500 text-white";
      case "TESTING":
        return "bg-yellow-500 text-white";
      case "AWAITING_FEEDBACK":
        return "bg-orange-500 text-white";
      case "NOT_STARTED":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETE":
        return "✓ Complete";
      case "IN_PROGRESS":
        return "▶ In Progress";
      case "TESTING":
        return "🔧 Testing";
      case "AWAITING_FEEDBACK":
        return "⏳ Awaiting Feedback";
      case "NOT_STARTED":
        return "⏸ Not Started";
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1);
    }
  };

  // Add this function after other handler functions
  const handleStatusChange = async (taskId, newStatus) => {
    console.log(
      `handleStatusChange called: taskId=${taskId}, newStatus=${newStatus}`
    );

    try {
      const task = tasks.find((t) => t.taskId === taskId);
      const oldStatus = task?.status;

      // Only proceed if status actually changed
      if (oldStatus === newStatus) {
        return;
      }

      // Update the tasks state (optimistic update for table view)
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, status: newStatus } : task
        )
      );

      // Update task counts
      if (oldStatus && oldStatus !== newStatus) {
        setTaskCounts((prevCounts) => {
          const newCounts = { ...prevCounts };
          newCounts[oldStatus] = Math.max(0, (prevCounts[oldStatus] || 0) - 1);
          newCounts[newStatus] = (prevCounts[newStatus] || 0) + 1;
          return newCounts;
        });
      }

      // Force Kanban refresh
      forceKanbanRefresh();

      // If task is in current filtered view and status changed, remove it
      if (
        viewMode === "table" &&
        statusFilter !== "all" &&
        newStatus !== statusFilter
      ) {
        setTasks((prevTasks) => prevTasks.filter((t) => t.taskId !== taskId));
      }

      // Don't show toast for timer-triggered changes (optional)
      // toast.success("Task status updated!");
    } catch (error) {
      console.error("Error updating status:", error);

      // Revert on error
      handleRefresh();
    }
  };

  // Calculate total time including current session
  const getTotalTime = () => {
    // Sum only completed logs (with endTime and durationInMinutes)
    const totalFromLogs = timeLogs.reduce((total, log) => {
      if (log.endTime && log.durationInMinutes) {
        return total + log.durationInMinutes;
      }
      return total;
    }, 0);

    // Convert minutes to seconds and add current timer (if running)
    return totalFromLogs * 60 + timerSeconds;
  };

  const formatDDMMYYYY = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get display logs - show all logs as they are
  const getDisplayLogs = () => {
    return timeLogs; // Just return all logs
  };
  // Component for note icon with right-side tooltip
  const NoteTooltipIcon = ({ note, noteId, openNoteId, setOpenNoteId }) => {
    const wrapperRef = useRef(null);
    const noteContentRef = useRef(null);
    const isOpen = openNoteId === noteId;

    if (!note) return null;

    return (
      <div ref={wrapperRef} className="relative inline-block ml-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setOpenNoteId(isOpen ? null : noteId);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            setOpenNoteId(isOpen ? null : noteId);
          }}
          className="cursor-pointer text-gray-400 hover:text-blue-500 transition relative"
        >
          <svg
            className="w-4 h-4 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse pointer-events-none"></span>
        </button>

        {isOpen && (
          <div
            ref={noteContentRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute z-80 w-72 p-3 text-xs bg-gray-900 text-white rounded-lg shadow-xl left-full top-1/2 transform -translate-y-1/2 ml-3"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="font-medium text-blue-300 mb-1">Time Log Note</div>

            <div
              className="bg-gray-800 p-2 rounded border border-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#4b5563 #1f2937",
              }}
            >
              {note}
            </div>

            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900"></div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] overflow-hidden">
          <div className="text-center p-4">
            <p className="text-red-500">Task not found</p>
          </div>
        </div>
      </div>
    );
  }

  const displayLogs = getDisplayLogs();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl h-[80vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Task Details</h2>
                <p className="text-blue-100 text-xs">
                  View and manage task information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded transition"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Left Column - Compact Task Info */}
            <div className="lg:col-span-2 border-r border-gray-200 overflow-y-auto p-4">
              {/* Task Header */}
              <div className="mb-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-xl font-bold text-gray-900">
                        {task.subject}
                      </h1>
                    </div>
                    <div className="ml-auto flex items-center gap-3 flex-wrap">
                      {/* Status Dropdown */}
                      <div className="relative">
                        <select
                          value={task.status || "NOT_STARTED"}
                          onChange={(e) =>
                            handleStatusChangeInModal(e.target.value)
                          } // Change this line
                          disabled={statusLoading}
                          className={`px-2 py-1 rounded text-xs font-medium appearance-none pr-6 cursor-pointer ${getStatusColor(
                            task.status
                          )} ${
                            statusLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <option value="NOT_STARTED">Not Started</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="TESTING">Testing</option>
                          <option value="AWAITING_FEEDBACK">
                            Awaiting Feedback
                          </option>
                          <option value="COMPLETE">Complete</option>
                        </select>

                        {/* Dropdown arrow */}
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <span
                        className={`px-4 py-1 rounded text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority || "Medium"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timer Section */}
                {/* Timer Section */}
                <div className="mb-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 text-xs">
                      Time Tracking
                    </h3>
                    {/* Show Stop button only if activeTimerLog exists (from getActiveTimerForTask API) */}
                    {activeTimerLog ? (
                      <button
                        onClick={handleStopTimer}
                        className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white"
                      >
                        <svg
                          className="w-2.5 h-2.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                          />
                        </svg>
                        Stop
                      </button>
                    ) : (
                      <button
                        onClick={canStartTimer ? handleStartTimer : undefined}
                        disabled={!canStartTimer}
                        className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 
                          text-white
                          ${
                            canStartTimer
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        title={
                          canStartTimer
                            ? "Start Task"
                            : "You have not Assignee or Owner of this Task"
                        }
                      >
                        <svg
                          className="w-2.5 h-2.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Start
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="text-center p-1.5 bg-white rounded border border-gray-200">
                      <div className="text-base font-bold text-gray-900 font-mono mb-0.5">
                        {/* Show current session time only if activeTimerLog exists */}
                        {activeTimerLog ? formatTime(timerSeconds) : "00:00:00"}
                      </div>
                      <div className="text-[10px] text-gray-600">
                        Current Session
                      </div>
                      {activeTimerLog && (
                        <div className="text-[10px] text-green-600 mt-0.5 flex items-center justify-center gap-0.5">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          Active
                        </div>
                      )}
                    </div>
                    {/* <div className="text-center p-1.5 bg-white rounded border border-gray-200">
                      <div className="text-base font-bold text-gray-900 font-mono mb-0.5">
                        {formatTime(getTotalTime())}
                      </div>
                      <div className="text-[10px] text-gray-600">
                        Total Time
                      </div>
                    </div> */}
                  </div>
                </div>

                {/* Main Tabs */}
                <div className="mb-4">
                  <div className="border-b border-gray-200">
                    <nav className="flex">
                      <button
                        onClick={() => setActiveTab("timelogs")}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium text-center ${
                          activeTab === "timelogs"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Time Logs
                      </button>
                      <button
                        onClick={() => setActiveTab("statistics")}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium text-center ${
                          activeTab === "statistics"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Statistics
                      </button>
                      <button
                        onClick={() => setActiveTab("comments")}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium text-center ${
                          activeTab === "comments"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Comments
                      </button>
                      <button
                        onClick={() => setActiveTab("attachments")}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium text-center ${
                          activeTab === "attachments"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Attachments
                      </button>
                    </nav>
                  </div>

                  <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-3 h-full">
                    {activeTab === "timelogs" && (
                      <div className="overflow-x-auto min-h-[300px]">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-1.5 text-left font-medium text-gray-500">
                                Member
                              </th>
                              <th className="px-2 py-1.5 text-left font-medium text-gray-500">
                                Start Time
                              </th>
                              <th className="px-2 py-1.5 text-left font-medium text-gray-500">
                                End Time
                              </th>
                              <th className="px-2 py-1.5 text-left font-medium text-gray-500">
                                Duration
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {displayLogs.length > 0 ? (
                              displayLogs.map((log) => (
                                <tr
                                  key={log.taskLogId || log.startTime}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-2 py-1.5 whitespace-nowrap">
                                    <div className="flex items-center group">
                                      <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-1.5">
                                        {getInitials(log.name)}
                                      </div>
                                      <span className="font-medium text-gray-900 text-xs">
                                        {log.name}
                                      </span>
                                      <NoteTooltipIcon
                                        note={log.endNote}
                                        noteId={log.taskLogId}
                                        openNoteId={openNoteId}
                                        setOpenNoteId={setOpenNoteId}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-2 py-1.5 whitespace-nowrap text-gray-900 text-xs">
                                    {formatDateTime(log.startTime)}
                                  </td>
                                  <td className="px-2 py-1.5 whitespace-nowrap text-gray-900 text-xs">
                                    {log.endTime
                                      ? formatDateTime(log.endTime)
                                      : "In Progress"}
                                  </td>
                                  <td className="px-2 py-1.5 whitespace-nowrap">
                                    <div className="font-medium text-gray-900 text-xs">
                                      {
                                        !log.endTime
                                          ? "In Progress"
                                          : formatDuration(
                                              log.durationInMinutes
                                            ) /* For completed logs */
                                      }
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="px-2 py-3 text-center text-gray-500 text-xs"
                                >
                                  No time logs available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === "statistics" && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-xs">
                            Weekly Time Distribution
                          </h4>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
                            <span className="text-[10px] text-gray-600">
                              Time Spent (hours)
                            </span>
                          </div>
                        </div>

                        <div className="relative h-40 mb-2">
                          <canvas ref={chartRef}></canvas>
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <div className="text-gray-500 text-[10px]">
                                Total Time Logged
                              </div>
                              <div className="font-bold text-gray-900 text-xs">
                                {formatTime(getTotalTime())}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-[10px]">
                                Total Entries
                              </div>
                              <div className="font-bold text-gray-900 text-xs">
                                {displayLogs.length} logs
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "comments" && (
                      <div className="h-full">
                        <TaskComments taskId={taskId} />
                      </div>
                    )}

                    {activeTab === "attachments" && (
                      <TaskAttachments
                        taskId={taskId}
                        attachments={attachments}
                        onAttachmentsUpdate={(updatedAttachments) =>
                          setAttachments(updatedAttachments)
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Compact Task Information */}
            <div className="lg:col-span-1 bg-gray-50 overflow-y-auto p-3">
              {/* Task Information Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
                <h3 className="font-semibold text-gray-900 mb-2 text-xs border-b pb-1.5">
                  Task Information
                </h3>

                <div className="space-y-3">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] text-gray-500 font-medium mb-0.5">
                        Start Date
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        {formatDDMMYYYY(task.startDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-medium mb-0.5">
                        Due Date
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        {formatDDMMYYYY(task.dueDate)}
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] text-gray-500 font-medium mb-0.5">
                        Hourly Rate
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        {parseFloat(task.hourlyRate || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div>
                        <div className="text-[10px] text-gray-500 font-medium mb-0.5">
                          Estimate
                        </div>
                        <div className="text-xs font-medium text-gray-900">
                          {task.estimateHours || 0} hours
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estimate & Creator */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] text-gray-500 font-medium mb-0.5">
                        Created by
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {getInitials(task.createdBy)}
                        </div>
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {task.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="text-[10px] text-gray-500 font-medium mb-1">
                      Description
                    </div>
                    <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 max-h-20 overflow-y-auto">
                      {task.description ||
                        "No description provided for this task"}
                    </div>
                  </div>

                  {/* Related to */}
                  {task.relatedTo && task.relatedName && (
                    <div>
                      <div className="text-[10px] text-gray-500 font-medium mb-1">
                        Related to
                      </div>
                      <div className="flex items-start gap-1.5 p-2 bg-blue-50 rounded border border-blue-100">
                        <svg
                          className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <div className="text-xs font-medium text-blue-800">
                          {task.relatedTo.charAt(0).toUpperCase() +
                            task.relatedTo.slice(1)}{" "}
                          - {task.relatedName}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignees Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
                <h3 className="font-semibold text-gray-900 mb-2 text-xs">
                  Assignees
                </h3>

                {canEdit ? (
                  <CircularAssigneesSelector
                    value={task.assignees || []}
                    options={teamMembers}
                    loading={loadingTeam}
                    onChange={handleAssigneesChange}
                    getInitials={getInitials}
                    type="assignees"
                    taskId={taskId}
                    excludeIds={task.followers || []}
                  />
                ) : (
                  // Read-only view
                  <div className="flex flex-wrap gap-1.5">
                    {task.assignees && task.assignees.length > 0 ? (
                      teamMembers
                        .filter((member) =>
                          task.assignees.includes(member.value)
                        )
                        .map((member) => (
                          <div
                            key={member.value}
                            className="relative group w-7 h-7 rounded-full
                         bg-gradient-to-br from-blue-500 to-purple-600
                         flex items-center justify-center
                         text-white text-[10px] font-bold shadow"
                            title={member.label}
                          >
                            {getInitials(member.label)}
                            <div
                              className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 hidden group-hover:block
                              bg-gray-900 text-white text-[9px] rounded px-1.5 py-0.5
                              whitespace-nowrap shadow z-10"
                            >
                              {member.label}
                            </div>
                          </div>
                        ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No assignees
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Followers Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="font-semibold text-gray-900 mb-2 text-xs">
                  Followers
                </h3>

                {canEdit ? (
                  <CircularAssigneesSelector
                    value={task.followers || []}
                    options={teamMembers}
                    loading={loadingTeam}
                    onChange={handleFollowersChange}
                    getInitials={getInitials}
                    type="followers"
                    taskId={taskId}
                    excludeIds={task.assignees || []}
                  />
                ) : (
                  // Read-only view
                  <div className="flex flex-wrap gap-1.5">
                    {task.followers && task.followers.length > 0 ? (
                      teamMembers
                        .filter((member) =>
                          task.followers.includes(member.value)
                        )
                        .map((member) => (
                          <div
                            key={member.value}
                            className="relative group w-7 h-7 rounded-full
                         bg-gradient-to-br from-blue-500 to-purple-600
                         flex items-center justify-center
                         text-white text-[10px] font-bold shadow"
                            title={member.label}
                          >
                            {getInitials(member.label)}
                            <div
                              className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 hidden group-hover:block
                              bg-gray-900 text-white text-[9px] rounded px-1.5 py-0.5
                              whitespace-nowrap shadow z-10"
                            >
                              {member.label}
                            </div>
                          </div>
                        ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No followers
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewTaskModal;
