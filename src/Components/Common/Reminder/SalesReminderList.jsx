import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { showDeleteConfirmation } from "../../BaseComponet/alertUtils";
import SalesCreateReminder from "./SalesCreateReminder";
import SalesEditReminder from "./SalesEditReminder";

function SalesReminderList({ module, referenceId }) {
  // State variables
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  // Skeleton Loader
  const TableSkeleton = ({ rows = 5, cols = 5 }) => {
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

  // Fetch reminders for specific module
  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `getAllReminderForSpecificModule/${module}/${referenceId}`
      );

      if (response.data && Array.isArray(response.data)) {
        setReminders(response.data);
      } else {
        setReminders([]);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load reminders"
      );
      toast.error("Failed to load reminders");
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, [module, referenceId]);

  // Delete reminder
  const handleDelete = async (reminderId, message) => {
    const result = await showDeleteConfirmation(
      `reminder: ${message || "this reminder"}`
    );

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`deleteReminderById/${reminderId}`);
      toast.success("Reminder deleted successfully!");
      fetchReminders();
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

  // Handle create success
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchReminders();
    toast.success("Reminder created successfully!");
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedReminder(null);
    fetchReminders();
    toast.success("Reminder updated successfully!");
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

  // Initial fetch
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[300px]">
        <div className="text-center text-red-600 max-w-md">
          <svg
            className="w-12 h-12 mx-auto mb-3"
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
          <h3 className="text-md font-semibold mb-2">
            Error Loading Reminders
          </h3>
          <p className="mb-3 text-sm">{error}</p>
          <button
            onClick={fetchReminders}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-base font-bold text-gray-900">Reminders</h1>
                <p className="text-xs text-gray-600">
                  Manage reminders for this {module.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700
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
              Create Reminder
            </button>
          </div>
        </div>
      </div>

      {/* Reminders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger Time
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <TableSkeleton rows={5} cols={5} />
              ) : reminders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <div className="text-gray-500">
                      <svg
                        className="w-12 h-12 mx-auto mb-3 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="font-medium">No reminders found</p>
                      <p className="text-sm mt-1">
                        Create your first reminder for this{" "}
                        {module.toLowerCase()}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                reminders.map((reminder) => {
                  const overdue = isOverdue(
                    reminder.triggerTime,
                    reminder.sent
                  );

                  return (
                    <tr
                      key={reminder.reminderId}
                      className={`hover:bg-gray-50 transition-colors ${
                        overdue ? "bg-red-50" : ""
                      }`}
                    >
                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {reminder.customerName || "No Customer"}
                        </div>
                        {reminder.referenceName && (
                          <div className="text-xs text-gray-500">
                            Ref: {reminder.referenceName}
                          </div>
                        )}
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

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            reminder.sent
                          )}`}
                        >
                          {getStatusText(reminder.sent)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(reminder)}
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

                          <button
                            onClick={() =>
                              handleDelete(
                                reminder.reminderId,
                                reminder.message
                              )
                            }
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Reminder Modal */}
      {showCreateModal && (
        <SalesCreateReminder
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          module={module}
          referenceId={referenceId}
        />
      )}

      {/* Edit Reminder Modal */}
      {showEditModal && selectedReminder && (
        <SalesEditReminder
          reminderId={selectedReminder.reminderId}
          onClose={() => {
            setShowEditModal(false);
            setSelectedReminder(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

export default SalesReminderList;
