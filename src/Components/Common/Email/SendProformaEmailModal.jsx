import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import RichTextEditor from "../../BaseComponet/RichTextEditor";
import PlaceholdersModal from "../Settings/Template/Email/PlaceholdersModal";
import { pdf } from "@react-pdf/renderer";
import ProformaPDF from "../Proforma/ProformaPDF"; // You need to have/create this component
import { useLayout } from "../../Layout/useLayout";

const SendProformaEmailModal = ({
  isOpen,
  onClose,
  proformaId,
  proformaNumber,
  customerEmail,
}) => {
  const { role } = useLayout();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedTemplateData, setSelectedTemplateData] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    emailBody: "",
    attachPdf: true,
  });
  const [errors, setErrors] = useState({});
  const [editorContent, setEditorContent] = useState("");
  const [isFetchingTemplates, setIsFetchingTemplates] = useState(false);
  const [availablePlaceholders, setAvailablePlaceholders] = useState({});
  const [showPlaceholdersModal, setShowPlaceholdersModal] = useState(false);
  const [placeholderInsertMode, setPlaceholderInsertMode] = useState("body");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [pdfBase64, setPdfBase64] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [proformaDataForPdf, setProformaDataForPdf] = useState(null);

  // Refs for cursor position tracking
  const subjectInputRef = useRef(null);
  const [subjectCursorPosition, setSubjectCursorPosition] = useState({
    start: 0,
    end: 0,
  });
  const richTextEditorRef = useRef(null);

  // Fetch proforma data for PDF generation
  const fetchProformaDataForPdf = useCallback(async () => {
    if (!proformaId) return null;

    try {
      let adminInformation = null;
      const response = await axiosInstance.get(
        `getProformaInvoiceById/${proformaId}`
      );

      if (role === "ROLE_ADMIN") {
        const adminResponse = await axiosInstance.get(`/admin/getAdminInfo`);
        adminInformation = adminResponse.data;
      } else if (role === "ROLE_EMPLOYEE") {
        const employeeResponse = await axiosInstance.get(
          `/employee/getEmployeeInfo`
        );
        const employeeResponseData = employeeResponse.data;
        adminInformation = employeeResponseData.admin;
      }

      const proformaData = response.data;
      const proformaDataToSend = {
        ...proformaData,
        adminInformation: adminInformation || null,
      };

      return proformaDataToSend;
    } catch (error) {
      console.error("Error fetching proforma data for PDF:", error);
      toast.error("Failed to fetch proforma data for PDF generation");
      return null;
    }
  }, [proformaId, role]);

  // Generate PDF as base64
  const generatePdfBase64 = useCallback(async (proformaData) => {
    if (!proformaData) return "";

    try {
      setIsGeneratingPdf(true);

      // Create PDF document - Use ProformaPDF component
      const doc = (
        <ProformaPDF
          invoiceData={proformaData}
          adminInformation={proformaData?.adminInformation}
        />
      );

      // Generate PDF as blob
      const blob = await pdf(doc).toBlob();

      // Convert blob to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        };
        reader.onerror = reject;
      });

      return base64;
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
      return "";
    } finally {
      setIsGeneratingPdf(false);
    }
  }, []);

  // Generate PDF when modal opens (if attachPdf is checked)
  useEffect(() => {
    const generateProformaPdf = async () => {
      if (!isOpen || !proformaId || !formData.attachPdf) return;

      try {
        // Fetch proforma data
        const data = await fetchProformaDataForPdf();
        if (!data) {
          setPdfBase64("");
          return;
        }

        // Store data for potential re-generation
        setProformaDataForPdf(data);

        // Generate PDF base64
        const base64 = await generatePdfBase64(data);
        setPdfBase64(base64);
      } catch (error) {
        console.error("Error in PDF generation flow:", error);
        setPdfBase64("");
      }
    };

    generateProformaPdf();
  }, [
    isOpen,
    proformaId,
    formData.attachPdf,
    fetchProformaDataForPdf,
    generatePdfBase64,
  ]);

  // Fetch templates for PROFORMA_SEND trigger
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!isOpen || hasInitialized) return;

      setIsFetchingTemplates(true);
      try {
        const response = await axiosInstance.get(
          "getEmailTemplates/SALES/PROFORMA_SEND"
        );
        const templatesData = response.data || [];
        setTemplates(templatesData);

        if (templatesData.length > 0) {
          const defaultTemplate = templatesData.find(
            (template) => template.default
          );
          const firstTemplate = defaultTemplate || templatesData[0];

          setSelectedTemplateId(firstTemplate.emailTemplateId);
          setSelectedTemplateData(firstTemplate);

          setFormData({
            subject: firstTemplate.subject || "",
            emailBody: firstTemplate.emailBody || "",
            attachPdf: true,
          });

          setEditorContent(firstTemplate.emailBody || "");
        }

        setHasInitialized(true);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to load email templates");
      } finally {
        setIsFetchingTemplates(false);
      }
    };

    fetchTemplates();
  }, [isOpen, hasInitialized]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false);
      setPdfBase64("");
      setProformaDataForPdf(null);
      setIsGeneratingPdf(false);
    }
  }, [isOpen]);

  // Fetch placeholders for PROFORMA_SEND
  useEffect(() => {
    const fetchPlaceholders = async () => {
      if (!isOpen) return;

      try {
        const response = await axiosInstance.get(
          "getTampletePlaceholders/PROFORMA_SEND"
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
        }
      } catch (error) {
        console.error("Error fetching placeholders:", error);
      }
    };

    fetchPlaceholders();
  }, [isOpen]);

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);

    if (templateId === "") {
      setSelectedTemplateData(null);
      setFormData((prev) => ({
        ...prev,
        subject: "",
        emailBody: "",
      }));
      setEditorContent("");
      return;
    }

    const template = templates.find((t) => t.emailTemplateId === templateId);

    if (template) {
      setSelectedTemplateData(template);
      setFormData((prev) => ({
        ...prev,
        subject: template.subject || "",
        emailBody: template.emailBody || "",
      }));
      setEditorContent(template.emailBody || "");
    } else {
      setSelectedTemplateData(null);
      setFormData((prev) => ({
        ...prev,
        subject: "",
        emailBody: "",
      }));
      setEditorContent("");
    }
  };

  // Sync editor content with form data
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      emailBody: editorContent,
    }));
  }, [editorContent]);

  useEffect(() => {
    if (
      formData.emailBody !== editorContent &&
      formData.emailBody !== undefined
    ) {
      setEditorContent(formData.emailBody);
    }
  }, [formData.emailBody]);

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

  // Handle checkbox change
  const handleAttachPdfChange = async (e) => {
    const shouldAttach = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      attachPdf: shouldAttach,
    }));

    // If user enables PDF attachment and we don't have PDF yet, generate it
    if (shouldAttach && !pdfBase64 && !isGeneratingPdf) {
      try {
        const data = await fetchProformaDataForPdf();
        if (data) {
          const base64 = await generatePdfBase64(data);
          setPdfBase64(base64);
        }
      } catch (error) {
        console.error("Error generating PDF when checkbox checked:", error);
      }
    }
  };

  // Handle inserting placeholder into email body at cursor position
  const handleVariableInsert = (variableKey) => {
    const placeholder = `${variableKey}`;

    // Use the exposed method from RichTextEditor to insert at cursor position
    if (richTextEditorRef.current && richTextEditorRef.current.insertAtCursor) {
      richTextEditorRef.current.insertAtCursor(placeholder);
    } else {
      // Fallback: append at the end
      setEditorContent((prev) => prev + placeholder);
    }
  };

  // Handle inserting placeholder into subject field at cursor position
  const handleSubjectVariableInsert = (variableKey) => {
    const placeholder = `${variableKey}`;
    const currentSubject = formData.subject || "";

    // Insert at saved cursor position
    const { start, end } = subjectCursorPosition;
    const newSubject =
      currentSubject.substring(0, start) +
      placeholder +
      currentSubject.substring(end);

    handleChange("subject", newSubject);

    // Move cursor after inserted placeholder
    setTimeout(() => {
      if (subjectInputRef.current) {
        const newCursorPos = start + placeholder.length;
        subjectInputRef.current.focus();
        subjectInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Open subject placeholders modal and save cursor position
  const openSubjectPlaceholdersModal = () => {
    // Save cursor position from subject input
    if (subjectInputRef.current) {
      const start = subjectInputRef.current.selectionStart;
      const end = subjectInputRef.current.selectionEnd;
      setSubjectCursorPosition({ start, end });
    }
    setPlaceholderInsertMode("subject");
    setShowPlaceholdersModal(true);
  };

  // Open body placeholders modal and save cursor position
  const openBodyPlaceholdersModal = () => {
    // Save cursor position in rich text editor before opening modal
    if (
      richTextEditorRef.current &&
      richTextEditorRef.current.saveCursorPosition
    ) {
      richTextEditorRef.current.saveCursorPosition();
    }
    setPlaceholderInsertMode("body");
    setShowPlaceholdersModal(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject?.trim()) {
      newErrors.subject = "Email subject is required";
    }

    const plainText = formData.emailBody.replace(/<[^>]*>/g, "").trim();
    if (!plainText) {
      newErrors.emailBody = "Email body is required";
    }

    // Validate PDF only if attachment is enabled
    if (formData.attachPdf && !pdfBase64 && !isGeneratingPdf) {
      newErrors.pdf =
        "PDF is not ready yet. Please wait a moment or uncheck PDF attachment.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before sending");
      return;
    }

    // If PDF is still generating, wait for it
    if (formData.attachPdf && isGeneratingPdf) {
      toast.error("PDF is still being generated. Please wait...");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: proformaId,
        subject: formData.subject,
        emailBody: formData.emailBody,
        pdf: formData.attachPdf ? pdfBase64 : "",
      };

      // Use the proforma-specific API endpoint
      const response = await axiosInstance.post("sendProformaEmail", payload);
      toast.success("Proforma invoice sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);

      if (error.response?.status === 400) {
        toast.error(
          error.response.data?.message ||
            "Validation error. Please check your input."
        );
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(error.response?.data?.message || "Failed to send email");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      subject: "",
      emailBody: "",
      attachPdf: true,
    });
    setSelectedTemplateId("");
    setSelectedTemplateData(null);
    setEditorContent("");
    setErrors({});
    setAvailablePlaceholders({});
    setShowPlaceholdersModal(false);
    setTemplates([]);
    setHasInitialized(false);
    setPdfBase64("");
    setProformaDataForPdf(null);
    setIsGeneratingPdf(false);
    onClose();
  };

  const characterCount = useMemo(() => {
    return formData.emailBody.replace(/<[^>]*>/g, "").length;
  }, [formData.emailBody]);

  const totalPlaceholders = useMemo(() => {
    return Object.values(availablePlaceholders).reduce(
      (total, arr) => total + arr.length,
      0
    );
  }, [availablePlaceholders]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
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
                    Send Proforma Invoice via Email
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {proformaNumber || `Proforma Invoice #${proformaId}`}
                  </p>
                </div>
              </div>
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

          {/* Modal Body */}
          <div
            className="flex-1 overflow-y-auto p-6"
            style={{ maxHeight: "calc(90vh - 130px)" }}
          >
            <form onSubmit={handleSendEmail}>
              <div className="space-y-6">
                {/* Template Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Email Template
                    {isFetchingTemplates && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Loading...)
                      </span>
                    )}
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    disabled={isFetchingTemplates}
                  >
                    <option value="">No Template (Start from scratch)</option>
                    {templates.map((template) => (
                      <option
                        key={template.emailTemplateId}
                        value={template.emailTemplateId}
                      >
                        {template.templateName}
                        {template.default && " (Default)"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PDF Attachment Checkbox */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="attachPdf"
                      checked={formData.attachPdf}
                      onChange={handleAttachPdfChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isGeneratingPdf}
                    />
                    <div>
                      <label
                        htmlFor="attachPdf"
                        className="text-sm font-semibold text-gray-700 cursor-pointer"
                      >
                        Attach Proforma Invoice as PDF
                        {isGeneratingPdf && formData.attachPdf && (
                          <span className="ml-2 text-xs text-blue-600">
                            (Preparing...)
                          </span>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.attachPdf
                          ? "PDF will be attached to the email"
                          : "Email will be sent without PDF attachment"}
                      </p>
                    </div>
                  </div>
                  {errors.pdf && formData.attachPdf && (
                    <p className="text-red-500 text-xs mt-1">{errors.pdf}</p>
                  )}
                </div>

                {/* Email Subject */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Subject
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    {totalPlaceholders > 0 && (
                      <button
                        type="button"
                        onClick={openSubjectPlaceholdersModal}
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
                        Insert Placeholder
                      </button>
                    )}
                  </div>
                  <input
                    ref={subjectInputRef}
                    type="text"
                    value={formData.subject}
                    onChange={(e) => {
                      handleChange("subject", e.target.value);
                      // Update cursor position on change
                      setSubjectCursorPosition({
                        start: e.target.selectionStart,
                        end: e.target.selectionEnd,
                      });
                    }}
                    onSelect={(e) => {
                      setSubjectCursorPosition({
                        start: e.target.selectionStart,
                        end: e.target.selectionEnd,
                      });
                    }}
                    onKeyUp={(e) => {
                      setSubjectCursorPosition({
                        start: e.target.selectionStart,
                        end: e.target.selectionEnd,
                      });
                    }}
                    onMouseUp={(e) => {
                      setSubjectCursorPosition({
                        start: e.target.selectionStart,
                        end: e.target.selectionEnd,
                      });
                    }}
                    placeholder="e.g., Proforma Invoice: {{proformaNumber}}"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.subject
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Email Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Body
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {characterCount} characters
                      </span>
                      {totalPlaceholders > 0 && (
                        <button
                          type="button"
                          onClick={openBodyPlaceholdersModal}
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
                          Insert Placeholder
                        </button>
                      )}
                    </div>
                  </div>

                  <RichTextEditor
                    ref={richTextEditorRef}
                    value={editorContent}
                    onChange={(content) => setEditorContent(content)}
                    placeholder="Enter your email content here. Use placeholders like {{proformaNumber}}, {{clientName}}, {{totalAmount}}, etc."
                    height="250px"
                    toolbarConfig="email"
                    label=""
                    error={errors.emailBody}
                    required={true}
                    className={errors.emailBody ? "border-red-500" : ""}
                  />

                  {errors.emailBody && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.emailBody}
                    </p>
                  )}
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
                onClick={handleSendEmail}
                disabled={loading || (formData.attachPdf && isGeneratingPdf)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Send Email
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
          setPlaceholderInsertMode("body");
        }}
        placeholders={availablePlaceholders}
        triggerEvent="PROFORMA_SEND"
        onInsert={
          placeholderInsertMode === "body"
            ? handleVariableInsert
            : handleSubjectVariableInsert
        }
        mode={placeholderInsertMode}
      />
    </>
  );
};

export default SendProformaEmailModal;
