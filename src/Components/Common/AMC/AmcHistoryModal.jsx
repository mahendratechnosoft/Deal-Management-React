// AmcHistoryModal.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
} from "../../BaseComponet/CustomerFormInputs";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { hasPermission } from "../../BaseComponet/permissions";

const AmcHistoryModal = ({
  isOpen,
  onClose,
  onSuccess,
  amcId,
  isEditMode = false,
  initialData = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amcStartDate: "",
    amcEndDate: "",
    amcAmount: "",
    amcScope: "",
    amcRecycleType: "Yearly",
    sequence: 1,
    paid: false, // Added paid field
  });

  const [errors, setErrors] = useState({});
  const [checkingSequence, setCheckingSequence] = useState(false);
  const [sequenceError, setSequenceError] = useState("");
  const [sequenceValid, setSequenceValid] = useState(false);
  const [existingSequences, setExistingSequences] = useState([]);

  const canEdit = hasPermission("amc", "Edit");
  const canCreate = hasPermission("amc","Create");
    const recycleTypeOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Half-Yearly", label: "Half-Yearly" },
    { value: "Yearly", label: "Yearly" },
    { value: "2 Years", label: "2 Years" },
  ];

  // Cleanup when modal closes
  useEffect(() => {
    return () => {
      setFormData({
        amcStartDate: "",
        amcEndDate: "",
        amcAmount: "",
        amcScope: "",
        amcRecycleType: "Yearly",
        sequence: 1,
        paid: false, // Reset paid field
      });
      setErrors({});
      setSequenceError("");
      setSequenceValid(false);
      setCheckingSequence(false);
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
          amcStartDate: initialData.amcStartDate || "",
          amcEndDate: initialData.amcEndDate || "",
          amcAmount: initialData.amcAmount || "",
          amcScope: initialData.amcScope || "",
          amcRecycleType: initialData.amcRecycleType || "Yearly",
          sequence: initialData.sequence || 1,
          paid: initialData.paid || false,
        });

        // Trigger sequence validation after a short delay
        setTimeout(() => {
          const sequence = initialData.sequence || 1;
          setSequenceValid(true); // Assume it's valid initially
          // Also check uniqueness in case it's been changed elsewhere
          checkSequenceUnique(sequence);
        }, 100);
      } else {
        // Create mode: reset to default values
        const defaultFormData = {
          amcStartDate: "",
          amcEndDate: "",
          amcAmount: "",
          amcScope: "",
          amcRecycleType: "Yearly",
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

  // Fetch all existing sequences for this AMC
  const fetchExistingSequences = async () => {
    try {
      const response = await axiosInstance.get(`getAllAMCHistoy/${amcId}`);
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
        `isAmcHistorySequenceUnique/${amcId}/${sequence}`
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
  // Auto-calculate end date when start date or recycle type changes
  useEffect(() => {
    if (formData.amcStartDate && formData.amcRecycleType) {
      const endDate = calculateAmcEndDate(
        formData.amcStartDate,
        formData.amcRecycleType
      );
      if (endDate && endDate !== formData.amcEndDate) {
        setFormData((prev) => ({ ...prev, amcEndDate: endDate }));
      }
    }
  }, [formData.amcStartDate, formData.amcRecycleType]);

  // Function to calculate end date based on start date and recycle type
  const calculateAmcEndDate = (startDate, recycleType) => {
    if (!startDate) return "";

    const date = new Date(startDate);

    switch (recycleType) {
      case "Monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "Quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "Half-Yearly":
        date.setMonth(date.getMonth() + 6);
        break;
      case "Yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      case "2 Years":
        date.setFullYear(date.getFullYear() + 2);
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
      amcStartDate: date,
    }));

    if (errors.amcStartDate) {
      setErrors((prev) => ({ ...prev, amcStartDate: "" }));
    }
  };

  // Handle recycle type change
  const handleRecycleTypeChange = (recycleType) => {
    setFormData((prev) => ({
      ...prev,
      amcRecycleType: recycleType,
    }));

    if (errors.amcRecycleType) {
      setErrors((prev) => ({ ...prev, amcRecycleType: "" }));
    }
  };

  // Handle sequence change with validation
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
  const handleAutoSequence = () => {
    const nextSequence = calculateNextSequence();
    setFormData((prev) => ({ ...prev, sequence: nextSequence }));
    checkSequenceUnique(nextSequence);
  };

  const validateForm = async () => {
    const newErrors = {};

    // Required fields
    if (!formData.amcStartDate) {
      newErrors.amcStartDate = "AMC start date is required";
    }

    if (!formData.amcEndDate) {
      newErrors.amcEndDate = "AMC end date is required";
    }

    // Add validation for amount format only (if provided)
    if (formData.amcAmount && formData.amcAmount.trim() !== "") {
      if (isNaN(formData.amcAmount) || parseFloat(formData.amcAmount) <= 0) {
        newErrors.amcAmount = "AMC amount must be a positive number";
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

  // In AmcHistoryModal.jsx - Modify the handleSubmit function:

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
        amcStartDate: formData.amcStartDate,
        amcEndDate: formData.amcEndDate,
        amcAmount: formData.amcAmount ? parseFloat(formData.amcAmount) : 0, // Default to 0 if not provided
        amcScope: formData.amcScope || "", // Allow empty scope
        amcRecycleType: formData.amcRecycleType || "Yearly",
        sequence: parseInt(formData.sequence),
        paid: formData.paid,
      };

      // Add acmHistoryId for update
      if (isEditMode && initialData?.acmHistoryId) {
        payload.acmHistoryId = initialData.acmHistoryId;
      }

      // Use correct endpoint for create/update
      const response = isEditMode
        ? await axiosInstance.put("updateAMCHistory", payload)
        : await axiosInstance.put("updateAMCHistory", payload);

      if (response.data) {
        toast.success(
          isEditMode
            ? "AMC History updated successfully"
            : "AMC History created successfully"
        );

        if (onSuccess) {
          // Pass a flag to indicate refresh is needed
          onSuccess({
            ...response.data,
            refreshParentList: true, // Add this flag
          });
        }

        onClose();
      }
    } catch (error) {
      console.error("Error saving AMC history:", error);

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
          error.response?.data?.message || "Failed to save AMC history"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isEditMode ? "Edit AMC History" : "Add New AMC History"}
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
                label={
                  <>
                    Start Date
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                name="amcStartDate"
                type="date"
                value={formData.amcStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                error={errors.amcStartDate}
                className="text-sm"
              />

              <GlobalInputField
                label={
                  <>
                    End Date
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                name="amcEndDate"
                type="date"
                value={formData.amcEndDate}
                onChange={(e) => handleChange("amcEndDate", e.target.value)}
                error={errors.amcEndDate}
                className="text-sm"
                readOnly
                style={{ backgroundColor: "#f9f9f9" }}
              />

              <GlobalInputField
                label="Amount"
                name="amcAmount"
                type="number"
                value={formData.amcAmount}
                onChange={(e) => handleChange("amcAmount", e.target.value)}
                error={errors.amcAmount}
                placeholder="25000"
                min="0"
                step="0.01"
                className="text-sm"
              />

              <GlobalSelectField
                label="Recycle Type"
                name="amcRecycleType"
                value={formData.amcRecycleType}
                onChange={(e) => handleRecycleTypeChange(e.target.value)}
                options={recycleTypeOptions}
                className="text-sm"
              />

              <div className="md:col-span-2">
                <GlobalTextAreaField
                  label="Scope"
                  name="amcScope"
                  value={formData.amcScope}
                  onChange={(e) => handleChange("amcScope", e.target.value)}
                  error={errors.amcScope}
                  placeholder="Describe the AMC scope..."
                  rows={4}
                  className="text-sm"
                />
              </div>
            </div>

    
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
                      "Update History"
                    ) : (
                      "Create History"
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

export default AmcHistoryModal;
