// GsuiteHistoryModal.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalSelectField,
} from "../../BaseComponet/CustomerFormInputs";
import { hasPermission } from "../../BaseComponet/permissions";

function GsuiteHistoryModal({
  isOpen,
  onClose,
  onSuccess,
  amcId,
  isEditMode,
  initialData,
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    domainName: "",
    platform: "Google Workspace",
    gsuitStartDate: "",
    gsuitRenewalDate: "",
    adminEmail: "",
    adminPassword: "",
    totalLicenses: "",
    gsuitAmount: "",
    paidBy: "ADMIN",
    purchasedViaReseller: false,
    resellerName: "",
    gsuitRenewalCycle: "YEARLY",
    sequence: 1,
    paid: false,
  });

  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [checkingSequence, setCheckingSequence] = useState(false);
  const [sequenceError, setSequenceError] = useState("");
  const [sequenceValid, setSequenceValid] = useState(false);
  const [existingSequences, setExistingSequences] = useState([]);

    const canEdit = hasPermission("amc", "Edit");
    const canCreate = hasPermission("amc", "Create");

  // Options
  const platformOptions = [
    { value: "Google Workspace", label: "Google Workspace" },
    { value: "Microsoft 365", label: "Microsoft 365" },
    { value: "Zoho Workplace", label: "Zoho Workplace" },
  ];

  const paidByOptions = [
    { value: "ADMIN", label: "Paid by Admin" },
    { value: "CLIENT", label: "Paid by Client" },
  ];

  const renewalCycleOptions = [
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "YEARLY", label: "Yearly" },
    { value: "2_YEARS", label: "2 Years" },
    { value: "3_YEARS", label: "3 Years" },
  ];

  // Cleanup when modal closes
  useEffect(() => {
    return () => {
      setFormData({
        domainName: "",
        platform: "Google Workspace",
        gsuitStartDate: "",
        gsuitRenewalDate: "",
        adminEmail: "",
        adminPassword: "",
        totalLicenses: "",
        gsuitAmount: "",
        paidBy: "ADMIN",
        purchasedViaReseller: false,
        resellerName: "",
        gsuitRenewalCycle: "YEARLY",
        sequence: 1,
        paid: false,
      });
      setErrors({});
      setSequenceError("");
      setSequenceValid(false);
      setCheckingSequence(false);
      setShowAdminPassword(false);
    };
  }, []);

  // Fetch existing sequences when modal opens
  useEffect(() => {
    if (isOpen && amcId) {
      setExistingSequences([]);
      fetchExistingSequences();
    }
  }, [isOpen, amcId]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      // Reset all states when modal opens
      setErrors({});
      setSequenceError("");
      setSequenceValid(false);
      setCheckingSequence(false);

      if (isEditMode && initialData) {
        // Edit mode: use initial data
        setFormData({
          domainName: initialData.domainName || "",
          platform: initialData.platform || "Google Workspace",
          gsuitStartDate: initialData.gsuitStartDate
            ? initialData.gsuitStartDate.split("T")[0]
            : "",
          gsuitRenewalDate: initialData.gsuitRenewalDate
            ? initialData.gsuitRenewalDate.split("T")[0]
            : "",
          adminEmail: initialData.adminEmail || "",
          adminPassword: initialData.adminPassword || "",
          totalLicenses: initialData.totalLicenses || "",
          gsuitAmount: initialData.gsuitAmount || "",
          paidBy: initialData.paidBy || "ADMIN",
          purchasedViaReseller: initialData.purchasedViaReseller || false,
          resellerName: initialData.resellerName || "",
          gsuitRenewalCycle: initialData.gsuitRenewalCycle || "YEARLY",
          sequence: initialData.sequence || 1,
          paid: initialData.paid || false,
        });

        // Trigger sequence validation after a short delay
        setTimeout(() => {
          const sequence = initialData.sequence || 1;
          setSequenceValid(true);
          checkSequenceUnique(sequence);
        }, 100);
      } else {
        // Create mode: reset to default values first
        const defaultFormData = {
          domainName: "",
          platform: "Google Workspace",
          gsuitStartDate: "",
          gsuitRenewalDate: "",
          adminEmail: "",
          adminPassword: "",
          totalLicenses: "",
          gsuitAmount: "",
          paidBy: "ADMIN",
          purchasedViaReseller: false,
          resellerName: "",
          gsuitRenewalCycle: "YEARLY",
          sequence: 1,
          paid: false,
        };

        // Wait for existing sequences to load, then set next sequence
        if (existingSequences.length > 0) {
          const maxSequence = Math.max(
            ...existingSequences.map((item) => item.sequence)
          );
          const nextSequence = maxSequence + 1;
          defaultFormData.sequence = nextSequence;

          // Set form data and check sequence
          setFormData(defaultFormData);
          setTimeout(() => checkSequenceUnique(nextSequence), 100);
        } else {
          // If no existing sequences, just set default
          setFormData(defaultFormData);
        }
      }
    }
  }, [isOpen, isEditMode, initialData, existingSequences]);

  // Fetch all existing sequences from the API
  const fetchExistingSequences = async () => {
    try {
      const response = await axiosInstance.get(
        `getAllAMCGsuitHistory/${amcId}`
      );
      if (response.data && Array.isArray(response.data)) {
        setExistingSequences(response.data);
      }
    } catch (error) {
      console.error("Error fetching existing sequences:", error);
      toast.error("Failed to load existing sequences");
      setExistingSequences([]);
    }
  };

  // Calculate next available sequence
  const calculateNextSequence = () => {
    if (existingSequences.length === 0) {
      return 1;
    }
    const maxSequence = Math.max(
      ...existingSequences.map((item) => item.sequence)
    );
    return maxSequence + 1;
  };

  // Check if sequence number is unique
  const checkSequenceUnique = async (sequence) => {
    if (!amcId || !sequence) {
      setSequenceError("Sequence number is required");
      setSequenceValid(false);
      return false;
    }

    setCheckingSequence(true);
    setSequenceError("");
    setSequenceValid(false);

    try {
      const response = await axiosInstance.get(
        `isGsuitHistorySequenceUnique/${amcId}/${sequence}`
      );

      console.log("Sequence check response:", response.data);

      // API response interpretation
      let isUnique;

      if (typeof response.data === "boolean") {
        isUnique = response.data;
      } else if (response.data.unique !== undefined) {
        isUnique = response.data.unique;
      } else if (response.data.exists !== undefined) {
        isUnique = !response.data.exists;
      } else if (response.data.isUnique !== undefined) {
        isUnique = response.data.isUnique;
      } else {
        console.error("Unexpected API response format:", response.data);
        setSequenceValid(false);
        setSequenceError("Unable to validate sequence. Please try again.");
        return false;
      }

      if (isUnique) {
        setSequenceValid(true);
        setSequenceError("");
        return true;
      } else {
        // For edit mode, check if it's the same as original
        if (isEditMode && initialData?.sequence === sequence) {
          // Same as original, it's valid (but not "available")
          setSequenceValid(true);
          setSequenceError("");
          return true;
        }
        setSequenceValid(false);
        setSequenceError(
          `Sequence number ${sequence} is already in use. Please choose a different sequence.`
        );
        return false;
      }
    } catch (error) {
      console.error("Error checking sequence uniqueness:", error);

      if (error.response?.status === 404) {
        setSequenceValid(true);
        setSequenceError("");
        return true;
      } else if (error.response?.status === 409) {
        // For edit mode, check if it's the same as original
        if (isEditMode && initialData?.sequence === sequence) {
          setSequenceValid(true);
          setSequenceError("");
          return true;
        }
        setSequenceValid(false);
        setSequenceError(`Sequence number ${sequence} is already in use.`);
        return false;
      } else {
        setSequenceValid(false);
        setSequenceError("Error checking sequence number. Please try again.");
        return false;
      }
    } finally {
      setCheckingSequence(false);
    }
  };

  // Auto-calculate renewal date
  useEffect(() => {
    if (formData.gsuitStartDate && formData.gsuitRenewalCycle) {
      const renewalDate = calculateRenewalDate(
        formData.gsuitStartDate,
        formData.gsuitRenewalCycle
      );
      if (renewalDate && renewalDate !== formData.gsuitRenewalDate) {
        setFormData((prev) => ({ ...prev, gsuitRenewalDate: renewalDate }));
      }
    }
  }, [formData.gsuitStartDate, formData.gsuitRenewalCycle]);

  const calculateRenewalDate = (startDate, cycle) => {
    if (!startDate) return "";

    const date = new Date(startDate);

    switch (cycle) {
      case "MONTHLY":
        date.setMonth(date.getMonth() + 1);
        break;
      case "QUARTERLY":
        date.setMonth(date.getMonth() + 3);
        break;
      case "YEARLY":
        date.setFullYear(date.getFullYear() + 1);
        break;
      case "2_YEARS":
        date.setFullYear(date.getFullYear() + 2);
        break;
      case "3_YEARS":
        date.setFullYear(date.getFullYear() + 3);
        break;
      default:
        date.setFullYear(date.getFullYear() + 1);
    }

    return date.toISOString().split("T")[0];
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field if exists
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // If sequence field changes, clear validation
    if (field === "sequence") {
      setSequenceError("");
      setSequenceValid(false);
    }
  };

  // Handle payment toggle
  const handlePaymentToggle = () => {
    setFormData((prev) => ({
      ...prev,
      paid: !prev.paid,
    }));
  };

  const handleRenewalCycleChange = (cycle) => {
    handleChange("gsuitRenewalCycle", cycle);

    if (formData.gsuitStartDate) {
      const renewalDate = calculateRenewalDate(formData.gsuitStartDate, cycle);
      handleChange("gsuitRenewalDate", renewalDate);
    }
  };

  const handleSequenceChange = async (value) => {
    const sequence = parseInt(value);
    if (isNaN(sequence) || sequence < 1) {
      setSequenceError("Sequence must be a positive number");
      setSequenceValid(false);
      handleChange("sequence", value);
      return;
    }

    handleChange("sequence", sequence);

    // Always check uniqueness with debouncing
    const timer = setTimeout(async () => {
      await checkSequenceUnique(sequence);
    }, 500);

    return () => clearTimeout(timer);
  };

  const handleAutoSequence = () => {
    const nextSequence = calculateNextSequence();
    setFormData((prev) => ({ ...prev, sequence: nextSequence }));
    checkSequenceUnique(nextSequence);
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.domainName?.trim()) {
      newErrors.domainName = "Domain name is required";
    }

    if (!formData.gsuitStartDate) {
      newErrors.gsuitStartDate = "Start date is required";
    }

    if (!formData.gsuitRenewalDate) {
      newErrors.gsuitRenewalDate = "Renewal date is required";
    }

    if (!formData.totalLicenses) {
      newErrors.totalLicenses = "Total licenses is required";
    } else if (
      isNaN(formData.totalLicenses) ||
      parseInt(formData.totalLicenses) <= 0
    ) {
      newErrors.totalLicenses = "Total licenses must be a positive number";
    }

    // REMOVED: GSuite Amount validation (no longer required)
    // if (!formData.gsuitAmount) {
    //   newErrors.gsuitAmount = "GSuite amount is required";
    // } else if (
    //   isNaN(formData.gsuitAmount) ||
    //   parseFloat(formData.gsuitAmount) <= 0
    // ) {
    //   newErrors.gsuitAmount = "GSuite amount must be a positive number";
    // }

    // Add validation for amount format only (if provided)
    if (formData.gsuitAmount && formData.gsuitAmount.trim() !== "") {
      if (
        isNaN(formData.gsuitAmount) ||
        parseFloat(formData.gsuitAmount) <= 0
      ) {
        newErrors.gsuitAmount = "GSuite amount must be a positive number";
      }
    }

    if (!formData.sequence) {
      newErrors.sequence = "Sequence number is required";
    } else if (isNaN(formData.sequence) || parseInt(formData.sequence) <= 0) {
      newErrors.sequence = "Sequence must be a positive number";
    }

    if (formData.adminEmail && !/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = "Admin email is invalid";
    }

    if (formData.purchasedViaReseller && !formData.resellerName?.trim()) {
      newErrors.resellerName =
        "Reseller name is required when purchased via reseller";
    }

    setErrors(newErrors);

    // Check sequence uniqueness for both create and edit modes
    if (!newErrors.sequence) {
      const originalSequence = isEditMode ? initialData?.sequence : null;
      const currentSequence = parseInt(formData.sequence);

      // Only check uniqueness if:
      // 1. In create mode, OR
      // 2. In edit mode and sequence has changed
      if (!isEditMode || currentSequence !== originalSequence) {
        const isUnique = await checkSequenceUnique(currentSequence);
        if (!isUnique) {
          return false;
        }
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    // Final sequence check for create mode
    if (!isEditMode && !sequenceValid) {
      toast.error("Please ensure sequence number is valid and unique");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        totalLicenses: formData.totalLicenses
          ? parseInt(formData.totalLicenses)
          : 0,
        gsuitAmount: formData.gsuitAmount
          ? parseFloat(formData.gsuitAmount)
          : 0, // Default to 0 if not provided
        sequence: parseInt(formData.sequence),
        paid: formData.paid,
        // Include amcId if creating new
        ...(!isEditMode && { amcId: amcId }),
      };

      // Add amcGsuitHistoryId for update
      if (isEditMode && initialData?.amcGsuitHistoryId) {
        payload.amcGsuitHistoryId = initialData.amcGsuitHistoryId;
      }

      let response;
      if (isEditMode && initialData?.amcGsuitHistoryId) {
        // Update existing
        response = await axiosInstance.put(`updateAMCGsuitHistory`, payload);
      } else {
        // Create new
        response = await axiosInstance.put(`updateAMCGsuitHistory`, payload);
      }

      if (response.data) {
        toast.success(
          isEditMode
            ? "GSuite history updated successfully"
            : "GSuite history created successfully"
        );

        if (onSuccess) {
          onSuccess({
            ...response.data,
            refreshParentList: true,
          });
        }

        onClose();
      }
    } catch (error) {
      console.error("Error saving GSuite history:", error);

      if (error.response?.status === 409) {
        toast.error(
          "Sequence number already exists. Please choose a different sequence."
        );
      } else if (error.response?.status === 400) {
        toast.error(
          error.response.data?.message ||
            "Invalid data. Please check all fields."
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to save GSuite history"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-3">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isEditMode ? "Edit GSuite History" : "Create GSuite History"}
                </h2>
                <p className="text-blue-100 text-xs">
                  Fill in the GSuite details below
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
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sequence Field */}
              <div className="md:col-span-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <GlobalInputField
                      label="Sequence Number"
                      name="sequence"
                      type="number"
                      value={formData.sequence}
                      onChange={(e) => handleSequenceChange(e.target.value)}
                      error={errors.sequence || sequenceError}
                      placeholder="Enter sequence number"
                      min="1"
                      className="text-sm"
                      required
                      disabled={checkingSequence}
                    />
                  </div>
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={handleAutoSequence}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium flex items-center gap-1 h-10 transition-colors"
                      title="Use next available sequence"
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Auto
                    </button>
                  )}
                </div>
                {checkingSequence && (
                  <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Checking sequence availability...
                  </p>
                )}

                {/* Show existing sequences for both modes */}
                {existingSequences.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Existing sequences:{" "}
                    {existingSequences
                      .map((s) => s.sequence)
                      .sort((a, b) => a - b)
                      .join(", ")}
                  </p>
                )}

                {/* Show different messages for edit vs create mode */}
                {sequenceValid && !checkingSequence && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {isEditMode
                      ? `Sequence number ${formData.sequence} is valid (current sequence)`
                      : `Sequence number ${formData.sequence} is available`}
                  </p>
                )}
              </div>

              {/* PAYMENT TOGGLE BUTTON */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-content-between gap-4 p-3 bg-white rounded-lg border border-gray-200">
                  <label className="text-sm font-medium text-gray-700 flex-shrink-0">
                    Payment Status:
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        !formData.paid
                          ? "font-semibold text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      Unpaid
                    </span>
                    <button
                      type="button"
                      onClick={handlePaymentToggle}
                      className={`
                        relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                        ${formData.paid ? "bg-green-500" : "bg-gray-300"}
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                      `}
                    >
                      <span
                        className={`
                          inline-block h-3 w-3 transform rounded-full bg-white transition-transform
                          ${formData.paid ? "translate-x-5" : "translate-x-1"}
                        `}
                      />
                    </button>
                    <span
                      className={`text-sm ${
                        formData.paid
                          ? "font-semibold text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      Paid
                    </span>
                  </div>
                </div>
              </div>

              <GlobalInputField
                label="Domain Name"
                name="domainName"
                value={formData.domainName}
                onChange={(e) => handleChange("domainName", e.target.value)}
                error={errors.domainName}
                placeholder="examplecompany.com"
                className="text-sm"
                required
              />

              <GlobalSelectField
                label="Platform"
                name="platform"
                value={formData.platform}
                onChange={(e) => handleChange("platform", e.target.value)}
                options={platformOptions}
                className="text-sm"
              />

              <GlobalInputField
                label="Start Date"
                name="gsuitStartDate"
                type="date"
                value={formData.gsuitStartDate}
                onChange={(e) => handleChange("gsuitStartDate", e.target.value)}
                error={errors.gsuitStartDate}
                className="text-sm"
                min={getTodayDate()}
                required
              />

              <GlobalInputField
                label="Renewal Date"
                name="gsuitRenewalDate"
                type="date"
                value={formData.gsuitRenewalDate}
                onChange={(e) =>
                  handleChange("gsuitRenewalDate", e.target.value)
                }
                error={errors.gsuitRenewalDate}
                className="text-sm"
                readOnly
                style={{ backgroundColor: "#f9f9f9" }}
                required
              />

              <GlobalInputField
                label="Admin Email"
                name="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => handleChange("adminEmail", e.target.value)}
                error={errors.adminEmail}
                placeholder="admin@example.com"
                className="text-sm"
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={(e) =>
                      handleChange("adminPassword", e.target.value)
                    }
                    placeholder="Enter admin password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showAdminPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
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
                    )}
                  </button>
                </div>
              </div>

              <GlobalInputField
                label="Total Licenses"
                name="totalLicenses"
                type="number"
                value={formData.totalLicenses}
                onChange={(e) => handleChange("totalLicenses", e.target.value)}
                error={errors.totalLicenses}
                placeholder="25"
                min="1"
                className="text-sm"
                required
              />

              <GlobalInputField
                label="GSuite Amount" // Removed asterisk from label
                name="gsuitAmount"
                type="number"
                value={formData.gsuitAmount}
                onChange={(e) => handleChange("gsuitAmount", e.target.value)}
                error={errors.gsuitAmount}
                placeholder="45000"
                min="0"
                step="0.01"
                className="text-sm"
              />

              <GlobalSelectField
                label="Paid By"
                name="paidBy"
                value={formData.paidBy}
                onChange={(e) => handleChange("paidBy", e.target.value)}
                options={paidByOptions}
                className="text-sm"
              />

              <GlobalSelectField
                label="Renewal Cycle"
                name="gsuitRenewalCycle"
                value={formData.gsuitRenewalCycle}
                onChange={(e) => handleRenewalCycleChange(e.target.value)}
                options={renewalCycleOptions}
                className="text-sm"
              />

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="purchasedViaReseller"
                    checked={formData.purchasedViaReseller}
                    onChange={(e) =>
                      handleChange("purchasedViaReseller", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="purchasedViaReseller"
                    className="text-sm text-gray-700"
                  >
                    Purchased via Reseller
                  </label>
                </div>

                {formData.purchasedViaReseller && (
                  <div className="mt-2">
                    <GlobalInputField
                      label="Reseller Name"
                      name="resellerName"
                      value={formData.resellerName}
                      onChange={(e) =>
                        handleChange("resellerName", e.target.value)
                      }
                      error={errors.resellerName}
                      placeholder="Google Authorized Partner Pvt Ltd"
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>

              {/* Conditional button rendering */}
              {(isEditMode && canEdit) || (!isEditMode && canCreate) ? (
                <button
                  type="submit"
                  disabled={
                    loading ||
                    checkingSequence ||
                    (!isEditMode && !sequenceValid)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditMode ? (
                    "Update GSuite"
                  ) : (
                    "Create GSuite"
                  )}
                </button>
              ) : (
                <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium flex items-center gap-2">
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
                      d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {isEditMode ? "No Edit Permission" : "No Create Permission"}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GsuiteHistoryModal;
