import React, { useState, useEffect, useRef, useMemo } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
} from "../../BaseComponet/CustomerFormInputs";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// You'll need to install this library: npm install country-state-city
import { Country, State, City } from "country-state-city";

function CreateVendorModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // Tab state
  const [tabErrors, setTabErrors] = useState({}); // Track which tabs have errors
  const errorFieldRefs = useRef({});

  // Country-State-City data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [attachments, setAttachments] = useState([]);
  const [vendorSettings, setVendorSettings] = useState({});

  // Form state matching API structure
  const [formData, setFormData] = useState({
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
    attachments: [],
    vendorCodeNumber: "",
  });

  const [errors, setErrors] = useState({});

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

  // Required fields configuration - ONLY vendorName is required
  const requiredFields = {
    vendorCode: false,
    vendorName: true,
    companyName: false,
    emailAddress: false,
    phone: false,
    pan: false,
    balance: false,
    accountHolderName: false,
    bankName: false,
    accountNumber: false,
    ifscCode: false,
    street: false,
    city: false,
    state: false,
    zipCode: false,
    country: false,
    udyamRegistrationType: false,
    udyamRegistrationNumber: false,
  };

  // Load countries on component mount
  useEffect(() => {
    const countryList = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
      phoneCode: country.phonecode,
    }));
    setCountries(countryList);
    getVendorSettings();
    getNextVendorNumber();
  }, []);

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
      setSelectedState("");

      // Update form data
      const countryName =
        countries.find((c) => c.value === selectedCountry)?.label || "";
      setFormData((prev) => ({
        ...prev,
        country: countryName,
        state: "",
        city: "",
      }));
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

      // Update form data
      const stateName =
        states.find((s) => s.value === selectedState)?.label || "";
      setFormData((prev) => ({
        ...prev,
        state: stateName,
        city: "",
      }));
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
  const handlePhoneChange = (value, country, e, formattedValue) => {
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

  // Check if field is required
  const isFieldRequired = (field) => {
    return requiredFields[field];
  };

  // Focus on the first error field
  const focusOnFirstError = (newErrors) => {
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      // Find which tab contains this error
      let errorTab = "basic";
      for (const tab of tabs) {
        if (tab.fields.includes(firstErrorKey)) {
          errorTab = tab.id;
          break;
        }
      }

      setActiveTab(errorTab);

      setTimeout(() => {
        const fieldRef = errorFieldRefs.current[firstErrorKey];
        if (fieldRef && fieldRef.focus) {
          fieldRef.focus();
          fieldRef.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  // Handle file upload
  // Update handleFileUpload to create Blob immediately:
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];

        // Create Blob from the file directly (no need for base64 conversion)
        const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(blob);

        const newAttachment = {
          fileName: file.name,
          contentType: file.type,
          data: base64String, // Base64 for API
          blobUrl: url, // Object URL for preview
          file: file,
          id: Date.now() + Math.random().toString(36).substr(2, 9),
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  // Then use the stored blobUrl for preview:
  const handleFilePreview = (attachment) => {
    if (attachment.blobUrl) {
      window.open(attachment.blobUrl, "_blank");
    } else {
      // Fallback to base64 conversion
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

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      } catch (error) {
        console.error("Error previewing attachment:", error);
        toast.error("Failed to preview file");
      }
    }
  };

  // Clean up blob URLs when component unmounts or when removing attachments
  useEffect(() => {
    return () => {
      // Clean up all blob URLs when component unmounts
      attachments.forEach((attachment) => {
        if (attachment.blobUrl) {
          URL.revokeObjectURL(attachment.blobUrl);
        }
      });
    };
  }, [attachments]);

  // Also clean up when removing an attachment
  const handleRemoveAttachment = (id) => {
    const attachment = attachments.find((att) => att.id === id);
    if (attachment && attachment.blobUrl) {
      URL.revokeObjectURL(attachment.blobUrl);
    }
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  // File size validation (max 5MB)
  const validateFileSize = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  };

  // File type validation
  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const getNextVendorNumber = async () => {
    try {
      const responce = await axiosInstance.get("getNextVendorNumber");
      setFormData((prev) => ({
        ...prev,
        vendorCodeNumber: responce.data,
      }));
    } catch (error) {
      console.error("Failed to fetch max proposal number:", error);
      toast.error("Failed to fetch max proposal number.");
    }
  };

  const getVendorSettings = async () => {
    try {
      const response = await axiosInstance.get(
        "getFinanceSettingByType/VENDOR"
      );
      const data = response.data;
      setVendorSettings(data);
    } catch (error) {
      console.error("Failed to fetch proposal settings:", error);
      toast.error("Failed to fetch proposal settings.");
    }
  };

  const dynamicPrefix = useMemo(() => {
    if (!vendorSettings || !vendorSettings.prefix) return "";

    let prefix = `${vendorSettings.prefix}-`;
    const dateObj = new Date();

    if (vendorSettings.numberFormat === "YEAR") {
      const year = dateObj.getFullYear();
      prefix = `${prefix}${year}/`;
    } else if (vendorSettings.numberFormat === "FINANCIAL_YEAR") {
      const month = dateObj.getMonth();
      const currentYear = dateObj.getFullYear();

      let fyStart, fyEnd;
      if (month >= 3) {
        fyStart = currentYear;
        fyEnd = currentYear + 1;
      } else {
        fyStart = currentYear - 1;
        fyEnd = currentYear;
      }
      const shortEnd = String(fyEnd).slice(-2);
      prefix = `${prefix}${fyStart}/${shortEnd}/`;
    }

    return prefix;
  }, [vendorSettings]);

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

    // GST validation (only if GST is provided)
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
      focusOnFirstError(newErrors);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }
    const sequenceString = String(formData.vendorCodeNumber).padStart(6, "0");
    const finalFormattedString = `${dynamicPrefix}${sequenceString}`;

    setLoading(true);
    try {
      // Prepare vendor payload
      const vendorPayload = {
        vendorCode: finalFormattedString,
        vendorCodeNumber: formData.vendorCodeNumber,
        vendorName: formData.vendorName,
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
      };

      // Prepare attachments payload
      const vendorAttachmentsPayload =
        attachments.length > 0
          ? attachments.map((attachment) => ({
              fileName: attachment.fileName,
              contentType: attachment.contentType,
              data: attachment.data,
            }))
          : null; // Send null if no attachments

      // Prepare final payload matching API structure
      const finalPayload = {
        vendor: vendorPayload,
        vendorAttachments: vendorAttachmentsPayload,
      };

      console.log("Creating vendor with payload:", finalPayload);

      // Note: Update API endpoint if needed
      const response = await axiosInstance.post("createVendor", finalPayload);

      if (response.data) {
        console.log("Vendor created successfully:", response.data);
        toast.success("Vendor created successfully!");
        onSuccess(response.data);
        onClose();
      } else {
        throw new Error("No response data received");
      }
    } catch (error) {
      console.error("Error creating vendor:", error);

      // Enhanced error handling
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(
            "Validation error: " +
              (error.response.data?.message || "Check your input")
          );
        } else if (error.response.status === 413) {
          toast.error("File size too large. Maximum 5MB per file.");
        } else if (error.response.status === 415) {
          toast.error("Unsupported file type. Please upload valid documents.");
        } else if (error.response.status === 500) {
          toast.error(
            "Server error: " +
              (error.response.data?.message || "Internal server error")
          );
        } else {
          toast.error(
            "Failed to create vendor: " +
              (error.response.data?.message || "Unknown error")
          );
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to create vendor. Please try again.");
      }
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

  // Render Basic Information Tab - Removed asterisks from all except vendorName
  const renderBasicTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vendor Code Field - REQUIRED */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">
            Vendor Code <span className="text-red-500">*</span>
          </label>

          <div
            className={`flex items-center border rounded-lg overflow-hidden bg-white transition-colors ${
              errors["vendorCode"]
                ? "border-red-500 ring-1 ring-red-500"
                : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
            }`}
          >
            {/* The Static Prefix */}
            <div className="bg-gray-50 px-3 py-2 border-r border-gray-200 text-gray-500 font-medium text-sm select-none">
              {dynamicPrefix}
            </div>

            {/* The Input Field (User types only the number/suffix here) */}
            <input
              type="text"
              name="vendorCodeNumber"
              value={
                formData.vendorCodeNumber
                  ? formData.vendorCodeNumber.toString().padStart(6, "0")
                  : "000000"
              }
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                const numericValue = rawValue.slice(-6);

                handleChange("vendorCodeNumber", numericValue);
              }}
              placeholder="000001"
              className="flex-1 px-3 py-2 text-sm outline-none text-gray-700 placeholder-gray-400"
              ref={(el) => (errorFieldRefs.current["vendorCode"] = el)}
            />
          </div>

          {/* Error Message */}
          {errors["vendorCode"] && (
            <p className="text-red-500 text-xs mt-1">{errors["vendorCode"]}</p>
          )}
        </div>

        {/* Vendor Name Field */}
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
          ref={(el) => (errorFieldRefs.current["vendorName"] = el)}
        />

        {/* Rest of the fields remain the same */}
        <GlobalInputField
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
          error={errors["companyName"]}
          placeholder="Enter company name"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current["companyName"] = el)}
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
          ref={(el) => (errorFieldRefs.current["emailAddress"] = el)}
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span>Phone Number</span>
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

  // Render MSME Details Tab - Removed asterisks
  const renderMSMETab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          ref={(el) => (errorFieldRefs.current["gstNumber"] = el)}
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
          ref={(el) => (errorFieldRefs.current["pan"] = el)}
        />

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
              ref={(el) =>
                (errorFieldRefs.current["udyamRegistrationType"] = el)
              }
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
              ref={(el) =>
                (errorFieldRefs.current["udyamRegistrationNumber"] = el)
              }
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

  // Render Financial Details Tab - Removed asterisks
  const renderFinancialTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Opening Balance"
          name="balance"
          type="number"
          value={formData.balance}
          onChange={(e) => handleChange("balance", e.target.value)}
          error={errors["balance"]}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current["balance"] = el)}
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
            ref={(el) => (errorFieldRefs.current["accountHolderName"] = el)}
          />
          <GlobalInputField
            label="Bank Name"
            name="bankName"
            value={formData.bankName}
            onChange={(e) => handleChange("bankName", e.target.value)}
            error={errors["bankName"]}
            placeholder="e.g., State Bank of India"
            className="text-sm"
            ref={(el) => (errorFieldRefs.current["bankName"] = el)}
          />
          <GlobalInputField
            label="Account Number"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => handleChange("accountNumber", e.target.value)}
            error={errors["accountNumber"]}
            placeholder="1234567890"
            className="text-sm"
            ref={(el) => (errorFieldRefs.current["accountNumber"] = el)}
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
            ref={(el) => (errorFieldRefs.current["ifscCode"] = el)}
          />
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mt-2">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> Bank details are required for making payments
            to this vendor.
          </p>
        </div>
      </div>
    </div>
  );

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
            />
            <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
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
              Choose Files
            </span>
          </label>

          <p className="text-xs text-gray-400 mt-2">
            Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX (Max 5MB
            each)
          </p>
        </div>
      </div>

      {/* File list */}
      {attachments.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Uploaded Documents ({attachments.length})
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* File icon based on type */}
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      attachment.contentType.includes("image")
                        ? "bg-green-100 text-green-600"
                        : attachment.contentType.includes("pdf")
                        ? "bg-red-100 text-red-600"
                        : attachment.contentType.includes("word")
                        ? "bg-blue-100 text-blue-600"
                        : attachment.contentType.includes("excel")
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
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
                    <button
                      type="button"
                      onClick={() => handleFilePreview(attachment)}
                      className="text-left hover:text-blue-600 transition-colors focus:outline-none"
                      title="Click to preview in new tab"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachment.contentType} •{" "}
                        {(attachment.file.size / 1024).toFixed(1)} KB
                      </p>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove file"
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
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Upload relevant documents for vendor
              verification. These will be stored securely and associated with
              this vendor record.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Render Address Details Tab - Removed asterisks
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
          ref={(el) => (errorFieldRefs.current["street"] = el)}
        />

        <GlobalSelectField
          label="Country"
          name="country"
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          options={[{ value: "", label: "Select country" }, ...countries]}
          error={errors["country"]}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current["country"] = el)}
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
          ref={(el) => (errorFieldRefs.current["state"] = el)}
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
          ref={(el) => (errorFieldRefs.current["city"] = el)}
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
          ref={(el) => (errorFieldRefs.current["zipCode"] = el)}
        />
      </div>
    </div>
  );

  // Render Remarks Tab - No changes needed
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
        <p className="text-xs text-gray-500 mt-2">
          Add any special instructions, payment terms, or notes about your
          relationship with this vendor.
        </p>
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
                <h2 className="text-lg font-bold">Create New Vendor</h2>
                <p className="text-blue-100 text-xs">
                  Add vendor details below
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
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-end gap-3">
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
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                    Create Vendor
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateVendorModal;
