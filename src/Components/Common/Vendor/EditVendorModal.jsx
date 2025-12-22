import React, { useState, useEffect } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
} from "../../BaseComponet/CustomerFormInputs";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Country, State, City } from "country-state-city";
import { hasPermission } from "../../BaseComponet/permissions";
import { showErrorAlert,showDeleteConfirmation  } from "../../BaseComponet/alertUtils";

function EditVendorModal({ vendorId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [tabErrors, setTabErrors] = useState({});

  // Country-State-City data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [existingAttachments, setExistingAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const canEdit = hasPermission("vendor", "Edit");
  // Form state
  const [formData, setFormData] = useState({
    vendorId: "",
    vendorCode: "",
    vendorName: "",
    companyName: "",
    emailAddress: "",
    phone: "",
    balance: 0,
    pan: "",
    gstNumber: "",
    isMSMERegister: false,
    udyamRegistrationType: "",
    udyamRegistrationNumber: "",
    remark: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    createdAt: "", // Add this line
    createdBy: "",
  });

  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);

  // UDYAM registration types
  const udyamTypes = [
    { value: "", label: "Select UDYAM Type" },
    { value: "Micro", label: "Micro Enterprise" },
    { value: "Small", label: "Small Enterprise" },
    { value: "Medium", label: "Medium Enterprise" },
  ];

  // Tabs configuration
  const tabs = [
    {
      id: "basic",
      label: "Basic Information",
      fields: [
        "vendorCode",
        "vendorName",
        "companyName",
        "emailAddress",
        "phone",
      ],
    },
    {
      id: "msme",
      label: "MSME Details",
      fields: [
        "pan",
        "gstNumber",
        "udyamRegistrationType",
        "udyamRegistrationNumber",
      ],
    },
    {
      id: "financial",
      label: "Financial Details",
      fields: [
        "balance",
        "accountHolderName",
        "bankName",
        "accountNumber",
        "ifscCode",
      ],
    },
    {
      id: "address",
      label: "Address Details",
      fields: ["street", "city", "state", "zipCode", "country"],
    },
    {
      id: "attachments",
      label: "Attachments",
      fields: ["attachments"],
    },
    {
      id: "remarks",
      label: "Additional Info",
      fields: ["remark"],
    },
  ];

  // Load countries on component mount
  useEffect(() => {
    const countryList = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
      phoneCode: country.phonecode,
    }));
    setCountries(countryList);
  }, []);

  // Load vendor data when vendorId changes
  useEffect(() => {
    if (vendorId) {
      fetchVendorData();
    }
  }, [vendorId]);

  // Find country code by name
  const findCountryCodeByName = (countryName) => {
    const country = countries.find((c) => c.label === countryName);
    return country ? country.value : "";
  };

  // Find state code by name
  const findStateCodeByName = (stateName, countryCode) => {
    if (!countryCode || !stateName) return "";
    const stateList = State.getStatesOfCountry(countryCode);
    const state = stateList.find((s) => s.name === stateName);
    return state ? state.isoCode : "";
  };

  // Update country selection when form data changes
  useEffect(() => {
    if (formData.country && countries.length > 0) {
      const countryCode = findCountryCodeByName(formData.country);
      if (countryCode && countryCode !== selectedCountry) {
        setSelectedCountry(countryCode);
      }
    }
  }, [formData.country, countries]);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const stateList = State.getStatesOfCountry(selectedCountry).map(
        (state) => ({
          value: state.isoCode,
          label: state.name,
        })
      );
      setStates(stateList);
      setCities([]);

      // Update selectedState based on formData.state
      if (formData.state && !selectedState) {
        const stateCode = findStateCodeByName(formData.state, selectedCountry);
        if (stateCode) {
          setSelectedState(stateCode);
        }
      }
    }
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const cityList = City.getCitiesOfState(
        selectedCountry,
        selectedState
      ).map((city) => ({
        value: city.name,
        label: city.name,
      }));
      setCities(cityList);

      // Update city in formData if not set
      const stateName =
        states.find((s) => s.value === selectedState)?.label || "";
      if (stateName !== formData.state) {
        handleChange("state", stateName);
      }
    }
  }, [selectedState]);

  // Update tab errors when errors change
  useEffect(() => {
    const newTabErrors = {};
    tabs.forEach((tab) => {
      const hasError = tab.fields.some((field) => errors[field]);
      newTabErrors[tab.id] = hasError;
    });
    setTabErrors(newTabErrors);
  }, [errors]);

  // Fetch vendor data
  const fetchVendorData = async () => {
    setFetching(true);
    try {
      const response = await axiosInstance.get(`getVendorById/${vendorId}`);
      if (response.data) {
        const vendorData = response.data;
        setOriginalData(vendorData);

        // Set form data
        setFormData({
          vendorId: vendorData.vendorId || "",
          vendorCode: vendorData.vendorCode || "",
          vendorName: vendorData.vendorName || "",
          companyName: vendorData.companyName || "",
          emailAddress: vendorData.emailAddress || "",
          phone: vendorData.phone || "",
          balance: vendorData.balance || 0,
          pan: vendorData.pan || "",
          gstNumber: vendorData.gstNumber || "",
          isMSMERegister: vendorData.isMSMERegister || false,
          udyamRegistrationType: vendorData.udyamRegistrationType || "",
          udyamRegistrationNumber: vendorData.udyamRegistrationNumber || "",
          remark: vendorData.remark || "",
          accountHolderName: vendorData.accountHolderName || "",
          bankName: vendorData.bankName || "",
          accountNumber: vendorData.accountNumber || "",
          ifscCode: vendorData.ifscCode || "",
          street: vendorData.street || "",
          city: vendorData.city || "",
          state: vendorData.state || "",
          zipCode: vendorData.zipCode || "",
          country: vendorData.country || "",
          createdAt: vendorData.createdAt || "", // Add this line
          createdBy: vendorData.createdBy || "",
        });
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      toast.error("Failed to load vendor details");
      onClose();
    } finally {
      setFetching(false);
    }
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field if exists
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Fetch attachments when attachments tab is active
  useEffect(() => {
    if (activeTab === "attachments" && formData.vendorId) {
      fetchVendorAttachments();
    }
  }, [activeTab, formData.vendorId, canEdit]);

  const fetchVendorAttachments = async () => {
    setAttachmentsLoading(true);
    try {
      console.log("Fetching attachments for vendorId:", formData.vendorId);

      const response = await axiosInstance.get(
        `getVendorAttachmentByVendorId/${formData.vendorId}`
      );

      console.log("Attachments API response:", response);
      console.log("Attachments data:", response.data);

      if (response.data) {
        const attachmentsWithId = response.data.map((att) => {
          return {
            ...att,
            id: att.vendorAttachmentId, // Use vendorAttachmentId as the ID
            markedForDeletion: false,
          };
        });

        console.log("Processed attachments:", attachmentsWithId);
        setExistingAttachments(attachmentsWithId);
      } else {
        console.log("No data in response");
        setExistingAttachments([]);
      }
    } catch (error) {
      console.error("Error fetching attachments:", error);
      console.error("Error details:", error.response);
      toast.error("Failed to load attachments");
      setExistingAttachments([]);
    } finally {
      setAttachmentsLoading(false);
    }
  };
  //   =================attachments code
  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 5MB limit`);
        continue;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1];
        const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(blob);

        try {
          // Save attachment immediately via API
          const attachmentPayload = {
            vendorId: formData.vendorId,
            fileName: file.name,
            contentType: file.type,
            data: base64String,
          };

          console.log("Uploading attachment:", attachmentPayload);

          const response = await axiosInstance.post("addVendorAttachement", [
            attachmentPayload,
          ]);

          console.log("Upload response:", response.data);

          // Check if response is successful
          if (response.status === 200 || response.status === 201) {
            // Try different response structures
            let savedAttachment;
            let attachmentId;

            if (Array.isArray(response.data) && response.data.length > 0) {
              // Response is an array
              savedAttachment = response.data[0];
              attachmentId =
                savedAttachment.vendorAttachmentId || savedAttachment.id;
            } else if (response.data && typeof response.data === "object") {
              // Response is a single object
              savedAttachment = response.data;
              attachmentId =
                savedAttachment.vendorAttachmentId || savedAttachment.id;
            }

            if (attachmentId) {
              // Create new attachment object
              const newAttachment = {
                ...(savedAttachment || attachmentPayload),
                id: attachmentId,
                blobUrl: url,
                file: file,
                uploadedAt:
                  savedAttachment?.uploadedAt || new Date().toISOString(),
                uploadedBy: savedAttachment?.uploadedBy || "Current User",
              };

              // Add to existing attachments immediately
              setExistingAttachments((prev) => [...prev, newAttachment]);
              toast.success(`${file.name} uploaded successfully`);

              // Force a re-fetch to ensure we have the latest data
              setTimeout(() => {
                fetchVendorAttachments();
              }, 500);
            } else {
              // If no ID in response, still add to UI and refresh list
              const tempAttachment = {
                ...attachmentPayload,
                id: `temp-${Date.now()}`,
                blobUrl: url,
                file: file,
                uploadedAt: new Date().toISOString(),
                uploadedBy: "Current User",
              };

              setExistingAttachments((prev) => [...prev, tempAttachment]);
              toast.success(
                `${file.name} uploaded successfully - refreshing list`
              );

              // Refresh the attachments list
              fetchVendorAttachments();
            }
          } else {
            toast.error("Upload failed with status: " + response.status);
          }
        } catch (error) {
          console.error("Error uploading attachment:", error);
          console.error("Error response:", error.response?.data);
          toast.error(
            `Failed to upload ${file.name}: ${
              error.response?.data?.message || error.message
            }`
          );
          // Clean up blob URL if upload fails
          URL.revokeObjectURL(url);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Handle file preview
  const handleFilePreview = (attachment) => {
    if (attachment.blobUrl) {
      window.open(attachment.blobUrl, "_blank");
    } else if (attachment.data) {
      // For existing attachments without blobUrl
      try {
        const byteCharacters = atob(attachment.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: attachment.contentType });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        console.error("Error previewing attachment:", error);
        toast.error("Failed to preview file");
      }
    }
  };

  // Handle remove attachment
  const handleRemoveAttachment = async (id, fileName) => {
    try {
      // Confirm deletion
      const result = await showDeleteConfirmation(fileName);
      if (!result.isConfirmed) {
        return;
      }

      // 1. Remove from UI immediately (optimistic update)

      setExistingAttachments((prev) => prev.filter((att) => att.id !== id));

      // 2. Show loading
      const loadingToast = toast.loading(`Deleting ${fileName}...`);

      // 3. Call API - ADD ERROR CATCHING

      const response = await axiosInstance.delete(
        `deleteVendorAttachement/${id}`
      );

      // 4. Success - update toast
      toast.dismiss(loadingToast);
      toast.success(`${fileName} deleted successfully`);

      // 5. Optional: Refresh after a short delay
      setTimeout(() => {
        fetchVendorAttachments();
      }, 500);
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss();

      // Detailed error analysis
      if (error.response) {
        // Server responded with error status

        // Show specific error message
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error (${error.response.status})`;
        toast.error(`Failed to delete: ${errorMessage}`);
      } else if (error.request) {
        // Request made but no response
        toast.error("Network error - No response from server");
      } else {
        // Something else happened
        toast.error(`Request failed: ${error.message}`);
      }

      // 6. On error: Refresh to get correct state from server
      fetchVendorAttachments(); // Refresh to sync with server
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(attachment.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachment.contentType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("Failed to download file");
    }
  };
  // Restore removed attachment
  const handleRestoreAttachment = (id) => {
    setExistingAttachments((prev) =>
      prev.map((att) =>
        att.id === id ? { ...att, markedForDeletion: false } : att
      )
    );
  };

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      existingAttachments.forEach((attachment) => {
        if (attachment.blobUrl) {
          URL.revokeObjectURL(attachment.blobUrl);
        }
      });
    };
  }, [existingAttachments]);

  // Handle MSME registration toggle
  const handleMSMEToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isMSMERegister: checked,
      udyamRegistrationType: checked ? prev.udyamRegistrationType : "",
      udyamRegistrationNumber: checked ? prev.udyamRegistrationNumber : "",
    }));

    if (!checked) {
      setErrors((prev) => ({
        ...prev,
        udyamRegistrationType: "",
        udyamRegistrationNumber: "",
      }));
    }
  };

  // Handle phone number change
  const handlePhoneChange = (value) => {
    const completeNumber = value.startsWith("+") ? value : `+${value}`;
    handleChange("phone", completeNumber);
  };

  // Handle country change
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    const countryName =
      countries.find((c) => c.value === countryCode)?.label || "";
    handleChange("country", countryName);
  };

  // Handle state change
  const handleStateChange = (stateCode) => {
    setSelectedState(stateCode);
    const stateName = states.find((s) => s.value === stateCode)?.label || "";
    handleChange("state", stateName);
  };

  // Handle city change
  const handleCityChange = (cityName) => {
    handleChange("city", cityName);
  };

  // Set active tab when there's an error
  const setErrorTab = (newErrors) => {
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      let errorTab = "basic";
      for (const tab of tabs) {
        if (tab.fields.includes(firstErrorKey)) {
          errorTab = tab.id;
          break;
        }
      }
      setActiveTab(errorTab);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Only vendorName is required
    if (!formData.vendorName?.trim()) {
      newErrors["vendorName"] = "Vendor name is required";
    }

    // Email format validation (only if email is provided)
    if (
      formData.emailAddress?.trim() &&
      !/\S+@\S+\.\S+/.test(formData.emailAddress)
    ) {
      newErrors["emailAddress"] = "Email is invalid";
    }

    // Phone validation (only if phone is provided and doesn't start with +)
    if (formData.phone?.trim() && !formData.phone.startsWith("+")) {
      newErrors["phone"] =
        "Please enter a valid phone number with country code";
    }

    // PAN format validation (only if PAN is provided)
    if (
      formData.pan?.trim() &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)
    ) {
      newErrors["pan"] = "Invalid PAN format (e.g., ABCDE1234F)";
    }

    if (
      formData.gstNumber?.trim() &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.gstNumber
      )
    ) {
      newErrors["gstNumber"] = "Invalid GST format (e.g., 27ABCDE1234F1Z5)";
    }

    // MSME validation (if registered and fields are provided)
    if (formData.isMSMERegister) {
      if (
        formData.udyamRegistrationType &&
        !formData.udyamRegistrationNumber?.trim()
      ) {
        newErrors["udyamRegistrationNumber"] =
          "UDYAM registration number is required when type is selected";
      }
      if (
        formData.udyamRegistrationNumber?.trim() &&
        !formData.udyamRegistrationType
      ) {
        newErrors["udyamRegistrationType"] =
          "UDYAM registration type is required when number is provided";
      }
    }

    // ZIP code validation (only if provided and not 6 digits)
    if (formData.zipCode?.trim() && !/^\d{6}$/.test(formData.zipCode)) {
      newErrors["zipCode"] = "ZIP code must be 6 digits";
    }

    // Balance validation (only if provided and not a number)
    if (formData.balance && isNaN(parseFloat(formData.balance))) {
      newErrors["balance"] = "Balance must be a valid number";
    }

    // Bank details validation (only if any bank field is filled)
    const hasBankDetails =
      formData.accountHolderName?.trim() ||
      formData.bankName?.trim() ||
      formData.accountNumber?.trim() ||
      formData.ifscCode?.trim();

    if (hasBankDetails) {
      if (!formData.accountHolderName?.trim()) {
        newErrors["accountHolderName"] =
          "Account holder name is required when providing bank details";
      }
      if (!formData.bankName?.trim()) {
        newErrors["bankName"] =
          "Bank name is required when providing bank details";
      }
      if (!formData.accountNumber?.trim()) {
        newErrors["accountNumber"] =
          "Account number is required when providing bank details";
      } else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
        newErrors["accountNumber"] = "Account number must be 9-18 digits";
      }
      if (!formData.ifscCode?.trim()) {
        newErrors["ifscCode"] =
          "IFSC code is required when providing bank details";
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
        newErrors["ifscCode"] = "Invalid IFSC code format (e.g., SBIN0001234)";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrorTab(newErrors);
      return false;
    }

    return true;
  };

  // Check if form has changes and if vendorCode is modified
  // In hasChanges function (around line 618)
  const hasChanges = () => {
    if (!originalData) return false;

    const excludedFields = ["vendorId", "createdAt", "createdBy"]; // Add createdAt and createdBy here
    const changedFields = [];
    Object.keys(formData).forEach((key) => {
      if (excludedFields.includes(key)) return; // Skip excluded fields
      if (formData[key] !== originalData[key]) {
        changedFields.push(key);
      }
    });

    return changedFields.length > 0;
  };
  // Check if vendorCode specifically has been changed
  const isVendorCodeChanged = () => {
    if (!originalData) return false;
    return formData.vendorCode !== originalData.vendorCode;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vendorId: formData.vendorId,
        vendorCode: formData.vendorCode || "",
        vendorName: formData.vendorName || "",
        companyName: formData.companyName || "",
        emailAddress: formData.emailAddress || "",
        phone: formData.phone || "",
        balance: parseFloat(formData.balance) || 0,
        pan: formData.pan ? formData.pan.toUpperCase() : "",
        gstNumber: formData.gstNumber ? formData.gstNumber.toUpperCase() : "",
        isMSMERegister: formData.isMSMERegister,
        udyamRegistrationType: formData.isMSMERegister
          ? formData.udyamRegistrationType || ""
          : "",
        udyamRegistrationNumber: formData.isMSMERegister
          ? formData.udyamRegistrationNumber || ""
          : "",
        remark: formData.remark || "",
        accountHolderName: formData.accountHolderName || "",
        bankName: formData.bankName || "",
        accountNumber: formData.accountNumber || "",
        ifscCode: formData.ifscCode || "",
        street: formData.street || "",
        city: formData.city || "",
        state: formData.state || "",
        zipCode: formData.zipCode || "",
        country: formData.country || "",
        createdAt: formData.createdAt || "", // Add this line
        createdBy: formData.createdBy || "", // Add this line
      };

      console.log("Updating vendor with payload:", payload);

      const response = await axiosInstance.put("updateVendor", payload);

      if (response.data) {
        console.log("Vendor updated successfully:", response.data);
        toast.success("Vendor updated successfully!");
        onSuccess(response.data);
        onClose();
      } else {
        throw new Error("No response data received");
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
      // Error handling remains the same
    } finally {
      setLoading(false);
    }
  };

  // Handle next button click
  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  // Check if current tab is last tab
  const isLastTab = () => {
    return activeTab === tabs[tabs.length - 1].id;
  };

  // Check if current tab is first tab
  const isFirstTab = () => {
    return activeTab === tabs[0].id;
  };

  // Render loading state
  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[95vh] overflow-hidden border border-gray-200 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vendor details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Basic Information Tab
  const renderBasicTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vendor Code Field - READ ONLY */}
        <GlobalInputField
          label={
            <>
              Vendor Code
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="vendorCode"
          value={formData.vendorCode}
          onChange={(e) =>
            handleChange("vendorCode", e.target.value.toUpperCase())
          }
          error={errors["vendorCode"]}
          placeholder="Vendor code"
          className="text-sm uppercase bg-gray-50 text-gray-800 "
        />

        <GlobalInputField
          label={
            <>
              Vendor Name
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="vendorName"
          value={formData.vendorName}
          onChange={(e) => handleChange("vendorName", e.target.value)}
          error={errors["vendorName"]}
          placeholder="Enter vendor name"
          className="text-sm"
        />

        <GlobalInputField
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
          error={errors["companyName"]}
          placeholder="Enter company name"
          className="text-sm"
        />

        <GlobalInputField
          label="Email Address"
          name="emailAddress"
          type="email"
          value={formData.emailAddress}
          onChange={(e) => handleChange("emailAddress", e.target.value)}
          error={errors["emailAddress"]}
          placeholder="vendor@company.com"
          className="text-sm"
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div
            className={`phone-input-wrapper ${
              errors["phone"] ? "border-red-500 rounded-lg" : ""
            }`}
          >
            <PhoneInput
              country={"in"}
              value={formData.phone || ""}
              onChange={handlePhoneChange}
              enableSearch={true}
              placeholder="Enter phone number"
              inputClass="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              buttonClass="!border-r-0 !rounded-l"
              inputStyle={{
                width: "100%",
                height: "40px",
                borderLeft: "none",
                borderTopLeftRadius: "0",
                borderBottomLeftRadius: "0",
              }}
              buttonStyle={{
                borderRight: "none",
                borderTopRightRadius: "0",
                borderBottomRightRadius: "0",
                height: "40px",
              }}
            />
          </div>
          {errors["phone"] && (
            <p className="text-red-500 text-xs flex items-center gap-1">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors["phone"]}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Render MSME Details Tab
  const renderMSMETab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Add GST Number field here */}
        <GlobalInputField
          label="GST Number"
          name="gstNumber"
          value={formData.gstNumber}
          onChange={(e) =>
            handleChange("gstNumber", e.target.value.toUpperCase())
          }
          error={errors["gstNumber"]}
          placeholder="27ABCDE1234F1Z5"
          className="text-sm uppercase"
          maxLength="15"
        />
        <GlobalInputField
          label="PAN Number"
          name="pan"
          value={formData.pan}
          onChange={(e) => handleChange("pan", e.target.value.toUpperCase())}
          error={errors["pan"]}
          placeholder="ABCDE1234F"
          className="text-sm uppercase"
          maxLength="10"
        />
      </div>

      <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg">
        <input
          type="checkbox"
          id="isMSMERegister"
          checked={formData.isMSMERegister}
          onChange={(e) => handleMSMEToggle(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="isMSMERegister"
          className="text-sm font-medium text-gray-700"
        >
          MSME Registered
        </label>
      </div>

      {formData.isMSMERegister && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <GlobalSelectField
              label="UDYAM Registration Type"
              name="udyamRegistrationType"
              value={formData.udyamRegistrationType}
              onChange={(e) =>
                handleChange("udyamRegistrationType", e.target.value)
              }
              options={udyamTypes}
              error={errors["udyamRegistrationType"]}
              className="text-sm"
            />
            <GlobalInputField
              label="UDYAM Registration Number"
              name="udyamRegistrationNumber"
              value={formData.udyamRegistrationNumber}
              onChange={(e) =>
                handleChange("udyamRegistrationNumber", e.target.value)
              }
              error={errors["udyamRegistrationNumber"]}
              placeholder="MH-12-3456"
              className="text-sm"
            />
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> MSME registration helps in availing
              government benefits and preferences.
            </p>
          </div>
        </>
      )}
    </div>
  );

  // Render Financial Details Tab
  const renderFinancialTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Balance"
          name="balance"
          type="number"
          value={formData.balance}
          onChange={(e) => handleChange("balance", e.target.value)}
          error={errors["balance"]}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="text-sm"
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Bank Account Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlobalInputField
            label="Account Holder Name"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={(e) => handleChange("accountHolderName", e.target.value)}
            error={errors["accountHolderName"]}
            placeholder="Enter account holder name"
            className="text-sm"
          />
          <GlobalInputField
            label="Bank Name"
            name="bankName"
            value={formData.bankName}
            onChange={(e) => handleChange("bankName", e.target.value)}
            error={errors["bankName"]}
            placeholder="e.g., State Bank of India"
            className="text-sm"
          />
          <GlobalInputField
            label="Account Number"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => handleChange("accountNumber", e.target.value)}
            error={errors["accountNumber"]}
            placeholder="1234567890"
            className="text-sm"
          />
          <GlobalInputField
            label="IFSC Code"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={(e) =>
              handleChange("ifscCode", e.target.value.toUpperCase())
            }
            error={errors["ifscCode"]}
            placeholder="SBIN0001234"
            className="text-sm uppercase"
          />
        </div>
      </div>
    </div>
  );

  // Render Attachments Tab
  // Render Attachments Tab
  const renderAttachmentsTab = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">
            Upload Vendor Documents
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Upload PAN card, GST certificate, bank statements, etc.
          </p>

          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              id="file-upload"
              disabled={!canEdit}
            />
            <span
              className={`inline-flex items-center px-4 py-2 ${
                canEdit
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white text-sm font-medium rounded-lg transition-colors`}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {canEdit ? "Choose Files" : "Upload Disabled"}
            </span>
          </label>
          <p className="text-xs text-gray-400 mt-2">
            Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX (Max 5MB
            each)
          </p>
          {!canEdit && (
            <p className="text-xs text-red-500 mt-2">
              You don't have permission to upload files
            </p>
          )}
        </div>
      </div>

      {/* Existing Attachments */}
      {existingAttachments.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Documents ({existingAttachments.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {existingAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      attachment.contentType.includes("image")
                        ? "bg-green-100 text-green-600"
                        : attachment.contentType.includes("pdf")
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {attachment.contentType.includes("image") ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : attachment.contentType.includes("pdf") ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {attachment.contentType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={() => handleDownloadAttachment(attachment)}
                    className="p-1 text-green-600 hover:text-green-800 transition-colors"
                    title="Download file"
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>

                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => handleFilePreview(attachment)}
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Preview file"
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>

                  {/* Delete Button (only if canEdit) */}
                  {/* Delete Button (only if canEdit) */}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveAttachment(
                          attachment.id,
                          attachment.fileName,
                          true
                        )
                      }
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete file"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {existingAttachments.length === 0 && (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      )}
    </div>
  );
  // Render Address Details Tab
  const renderAddressTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalTextAreaField
          label="Street Address"
          name="street"
          value={formData.street}
          onChange={(e) => handleChange("street", e.target.value)}
          error={errors["street"]}
          placeholder="Building name, street, area"
          rows={2}
          className="text-sm md:col-span-2"
        />

        <GlobalSelectField
          label="Country"
          name="country"
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          options={[{ value: "", label: "Select country" }, ...countries]}
          error={errors["country"]}
          className="text-sm"
        />

        <GlobalSelectField
          label="State"
          name="state"
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
          options={[{ value: "", label: "Select state" }, ...states]}
          error={errors["state"]}
          disabled={!selectedCountry}
          className="text-sm"
        />

        <GlobalSelectField
          label="City"
          name="city"
          value={formData.city}
          onChange={(e) => handleCityChange(e.target.value)}
          options={[{ value: "", label: "Select city" }, ...cities]}
          error={errors["city"]}
          disabled={!selectedState}
          className="text-sm"
        />

        <GlobalInputField
          label="ZIP Code"
          name="zipCode"
          value={formData.zipCode}
          onChange={(e) => handleChange("zipCode", e.target.value)}
          error={errors["zipCode"]}
          placeholder="422001"
          maxLength="6"
          className="text-sm"
        />
      </div>
    </div>
  );

  // Render Remarks Tab
  const renderRemarksTab = () => (
    <div className="space-y-4">
      <div>
        <GlobalTextAreaField
          label="Remarks"
          name="remark"
          value={formData.remark}
          onChange={(e) => handleChange("remark", e.target.value)}
          placeholder="Any additional notes about this vendor..."
          rows={6}
          className="text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[95vh] overflow-hidden border border-gray-200 flex flex-col">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Edit Vendor</h2>
                <p className="text-blue-100 text-xs">
                  Edit vendor details below
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                } ${tabErrors[tab.id] ? "pr-8" : ""}`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                {tabErrors[tab.id] && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit}>
            {activeTab === "basic" && renderBasicTab()}
            {activeTab === "msme" && renderMSMETab()}
            {activeTab === "financial" && renderFinancialTab()}
            {activeTab === "address" && renderAddressTab()}
            {activeTab === "attachments" && renderAttachmentsTab()}
            {activeTab === "remarks" && renderRemarksTab()}
          </form>
        </div>

        {/* Modal Footer */}
        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {/* Add permission message */}
              {!canEdit && (
                
                <span className="flex items-center gap-1 text-red-600">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.246 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  You don't have edit permission
                </span>
            
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>

              {!isFirstTab() && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
                >
                  Previous
                </button>
              )}

              {!isLastTab() ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                           !canEdit
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      Update Vendor
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditVendorModal;
