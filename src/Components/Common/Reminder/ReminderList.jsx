import React, { useState, useEffect, useCallback } from "react";
import { useLayout } from "../../Layout/useLayout";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Pagination from "../pagination";
import { hasPermission } from "../../BaseComponet/permissions";
import { showDeleteConfirmation } from "../../BaseComponet/alertUtils";
import CreateReminder from "./CreateReminder"; // Import the CreateReminder component
import EditReminder from "./EditReminder.jsx";

function ReminderList() {
  const { LayoutComponent } = useLayout();

  // State variables
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Skeleton Loader
  const TableSkeleton = ({ rows = 5, cols = 6 }) => {
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

  // Fetch reminders
  const fetchReminders = useCallback(
    async (page = 0) => {
      try {
        setLoading(true);

        // Build URL with parameters
        let url = `getAllReminder?page=${page}&size=${pageSize}`;

        if (searchTerm.trim()) {
          url += `&search=${searchTerm}`;
        }

        // Add date parameters if provided
        if (startDate) {
          url += `&startDate=${startDate}`;
        }

        if (endDate) {
          url += `&endDate=${endDate}`;
        }

        const response = await axiosInstance.get(url);
        const data = response.data;

        if (data && Array.isArray(data.content)) {
          setReminders(data.content);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.number || 0);
          setTotalItems(data.totalElements || 0);
        } else {
          setReminders([]);
          setTotalPages(1);
          setCurrentPage(0);
          setTotalItems(0);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching reminders:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load reminders"
        );
        toast.error("Failed to load reminders");
        setReminders([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, searchTerm, startDate, endDate] // Add startDate and endDate to dependencies
  );

  // Add date change handler
  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      setStartDate(value);
    } else if (name === "endDate") {
      setEndDate(value);
    }

    // Reset to first page when date changes
    fetchReminders(0);
  };
  // Delete reminder
  const handleDelete = async (reminderId, message) => {
    const result = await showDeleteConfirmation(
      `reminder: ${message || "this reminder"}`
    );

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`deleteReminderById/${reminderId}`);
      toast.success("Reminder deleted successfully!");
      fetchReminders(currentPage);
    } catch (error) {
      const message = error?.response?.data || "Failed to delete reminder";
      toast.error(message);
    }
  };

  // Edit reminder
  const handleEdit = (reminder) => {
    setSelectedReminder(reminder);
    setShowEditModal(true);
  };

  // Handle row click
  const handleRowClick = (reminder) => {
    handleEdit(reminder);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchReminders(newPage);
      setCurrentPage(newPage);
    }
  };


  const handleResetSearch = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    fetchReminders(0);
  };
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (sent) => {
    return sent ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
  };

  // Get status text
  const getStatusText = (sent) => {
    return sent ? "Sent" : "Pending";
  };

  // Check if reminder is overdue
  const isOverdue = (triggerTime, sent) => {
    if (sent) return false;
    const now = new Date();
    const trigger = new Date(triggerTime);
    return trigger < now;
  };

  // Fetch reminders with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReminders(0);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchReminders]);

  // Handle create success
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchReminders(currentPage);
    toast.success("Reminder created successfully!");
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
          <h3 className="text-lg font-semibold mb-2">
            Error Loading Reminders
          </h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => fetchReminders(0)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Reminders</h1>
                  <p className="text-xs text-gray-600">
                    Manage all your reminders
                  </p>
                </div>
              </div>
            </div>
            {/* Search and Create Button */}
        
            <div className="flex items-center gap-2">
              {/* Date Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={handleDateChange}
                    max={endDate || undefined}
                    className="w-full px-2 py-1 h-7 border border-gray-300 rounded-md 
                   focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
                <div className="relative">
                  <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={handleDateChange}
                    min={startDate || undefined}
                    className="w-full px-2 py-1 h-7 border border-gray-300 rounded-md 
                   focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* Existing search input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg
                    className="w-3 h-3 text-gray-400"
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
                  placeholder="Search reminders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-52 pl-7 pr-2 py-1 h-7 border border-gray-300
                 rounded-md focus:ring-1 focus:ring-blue-500
                 focus:border-blue-500 text-xs bg-white"
                />
              </div>

              {/* Rest of your buttons remain the same */}
              <button
                onClick={handleResetSearch}
                className="px-2 py-1 h-7 border border-gray-300 text-gray-700
               rounded-md hover:bg-gray-50 transition text-xs"
              >
                Reset
              </button>

               {hasPermission("reminder", "Edit") && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-2 py-1 h-7 bg-blue-600 hover:bg-blue-700
               text-white rounded-md transition
               flex items-center gap-1 text-xs shadow-sm"
              >
                <svg
                  className="w-3 h-3"
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
                Create
              </button>

               )}
            </div>
          </div>
        </div>

        {/* Reminders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trigger Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reminders.map((reminder) => {
                  const overdue = isOverdue(
                    reminder.triggerTime,
                    reminder.sent
                  );

                  return (
                    <tr
                      key={reminder.reminderId}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer group ${
                        overdue ? "bg-red-50" : ""
                      }`}
                      onClick={() => handleRowClick(reminder)}
                    >
                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div
                          className="font-medium text-gray-900 truncate"
                          title={reminder.customerName}
                        >
                          {reminder.customerName || "No Customer"}
                        </div>
                        {reminder.referenceName && (
                          <div className="text-xs text-gray-500">
                            Ref: {reminder.referenceName}
                          </div>
                        )}

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(reminder);
                            }}
                            className="p-1 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit Reminder"
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

                          {hasPermission("reminder", "Delete") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(
                                reminder.reminderId,
                                reminder.message
                              );
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Reminder"
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
                        )} 
                        </div>
                      </td>

                      {/* Message */}
                      <td className="px-4 py-3">
                        <div
                          className="text-sm text-gray-600 max-w-xs truncate"
                          title={reminder.message}
                        >
                          {reminder.message}
                        </div>
                      </td>

                      {/* Trigger Time */}
                      <td className="px-4 py-3">
                        <div
                          className={`text-sm ${
                            overdue ? "text-red-600 font-semibold" : ""
                          }`}
                        >
                          {formatDate(reminder.triggerTime)}
                        </div>
                        {overdue && (
                          <div className="text-xs text-red-500">Overdue</div>
                        )}
                      </td>

                      {/* Module */}
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {reminder.relatedModule || "N/A"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              reminder.sent
                            )}`}
                          >
                            {getStatusText(reminder.sent)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Empty State */}
            {!loading && reminders.length === 0 && (
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No reminders found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "Get started by creating your first reminder."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Create Your First Reminder
                  </button>
                )}
              </div>
            )}
          </div>
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
            fetchReminders(0);
          }}
          itemsName="reminders"
          showPageSize={true}
          sticky={true}
        />
      </div>
      {/* Create Reminder Modal - Using the actual CreateReminder component */}
      {showCreateModal && (
        <CreateReminder
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Reminder Modal */}
      {showEditModal && selectedReminder && (
        <EditReminder
          reminderId={selectedReminder.reminderId}
          onClose={() => {
            setShowEditModal(false);
            setSelectedReminder(null);
          }}
          onSuccess={(updatedReminder) => {
            setShowEditModal(false);
            setSelectedReminder(null);
            toast.success("Reminder updated successfully!");
            fetchReminders(currentPage);
          }}
        />
      )}
    </LayoutComponent>
  );
}

export default ReminderList;
