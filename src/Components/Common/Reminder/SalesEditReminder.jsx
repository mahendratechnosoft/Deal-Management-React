import React, { useState, useEffect } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";

function SalesEditReminder({ reminderId, onClose, onSuccess }) {
  const { role } = useLayout();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Get current date and time for initial trigger time
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Format trigger time for datetime-local input
  const formatDateTimeLocal = (dateTimeString) => {
    if (!dateTimeString) return getCurrentDateTime();
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    reminderId: "",
    adminId: "",
    employeeId: "",
    customerName: "",
    message: "",
    triggerTime: getCurrentDateTime(),
    relatedModule: "",
    referenceId: "",
    referenceName: "",
    sendEmailToCustomer: false,
    repeatDays: 1,
    recursionLimit: 1,
    recurringType: "once",
    currentCount: 0,
    createdBy: "",
    recurring: false,
    sent: false,
  });

  const [errors, setErrors] = useState({});

  // Reference details state
  const [referenceDetails, setReferenceDetails] = useState({
    customerName: "",
    referenceName: "",
    module: "",
  });

  // Employees state
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Repeat interval options
  const repeatIntervalOptions = [
    { value: "1", label: "1 Day" },
    { value: "7", label: "1 Week" },
    { value: "30", label: "1 Month" },
    { value: "90", label: "Quarterly" },
    { value: "180", label: "6 Months" },
    { value: "365", label: "1 Year" },
    { value: "custom", label: "Custom Days" },
  ];

  // Recursion limit options
  const recursionLimitOptions = [
    { value: "1000", label: "No Limit" },
    { value: "1", label: "1 Time" },
    { value: "2", label: "2 Times" },
    { value: "3", label: "3 Times" },
    { value: "5", label: "5 Times" },
    { value: "10", label: "10 Times" },
    { value: "custom", label: "Custom Limit" },
  ];

  // Selected options for dropdowns
  const [selectedRepeatOption, setSelectedRepeatOption] = useState("1");
  const [selectedLimitOption, setSelectedLimitOption] = useState("1");
  const [showCustomRepeatInput, setShowCustomRepeatInput] = useState(false);
  const [showCustomLimitInput, setShowCustomLimitInput] = useState(false);

  // Fetch reminder data
  useEffect(() => {
    if (reminderId) {
      fetchReminderData();
    }
  }, [reminderId]);

  // Fetch employees (only for admin)
  useEffect(() => {
    if (role === "ROLE_ADMIN") {
      fetchEmployees();
    }
  }, [role]);

  // Update form data when repeat option changes
  useEffect(() => {
    setShowCustomRepeatInput(selectedRepeatOption === "custom");
    if (selectedRepeatOption !== "custom" && selectedRepeatOption !== "") {
      setFormData((prev) => ({
        ...prev,
        repeatDays: parseInt(selectedRepeatOption),
      }));
    }
  }, [selectedRepeatOption]);

  // Update form data when limit option changes
  useEffect(() => {
    setShowCustomLimitInput(selectedLimitOption === "custom");
    if (selectedLimitOption !== "custom" && selectedLimitOption !== "") {
      const limitValue = parseInt(selectedLimitOption);
      setFormData((prev) => ({
        ...prev,
        recursionLimit: limitValue === 1000 ? 0 : limitValue,
      }));
    }
  }, [selectedLimitOption]);

  // Fetch reminder data by ID
  const fetchReminderData = async () => {
    setInitialLoading(true);
    try {
      const response = await axiosInstance.get(`getReminderById/${reminderId}`);
      const data = response.data;

      // Set recurring type based on recurring field
      const recurringType = data.recurring ? "recurring" : "once";

      // Set repeat dropdown option
      let repeatOption = "1";
      if (data.repeatDays === 7) repeatOption = "7";
      else if (data.repeatDays === 30) repeatOption = "30";
      else if (data.repeatDays === 90) repeatOption = "90";
      else if (data.repeatDays === 180) repeatOption = "180";
      else if (data.repeatDays === 365) repeatOption = "365";
      else if (data.repeatDays > 0 && data.repeatDays <= 365) {
        const standardOption = repeatIntervalOptions.find(
          (opt) => parseInt(opt.value) === data.repeatDays
        );
        repeatOption = standardOption ? standardOption.value : "custom";
      } else {
        repeatOption = "custom";
      }
      setSelectedRepeatOption(repeatOption);

      // Set limit dropdown option
      let limitOption = "1";
      if (data.recursionLimit === 1000) {
        limitOption = "1000";
      } else if (data.recursionLimit >= 1 && data.recursionLimit <= 10) {
        const standardLimit = recursionLimitOptions.find(
          (opt) => parseInt(opt.value) === data.recursionLimit
        );
        limitOption = standardLimit ? standardLimit.value : "custom";
      } else {
        limitOption = "custom";
      }
      setSelectedLimitOption(limitOption);

      // Set form data
      setFormData({
        reminderId: data.reminderId || "",
        adminId: data.adminId || "",
        employeeId: data.employeeId || "",
        customerName: data.customerName || "",
        message: data.message || "",
        triggerTime: formatDateTimeLocal(data.triggerTime),
        relatedModule: data.relatedModule || "",
        referenceId: data.referenceId || "",
        referenceName: data.referenceName || "",
        sendEmailToCustomer: data.sendEmailToCustomer || false,
        repeatDays: data.repeatDays || 1,
        recursionLimit: data.recursionLimit || 1,
        recurringType: recurringType,
        currentCount: data.currentCount || 0,
        createdBy: data.createdBy || "",
        recurring: data.recurring || false,
        sent: data.sent || false,
      });

      // Set reference details
      setReferenceDetails({
        customerName: data.customerName || "",
        referenceName: data.referenceName || "",
        module: data.relatedModule || "",
      });
    } catch (error) {
      console.error("Error fetching reminder:", error);
      toast.error("Failed to load reminder data");
      onClose();
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await axiosInstance.get("getEmployeeNameAndId");
      if (response.data && Array.isArray(response.data)) {
        const formattedEmployees = response.data.map((emp) => ({
          value: emp.employeeId,
          label: emp.name,
        }));
        setEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for recursionLimit
    if (name === "recursionLimit") {
      const numValue = value === "" ? 0 : parseInt(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
      setSelectedLimitOption("custom");
    } else if (name === "repeatDays") {
      const numValue = value === "" ? 1 : parseInt(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
      setSelectedRepeatOption("custom");
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle recurring type toggle
  const handleRecurringTypeToggle = (type) => {
    setFormData((prev) => ({
      ...prev,
      recurringType: type,
    }));
  };

  // Handle repeat interval change
  const handleRepeatOptionChange = (e) => {
    setSelectedRepeatOption(e.target.value);
  };

  // Handle recursion limit change
  const handleLimitOptionChange = (e) => {
    setSelectedLimitOption(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length > 500) {
      newErrors.message = "Message cannot exceed 500 characters";
    }

    // Trigger time validation
    if (!formData.triggerTime) {
      newErrors.triggerTime = "Trigger time is required";
    } else {
      const triggerDateTime = new Date(formData.triggerTime);
      const now = new Date();
      if (triggerDateTime < now && !formData.sent) {
        newErrors.triggerTime = "Trigger time cannot be in the past";
      }
    }

    // If recurring is checked, validate repeatDays and recursionLimit
    if (formData.recurringType === "recurring") {
      if (!formData.repeatDays || formData.repeatDays <= 0) {
        newErrors.repeatDays = "Repeat days must be greater than 0";
      }
      if (formData.recursionLimit < 0) {
        newErrors.recursionLimit = "Recursion limit must be 0 or greater";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't allow editing if reminder is already sent
    if (formData.sent) {
      toast.error("Cannot edit a reminder that has already been sent");
      return;
    }

    setErrors({});

    const isValid = validateForm();

    if (!isValid) {
      toast.error("Please check the form for errors");
      return;
    }

    setLoading(true);
    try {
      // Prepare payload
      const payload = {
        reminderId: formData.reminderId,
        adminId: formData.adminId,
        employeeId: formData.employeeId || "",
        customerName: formData.customerName.trim(),
        message: formData.message.trim(),
        triggerTime: formData.triggerTime,
        relatedModule: formData.relatedModule,
        referenceId: formData.referenceId || null,
        sendEmailToCustomer: formData.sendEmailToCustomer,
        repeatDays:
          formData.recurringType === "recurring"
            ? parseInt(formData.repeatDays)
            : 0,
        recursionLimit:
          formData.recurringType === "recurring"
            ? parseInt(formData.recursionLimit)
            : 0,
        currentCount: formData.currentCount || 0,
        createdBy: formData.createdBy || "",
        recurring: formData.recurringType === "recurring",
        sent: formData.sent || false,
      };

      // Add employeeId only for admin
      if (role === "ROLE_ADMIN" && formData.employeeId) {
        payload.employeeId = formData.employeeId;
      }

      await axiosInstance.put("updateReminder", payload);

    //   toast.success("Reminder updated successfully!");
      if (onSuccess) {
        onSuccess(payload);
      }
      onClose();
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast.error(error.response?.data?.message || "Failed to update reminder");
    } finally {
      setLoading(false);
    }
  };

  // Get min date for trigger time
  const getMinTriggerTime = () => {
    if (!formData.sent) {
      return getCurrentDateTime();
    }
    return "";
  };

  // Character counter for message
  const messageLength = formData.message.length;

  // Check if reminder is already sent
  const isSent = formData.sent;

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200">
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading reminder data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Edit Reminder</h2>
                <p className="text-blue-100 text-xs">
                  {isSent ? "View sent reminder" : "Update reminder details"}
                </p>
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

        {/* Warning for sent reminders */}
        {isSent && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mx-3 mt-3 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This reminder has already been sent. You can view the details
                  but cannot edit them.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <form onSubmit={handleSubmit}>
            {/* Reference Info */}
            <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Reference
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Module:</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                    {referenceDetails.module}
                  </span>
                </div>
                {referenceDetails.referenceName && (
                  <div className="mb-1">
                    <span className="font-medium">Reference:</span>{" "}
                    {referenceDetails.referenceName}
                  </div>
                )}
                {referenceDetails.customerName && (
                  <div>
                    <span className="font-medium">Customer:</span>{" "}
                    {referenceDetails.customerName}
                  </div>
                )}
                {formData.sent && (
                  <div className="mt-2 flex items-center gap-1">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                        formData.sent
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {formData.sent ? "Sent" : "Pending"}
                    </span>
                    {formData.currentCount > 0 && (
                      <span className="text-xs text-gray-500">
                        (Sent {formData.currentCount} time
                        {formData.currentCount > 1 ? "s" : ""})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Trigger Time */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Time *
              </label>
              <input
                type="datetime-local"
                name="triggerTime"
                value={formData.triggerTime}
                onChange={handleChange}
                min={getMinTriggerTime()}
                disabled={isSent}
                className={`w-full px-3 py-1.5 border rounded text-sm ${
                  errors.triggerTime
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } ${isSent ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              {errors.triggerTime && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.triggerTime}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Message *
                </label>
                <span
                  className={`text-xs ${
                    messageLength > 500 ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {messageLength}/500
                </span>
              </div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                disabled={isSent}
                className={`w-full px-3 py-1.5 border rounded text-sm ${
                  errors.message
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } ${isSent ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="Enter reminder message..."
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Employee Selection (only for admin) */}
            {role === "ROLE_ADMIN" && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Employee (Optional)
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSent || loadingEmployees}
                >
                  <option value="">Select an employee</option>
                  {loadingEmployees ? (
                    <option value="">Loading employees...</option>
                  ) : (
                    employees.map((emp) => (
                      <option key={emp.value} value={emp.value}>
                        {emp.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Recurring Options */}
            <div className="mb-3 p-3 border border-gray-200 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Type
              </label>
              <div className="flex items-center space-x-4 mb-3">
                <button
                  type="button"
                  onClick={() => handleRecurringTypeToggle("once")}
                  disabled={isSent}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    formData.recurringType === "once"
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${isSent ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-center gap-2">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>One-time</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRecurringTypeToggle("recurring")}
                  disabled={isSent}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    formData.recurringType === "recurring"
                      ? "bg-green-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${isSent ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-center gap-2">
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Recurring</span>
                  </div>
                </button>
              </div>

              {formData.recurringType === "recurring" && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Repeat Interval */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Repeat Every *
                      </label>
                      <div className="space-y-2">
                        <select
                          value={selectedRepeatOption}
                          onChange={handleRepeatOptionChange}
                          disabled={isSent}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          {repeatIntervalOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {showCustomRepeatInput && (
                          <div className="relative">
                            <input
                              type="number"
                              name="repeatDays"
                              value={formData.repeatDays}
                              onChange={handleChange}
                              min="1"
                              disabled={isSent}
                              className={`w-full px-3 py-1.5 border rounded text-sm ${
                                errors.repeatDays
                                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              } ${
                                isSent ? "bg-gray-100 cursor-not-allowed" : ""
                              }`}
                              placeholder="Enter days"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                              days
                            </span>
                          </div>
                        )}
                        {errors.repeatDays && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.repeatDays}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Recursion Limit */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Recursion Limit
                      </label>
                      <div className="space-y-2">
                        <select
                          value={selectedLimitOption}
                          onChange={handleLimitOptionChange}
                          disabled={isSent}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          {recursionLimitOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {showCustomLimitInput && (
                          <div className="relative">
                            <input
                              type="number"
                              name="recursionLimit"
                              value={formData.recursionLimit}
                              onChange={handleChange}
                              min="0"
                              max="99999"
                              disabled={isSent}
                              className={`w-full px-3 py-1.5 border rounded text-sm ${
                                errors.recursionLimit
                                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              } ${
                                isSent ? "bg-gray-100 cursor-not-allowed" : ""
                              }`}
                              placeholder="Enter limit"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                              times
                            </span>
                          </div>
                        )}
                        {errors.recursionLimit && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.recursionLimit}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info text */}
                  <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                    <div className="flex items-start gap-1">
                      <svg
                        className="w-3 h-3 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {formData.recursionLimit === 0
                          ? "This reminder will repeat indefinitely."
                          : `This reminder will repeat ${
                              formData.recursionLimit
                            } time${formData.recursionLimit === 1 ? "" : "s"}.`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Email Notification */}
            <div className="mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="sendEmailToCustomer"
                  checked={formData.sendEmailToCustomer}
                  onChange={handleChange}
                  disabled={isSent}
                  id="sendEmail"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="sendEmail"
                  className={`ml-2 block text-sm font-medium ${
                    isSent ? "text-gray-500" : "text-gray-700"
                  }`}
                >
                  Send email notification to customer
                </label>
              </div>
            </div>
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
              onClick={handleSubmit}
              disabled={loading || isSent}
              className={`px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                isSent ? "bg-gray-400 hover:bg-gray-400" : ""
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1.5"></div>
                  Updating...
                </>
              ) : isSent ? (
                "Cannot Edit Sent Reminder"
              ) : (
                "Update Reminder"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesEditReminder;
