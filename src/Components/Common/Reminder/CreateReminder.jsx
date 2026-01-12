import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";

function CreateReminder({ onClose, onSuccess }) {
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
    customerName: "",
    message: "",
    triggerTime: getCurrentDateTime(), // Set to current time initially
    relatedModule: "",
    referenceId: "",
    referenceName: "",
    sendEmailToCustomer: false,
    repeatDays: 1,
    recursionLimit: 1, // Default is 1 Time
    recurringType: "once", // 'once' or 'recurring'
    employeeId: "", // Only for admin
  });

  const [errors, setErrors] = useState({});
  const [leads, setLeads] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [proformas, setProformas] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProformas, setLoadingProformas] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const employeeDropdownRef = useRef(null);

  // State for reference dropdown
  const [showReferenceDropdown, setShowReferenceDropdown] = useState(false);
  const [referenceSearch, setReferenceSearch] = useState("");
  const [filteredReferences, setFilteredReferences] = useState([]);
  const referenceDropdownRef = useRef(null);

  // State for dropdown selections
  const [selectedRepeatOption, setSelectedRepeatOption] = useState("1");
  const [selectedLimitOption, setSelectedLimitOption] = useState("1"); // Default is "1" (1 Time)
  const [showCustomRepeatInput, setShowCustomRepeatInput] = useState(false);
  const [showCustomLimitInput, setShowCustomLimitInput] = useState(false);

  // Module options as per your requirement
  const moduleOptions = [
    { value: "", label: "Select Module" },
    { value: "LEAD", label: "Lead" },
    // { value: "CUSTOMER", label: "Customer" },
    { value: "PROPOSAL", label: "Proposal" },
    { value: "PROFORMA", label: "Proforma" },
    { value: "INVOICE", label: "Invoice" },
  ];

  // Repeat interval options with values in days
  const repeatIntervalOptions = [
    { value: "1", label: "1 Day" },
    { value: "7", label: "1 Week" },
    { value: "30", label: "1 Month" },
    { value: "90", label: "Quarterly" },
    { value: "180", label: "6 Months" },
    { value: "365", label: "1 Year" },
    { value: "custom", label: "Custom Days" },
  ];

  // Enhanced Recursion limit options with more options
  const recursionLimitOptions = [
    { value: "1000", label: "No Limit" },
    { value: "1", label: "1 Time" },
    { value: "2", label: "2 Times" },
    { value: "3", label: "3 Times" },
    { value: "4", label: "4 Times" },
    { value: "5", label: "5 Times" },
    { value: "6", label: "6 Times" },
    { value: "7", label: "7 Times" },
    { value: "8", label: "8 Times" },
    { value: "9", label: "9 Times" },
    { value: "10", label: "10 Times" },
    { value: "12", label: "12 Times" },
    { value: "15", label: "15 Times" },
    { value: "20", label: "20 Times" },
    { value: "25", label: "25 Times" },
    { value: "30", label: "30 Times" },
    { value: "40", label: "40 Times" },
    { value: "50", label: "50 Times" },
    { value: "100", label: "100 Times" },
    { value: "custom", label: "Custom Limit" },
  ];

  // Fetch employees (only for admin)
  useEffect(() => {
    if (role === "ROLE_ADMIN") {
      fetchEmployees();
    }
  }, [role]);

  useEffect(() => {
    // Update showCustomRepeatInput based on selected option
    setShowCustomRepeatInput(selectedRepeatOption === "custom");

    // If not custom and not empty, update formData
    if (selectedRepeatOption !== "custom" && selectedRepeatOption !== "") {
      setFormData((prev) => ({
        ...prev,
        repeatDays: parseInt(selectedRepeatOption),
      }));
    }
  }, [selectedRepeatOption]);

  useEffect(() => {
    // Update showCustomLimitInput based on selected option
    setShowCustomLimitInput(selectedLimitOption === "custom");

    // If not custom and not empty, update formData
    if (selectedLimitOption !== "custom" && selectedLimitOption !== "") {
      // For all options including "No Limit" (0), set the value directly
      setFormData((prev) => ({
        ...prev,
        recursionLimit: parseInt(selectedLimitOption),
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

  // Filter references based on search
  useEffect(() => {
    if (!formData.relatedModule || getCurrentModuleLoading()) {
      setFilteredReferences([]);
      return;
    }

    if (referenceSearch.trim() === "") {
      setFilteredReferences(getCurrentModuleData());
    } else {
      const searchTerm = referenceSearch.toLowerCase().trim();
      const filtered = getCurrentModuleData().filter((item) => {
        const itemText = formatReferenceOption(item).toLowerCase();
        return itemText.includes(searchTerm);
      });
      setFilteredReferences(filtered);
    }
  }, [
    referenceSearch,
    formData.relatedModule,
    leads,
    proposals,
    customers,
    proformas,
    invoices,
  ]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close employee dropdown
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setShowEmployeeDropdown(false);
      }

      // Close reference dropdown
      if (
        referenceDropdownRef.current &&
        !referenceDropdownRef.current.contains(event.target)
      ) {
        setShowReferenceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Fetch data based on selected module
  useEffect(() => {
    if (!formData.relatedModule) {
      // Clear all data if no module selected
      setLeads([]);
      setProposals([]);
      setCustomers([]);
      setProformas([]);
      setInvoices([]);
      setFilteredReferences([]);
      return;
    }

    switch (formData.relatedModule) {
      case "LEAD":
        fetchLeads();
        break;
      case "CUSTOMER":
        fetchCustomers();
        break;
      case "PROPOSAL":
        fetchProposals();
        break;
      case "PROFORMA":
        fetchProformas();
        break;
      case "INVOICE":
        fetchInvoices();
        break;
      default:
        break;
    }
  }, [formData.relatedModule]);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const response = await axiosInstance.get("getLeadNameAndIdWithConverted");
      if (response.data && Array.isArray(response.data)) {
        setLeads(response.data);
        setFilteredReferences(response.data);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await axiosInstance.get("getCustomerListWithNameAndId");
      if (response.data && Array.isArray(response.data)) {
        setCustomers(response.data);
        setFilteredReferences(response.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchProposals = async () => {
    setLoadingProposals(true);
    try {
      const response = await axiosInstance.get("getProposalNumberAndId");
      if (response.data && Array.isArray(response.data)) {
        setProposals(response.data);
        setFilteredReferences(response.data);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoadingProposals(false);
    }
  };

  const fetchProformas = async () => {
    setLoadingProformas(true);
    try {
      const response = await axiosInstance.get("getProformaNumberAndId");
      if (response.data && Array.isArray(response.data)) {
        setProformas(response.data);
        setFilteredReferences(response.data);
      }
    } catch (error) {
      console.error("Error fetching proformas:", error);
      toast.error("Failed to load proformas");
    } finally {
      setLoadingProformas(false);
    }
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const response = await axiosInstance.get("getInvoiceNumberAndId");
      if (response.data && Array.isArray(response.data)) {
        setInvoices(response.data);
        setFilteredReferences(response.data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for recursionLimit when user types in custom input
    if (name === "recursionLimit") {
      const numValue = value === "" ? 0 : parseInt(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
      // When user types in custom input, set dropdown to "custom"
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

    // When reference selection changes, update referenceName and customerName
    if (name === "referenceId" && formData.relatedModule) {
      let selectedItem = null;
      let customerNameValue = "";
      let referenceNameValue = "";

      switch (formData.relatedModule) {
        case "LEAD":
          selectedItem = leads.find((lead) => lead.leadId === value);
          if (selectedItem) {
            customerNameValue = selectedItem.companyName || "";
            referenceNameValue = selectedItem.clientName || "";
          }
          break;
        case "CUSTOMER":
          selectedItem = customers.find((cust) => cust.id === value);
          if (selectedItem) {
            customerNameValue = selectedItem.companyName || "";
            referenceNameValue = selectedItem.companyName || "";
          }
          break;
        case "PROPOSAL":
          selectedItem = proposals.find((prop) => prop.proposalId === value);
          if (selectedItem) {
            customerNameValue = selectedItem.companyName || "";
            referenceNameValue = selectedItem.formatedProposalNumber || "";
          }
          break;
        case "PROFORMA":
          selectedItem = proformas.find(
            (proforma) => proforma.proformaInvoiceId === value
          );
          if (selectedItem) {
            customerNameValue = selectedItem.companyName || "";
            referenceNameValue =
              selectedItem.formatedProformaInvoiceNumber || "";
          }
          break;
        case "INVOICE":
          selectedItem = invoices.find((inv) => inv.invoiceId === value);
          if (selectedItem) {
            customerNameValue = selectedItem.companyName || "";
            referenceNameValue = selectedItem.formatedInvoiceNumber || "";
          }
          break;
        default:
          break;
      }

      setFormData((prev) => ({
        ...prev,
        referenceId: value,
        referenceName: referenceNameValue,
        customerName: customerNameValue,
      }));
    }

    // When module changes, reset reference fields
    if (name === "relatedModule") {
      setFormData((prev) => ({
        ...prev,
        referenceId: "",
        referenceName: "",
        customerName: "",
      }));
      setShowReferenceDropdown(false);
      setReferenceSearch("");
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

  // Handle employee search input change
  const handleEmployeeSearchChange = (e) => {
    setEmployeeSearch(e.target.value);
  };

  // Handle reference selection
  const handleReferenceSelect = (item) => {
    let customerNameValue = "";
    let referenceNameValue = "";

    switch (formData.relatedModule) {
      case "LEAD":
        customerNameValue = item.companyName || "";
        referenceNameValue = item.clientName || "";
        break;
      case "CUSTOMER":
        customerNameValue = item.companyName || "";
        referenceNameValue = item.companyName || "";
        break;
      case "PROPOSAL":
        customerNameValue = item.companyName || "";
        referenceNameValue = item.formatedProposalNumber || "";
        break;
      case "PROFORMA":
        customerNameValue = item.companyName || "";
        referenceNameValue = item.formatedProformaInvoiceNumber || "";
        break;
      case "INVOICE":
        customerNameValue = item.companyName || "";
        referenceNameValue = item.formatedInvoiceNumber || "";
        break;
      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      referenceId: getReferenceValue(item),
      referenceName: referenceNameValue,
      customerName: customerNameValue,
    }));
    setShowReferenceDropdown(false);
    setReferenceSearch("");
  };

  // Handle reference search input change
  const handleReferenceSearchChange = (e) => {
    setReferenceSearch(e.target.value);
  };

  // Handle recurring type toggle
  const handleRecurringTypeToggle = (type) => {
    setFormData((prev) => ({
      ...prev,
      recurringType: type,
    }));
  };

  // Handle repeat interval dropdown change
  const handleRepeatOptionChange = (e) => {
    const value = e.target.value;
    setSelectedRepeatOption(value);
  };

  // Handle recursion limit dropdown change
  const handleLimitOptionChange = (e) => {
    const value = e.target.value;
    setSelectedLimitOption(value);
  };

  const validateForm = () => {
    const newErrors = {};

    // Message validation - required and max 500 characters
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length > 500) {
      newErrors.message = "Message cannot exceed 500 characters";
    }

    // Trigger time validation - check if it's empty or invalid
    if (!formData.triggerTime) {
      newErrors.triggerTime = "Trigger time is required";
    } else {
      // Additional validation: Ensure trigger time is not in the past
      const triggerDateTime = new Date(formData.triggerTime);
      const now = new Date();
      if (triggerDateTime < now) {
        newErrors.triggerTime = "Trigger time cannot be in the past";
      }
    }

    // Module validation
    if (!formData.relatedModule) {
      newErrors.relatedModule = "Please select a module";
    } else {
      // If module is selected, reference must also be selected
      if (!formData.referenceId) {
        newErrors.referenceId = `Please select a ${formData.relatedModule.toLowerCase()}`;
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

    // Clear all errors before validation
    setErrors({});

    const isValid = validateForm();

    if (!isValid) {
      // Show a generic error message
      toast.error("Please check the form for errors");
      return;
    }

    setLoading(true);
    try {
      // Prepare payload - Send recursionLimit as is (0 for No Limit, actual numbers for others)
      const payload = {
        customerName: formData.customerName.trim(),
        message: formData.message.trim(),
        triggerTime: formData.triggerTime,
        relatedModule: formData.relatedModule,
        referenceId: formData.referenceId || null,
        referenceName: formData.referenceName || "",
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

      console.log("Creating reminder with payload:", payload);

      const response = await axiosInstance.post("createReminder", payload);

      toast.success("Reminder created successfully!");
      onSuccess(response.data);
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast.error(error.response?.data?.message || "Failed to create reminder");
    } finally {
      setLoading(false);
    }
  };

  // Get min date for trigger time (current time)
  const getMinTriggerTime = () => {
    return getCurrentDateTime();
  };

  // Helper function to get loading state for current module
  const getCurrentModuleLoading = () => {
    switch (formData.relatedModule) {
      case "LEAD":
        return loadingLeads;
      case "CUSTOMER":
        return loadingCustomers;
      case "PROPOSAL":
        return loadingProposals;
      case "PROFORMA":
        return loadingProformas;
      case "INVOICE":
        return loadingInvoices;
      default:
        return false;
    }
  };

  // Helper function to get data for current module
  const getCurrentModuleData = () => {
    switch (formData.relatedModule) {
      case "LEAD":
        return leads;
      case "CUSTOMER":
        return customers;
      case "PROPOSAL":
        return proposals;
      case "PROFORMA":
        return proformas;
      case "INVOICE":
        return invoices;
      default:
        return [];
    }
  };

  // Helper function to get label for reference dropdown
  const getReferenceLabel = () => {
    switch (formData.relatedModule) {
      case "LEAD":
        return "Select Lead";
      case "CUSTOMER":
        return "Select Customer";
      case "PROPOSAL":
        return "Select Proposal";
      case "PROFORMA":
        return "Select Proforma";
      case "INVOICE":
        return "Select Invoice";
      default:
        return "Select";
    }
  };

  // Helper function to format reference option label
  const formatReferenceOption = (item) => {
    switch (formData.relatedModule) {
      case "LEAD":
        return `${item.clientName} - ${item.companyName}`;
      case "CUSTOMER":
        return `${item.companyName || item.name} (${item.email || "No email"})`;
      case "PROPOSAL":
        return `${
          item.formatedProposalNumber || `Proposal #${item.proposalNumber}`
        } - ${item.companyName}`;
      case "PROFORMA":
        return `${item.formatedProformaInvoiceNumber || "Proforma"} - ${
          item.companyName
        }`;
      case "INVOICE":
        return `${item.formatedInvoiceNumber || "Invoice"} - ${
          item.companyName
        }`;
      default:
        return String(item.name || item.title || `Item #${item.id}`);
    }
  };

  // Helper function to get reference value
  const getReferenceValue = (item) => {
    switch (formData.relatedModule) {
      case "LEAD":
        return item.leadId;
      case "CUSTOMER":
        return item.id;
      case "PROPOSAL":
        return item.proposalId;
      case "PROFORMA":
        return item.proformaInvoiceId;
      case "INVOICE":
        return item.invoiceId;
      default:
        return item.id;
    }
  };

  // Get selected employee name
  const getSelectedEmployeeName = () => {
    if (!formData.employeeId) return "";
    const employee = employees.find((emp) => emp.value === formData.employeeId);
    return employee ? employee.label : "";
  };

  // Get selected reference name
  const getSelectedReferenceName = () => {
    if (!formData.referenceId) return "";
    const item = getCurrentModuleData().find(
      (item) => getReferenceValue(item) === formData.referenceId
    );
    return item ? formatReferenceOption(item) : "";
  };

  // Character counter for message
  const messageLength = formData.message.length;

  // Reset form when modal opens (optional)
  useEffect(() => {
    // Reset form with current time when component mounts
    setFormData((prev) => ({
      ...prev,
      triggerTime: getCurrentDateTime(),
    }));
  }, []);

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
                <h2 className="text-lg font-bold">Create New Reminder</h2>
                <p className="text-blue-100 text-xs">
                  Set up a reminder for follow-ups
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
          <form onSubmit={handleSubmit} id="reminder-form">
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
              <p className="mt-1 text-xs text-gray-500">
                Set the date and time for the reminder
              </p>
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
                  {messageLength}/500 characters
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
                placeholder="Enter reminder message (max 500 characters)"
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Related Module */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Related Module *
              </label>
              <select
                name="relatedModule"
                value={formData.relatedModule}
                onChange={handleChange}
                className={`w-full px-3 py-1.5 border rounded text-sm ${
                  errors.relatedModule
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              >
                {moduleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.relatedModule && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.relatedModule}
                </p>
              )}
            </div>

            {/* Reference Selection (conditional) */}
            {formData.relatedModule && (
              <div className="mb-3" ref={referenceDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getReferenceLabel()} *
                </label>
                <div className="relative">
                  {/* Custom dropdown trigger */}
                  <div
                    className={`w-full px-3 py-1.5 border rounded text-sm bg-white flex items-center justify-between cursor-pointer ${
                      errors.referenceId ? "border-red-300" : "border-gray-300"
                    } ${getCurrentModuleLoading() ? "opacity-50" : ""}`}
                    onClick={() =>
                      !getCurrentModuleLoading() &&
                      setShowReferenceDropdown(!showReferenceDropdown)
                    }
                  >
                    <span
                      className={
                        formData.referenceId ? "text-gray-800" : "text-gray-500"
                      }
                    >
                      {formData.referenceId
                        ? getSelectedReferenceName()
                        : `Select a ${formData.relatedModule.toLowerCase()}`}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        showReferenceDropdown ? "transform rotate-180" : ""
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

                  {/* Custom dropdown menu - using portal-like positioning */}
                  {showReferenceDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                      {/* Search input */}
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <input
                            type="text"
                            value={referenceSearch}
                            onChange={handleReferenceSearchChange}
                            placeholder={`Search ${formData.relatedModule.toLowerCase()}s...`}
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

                      {/* Reference list */}
                      <div className="max-h-48 overflow-y-auto">
                        {getCurrentModuleLoading() ? (
                          <div className="py-3 px-3 text-center text-sm text-gray-500">
                            Loading {formData.relatedModule.toLowerCase()}s...
                          </div>
                        ) : filteredReferences.length === 0 ? (
                          <div className="py-3 px-3 text-center text-sm text-gray-500">
                            {referenceSearch
                              ? `No ${formData.relatedModule.toLowerCase()}s found`
                              : `No ${formData.relatedModule.toLowerCase()}s available`}
                          </div>
                        ) : (
                          filteredReferences.map((item) => (
                            <div
                              key={getReferenceValue(item)}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                                formData.referenceId === getReferenceValue(item)
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                              }`}
                              onClick={() => handleReferenceSelect(item)}
                            >
                              {formatReferenceOption(item)}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.referenceId && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.referenceId}
                  </p>
                )}
              </div>
            )}

            {/* Employee Selection (only for admin) */}
            {role === "ROLE_ADMIN" && (
              <div className="mb-3" ref={employeeDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Employee (Optional)
                </label>
                <div className="relative">
                  {/* Custom dropdown trigger */}
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

                  {/* Custom dropdown menu - using portal-like positioning */}
                  {showEmployeeDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                      {/* Search input */}
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

                      {/* Employee list */}
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
                <p className="mt-1 text-xs text-gray-500">
                  Select an employee to assign this reminder
                </p>
              </div>
            )}

            {/* Recurring Options - Toggle Style */}
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
                    <span>One-time Reminder</span>
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
                    <span>Recurring Reminder</span>
                  </div>
                </button>
              </div>

              {formData.recurringType === "recurring" && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Repeat Interval Dropdown */}
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

                        {/* Custom days input (only shown when custom is selected) */}
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
                              placeholder="Enter number of days"
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

                    {/* Recursion Limit Dropdown */}
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

                        {/* Custom limit input (only shown when custom is selected) */}
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
                              placeholder="Enter limit (0 for no limit)"
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

export default CreateReminder;
