import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance.js";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import Pagination from "../pagination";
import { hasPermission } from "../../BaseComponet/permissions";
import { showDeleteConfirmation } from "../../BaseComponet/alertUtils";
import CreateTaskModal from "./CreateTaskModal.jsx";
import PreviewTaskModal from "./PreviewTaskModal.jsx";
import EditTaskModal from "./EditTaskModal.jsx";
import { ProgressCard } from "../../BaseComponet/FinancialDashboardComponents.jsx";

function TaskList() {
  const navigate = useNavigate();
  const { LayoutComponent, role } = useLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("NOT_STARTED");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTaskId, setPreviewTaskId] = useState(null);
  const [taskCounts, setTaskCounts] = useState({
    NOT_STARTED: 0,
    IN_PROGRESS: 0,
    TESTING: 0,
    AWAITING_FEEDBACK: 0,
    COMPLETE: 0,
    TOTAL: 0,
  });
  const [listType, setListType] = useState("ASSIGNED");
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'kanban'
  const [showViewDropdown, setShowViewDropdown] = useState(false);

  const InlineSpinner = ({ label = "Loading..." }) => (

    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );

  const TableSkeleton = ({ rows = 5, cols = 8 }) => {
    const r = Array.from({ length: rows });
    const c = Array.from({ length: cols });
    return (
      <tbody>
        {r.map((_, i) => (
          <tr key={i} className="animate-pulse">
            {c.map((_, j) => (
              <td key={j} className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  // Fetch tasks with search and filters
  const fetchTasks = useCallback(
    async (
      page = 0,
      search = "",
      status = "NOT_STARTED",
      priority = "all",
      assignee = "all",
      currentListType = listType
    ) => {
      try {
        setLoading(true);

        // Build API URL with parameters
        let url = `getAllTaskList/${page}/${pageSize}`;
        const params = new URLSearchParams();

        if (search.trim()) params.append("search", search);
        if (status !== "all") params.append("status", status);
        if (priority !== "all") params.append("priority", priority);
        if (assignee !== "all") params.append("assignee", assignee);
        params.append("listType", currentListType);

        if (params.toString()) url += `?${params.toString()}`;

        const response = await axiosInstance.get(url);
        const data = response.data;

        if (data && data.taskList) {
          // Transform API data to match our UI structure
          const transformedTasks = data.taskList.map((task) => ({
            id: task.taskId,
            taskId: task.taskId,
            subject: task.subject,
            description: "", // Not provided in API, you might need to adjust
            status: task.status || "pending", // Adjust based on your API
            priority: (task.priority || "").toLowerCase(),
            assignees: task.assignedEmployees
              ? task.assignedEmployees.map(
                (emp) => emp.name || emp.employeeName || "Unnamed"
              )
              : [],
            startDate: task.startDate,
            dueDate: task.endDate,
            hourlyRate: task.hourlyRate || 0,
            estimateHours: task.estimatedHours || 0,
            tags: task.relatedTo ? [task.relatedTo] : [],
            isPublic: true, // Adjust based on your business logic
            isBillable: true, // Adjust based on your business logic
            createdBy: task.createdBy,
            createdAt: task.createdAt,
            // Add additional fields from API
            adminId: task.adminId,
            employeeId: task.employeeId,
            relatedTo: task.relatedTo,
            relatedToId: task.relatedToId,
            relatedToName: task.relatedToName,
            followersEmployees: task.followersEmployees || [],
          }));

          setTasks(transformedTasks);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.currentPage || 0);
          setTotalItems(data.totalElement || 0);
        } else {
          setTasks([]);
          setTotalPages(1);
          setCurrentPage(0);
          setTotalItems(0);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load tasks"
        );
        toast.error("Failed to load tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, listType]
  );

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
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
    }
  };

  const fetchTaskCounts = useCallback(async () => {
    setLoadingCounts(true);
    try {
      const url = `getTaskCount?listType=${listType}`;
      const response = await axiosInstance.get(url);
      const data = response.data;
      setTaskCounts({
        NOT_STARTED: data.NOT_STARTED || 0,
        IN_PROGRESS: data.IN_PROGRESS || 0,
        TESTING: data.TESTING || 0,
        AWAITING_FEEDBACK: data.AWAITING_FEEDBACK || 0,
        COMPLETE: data.COMPLETE || 0,
        TOTAL: data.TOTAL || 0,
      });
    } catch (err) {
      console.error("Error fetching task counts:", err);
      setTaskCounts({
        NOT_STARTED: 0,
        IN_PROGRESS: 0,
        TESTING: 0,
        AWAITING_FEEDBACK: 0,
        COMPLETE: 0,
        TOTAL: 0,
      });
    } finally {
      setLoadingCounts(false);
    }
  }, [listType]);

  // Single useEffect for data fetching with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTasks(
        0,
        searchTerm,
        statusFilter,
        priorityFilter,
        assigneeFilter,
        listType
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    fetchTasks,
    listType,
  ]);

  useEffect(() => {
    fetchTaskCounts();
  }, [listType, fetchTaskCounts]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchTasks(
        newPage,
        searchTerm,
        statusFilter,
        priorityFilter,
        assigneeFilter
      );
    }
  };

  // Preview Modal handlers
  const handlePreview = (taskId) => {
    setPreviewTaskId(taskId);
    setShowPreviewModal(true);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewTaskId(null);
  };

  // Create Modal handlers
  const handleCreateTask = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    toast.success("Task created successfully!");
    fetchTasks(
      currentPage,
      searchTerm,
      statusFilter,
      priorityFilter,
      assigneeFilter
    );
  };

  // Edit Modal handlers
  const handleEdit = (taskId) => {
    setSelectedTaskId(taskId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTaskId(null);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedTaskId(null);
    toast.success("Task updated successfully!");
    fetchTasks(
      currentPage,
      searchTerm,
      statusFilter,
      priorityFilter,
      assigneeFilter
    );
  };

  const handleRefresh = () => {
    fetchTasks(
      currentPage,
      searchTerm,
      statusFilter,
      priorityFilter,
      assigneeFilter
    );
  };

  const handleDelete = async (taskId, taskName) => {
    try {
      const result = await showDeleteConfirmation(taskName || "this task");

      if (result.isConfirmed) {
        // Remove the task from local state immediately
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.taskId !== taskId)
        );
        setTotalItems((prevTotal) => prevTotal - 1);

        // Call actual API to delete task
        await axiosInstance.delete(`deleteTask/${taskId}`);
        toast.success("Task deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task. Please try again.");
      // Refresh to get actual data
      handleRefresh();
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const taskIndex = tasks.findIndex((t) => t.taskId === taskId);
    if (taskIndex === -1) return;

    const oldStatus = tasks[taskIndex].status;
    if (oldStatus === newStatus) return;

    try {
      setTasks((prevTasks) => {
        if (statusFilter !== "all" && statusFilter !== newStatus) {
          setTotalItems((prev) => prev - 1);
          return prevTasks.filter((task) => task.taskId !== taskId);
        }
        return prevTasks.map((task) =>
          task.taskId === taskId ? { ...task, status: newStatus } : task
        );
      });

      setTaskCounts((prevCounts) => ({
        ...prevCounts,
        [oldStatus]: Math.max(0, (prevCounts[oldStatus] || 0) - 1),
        [newStatus]: (prevCounts[newStatus] || 0) + 1,
      }));

      await axiosInstance.put(`updateTaskStatus/${taskId}/${newStatus}`);
      toast.success("Task status updated!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      handleRefresh();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "TESTING":
        return "bg-yellow-100 text-yellow-800";
      case "AWAITING_FEEDBACK":
        return "bg-orange-100 text-orange-800";
      case "COMPLETE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter options (you might want to fetch these from API)
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "on-hold", label: "On Hold" },
  ];

  const priorityOptions = [
    { value: "all", label: "All Priority" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const handleCardClick = (status) => {
    setStatusFilter(status);
    setCurrentPage(0);
  };

  const handleAssigneeUpdate = (taskId, updatedAssigneeIds) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.taskId === taskId) {
          // Get assignee names from teamMembers
          const updatedAssigneeNames = teamMembers
            .filter(member => updatedAssigneeIds.includes(member.value))
            .map(member => member.label);

          return {
            ...task,
            assignees: updatedAssigneeNames
          };
        }
        return task;
      })
    );
  };
  const handleFollowerUpdate = (taskId, updatedFollowerIds) => {
    // Similar logic for followers if needed
  };

  const getCardActiveStyle = (cardStatus) => {
    const baseStyle =
      "rounded-lg transition-all duration-200 cursor-pointer overflow-hidden";
    if (statusFilter === cardStatus) {
      return `${baseStyle} ring-2 ring-blue-600 ring-inset shadow-lg shadow-blue-100/50 scale-105`;
    }
    return `${baseStyle} opacity-80 hover:opacity-100`;
  };

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600 max-w-md">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Error Loading Tasks</h3>
          <p className="mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Header Section */}
        <div className="">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage and track all your tasks in one place
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 sm:max-w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                  />
                </div>
              </div>

              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                onClick={handleCreateTask}
              >
                <svg
                  className="w-4 h-4"
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
                Create Task
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          {role !== "ROLE_ADMIN" && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 ms-auto">
                <span className="text-sm text-gray-600 font-medium">
                  Switch to {listType === "FOLLOWER" ? "Assigned" : "Follower"}
                  Task
                </span>
                <button
                  type="button"
                  className={`${listType === "FOLLOWER"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 border-[#6366F1]"
                    : "bg-gray-700 border-gray-600"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none`}
                  role="switch"
                  onClick={() =>
                    setListType(
                      listType === "FOLLOWER" ? "ASSIGNED" : "FOLLOWER"
                    )
                  }
                >
                  <span
                    aria-hidden="true"
                    className={`${listType === "FOLLOWER"
                      ? "translate-x-5"
                      : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* CHANGE 4: Clickable Progress Cards wrapped in divs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loadingCounts ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 p-4 rounded-lg animate-pulse"
                >
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                </div>
              ))
            ) : (
              <>
                <div
                  onClick={() => handleCardClick("NOT_STARTED")}
                  className={getCardActiveStyle("NOT_STARTED")}
                >
                  <ProgressCard
                    label="Not Started"
                    count={taskCounts.NOT_STARTED || 0}
                    total={taskCounts.TOTAL || 0}
                    barColorClass="bg-gray-500"
                  />
                </div>

                <div
                  onClick={() => handleCardClick("IN_PROGRESS")}
                  className={getCardActiveStyle("IN_PROGRESS")}
                >
                  <ProgressCard
                    label="In Progress"
                    count={taskCounts.IN_PROGRESS || 0}
                    total={taskCounts.TOTAL || 0}
                    barColorClass="bg-blue-500"
                  />
                </div>

                <div
                  onClick={() => handleCardClick("TESTING")}
                  className={getCardActiveStyle("TESTING")}
                >
                  <ProgressCard
                    label="Testing"
                    count={taskCounts.TESTING || 0}
                    total={taskCounts.TOTAL || 0}
                    barColorClass="bg-yellow-500"
                  />
                </div>

                <div
                  onClick={() => handleCardClick("AWAITING_FEEDBACK")}
                  className={getCardActiveStyle("AWAITING_FEEDBACK")}
                >
                  <ProgressCard
                    label="Awaiting Feedback"
                    count={taskCounts.AWAITING_FEEDBACK || 0}
                    total={taskCounts.TOTAL || 0}
                    barColorClass="bg-orange-500"
                  />
                </div>

                <div
                  onClick={() => handleCardClick("COMPLETE")}
                  className={getCardActiveStyle("COMPLETE")}
                >
                  <ProgressCard
                    label="Completed"
                    count={taskCounts.COMPLETE || 0}
                    total={taskCounts.TOTAL || 0}
                    barColorClass="bg-green-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter Section */}
        {/* <div className="mb-4 bg-white rounded-lg shadow-xs p-3 border border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        
                        <div className="flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                                
                                <div className="min-w-[140px] flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-0.5">
                                        Status
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-3 py-1.5 pl-8 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="min-w-[140px] flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-0.5">
                                        Priority
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={priorityFilter}
                                            onChange={(e) => setPriorityFilter(e.target.value)}
                                            className="w-full px-3 py-1.5 pl-8 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                                        >
                                            {priorityOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="self-end mt-0.5">
                                    <button
                                        onClick={() => {
                                            setStatusFilter('all');
                                            setPriorityFilter('all');
                                            setAssigneeFilter('all');
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center gap-1 border border-gray-200"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                        </svg>
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                    
                        <div className="flex items-center gap-4 border-l border-gray-100 pl-4 mt-2 sm:mt-0">
                            <div className="text-center min-w-[60px]">
                                <div className="text-base font-semibold text-gray-900">{totalItems}</div>
                                <div className="text-[10px] text-gray-500">Total</div>
                            </div>
                            <div className="text-center min-w-[60px]">
                                <div className="text-base font-semibold text-green-600">
                                    {tasks.filter(t => t.status === "completed").length}
                                </div>
                                <div className="text-[10px] text-gray-500">Done</div>
                            </div>
                            <div className="text-center min-w-[60px]">
                                <div className="text-base font-semibold text-blue-600">
                                    {tasks.filter(t => t.status === "in-progress").length}
                                </div>
                                <div className="text-[10px] text-gray-500">Active</div>
                            </div>
                        </div>
                    </div>
                </div> */}

        {/* Table View */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto crm-Leadlist-kanbadn-col-list">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TASK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRIORITY
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ASSIGNEES
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATES
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RELATED TO
                  </th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={6} cols={7} />
              ) : (
                <tbody className="bg-white overflow-x-auto">
                  {tasks.map((task) => {
                    const isOverdue = task.dueDate &&
                      new Date(task.dueDate) < new Date() &&
                      task.status !== "COMPLETE";

                    return (
                      <tr
                        key={task.taskId}
                        className={`hover:bg-gray-50 transition-colors duration-150 group ${isOverdue
                          ? "border-l-3 border-l-red-600 !border-l-red-600 shadow-[inset_4px_0_0_0_rgb(220,38,38)]"
                          : ""
                          }`}
                      >

                        {/* Task Details */}
                        <td className="px-4 py-3">
                          <div className="min-w-[200px]">
                            <div
                              className="font-semibold text-gray-900 mb-1 truncate"
                              title={task.subject}
                            >
                              {task.subject}
                            </div>

                            <div className="mt-2">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => handleEdit(task.taskId)}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="Edit Task"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(task.taskId, task.subject)
                                  }
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  title="Delete Task"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>

                                <button
                                  onClick={() => handlePreview(task.taskId)}
                                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                  title="View Details"
                                >
                                  <svg
                                    className="w-4 h-4"
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
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task.taskId, e.target.value)
                            }
                            className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                              task.status
                            )} border-none focus:ring-0 focus:border-none cursor-pointer`}
                          >
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="TESTING">Testing</option>
                            <option value="AWAITING_FEEDBACK">
                              Awaiting Feedback
                            </option>
                            <option value="COMPLETE">Complete</option>
                          </select>
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority
                              ? task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)
                              : "Medium"}
                          </span>
                        </td>

                        {/* Assignees */}
                        {/* Replace the current assignees cell */}
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {task.assignees.length > 0 ? (
                              <div className="flex -space-x-2">
                                {task.assignees
                                  .slice(0, 3)
                                  .map((assignee, index) => (
                                    <div
                                      key={index}
                                      className="relative group"
                                      title={`${assignee}${index === 2 && task.assignees.length > 3
                                        ? ` +${task.assignees.length - 3} more`
                                        : ""
                                        }`}
                                    >
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm">
                                        {assignee.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                  ))}
                                {task.assignees.length > 3 && (
                                  <div
                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold border-2 border-white shadow-sm"
                                    title={`${task.assignees
                                      .slice(3)
                                      .join(", ")}`}
                                  >
                                    +{task.assignees.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 italic">
                                Unassigned
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 text-xs">Start:</span>
                              <span className="font-medium">
                                {formatDate(task.startDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 text-xs">Due:</span>
                              <span
                                className={`font-medium ${task.dueDate &&
                                  new Date(task.dueDate) < new Date() &&
                                  task.status !== "COMPLETE"
                                  ? "text-red-600 font-semibold"
                                  : ""
                                  }`}
                              >
                                {task.dueDate ? formatDate(task.dueDate) : "N"}
                              </span>
                            </div>
                          </div>
                        </td>



                        {/* Related To */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5 min-w-[120px]">
                            {task.relatedTo ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  {task.relatedTo}
                                </span>
                                {task.relatedToName && (
                                  <span
                                    className="text-xs text-gray-600 truncate max-w-[100px]"
                                    title={task.relatedToName}
                                  >
                                    {task.relatedToName}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 italic px-2">
                                Not linked
                              </span>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>

          {!loading && tasks.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first task."}
              </p>
              {!searchTerm &&
                statusFilter === "all" &&
                priorityFilter === "all" && (
                  <button
                    onClick={handleCreateTask}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Create Your First Task
                  </button>
                )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            fetchTasks(
              0,
              searchTerm,
              statusFilter,
              priorityFilter,
              assigneeFilter
            );
          }}
          itemsName="tasks"
          showPageSize={true}
          sticky={true}
        />
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Preview Task Modal */}
      {showPreviewModal && previewTaskId && (
        <PreviewTaskModal
          taskId={previewTaskId}
          onClose={handleClosePreviewModal}
          onStatusUpdate={handleStatusChange}
          onAssigneeUpdate={(updatedAssigneeIds) =>
            handleAssigneeUpdate(previewTaskId, updatedAssigneeIds)
          }
          onFollowerUpdate={(updatedFollowerIds) =>
            handleFollowerUpdate(previewTaskId, updatedFollowerIds)
          }
        />
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTaskId && (
        <EditTaskModal
          taskId={selectedTaskId}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </LayoutComponent>
  );
}

export default TaskList;
