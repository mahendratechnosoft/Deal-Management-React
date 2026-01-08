import React, { useState, useEffect, useRef, useMemo } from "react";
import axiosInstance from "../../../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalSelectField,
} from "../../../../BaseComponet/CustomerFormInputs";
import PlaceholdersModal from "./PlaceholdersModal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import RichTextEditor from "../../../../BaseComponet/RichTextEditor";

const EditTemplate = ({
  isOpen,
  onClose,
  templateId,
  category = "SALES",
  onTemplateUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingPlaceholders, setLoadingPlaceholders] = useState(false);
  const [availablePlaceholders, setAvailablePlaceholders] = useState({});
  const [hasFetchedPlaceholders, setHasFetchedPlaceholders] = useState(false);
  const [showPlaceholdersModal, setShowPlaceholdersModal] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [placeholderInsertMode, setPlaceholderInsertMode] = useState("body"); // 'body' or 'subject'

  const prevTriggerRef = useRef("");
  const mainModalRef = useRef(null);
  const mainContentRef = useRef(null);
  const quillRef = useRef(null);

  // Centralized trigger configuration for all categories
  const ALL_TRIGGERS = {
    SALES: [
      { value: "PROPOSAL_SEND", label: "Proposal Send" },
      { value: "PROFORMA_SEND", label: "Proforma Send" },
      { value: "PROFORMA_DUE_REMINDER", label: "Proforma Due Reminder" },
      { value: "PROFORMA_OVERDUE_ALERT", label: "Proforma Overdue Alert" },
      { value: "INVOICE_SEND", label: "Invoice Send" },
      { value: "PAYMENT_RECORDED", label: "Payment Recorded" },
    ],
    TASK: [
      { value: "NEW_TASK", label: "New Task" },
      { value: "UPDATE_TASK", label: "Update Task" },
      { value: "TASK_STATUS_CHANGE", label: "Task Status Change" },
    ],
    ATTENDANCE: [
      { value: "ATTENDANCE_CHECK_IN", label: "Attendance Check In" },
      { value: "ATTENDANCE_CHECK_OUT", label: "Attendance Check Out" },
    ],
  };

  // Form state matching API structure
  const [formData, setFormData] = useState({
    emailTemplateId: "",
    templateName: "",
    adminId: "", // Missing in original
    subject: "",
    emailBody: "",
    category: category,
    triggerEvent: "",
    createdAt: "", // Missing in original
    default: false,
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isTriggerDisabled, setIsTriggerDisabled] = useState(true);

  // Get triggers for current category
  const getTriggers = () => {
    const triggers = ALL_TRIGGERS[category] || [];
    return [
      { value: "", label: `Select ${category} Trigger Event` },
      ...triggers,
    ];
  };

  // Get readable trigger name for display
  const getTriggerDisplayName = (triggerValue) => {
    if (!triggerValue) return "";

    const triggers = ALL_TRIGGERS[category] || [];
    const trigger = triggers.find((t) => t.value === triggerValue);
    return trigger ? trigger.label : triggerValue.replace(/_/g, " ");
  };

  // Add keyboard event listener for # key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (
        e.key === "#" &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setPlaceholderInsertMode("body"); // Set to body mode
        setShowPlaceholdersModal(true);
      }
    };

    if (isOpen) {
      document.addEventListener("keypress", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, [isOpen]);

  // Fetch template data when modal opens
  useEffect(() => {
    const fetchTemplateData = async () => {
      if (isOpen && templateId) {
        setIsFetching(true);
        try {
          const response = await axiosInstance.get(
            `getEmailTemplateById/${templateId}`
          );

          if (response.data) {
            const template = response.data;
            const fullFormData = {
              emailTemplateId: template.emailTemplateId || "",
              templateName: template.templateName || "",
              adminId: template.adminId || "", // Added
              subject: template.subject || "",
              emailBody: template.emailBody || "",
              category: template.category || category,
              triggerEvent: template.triggerEvent || "",
              createdAt: template.createdAt || "", // Added
              default: template.default || false,
              active: template.active !== undefined ? template.active : true,
            };

            setFormData(fullFormData);
            setOriginalData(fullFormData); // Store original data for comparison
            setEditorContent(template.emailBody || "");

            // Trigger event should not be editable once template is created
            setIsTriggerDisabled(true);
          }
        } catch (error) {
          console.error("Error fetching template:", error);
          toast.error("Failed to load template data");
          onClose();
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchTemplateData();
  }, [isOpen, templateId, category, onClose]);

  // Fetch placeholders when trigger changes
  useEffect(() => {
    const fetchPlaceholders = async () => {
      if (!isOpen || !formData.triggerEvent) return;

      if (
        hasFetchedPlaceholders &&
        prevTriggerRef.current === formData.triggerEvent
      ) {
        return;
      }

      setLoadingPlaceholders(true);
      setHasFetchedPlaceholders(false);

      try {
        const response = await axiosInstance.get(
          `getTampletePlaceholders/${formData.triggerEvent}`
        );

        let placeholdersData = {};

        if (response.data) {
          // Format 1: Direct object with categories
          if (
            typeof response.data === "object" &&
            !Array.isArray(response.data)
          ) {
            placeholdersData = response.data;
          }
          // Format 2: Data wrapped in data property
          else if (
            response.data.data &&
            typeof response.data.data === "object"
          ) {
            placeholdersData = response.data.data;
          }
          // Format 3: Simple array format
          else if (Array.isArray(response.data)) {
            placeholdersData = {
              General: response.data.map((item) => ({
                label: item.label || item.name || item.key,
                key: item.key || item.value,
              })),
            };
          }
          // Format 4: Stringified JSON
          else if (typeof response.data === "string") {
            try {
              const parsedData = JSON.parse(response.data);
              if (typeof parsedData === "object") {
                placeholdersData = parsedData;
              }
            } catch (parseError) {
              console.error("Failed to parse JSON string:", parseError);
            }
          }
        }

        if (placeholdersData && Object.keys(placeholdersData).length > 0) {
          setAvailablePlaceholders(placeholdersData);
          setHasFetchedPlaceholders(true);
          prevTriggerRef.current = formData.triggerEvent;
        } else {
          setAvailablePlaceholders({});
          setHasFetchedPlaceholders(true);
          prevTriggerRef.current = formData.triggerEvent;
        }
      } catch (error) {
        console.error("Error fetching placeholders:", error);
        setAvailablePlaceholders({});
        setHasFetchedPlaceholders(true);
        prevTriggerRef.current = formData.triggerEvent;
      } finally {
        setLoadingPlaceholders(false);
      }
    };

    if (isOpen && formData.triggerEvent) {
      const timeoutId = setTimeout(fetchPlaceholders, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.triggerEvent, isOpen, hasFetchedPlaceholders]);

  // Update formData when editor content changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      emailBody: editorContent,
    }));
  }, [editorContent]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleVariableInsert = (variableKey) => {
    // Append the placeholder to the current content
    const placeholder = `{{${variableKey}}}`;
    setEditorContent((prev) => prev + placeholder);
  };

  // Handle inserting placeholder into subject field
  const handleSubjectVariableInsert = (variableKey) => {
    const placeholder = `${variableKey}`;
    const currentSubject = formData.subject || "";

    // For now, just append to the end
    const newSubject =
      currentSubject + (currentSubject ? " " : "") + placeholder;
    handleChange("subject", newSubject);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.templateName?.trim()) {
      newErrors["templateName"] = "Template name is required";
    }

    if (!formData.subject?.trim()) {
      newErrors["subject"] = "Email subject is required";
    }

    // Remove HTML tags for validation
    const plainText = formData.emailBody.replace(/<[^>]*>/g, "").trim();
    if (!plainText) {
      newErrors["emailBody"] = "Email body is required";
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
      // Prepare update data with ALL fields from the API
      const updateData = {
        emailTemplateId: formData.emailTemplateId,
        templateName: formData.templateName,
        adminId: formData.adminId, // Added
        subject: formData.subject,
        emailBody: formData.emailBody,
        category: formData.category,
        triggerEvent: formData.triggerEvent,
        createdAt: formData.createdAt, // Added
        default: formData.default, // Keep default field
        active: formData.active,
      };

      console.log("Sending update data:", updateData); // For debugging

      const response = await axiosInstance.put(
        "updateEmailTemplate",
        updateData
      );

      toast.success("Template updated successfully!");

      if (onTemplateUpdated) {
        onTemplateUpdated(response.data);
      }

      handleClose();
    } catch (error) {
      console.error("Error updating template:", error);
      console.error("Error response:", error.response); // For debugging

      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message;
        if (errorMessage) {
          toast.error(errorMessage);
        } else {
          toast.error("Validation error. Please check your input.");
        }
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (error.response?.data?.errors) {
        // Handle field-specific errors
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((field) => {
          toast.error(`${field}: ${errors[field]}`);
        });
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update template"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      emailTemplateId: "",
      templateName: "",
      adminId: "",
      subject: "",
      emailBody: "",
      category: category,
      triggerEvent: "",
      createdAt: "",
      default: false,
      active: true,
    });
    setOriginalData(null);
    setEditorContent("");
    setErrors({});
    setAvailablePlaceholders({});
    setShowPlaceholdersModal(false);
    setHasFetchedPlaceholders(false);
    setIsTriggerDisabled(true);
    prevTriggerRef.current = "";
    setPlaceholderInsertMode("body");
    onClose();
  };

  // Get total placeholders count
  const totalPlaceholders = useMemo(() => {
    return Object.values(availablePlaceholders).reduce(
      (total, arr) => total + arr.length,
      0
    );
  }, [availablePlaceholders]);

  // Calculate character count (excluding HTML tags)
  // Keep this as is - it should work with your RichTextEditor content
  const characterCount = useMemo(() => {
    return formData.emailBody.replace(/<[^>]*>/g, "").length;
  }, [formData.emailBody]);

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div
          ref={mainModalRef}
          className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[85vh] overflow-hidden border border-gray-200 flex flex-col my-4"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Edit {category} Email Template
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {formData.triggerEvent
                      ? getTriggerDisplayName(formData.triggerEvent)
                      : `${category} Category`}
                  </p>
                </div>
              </div>

              {/* Status Toggle moved to top right */}
              <div className="flex items-center gap-4">
                {/* <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-medium">Status:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => handleChange("active", e.target.checked)}
                      className="sr-only peer"
                      disabled={formData.default}
                    />
                    <div
                      className={`w-10 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                        formData.default
                          ? "bg-gray-300 cursor-not-allowed peer-checked:bg-gray-400"
                          : "bg-gray-300 peer-checked:bg-green-500"
                      }`}
                    ></div>
                    <span className="ml-2 text-sm font-medium">
                      {formData.active ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div> */}
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Body - Scrollable */}
          <div
            ref={mainContentRef}
            className="flex-1 overflow-y-auto p-6"
            style={{ maxHeight: "calc(85vh - 130px)" }}
          >
            {isFetching ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading template data...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Category Display (Read-only) */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {category} Category
                      </span>
                      {formData.triggerEvent && (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          {getTriggerDisplayName(formData.triggerEvent)}
                        </span>
                      )}
                      {formData.default && (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          Default Template
                        </span>
                      )}
                    </div>
                    {formData.createdAt && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                        Created:{" "}
                        {new Date(formData.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Template Name and Email Subject in one row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Template Name */}
                    <div>
                      <GlobalInputField
                        label={
                          <>
                            Template Name
                            <span className="text-red-500 ml-1">*</span>
                          </>
                        }
                        name="templateName"
                        value={formData.templateName}
                        onChange={(e) =>
                          handleChange("templateName", e.target.value)
                        }
                        error={errors["templateName"]}
                        placeholder={`e.g., Standard ${category} ${
                          formData.triggerEvent
                            ? getTriggerDisplayName(formData.triggerEvent)
                            : "Template"
                        }`}
                        className="text-sm"
                      />
                    </div>

                    {/* Email Subject */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-semibold text-gray-700">
                          <>
                            Email Subject
                            <span className="text-red-500 ml-1">*</span>
                          </>
                        </label>
                        {formData.triggerEvent && totalPlaceholders > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setPlaceholderInsertMode("subject");
                              setShowPlaceholdersModal(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
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
                                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                              />
                            </svg>
                            Email Subject Placeholder
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={(e) =>
                          handleChange("subject", e.target.value)
                        }
                        placeholder={
                          category === "TASK"
                            ? "e.g., Task Update: {{taskTitle}}"
                            : "e.g., New Proposal: {{proposalNumber}}"
                        }
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                          errors["subject"]
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors["subject"] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors["subject"]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Body - Rich Text Editor */}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        <>
                          Email Body
                          <span className="text-red-500 ml-1">*</span>
                        </>
                      </label>

                      <div className="flex">
                        <div className="flex items-center gap-3 ml-2">
                          <span className="text-xs text-gray-500">
                            {characterCount} characters
                          </span>
                        </div>
                        {formData.triggerEvent && totalPlaceholders > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setPlaceholderInsertMode("body");
                              setShowPlaceholdersModal(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 ml-2"
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
                                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                              />
                            </svg>
                            Email Body Placeholder
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Replace this entire div with RichTextEditor */}
                    <RichTextEditor
                      value={editorContent}
                      onChange={(content) => setEditorContent(content)}
                      placeholder={
                        category === "TASK"
                          ? "Enter your task email content here. Use placeholders like {{taskTitle}}, {{assigneeName}}, {{taskStatus}}, etc."
                          : "Enter your sales email content here. Use placeholders like {{clientName}}, {{proposalNumber}}, {{amount}}, etc."
                      }
                      height="300px"
                      toolbarConfig="email"
                      label=""
                      error={errors["emailBody"]}
                      required={true}
                      className={errors["emailBody"] ? "border-red-500" : ""}
                    />

                    {errors["emailBody"] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors["emailBody"]}
                      </p>
                    )}
                  </div>

                  {/* Default Template Warning */}
                  {formData.default && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.282 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm text-yellow-800 font-medium">
                            Default Template
                          </p>
                          <p className="text-xs text-yellow-700">
                            This template is set as default. Status cannot be
                            changed while it's the default template.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
                disabled={loading || isFetching}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || isFetching || !formData.triggerEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Update Template
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholders Modal */}
      <PlaceholdersModal
        isOpen={showPlaceholdersModal}
        onClose={() => {
          setShowPlaceholdersModal(false);
          setPlaceholderInsertMode("body"); // Reset to default
        }}
        placeholders={availablePlaceholders}
        triggerEvent={formData.triggerEvent}
        onInsert={
          placeholderInsertMode === "body"
            ? handleVariableInsert
            : handleSubjectVariableInsert
        }
        mode={placeholderInsertMode} // Pass the mode for UI indication
      />
    </>
  );
};

export default EditTemplate;
