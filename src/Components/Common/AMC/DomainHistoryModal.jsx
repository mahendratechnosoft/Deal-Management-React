// DomainHistoryModal.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalSelectField,
} from "../../BaseComponet/CustomerFormInputs";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { hasPermission } from "../../BaseComponet/permissions";

const DomainHistoryModal = ({
  isOpen,
  onClose,
  onSuccess,
  amcId,
  isEditMode = false,
  initialData = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    domainStartDate: "",
    domainRenewalDate: "",
    domainAmount: "",
    domainRenewalCycle: "1 Year",
    sequence: 1,
    paid: false,
  });

  const [errors, setErrors] = useState({});
  const [checkingSequence, setCheckingSequence] = useState(false);
  const [sequenceError, setSequenceError] = useState("");
  const [sequenceValid, setSequenceValid] = useState(false);
  const [existingSequences, setExistingSequences] = useState([]);
  const [autoButtonLoading, setAutoButtonLoading] = useState(false);
  const canEdit = hasPermission("amc", "Edit");
  const canCreate = hasPermission("amc", "Create");

  const domainRenewalOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Half-Yearly", label: "Half-Yearly" },
    { value: "1 Year", label: "1 Year" },
    { value: "2 Years", label: "2 Years" },
    { value: "3 Years", label: "3 Years" },
  ];

  // Cleanup when modal closes
  useEffect(() => {
    return () => {
      setFormData({
        domainStartDate: "",
        domainRenewalDate: "",
        domainAmount: "",
        domainRenewalCycle: "1 Year",
        sequence: 1,
        paid: false,
      });
      setErrors({});
      setSequenceError("");
      setSequenceValid(false);
      setCheckingSequence(false);
       setAutoButtonLoading(false);
    };
  }, []);

  // Fetch existing sequences when modal opens
  useEffect(() => {
    if (isOpen && amcId) {
      fetchExistingSequences();
    }
  }, [isOpen, amcId]);

  // Initialize form with initialData
  // Initialize form with initialData
  useEffect(() => {
    if (isOpen) {
      // Reset validation states when modal opens
      setErrors({});
      setSequenceError("");
      setSequenceValid(false);
      setCheckingSequence(false);

      if (isEditMode && initialData) {
        // Edit mode: use initial data
        setFormData({
          domainStartDate: initialData.domainStartDate || "",
          domainRenewalDate: initialData.domainRenewalDate || "",
          domainAmount: initialData.domainAmount || "",
          domainRenewalCycle: initialData.domainRenewalCycle || "1 Year",
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
        // CREATE MODE: Handle empty existingSequences
        const initializeForm = () => {
          const defaultFormData = {
            domainStartDate: "",
            domainRenewalDate: "",
            domainAmount: "",
            domainRenewalCycle: "1 Year",
            sequence: 1, // Default to 1
            paid: false,
          };

          // If we have existing sequences, calculate next sequence
          if (existingSequences.length > 0) {
            const maxSequence = Math.max(
              ...existingSequences.map((item) => item.sequence)
            );
            const nextSequence = maxSequence + 1;
            defaultFormData.sequence = nextSequence;
          } else {
            // No existing sequences, keep as 1
            defaultFormData.sequence = 1;
          }

          setFormData(defaultFormData);

          // Check sequence uniqueness after setting
          setTimeout(() => {
            checkSequenceUnique(defaultFormData.sequence);
          }, 100);
        };

        initializeForm();
      }
    }
  }, [isOpen, isEditMode, initialData, existingSequences]);
  // Fetch all existing sequences for this AMC
  const fetchExistingSequences = async () => {
    try {
      const response = await axiosInstance.get(
        `getAllAMCDomainHistoy/${amcId}`
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

  // Check if sequence number is unique using the provided API
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
        `isDomainHistorySequenceUnique/${amcId}/${sequence}`
      );

      console.log("Sequence check response:", response.data);

      // API response interpretation
      let isUnique;

      if (typeof response.data === "boolean") {
        // If API returns boolean directly
        isUnique = response.data;
      } else if (response.data.unique !== undefined) {
        // If API returns { "unique": boolean }
        isUnique = response.data.unique;
      } else if (response.data.exists !== undefined) {
        // If API returns { "exists": boolean }
        isUnique = !response.data.exists;
      } else if (response.data.isUnique !== undefined) {
        // If API returns { "isUnique": boolean }
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
        setSequenceError(`Sequence number ${sequence} is already in use.`);
        return false;
      }
    } catch (error) {
      console.error("Error checking sequence uniqueness:", error);

      if (error.response?.status === 404) {
        // 404 might mean sequence doesn't exist (is unique)
        setSequenceValid(true);
        setSequenceError("");
        return true;
      } else if (error.response?.status === 409) {
        // 409 Conflict means sequence exists
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

  // Auto-calculate renewal date when start date or renewal cycle changes
  useEffect(() => {
    if (formData.domainStartDate && formData.domainRenewalCycle) {
      const renewalDate = calculateDomainRenewalDate(
        formData.domainStartDate,
        formData.domainRenewalCycle
      );
      if (renewalDate && renewalDate !== formData.domainRenewalDate) {
        setFormData((prev) => ({ ...prev, domainRenewalDate: renewalDate }));
      }
    }
  }, [formData.domainStartDate, formData.domainRenewalCycle]);

  // Function to calculate renewal date based on start date and renewal cycle
  const calculateDomainRenewalDate = (startDate, renewalCycle) => {
    if (!startDate) return "";

    const date = new Date(startDate);

    switch (renewalCycle) {
      case "Monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "Quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "Half-Yearly":
        date.setMonth(date.getMonth() + 6);
        break;
      case "1 Year":
        date.setFullYear(date.getFullYear() + 1);
        break;
      case "2 Years":
        date.setFullYear(date.getFullYear() + 2);
        break;
      case "3 Years":
        date.setFullYear(date.getFullYear() + 3);
        break;
      default:
        date.setFullYear(date.getFullYear() + 1);
    }

    return date.toISOString().split("T")[0];
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

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

  // Handle start date change
  const handleStartDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      domainStartDate: date,
    }));

    if (errors.domainStartDate) {
      setErrors((prev) => ({ ...prev, domainStartDate: "" }));
    }
  };

  // Handle renewal cycle change
  const handleRenewalCycleChange = (renewalCycle) => {
    setFormData((prev) => ({
      ...prev,
      domainRenewalCycle: renewalCycle,
    }));

    if (errors.domainRenewalCycle) {
      setErrors((prev) => ({ ...prev, domainRenewalCycle: "" }));
    }
  };

  // Handle sequence change with validation
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

  // Auto-assign next sequence
  // Auto-assign next sequence
  const handleAutoSequence = async () => {
    setAutoButtonLoading(true);
    try {
      let nextSequence;

      if (existingSequences.length === 0) {
        // No existing sequences, start with 1
        nextSequence = 1;
      } else {
        const maxSequence = Math.max(
          ...existingSequences.map((item) => item.sequence)
        );
        nextSequence = maxSequence + 1;
      }

      setFormData((prev) => ({ ...prev, sequence: nextSequence }));
      await checkSequenceUnique(nextSequence);
    } catch (error) {
      toast.error("Failed to calculate next sequence");
    } finally {
      setAutoButtonLoading(false);
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.domainStartDate) {
      newErrors.domainStartDate = "Domain start date is required";
    }

    if (!formData.domainRenewalDate) {
      newErrors.domainRenewalDate = "Domain renewal date is required";
    }

    // REMOVED: Domain Amount validation (no longer required)
    // if (!formData.domainAmount) {
    //   newErrors.domainAmount = "Domain amount is required";
    // } else if (
    //   isNaN(formData.domainAmount) ||
    //   parseFloat(formData.domainAmount) <= 0
    // ) {
    //   newErrors.domainAmount = "Domain amount must be a positive number";
    // }

    // Add validation for amount format only (if provided)
    if (formData.domainAmount && formData.domainAmount.trim() !== "") {
      if (
        isNaN(formData.domainAmount) ||
        parseFloat(formData.domainAmount) < 0
      ) {
        newErrors.domainAmount = "Domain amount must be a positive number";
      }
    }

    if (!formData.sequence) {
      newErrors.sequence = "Sequence number is required";
    } else if (isNaN(formData.sequence) || parseInt(formData.sequence) <= 0) {
      newErrors.sequence = "Sequence must be a positive number";
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
        amcId,
        domainStartDate: formData.domainStartDate,
        domainRenewalDate: formData.domainRenewalDate,
        domainAmount: formData.domainAmount
          ? parseFloat(formData.domainAmount)
          : 0, // Default to 0 if not provided
        domainRenewalCycle: formData.domainRenewalCycle || "1 Year",
        sequence: parseInt(formData.sequence),
        paid: formData.paid,
      };

      // Add acmDomainHistoryId for update
      if (isEditMode && initialData?.acmDomainHistoryId) {
        payload.acmDomainHistoryId = initialData.acmDomainHistoryId;
      }

      const response = isEditMode
        ? await axiosInstance.put("updateAMCDomainHistoy", payload)
        : await axiosInstance.put("updateAMCDomainHistoy", payload);

      if (response.data) {
        toast.success(
          isEditMode
            ? "Domain History updated successfully"
            : "Domain History created successfully"
        );
        if (onSuccess) {
          onSuccess({
            ...(response.data || payload),
            refreshParentList: true,
          });
        }

        onClose();
      }
    } catch (error) {
      console.error("Error saving domain history:", error);

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
          error.response?.data?.message || "Failed to save domain history"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-200 flex flex-col">
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isEditMode
                    ? "Edit Domain History"
                    : "Add New Domain History"}
                </h2>
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
              {/* SEQUENCE FIELD */}
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
                      disabled={autoButtonLoading || checkingSequence} // Add disabled state if using loading
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 h-10 transition-colors ${
                        autoButtonLoading
                          ? "bg-blue-300 text-blue-700 cursor-wait"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                      title="Use next available sequence"
                    >
                      {autoButtonLoading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                          Calculating...
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
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
                label={
                  <>
                    Domain Start Date
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                name="domainStartDate"
                type="date"
                value={formData.domainStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                error={errors.domainStartDate}
                className="text-sm"
              />

              <GlobalInputField
                label={
                  <>
                    Domain Renewal Date
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                name="domainRenewalDate"
                type="date"
                value={formData.domainRenewalDate}
                onChange={(e) =>
                  handleChange("domainRenewalDate", e.target.value)
                }
                error={errors.domainRenewalDate}
                className="text-sm"
                readOnly
                style={{ backgroundColor: "#f9f9f9" }}
              />

              <GlobalInputField
                label="Domain Amount (₹)" // Removed asterisk
                name="domainAmount"
                type="number"
                value={formData.domainAmount}
                onChange={(e) => handleChange("domainAmount", e.target.value)}
                error={errors.domainAmount}
                placeholder="1200"
                min="0"
                step="0.01"
                className="text-sm"
              />

              <GlobalSelectField
                label="Renewal Cycle"
                name="domainRenewalCycle"
                value={formData.domainRenewalCycle}
                onChange={(e) => handleRenewalCycleChange(e.target.value)}
                options={domainRenewalOptions}
                className="text-sm"
              />
            </div>

            {/* Modal Footer inside form */}
            {/* Modal Footer inside form */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
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
                      "Update Domain"
                    ) : (
                      "Create Domain"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DomainHistoryModal;
