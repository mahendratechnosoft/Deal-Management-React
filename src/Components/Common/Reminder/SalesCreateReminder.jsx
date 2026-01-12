import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";

function SalesCreateReminder({ onClose, onSuccess, module, referenceId }) {
  const { role } = useLayout();
  const [loading, setLoading] = useState(false);

  // Get current date and time for initial trigger time
  const getCurrentDateTime = () => {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:mm (local datetime-local format)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    message: "",
    triggerTime: getCurrentDateTime(),
    sendEmailToCustomer: false,
    repeatDays: 1,
    recursionLimit: 1, // Default is 1 Time
    recurringType: "once", // 'once' or 'recurring'
    employeeId: "", // Only for admin
  });

  const [errors, setErrors] = useState({});

  // Reference details state
  const [referenceDetails, setReferenceDetails] = useState({
    customerName: "",
    referenceName: "",
  });
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Employees state
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const employeeDropdownRef = useRef(null);

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

  // Fetch employees (only for admin)
  useEffect(() => {
    if (role === "ROLE_ADMIN") {
      fetchEmployees();
    }
  }, [role]);

  // Fetch reference details (customer name, reference name)
  useEffect(() => {
    fetchReferenceDetails();
  }, [module, referenceId]);

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
        recursionLimit: limitValue === 1000 ? 0 : limitValue, // 1000 is "No Limit" which maps to 0
      }));
    }
  }, [selectedLimitOption]);

  // Filter employees based on search
  useEffect(() => {
    if (employeeSearch.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const searchTerm = employeeSearch.toLowerCase().trim();
      const filtered = employees.filter(
        (emp) =>
          emp.label.toLowerCase().includes(searchTerm) ||
          (emp.email && emp.email.toLowerCase().includes(searchTerm)) ||
          (emp.employeeCode &&
            emp.employeeCode.toLowerCase().includes(searchTerm))
      );
      setFilteredEmployees(filtered);
    }
  }, [employeeSearch, employees]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setShowEmployeeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch employees
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await axiosInstance.get("getEmployeeNameAndId");
      if (response.data && Array.isArray(response.data)) {
        const formattedEmployees = response.data.map((emp) => ({
          value: emp.employeeId,
          label: emp.name,
          email: emp.email,
          employeeCode: emp.employeeCode,
        }));
        setEmployees(formattedEmployees);
        setFilteredEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Fetch reference details based on module - UPDATED TO INCLUDE LEAD
  const fetchReferenceDetails = async () => {
    if (!module || !referenceId) {
      setReferenceDetails({
        customerName: "",
        referenceName: "",
      });
      setLoadingDetails(false);
      return;
    }

    setLoadingDetails(true);
    try {
      let endpoint = "";

      // Set endpoint based on module
      switch (module) {
        case "LEAD":
          endpoint = `getLeadById/${referenceId}`;
          break;
        case "PROPOSAL":
          endpoint = `getProposalById/${referenceId}`;
          break;
        case "PROFORMA":
          endpoint = `getProformaInvoiceById/${referenceId}`;
          break;
        case "INVOICE":
          endpoint = `getInvoiceById/${referenceId}`;
          break;
        default:
          throw new Error(`Unsupported module: ${module}`);
      }

      const response = await axiosInstance.get(endpoint);

      if (response.data) {
        let customerName = "";
        let referenceName = "";

        // Extract details based on module structure
        if (module === "LEAD") {
          // Handle LEAD data structure
          const leadData = response.data.lead || response.data;
          customerName = leadData.clientName || leadData.companyName || "";
          referenceName = leadData.companyName || leadData.clientName || "";
        } else if (module === "PROPOSAL" && response.data.proposalInfo) {
          customerName =
            response.data.proposalInfo.customerInfo?.companyName ||
            response.data.proposalInfo.customerInfo?.customerName ||
            "";
          referenceName =
            response.data.proposalInfo.formatedProposalNumber || "";
        } else if (module === "PROFORMA" && response.data.proformaInvoiceInfo) {
          customerName =
            response.data.proformaInvoiceInfo.customerInfo?.companyName || "";
          referenceName =
            response.data.proformaInvoiceInfo.formatedProformaInvoiceNumber ||
            "";
        } else if (module === "INVOICE" && response.data.invoiceInfo) {
          customerName =
            response.data.invoiceInfo.customerInfo?.companyName || "";
          referenceName = response.data.invoiceInfo.formatedInvoiceNumber || "";
        }

        setReferenceDetails({
          customerName,
          referenceName,
        });
      }
    } catch (error) {
      console.error("Error fetching reference details:", error);
      toast.error("Failed to load details");
      setReferenceDetails({
        customerName: "",
        referenceName: "",
      });
    } finally {
      setLoadingDetails(false);
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

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    setFormData((prev) => ({
      ...prev,
      employeeId: employee.value,
    }));
    setShowEmployeeDropdown(false);
    setEmployeeSearch("");
  };

  // Handle employee search
  const handleEmployeeSearchChange = (e) => {
    setEmployeeSearch(e.target.value);
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
      if (triggerDateTime < now) {
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
        customerName: referenceDetails.customerName,
        message: formData.message.trim(),
        triggerTime: formData.triggerTime,
        relatedModule: module,
        referenceId: referenceId,
        referenceName: referenceDetails.referenceName,
        sendEmailToCustomer: formData.sendEmailToCustomer,
        repeatDays:
          formData.recurringType === "recurring"
            ? parseInt(formData.repeatDays)
            : 0,
        recursionLimit:
          formData.recurringType === "recurring"
            ? parseInt(formData.recursionLimit)
            : 0,
        recurring: formData.recurringType === "recurring",
      };

      // Add employeeId only for admin
      if (role === "ROLE_ADMIN" && formData.employeeId) {
        payload.employeeId = formData.employeeId;
      }

      await axiosInstance.post("createReminder", payload);

      toast.success("Reminder created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast.error(error.response?.data?.message || "Failed to create reminder");
    } finally {
      setLoading(false);
    }
  };

  // Get min date for trigger time
  const getMinTriggerTime = () => {
    return getCurrentDateTime();
  };

  // Get selected employee name
  const getSelectedEmployeeName = () => {
    if (!formData.employeeId) return "";
    const employee = employees.find((emp) => emp.value === formData.employeeId);
    return employee ? employee.label : "";
  };

  // Character counter for message
  const messageLength = formData.message.length;

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
                <h2 className="text-lg font-bold">Create Reminder</h2>
                <p className="text-blue-100 text-xs">
                  Set reminder for {module.toLowerCase()}:{" "}
                  {referenceDetails.referenceName}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <form onSubmit={handleSubmit}>
            {/* Reference Info */}
            <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Reference
              </div>
              <div className="text-sm">
                {loadingDetails ? (
                  <div className="flex items-center">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mr-2"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Module:</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        {module}
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
                  </>
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
                className={`w-full px-3 py-1.5 border rounded text-sm ${
                  errors.triggerTime
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
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
                className={`w-full px-3 py-1.5 border rounded text-sm ${
                  errors.message
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="Enter reminder message..."
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Employee Selection (only for admin) */}
            {role === "ROLE_ADMIN" && (
              <div className="mb-3" ref={employeeDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Employee (Optional)
                </label>
                <div className="relative">
                  <div
                    className={`w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white flex items-center justify-between cursor-pointer ${
                      loadingEmployees ? "opacity-50" : ""
                    }`}
                    onClick={() =>
                      !loadingEmployees &&
                      setShowEmployeeDropdown(!showEmployeeDropdown)
                    }
                  >
                    <span
                      className={
                        formData.employeeId ? "text-gray-800" : "text-gray-500"
                      }
                    >
                      {formData.employeeId
                        ? getSelectedEmployeeName()
                        : "Select an employee"}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        showEmployeeDropdown ? "transform rotate-180" : ""
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

                  {showEmployeeDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <input
                            type="text"
                            value={employeeSearch}
                            onChange={handleEmployeeSearchChange}
                            placeholder="Search employees..."
                            className="w-full px-3 py-1.5 pl-9 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                          />
                          <svg
                            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
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
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        {loadingEmployees ? (
                          <div className="py-3 px-3 text-center text-sm text-gray-500">
                            Loading employees...
                          </div>
                        ) : filteredEmployees.length === 0 ? (
                          <div className="py-3 px-3 text-center text-sm text-gray-500">
                            {employeeSearch
                              ? "No employees found"
                              : "No employees available"}
                          </div>
                        ) : (
                          filteredEmployees.map((employee) => (
                            <div
                              key={employee.value}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                                formData.employeeId === employee.value
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                              }`}
                              onClick={() => handleEmployeeSelect(employee)}
                            >
                              <div className="font-medium">
                                {employee.label}
                              </div>
                              {(employee.email || employee.employeeCode) && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {employee.employeeCode && (
                                    <span>Code: {employee.employeeCode}</span>
                                  )}
                                  {employee.email && employee.employeeCode && (
                                    <span className="mx-1">•</span>
                                  )}
                                  {employee.email && (
                                    <span>{employee.email}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    formData.recurringType === "once"
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
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
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    formData.recurringType === "recurring"
                      ? "bg-green-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
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
                              className={`w-full px-3 py-1.5 border rounded text-sm ${
                                errors.repeatDays
                                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                              className={`w-full px-3 py-1.5 border rounded text-sm ${
                                errors.recursionLimit
                                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                  id="sendEmail"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="sendEmail"
                  className="ml-2 block text-sm font-medium text-gray-700"
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
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1.5"></div>
                  Creating...
                </>
              ) : (
                "Create Reminder"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesCreateReminder;
