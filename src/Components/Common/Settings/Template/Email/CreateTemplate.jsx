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

const CreateTemplate = ({
  isOpen,
  onClose,
  trigger = "",
  category = "SALES",
  onTemplateCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingPlaceholders, setLoadingPlaceholders] = useState(false);
  const [availablePlaceholders, setAvailablePlaceholders] = useState({});
  const [hasFetchedPlaceholders, setHasFetchedPlaceholders] = useState(false);
  const [showPlaceholdersModal, setShowPlaceholdersModal] = useState(false);
  const [editorContent, setEditorContent] = useState("");

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

  // Form state matching API structure
  const [formData, setFormData] = useState({
    category: category,
    triggerEvent: trigger || "",
    templateName: "",
    subject: "",
    emailBody: "",
    active: true,
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens or trigger/category changes
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        category: category,
        triggerEvent: trigger || "",
      }));
      setEditorContent("");
      setHasFetchedPlaceholders(false);
      setAvailablePlaceholders({});
    }
  }, [isOpen, trigger, category]);

  // Update formData when editor content changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      emailBody: editorContent,
    }));
  }, [editorContent]);

  // Fetch placeholders when trigger changes
  useEffect(() => {
    const fetchPlaceholders = async () => {
      if (!isOpen) return;

      if (!formData.triggerEvent) {
        setAvailablePlaceholders({});
        setHasFetchedPlaceholders(false);
        return;
      }

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
          if (
            typeof response.data === "object" &&
            !Array.isArray(response.data)
          ) {
            placeholdersData = response.data;
          } else if (
            response.data.data &&
            typeof response.data.data === "object"
          ) {
            placeholdersData = response.data.data;
          } else if (Array.isArray(response.data)) {
            placeholdersData = {
              General: response.data.map((item) => ({
                label: item.label || item.name || item.key,
                key: item.key || item.value,
              })),
            };
          } else if (typeof response.data === "string") {
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

    if (isOpen) {
      const timeoutId = setTimeout(fetchPlaceholders, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.triggerEvent, isOpen, hasFetchedPlaceholders]);

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

    if (field === "triggerEvent") {
      setHasFetchedPlaceholders(false);
      setAvailablePlaceholders({});
    }
  };

const handleVariableInsert = (variableKey) => {
  // Since RichTextEditor manages its own content via state,
  // we'll append the placeholder to the current content
  const placeholder = `{{${variableKey}}}`;
  setEditorContent((prev) => prev + placeholder);

  // Focus back on the editor after insertion
  // You might need to add a ref to RichTextEditor and call focus method
  // or handle this within the PlaceholdersModal
};

  // Handle inserting placeholder into subject field
  const handleSubjectVariableInsert = (variableKey) => {
    const placeholder = `${variableKey}`;
    const currentSubject = formData.subject || "";

    // If cursor is in subject input, we need a ref to handle that
    // For now, just append to the end
    const newSubject =
      currentSubject + (currentSubject ? " " : "") + placeholder;
    handleChange("subject", newSubject);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.triggerEvent?.trim()) {
      newErrors["triggerEvent"] = "Trigger event is required";
    }

    if (!formData.templateName?.trim()) {
      newErrors["templateName"] = "Template name is required";
    }

    if (!formData.subject?.trim()) {
      newErrors["subject"] = "Email subject is required";
    }

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
      const response = await axiosInstance.post(
        "createEmailTemplate",
        formData
      );

      toast.success("Template created successfully!");

      if (onTemplateCreated) {
        onTemplateCreated(response.data);
      }

      handleClose();
    } catch (error) {
      console.error("Error creating template:", error);

      if (error.response?.status === 400) {
        toast.error(
          error.response.data?.message ||
            "Validation error. Please check your input."
        );
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create template"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      category: category,
      triggerEvent: trigger || "",
      templateName: "",
      subject: "",
      emailBody: "",
      active: true,
    });
    setEditorContent("");
    setErrors({});
    setAvailablePlaceholders({});
    setShowPlaceholdersModal(false);
    setHasFetchedPlaceholders(false);
    prevTriggerRef.current = "";
    onClose();
  };

  // Get total placeholders count
  const totalPlaceholders = useMemo(() => {
    return Object.values(availablePlaceholders).reduce(
      (total, arr) => total + arr.length,
      0
    );
  }, [availablePlaceholders]);

  // Replace the current characterCount useMemo:
  const characterCount = useMemo(() => {
    // Remove HTML tags and count characters
    const plainText = formData.emailBody.replace(/<[^>]*>/g, "");
    return plainText.length;
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
                      d="M3 8l7.89-4.78a2 2 0 012.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Create {category} Email Template
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
                  </div>
                  {/* <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                    <span className="text-sm font-medium">Status:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          handleChange("active", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      <span className="ml-2 text-sm font-medium">
                        {formData.active ? "Active" : "Inactive"}
                      </span>
                    </label>
                  </div> */}
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
                            setPlaceholderInsertMode("subject"); // Set to subject mode
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
                      onChange={(e) => handleChange("subject", e.target.value)}
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
                    label="" // Empty since we have our own label above
                    error={errors["emailBody"]}
                    required={true}
                    className={errors["emailBody"] ? "border-red-500" : ""}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.triggerEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Template
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

export default CreateTemplate;
