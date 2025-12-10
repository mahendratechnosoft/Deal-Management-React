import React, { useState, useEffect } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
  GlobalMultiSelectField,
} from "../../BaseComponet/CustomerFormInputs";

import {
  formatInvoiceNumber,
  formatProposalNumber,
  formatCurrency,
} from "../../BaseComponet/UtilFunctions"; // Adjust the path as needed

function EditTaskModal({ taskId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [relatedData, setRelatedData] = useState([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(false);

  const [formData, setFormData] = useState({
    taskId: "",
    adminId: "",
    employeeId: null,
    subject: "",
    description: "",
    hourlyRate: "",
    startDate: "",
    dueDate: "",
    priority: "Medium",
    relatedTo: "",
    relatedId: "",
    relatedName: "",
    assignees: [],
    followers: [],
    estimateHours: "",
    status: "pending",
    createdAt: "",
    createdBy: "",
  });

  const [errors, setErrors] = useState({});

  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Urgent", label: "Urgent" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "on-hold", label: "On Hold" },
  ];

  const relatedToOptions = [
    { value: "", label: "Non selected" },
    { value: "lead", label: "Lead" },
    { value: "customer", label: "Customer" },
    { value: "proposal", label: "Proposal" },
    { value: "proforma", label: "Proforma" },
    { value: "invoice", label: "Invoice" },
  ];

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Fetch task data when taskId changes
  useEffect(() => {
    if (taskId) {
      fetchTaskData();
    }
  }, [taskId]);

  // Fetch related data when relatedTo changes
  useEffect(() => {
    if (formData.relatedTo) {
      fetchRelatedData();
    } else {
      setRelatedData([]);
      setFormData((prev) => ({
        ...prev,
        relatedId: "",
        relatedName: "",
      }));
    }
  }, [formData.relatedTo]);

  const fetchTeamMembers = async () => {
    setLoadingTeam(true);
    try {
      const response = await axiosInstance.get("getEmployeeNameAndId");
      if (response.data && Array.isArray(response.data)) {
        // Format for react-select
        const formattedTeamMembers = response.data.map((member) => ({
          value: member.employeeId,
          label: member.name,
        }));
        setTeamMembers(formattedTeamMembers);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoadingTeam(false);
    }
  };

  const fetchRelatedData = async () => {
    if (!formData.relatedTo) return;

    setLoadingRelatedData(true);
    try {
      let endpoint = "";

      // Updated API endpoints
      switch (formData.relatedTo) {
        case "lead":
          endpoint = "getLeadNameAndIdWithConverted";
          break;
        case "customer":
          endpoint = "getCustomerListWithNameAndId";
          break;
        case "proforma":
          endpoint = "getProformaNumberAndId";
          break;
        case "proposal":
          endpoint = "getProposalNumberAndId";
          break;
        case "invoice":
          endpoint = "getInvoiceNumberAndId";
          break;
        default:
          return;
      }

      const response = await axiosInstance.get(endpoint);
      const responseData = response.data || [];

      if (Array.isArray(responseData)) {
        // Format data using utility functions
        const formattedData = responseData.map((item) => {
          switch (formData.relatedTo) {
            case "lead":
              return {
                id: item.leadId || item.id,
                name: item.clientName || `Lead #${item.leadId || item.id}`,
                email: item.email || "",
                phone: item.phone || "",
                originalData: item,
              };

            case "customer":
              return {
                id: item.id,
                name: `${item.companyName || "Customer"} (${
                  item.email || "No email"
                })`,
                email: item.email || "",
                phone: item.phone || "",
                originalData: item,
              };

            case "proforma":
              return {
                id: item.proformaInvoiceId || item.id,
                name: item.proformaInvoiceNumber
                  ? formatInvoiceNumber(item.proformaInvoiceNumber)
                  : `Proforma #${item.proformaInvoiceId || item.id}`,
                number: item.proformaInvoiceNumber || "",
                amount: item.totalAmount || 0,
                currency: item.currency || "INR",
                originalData: item,
              };

            case "proposal":
              return {
                id: item.proposalId || item.id,
                name: item.proposalNumber
                  ? formatProposalNumber(item.proposalNumber)
                  : `Proposal #${item.proposalId || item.id}`,
                number: item.proposalNumber || "",
                amount: item.totalAmount || 0,
                currency: item.currency || "INR",
                originalData: item,
              };

            case "invoice":
              return {
                id: item.invoiceId || item.id,
                name: item.invoiceNumber
                  ? formatInvoiceNumber(item.invoiceNumber)
                  : `Invoice #${item.invoiceId || item.id}`,
                number: item.invoiceNumber || "",
                amount: item.totalAmount || 0,
                currency: item.currency || "INR",
                date: item.invoiceDate || "",
                originalData: item,
              };

            default:
              return {
                id: item.id,
                name: String(item.name || item.title || `Item #${item.id}`),
                originalData: item,
              };
          }
        });

        setRelatedData(formattedData);
      } else {
        toast.error(`No ${formData.relatedTo} data found`);
        setRelatedData([]);
      }
    } catch (error) {
      console.error(`Error fetching ${formData.relatedTo} data:`, error);
      toast.error(`Failed to load ${formData.relatedTo} data`);
      setRelatedData([]);
    } finally {
      setLoadingRelatedData(false);
    }
  };

  const fetchTaskData = async () => {
    try {
      setLoadingTask(true);
      const response = await axiosInstance.get(`getTaskByItemId/${taskId}`);

      if (response.data) {
        const taskData = response.data.task;
        const canStartTimer = response.data.canStartTimer;

        // Format dates to YYYY-MM-DD for input fields
        const formatDate = (dateString) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            return date.toISOString().split("T")[0];
          } catch (e) {
            console.error("Error parsing date:", dateString, e);
            return "";
          }
        };

        // Extract assignee and follower IDs from the response
        const assigneeIds = taskData.assignedEmployees
          ? taskData.assignedEmployees.map((emp) => emp.employeeId)
          : [];

        const followerIds = taskData.followersEmployees
          ? taskData.followersEmployees.map((emp) => emp.employeeId)
          : [];

        // Set form data with the fetched task data
        setFormData({
          taskId: taskData.taskId,
          adminId: taskData.adminId || "",
          employeeId: taskData.employeeId || null,
          subject: taskData.subject || "",
          description: taskData.description || "",
          hourlyRate: taskData.hourlyRate?.toString() || "",
          startDate: formatDate(taskData.startDate),
          dueDate: formatDate(taskData.endDate), // Note: API returns 'endDate' not 'dueDate'
          priority: taskData.priority || "Medium",
          relatedTo: taskData.relatedTo || "",
          relatedId: taskData.relatedToId || "",
          relatedName: taskData.relatedToName || "",
          assignees: assigneeIds,
          followers: followerIds,
          estimateHours: taskData.estimatedHours?.toString() || "",
          status: taskData.status || "pending",
          // Include createdAt and createdBy from API
          createdAt: taskData.createdAt || "",
          createdBy: taskData.createdBy || "",
        });

        // If task has relatedTo, fetch the related data
        if (taskData.relatedTo) {
          // Small delay to ensure state is updated
          setTimeout(() => {
            fetchRelatedData();
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error fetching task data:", error);
      toast.error("Failed to load task data");
    } finally {
      setLoadingTask(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    // Reset related fields when relatedTo changes
    if (name === "relatedTo") {
      updatedFormData.relatedId = "";
      updatedFormData.relatedName = "";
      setRelatedData([]);
    }

    setFormData(updatedFormData);

    // Clear error for this field if exists
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAssigneesChange = (selectedIds) => {
    setFormData((prev) => ({
      ...prev,
      assignees: selectedIds,
    }));
  };

  const handleFollowersChange = (selectedIds) => {
    setFormData((prev) => ({
      ...prev,
      followers: selectedIds,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject?.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    // Check due date only if it's provided
    if (formData.dueDate && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);

      if (dueDate < startDate) {
        newErrors.dueDate = "Due date cannot be before start date";
      }
    }

    if (formData.hourlyRate && parseFloat(formData.hourlyRate) < 0) {
      newErrors.hourlyRate = "Hourly rate cannot be negative";
    }

    if (formData.estimateHours && parseFloat(formData.estimateHours) < 0) {
      newErrors.estimateHours = "Estimate hours cannot be negative";
    }

    // Validate relatedId if relatedTo is selected
    if (formData.relatedTo && !formData.relatedId) {
      newErrors.relatedId = `Please select a ${formData.relatedTo}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        taskId: formData.taskId,
        adminId: formData.adminId,
        employeeId: formData.employeeId,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
        priority: formData.priority,
        relatedTo: formData.relatedTo || null,
        relatedToId: formData.relatedId || null,
        relatedToName: formData.relatedName || null,
        assignedEmployees: formData.assignees.map((employeeId) => ({
          employeeId: employeeId,
        })),
        followersEmployees: formData.followers.map((employeeId) => ({
          employeeId: employeeId,
        })),
        estimatedHours: formData.estimateHours
          ? parseFloat(formData.estimateHours)
          : null,
        status: formData.status,
        // Include createdAt and createdBy from fetched data
        createdAt: formData.createdAt,
        createdBy: formData.createdBy,
      };

      const response = await axiosInstance.put("updateTask", payload);

      if (response.data) {
        toast.success("Task updated successfully!");
        onSuccess();
      } else {
        throw new Error("No response data received");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getMinDueDate = () => {
    return formData.startDate;
  };

  // Format related data for GlobalSelectField
  const relatedOptions = relatedData.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  // Add current related item if not in the list
  if (
    formData.relatedId &&
    formData.relatedName &&
    !relatedOptions.some((opt) => opt.value === formData.relatedId)
  ) {
    relatedOptions.unshift({
      value: formData.relatedId,
      label: formData.relatedName,
    });
  }

  // Read-only info display for createdAt and createdBy
  const displayCreatedInfo = () => {
    if (!formData.createdAt && !formData.createdBy) return null;

    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return dateString;
      }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">
            Created By
          </label>
          <div className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded border border-gray-200">
            {formData.createdBy || "N/A"}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">
            Created At
          </label>
          <div className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded border border-gray-200">
            {formData.createdAt ? formatDate(formData.createdAt) : "N/A"}
          </div>
        </div>
      </div>
    );
  };

  if (loadingTask) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
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
              </div>
              <div>
                <h2 className="text-lg font-bold">Edit Task</h2>
                <p className="text-blue-100 text-xs">Update task information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <form onSubmit={handleSubmit}>
            {/* Form Grid - Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Subject - Full width */}
              <div className="md:col-span-2">
                <GlobalInputField
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required={true}
                  error={errors.subject}
                  placeholder="Enter task subject"
                  className="text-sm"
                />
              </div>

              {/* Status */}
              <GlobalSelectField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                className="text-sm"
              />

              {/* Hourly Rate */}
              <GlobalInputField
                label="Hourly Rate"
                name="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={handleChange}
                error={errors.hourlyRate}
                placeholder="0"
                min="0"
                step="0.01"
                className="text-sm"
              />

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-2">
                <GlobalInputField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required={true}
                  error={errors.startDate}
                  className="text-sm"
                />

                <GlobalInputField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  error={errors.dueDate}
                  min={getMinDueDate()}
                  className="text-sm"
                />
              </div>

              {/* Priority */}
              <GlobalSelectField
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
                className="text-sm"
              />

              {/* Related To */}
              <GlobalSelectField
                label="Related To"
                name="relatedTo"
                value={formData.relatedTo}
                onChange={handleChange}
                options={relatedToOptions}
                className="text-sm"
              />

              {/* MultiSelect for Assignees */}
              <GlobalMultiSelectField
                label="Assignees"
                name="assignees"
                value={formData.assignees}
                onChange={handleAssigneesChange}
                options={teamMembers}
                placeholder="Select assignees..."
                loading={loadingTeam}
                className="text-sm"
                isSearchable={true}
                closeMenuOnSelect={false}
              />

              {/* MultiSelect for Followers */}
              <GlobalMultiSelectField
                label="Followers"
                name="followers"
                value={formData.followers}
                onChange={handleFollowersChange}
                options={teamMembers}
                placeholder="Select followers..."
                loading={loadingTeam}
                className="text-sm"
                isSearchable={true}
                closeMenuOnSelect={false}
              />

              {/* Related Item Selection */}
              {formData.relatedTo && (
                <GlobalSelectField
                  label={`Select ${
                    formData.relatedTo.charAt(0).toUpperCase() +
                    formData.relatedTo.slice(1)
                  }`}
                  name="relatedId"
                  value={formData.relatedId}
                  onChange={(e) => {
                    const selected = relatedData.find(
                      (item) => item.id === e.target.value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      relatedId: e.target.value,
                      relatedName: selected?.name || "",
                    }));
                  }}
                  options={relatedOptions}
                  loading={loadingRelatedData}
                  error={errors.relatedId}
                  className="text-sm"
                />
              )}

              {/* Estimate Hours */}
              <GlobalInputField
                label="Estimate hours"
                name="estimateHours"
                type="number"
                value={formData.estimateHours}
                onChange={handleChange}
                error={errors.estimateHours}
                placeholder="0"
                min="0"
                step="0.5"
                className="text-sm"
              />
            </div>

            {/* Task Description - Full width */}
            <div className="mt-3">
              <GlobalTextAreaField
                label="Task Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add Description"
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Display Created Info (Read-only) */}
            {displayCreatedInfo()}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-xs font-medium"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1.5"></div>
                  Updating...
                </>
              ) : (
                "Update Task"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal;
