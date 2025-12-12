import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
  CustomMultiSelectWithExclusion
} from "../../BaseComponet/CustomerFormInputs";
import {
  formatInvoiceNumber,
  formatProposalNumber,
  formatDate,
  formatCurrency
} from "../../BaseComponet/UtilFunctions";

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
  repeatEvery: "",
  relatedTo: "",
  relatedId: "",
  relatedName: "",
  assignees: [],
  followers: [],
  tags: [],
  estimateHours: "",
  status: "NOT_STARTED",
  priority: "Medium", // Add this
  createdAt: "",
  createdBy: "",
});

  const [errors, setErrors] = useState({});



  const statusOptions = [
    { value: "NOT_STARTED", label: " Not Started" },
    { value: "IN_PROGRESS", label: " In Progress" },
    { value: "TESTING", label: " Testing" },
    { value: "AWAITING_FEEDBACK", label: " Awaiting Feedback" },
    { value: "COMPLETE", label: " Complete" }
  ];

  const relatedToOptions = [
    { value: "", label: "Non selected" },
    { value: "lead", label: "Lead" },
    { value: "customer", label: "Customer" },
    { value: "proposal", label: "Proposal" },
    { value: "proforma", label: "Proforma" },
    { value: "invoice", label: "Invoice" }
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
        const formattedData = responseData.map((item) => {
          switch (formData.relatedTo) {
            case "lead":
              return {
                id: item.leadId || item.id,
                name: item.clientName || `Lead #${item.leadId || item.id}`,
                originalData: item
              };

            case "customer":
              return {
                id: item.id,
                name: `${item.companyName || 'Customer'} (${item.email || 'No email'})`,
                originalData: item
              };

            case "proforma":
              return {
                id: item.proformaInvoiceId || item.id,
                name: formatInvoiceNumber(item.proformaInvoiceNumber) ||
                  `Proforma #${item.proformaInvoiceId || item.id}`,
                originalData: item
              };

            case "proposal":
              return {
                id: item.proposalId || item.id,
                name: formatProposalNumber(item.proposalNumber) ||
                  `Proposal #${item.proposalId || item.id}`,
                originalData: item
              };

            case "invoice":
              return {
                id: item.invoiceId || item.id,
                name: formatInvoiceNumber(item.invoiceNumber) ||
                  `Invoice #${item.invoiceId || item.id}`,
                amount: item.totalAmount ? formatCurrency(item.totalAmount, item.currency) : '',
                originalData: item
              };

            default:
              return {
                id: item.id,
                name: String(item.name || item.title || `Item #${item.id}`),
                originalData: item
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

        // Format dates to YYYY-MM-DD for input fields
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            return date.toISOString().split("T")[0];
          } catch (e) {
            console.error("Error parsing date:", dateString, e);
            return "";
          }
        };

        // Extract assignee and follower IDs
        const assigneeIds = taskData.assignedEmployees
          ? taskData.assignedEmployees.map((emp) => emp.employeeId)
          : [];

        const followerIds = taskData.followersEmployees
          ? taskData.followersEmployees.map((emp) => emp.employeeId)
          : [];

        // Set form data
        setFormData({
          taskId: taskData.taskId,
          adminId: taskData.adminId || "",
          employeeId: taskData.employeeId || null,
          subject: taskData.subject || "",
          description: taskData.description || "",
          hourlyRate: taskData.hourlyRate?.toString() || "",
          startDate: formatDateForInput(taskData.startDate),
          dueDate: formatDateForInput(taskData.endDate),
      
          relatedTo: taskData.relatedTo || "",
          relatedId: taskData.relatedToId || "",
          relatedName: taskData.relatedToName || "",
          assignees: assigneeIds,
          followers: followerIds,
          estimateHours: taskData.estimatedHours?.toString() || "",
          status: (taskData.status || "NOT_STARTED").toUpperCase(),
          createdAt: taskData.createdAt || "",
          createdBy: taskData.createdBy || "",
        });

        // If task has relatedTo, fetch the related data
        if (taskData.relatedTo) {
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

    let processedValue = value;

    switch (name) {
      case 'subject':
        if (value.length <= 150) {
          processedValue = value;
        } else {
          return;
        }
        break;

      case 'description':
        if (value.length <= 500) {
          processedValue = value;
        } else {
          return;
        }
        break;

      case 'hourlyRate':
      case 'estimateHours':
        if (value === '') {
          processedValue = value;
        } else {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            processedValue = value;
          } else {
            const intPart = Math.floor(numValue).toString();
            if (intPart.length > 4) {
              return;
            }
            processedValue = value;
          }
        }
        break;

      default:
        processedValue = value;
    }

    const updatedFormData = {
      ...formData,
      [name]: processedValue,
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

    // Subject validation
    if (!formData.subject?.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length > 150) {
      newErrors.subject = "Subject cannot exceed 150 characters";
    }

    // Start date validation
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    // Due date validation
    if (formData.dueDate && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);

      if (dueDate < startDate) {
        newErrors.dueDate = "Due date cannot be before start date";
      }
    }

    // Hourly rate validation
    if (formData.hourlyRate) {
      const hourlyRateNum = parseFloat(formData.hourlyRate);
      if (hourlyRateNum < 0) {
        newErrors.hourlyRate = "Hourly rate cannot be negative";
      } else if (hourlyRateNum.toString().split('.')[0].length > 4) {
        newErrors.hourlyRate = "Hourly rate cannot exceed 4 digits";
      }
    }

    // Estimate hours validation
    if (formData.estimateHours) {
      const estimateHoursNum = parseFloat(formData.estimateHours);
      if (estimateHoursNum < 0) {
        newErrors.estimateHours = "Estimate hours cannot be negative";
      } else if (estimateHoursNum.toString().split('.')[0].length > 4) {
        newErrors.estimateHours = "Estimate hours cannot exceed 4 digits";
      }
    }

    // Description validation
    if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    // Related ID validation
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
    // Construct the payload in the exact format the API expects
    const payload = {
      taskId: formData.taskId,
      adminId: formData.adminId,
      employeeId: formData.employeeId,
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      startDate: formData.startDate,
      endDate: formData.dueDate || null,
      priority: "Medium", // You need to add this to your form if it's not included
      relatedTo: formData.relatedTo || null,
      relatedToId: formData.relatedId || null,
      relatedToName: formData.relatedName || null,
      hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0,
      estimatedHours: formData.estimateHours ? parseFloat(formData.estimateHours) : 0,
      status: formData.status,
      // Build assignedEmployees array
      assignedEmployees: formData.assignees.map(employeeId => {
        const employee = teamMembers.find(member => member.value === employeeId);
        return {
          employeeId: employeeId,
          name: employee ? employee.label : `Employee ${employeeId}`
        };
      }),
      // Build followersEmployees array
      followersEmployees: formData.followers.map(employeeId => {
        const employee = teamMembers.find(member => member.value === employeeId);
        return {
          employeeId: employeeId,
          name: employee ? employee.label : `Employee ${employeeId}`
        };
      }),
      createdAt: formData.createdAt,
      createdBy: formData.createdBy,
    };

    console.log('Sending update payload:', JSON.stringify(payload, null, 2));

    // Send the payload directly (not wrapped in a task object)
    const response = await axiosInstance.put("updateTask", payload);

    if (response.data) {
      toast.success("Task updated successfully!");
      onSuccess();
    } else {
      throw new Error("No response data received");
    }
  } catch (error) {
    console.error("Error updating task:", error);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);

      if (error.response.status === 500) {
        toast.error('Server error: ' + (error.response.data?.message || 'Check console for details'));
      } else {
        toast.error('Failed to update task: ' + (error.response.data?.message || 'Unknown error'));
      }
    } else if (error.request) {
      console.error('Request error:', error.request);
      toast.error('Network error. Please check your connection.');
    } else {
      console.error('Error:', error.message);
      toast.error('Failed to update task. Please try again.');
    }
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

 

  // Get status color classes
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
                <div className="relative">
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
                  <div className="absolute right-2 top-0 text-xs text-gray-500">
                    {formData.subject.length}/150
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status || "NOT_STARTED"}
                    onChange={handleChange}
                    name="status"
                    className={`w-full px-3 py-2 border rounded text-xs`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value} className="text-gray-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-xs text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>

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
                max="9999"
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


              {/* Related To */}
              <GlobalSelectField
                label="Related To"
                name="relatedTo"
                value={formData.relatedTo}
                onChange={handleChange}
                options={relatedToOptions}
                className="text-sm"
              />

              {/* Related Item Selection */}
              {formData.relatedTo && (
                <GlobalSelectField
                  label={`Select ${formData.relatedTo.charAt(0).toUpperCase() + formData.relatedTo.slice(1)}`}
                  name="relatedId"
                  value={formData.relatedId}
                  onChange={(e) => {
                    const selected = relatedData.find((item) => item.id === e.target.value);
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

              {/* Assignees */}
              <CustomMultiSelectWithExclusion
                type="assignees"
                label="Assignees"
                options={teamMembers}
                assignees={formData.assignees}
                followers={formData.followers}
                onAssigneesChange={handleAssigneesChange}
                onFollowersChange={handleFollowersChange}
                loading={loadingTeam}
                className="mb-4"
              />

              {/* Followers */}
              <CustomMultiSelectWithExclusion
                type="followers"
                label="Followers"
                options={teamMembers}
                assignees={formData.assignees}
                followers={formData.followers}
                onAssigneesChange={handleAssigneesChange}
                onFollowersChange={handleFollowersChange}
                loading={loadingTeam}
                className="mb-4"
              />

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
                max="9999"
                step="0.5"
                className="text-sm"
              />
            </div>

            {/* Task Description */}
            <div className="mt-3">
              <div className="relative">
                <GlobalTextAreaField
                  label="Task Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add Description"
                  rows={3}
                  error={errors.description}
                  className="text-sm"
                />
                <div className="absolute right-2 bottom-2 text-xs text-gray-500">
                  {formData.description.length}/500
                </div>
              </div>
            </div>

       
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
             
            </div>
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
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded hover:from-blue-700 hover:to-indigo-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1.5"></div>
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal;