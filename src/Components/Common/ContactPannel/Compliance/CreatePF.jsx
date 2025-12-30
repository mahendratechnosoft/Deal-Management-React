import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
} from "../../../BaseComponet/CustomerFormInputs";
import axiosInstance from "../../../BaseComponet/axiosInstance";

function CreatePFModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [tabErrors, setTabErrors] = useState({});
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [attachmentBack, setAttachmentBack] = useState(null); // NEW for back side
const [attachmentPan, setAttachmentPan] = useState(null); // NEW for PAN

const [attachmentErrorBack, setAttachmentErrorBack] = useState(""); // NEW
const [attachmentErrorPan, setAttachmentErrorPan] = useState(""); // NEW
  // Refs for focusing on error fields
  const errorFieldRefs = useRef({});

  const [formData, setFormData] = useState({
    name: "",
    dateOfJoining: "",
    uan: "",
    dateOfBirth: "",
    fatherName: "",
    email: "",
    phone: "",
    aadhaarNumber: "",
    gender: "MALE",
    married: false,
    pan: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
  aadhaarPhoto: "", // Add this
  aadhaarPhotoBack: "", // NEW
  panPhoto: "", // NEW
  grossSalary: "",     
  });

  const [errors, setErrors] = useState({});

  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHER", label: "Other" },
  ];

  // Tabs configuration matching AMC modal structure
  const tabs = [
    {
      id: "basic",
      label: "Basic Information",
      fields: ["name", "fatherName", "dateOfJoining", "dateOfBirth", "uan"],
    },
    {
      id: "contact",
      label: "Contact Information",
      fields: ["email", "phone"],
    },
    {
      id: "identification",
      label: "Identification",
      fields: ["aadhaarNumber", "gender", "pan","married"],
    },
    {
      id: "bank",
      label: "Bank Details",
      fields: ["accountHolderName", "bankName", "accountNumber", "ifsc"],
    },
    {
      id: "document",
      label: "Aadhaar Document",
        fields: ["aadhaarPhoto", "aadhaarPhotoBack", "panPhoto"], 
    },
  ];

  // Update tab errors when errors change
  useEffect(() => {
    const newTabErrors = {};

    tabs.forEach((tab) => {
      const hasError = tab.fields.some((field) => {
        return errors[field];
      });

      newTabErrors[tab.id] = hasError;
    });

    setTabErrors(newTabErrors);
  }, [errors]);

  // Focus on the first error field
  const focusOnFirstError = (newErrors) => {
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      let errorTab = "basic";

      // Determine which tab contains the error
      if (
        ["name", "fatherName", "dateOfJoining", "dateOfBirth", "uan"].includes(
          firstErrorKey
        )
      ) {
        errorTab = "basic";
      } else if (["email", "phone"].includes(firstErrorKey)) {
        errorTab = "contact";
      } else if (["aadhaarNumber", "gender", "pan"].includes(firstErrorKey)) {
        errorTab = "identification";
      } else if (
        ["accountHolderName", "bankName", "accountNumber", "ifsc"].includes(
          firstErrorKey
        )
      ) {
        errorTab = "bank";
      } else if (firstErrorKey === "aadhaarPhoto") {
        errorTab = "document";
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

  // Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

  // Handle file attachment
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

 // Change from 5MB to 200KB:
const maxSize = 200 * 1024; // 200KB
if (file.size > maxSize) {
  setAttachmentError("File size exceeds 200KB limit");
  toast.error("File size exceeds 200KB limit");
  return;
}

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setAttachmentError(
        "Only image files are allowed (JPEG, PNG, GIF, WebP, BMP)"
      );
      toast.error("Invalid file type. Please upload an image file.");
      return;
    }

    const newAttachment = {
      id: Date.now(),
      file: file,
      fileName: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
    };

    setAttachment(newAttachment);
    setAttachmentError("");

    // Clear any previous attachment error
    if (errors.aadhaarPhoto) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.aadhaarPhoto;
        return newErrors;
      });
    }

    toast.success("Aadhaar photo uploaded successfully");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle Aadhaar Back Side attachment
const handleAttachmentChangeBack = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const maxSize = 200 * 1024; // 200KB
  if (file.size > maxSize) {
    setAttachmentErrorBack("File size exceeds 200KB limit");
    toast.error("File size exceeds 200KB limit");
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setAttachmentErrorBack(
      "Only image files are allowed (JPEG, PNG, GIF, WebP, BMP)"
    );
    toast.error("Invalid file type. Please upload an image file.");
    return;
  }

  const newAttachment = {
    id: Date.now(),
    file: file,
    fileName: file.name,
    size: file.size,
    type: file.type,
    preview: URL.createObjectURL(file),
  };

  setAttachmentBack(newAttachment);
  setAttachmentErrorBack("");
  
  // Clear any previous attachment error
  if (errors.aadhaarPhotoBack) {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.aadhaarPhotoBack;
      return newErrors;
    });
  }

  toast.success("Aadhaar back side uploaded successfully");
};

// Handle PAN/License attachment
const handleAttachmentChangePan = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const maxSize = 200 * 1024; // 200KB
  if (file.size > maxSize) {
    setAttachmentErrorPan("File size exceeds 200KB limit");
    toast.error("File size exceeds 200KB limit");
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setAttachmentErrorPan(
      "Only image files are allowed (JPEG, PNG, GIF, WebP, BMP)"
    );
    toast.error("Invalid file type. Please upload an image file.");
    return;
  }

  const newAttachment = {
    id: Date.now(),
    file: file,
    fileName: file.name,
    size: file.size,
    type: file.type,
    preview: URL.createObjectURL(file),
  };

  setAttachmentPan(newAttachment);
  setAttachmentErrorPan("");
  
  // Clear any previous attachment error
  if (errors.panPhoto) {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.panPhoto;
      return newErrors;
    });
  }

  toast.success("PAN/License uploaded successfully");
};

  // Preview attachment
  const handlePreviewAttachment = () => {
    if (!attachment) return;
    try {
      if (attachment.type.includes("image")) {
        const blobUrl = URL.createObjectURL(attachment.file);
        const newWindow = window.open(blobUrl, "_blank");
        if (newWindow) {
          newWindow.focus();
          newWindow.onload = () => {
            setTimeout(() => {
              URL.revokeObjectURL(blobUrl);
            }, 1000);
          };
          setTimeout(() => {
            try {
              URL.revokeObjectURL(blobUrl);
            } catch (e) { }
          }, 5000);
        } else {
          toast.error("Popup blocked. Please allow popups to preview image.");
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "90vw";
            img.style.maxHeight = "90vh";
            const modal = document.createElement("div");
            modal.style.position = "fixed";
            modal.style.top = "0";
            modal.style.left = "0";
            modal.style.width = "100%";
            modal.style.height = "100%";
            modal.style.backgroundColor = "rgba(0,0,0,0.8)";
            modal.style.display = "flex";
            modal.style.alignItems = "center";
            modal.style.justifyContent = "center";
            modal.style.zIndex = "9999";
            modal.style.cursor = "pointer";
            modal.appendChild(img);
            modal.onclick = () => document.body.removeChild(modal);
            document.body.appendChild(modal);
          };
          reader.readAsDataURL(attachment.file);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        }
      }
    } catch (error) {
      console.error("Error previewing attachment:", error);
      toast.error("Failed to preview image");
    }
  };

  // Download attachment
  const handleDownloadAttachment = () => {
    if (!attachment) return;
    try {
      const blobUrl = URL.createObjectURL(attachment.file);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = attachment.fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (e) { }
      }, 100);
      toast.success(`Downloading ${attachment.fileName}`);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("Failed to download file");
    }
  };

  // Remove attachment
  const handleRemoveAttachment = () => {
    if (attachment) {
      if (attachment.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      setAttachment(null);
      setAttachmentError("");
      toast.success("Aadhaar photo removed");
    }
  };

  // Clean up object URL on unmount
useEffect(() => {
  return () => {
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    if (attachmentBack?.preview) {
      URL.revokeObjectURL(attachmentBack.preview);
    }
    if (attachmentPan?.preview) {
      URL.revokeObjectURL(attachmentPan.preview);
    }
  };
}, [attachment, attachmentBack, attachmentPan]);

  // Convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    switch (name) {
      case "name":
      case "fatherName":
      case "accountHolderName":
      case "bankName":
        if (/^[a-zA-Z\s]*$/.test(value) || value === "") {
          if (value.length <= 100) {
            processedValue = value;
          }
        }
        break;
      case "uan":
        if (/^\d{0,12}$/.test(value)) {
          processedValue = value;
        }
        break;
      case "phone":
        // For phone input field with country code, we'll handle separately
        processedValue = value;
        break;
      case "aadhaarNumber":
        if (/^\d{0,12}$/.test(value)) {
          processedValue = value;
        }
        break;
      case "pan":
        if (/^[A-Z0-9]{0,10}$/.test(value.toUpperCase())) {
          processedValue = value.toUpperCase();
        }
        break;
      case "accountNumber":
        if (/^\d{0,20}$/.test(value)) {
          processedValue = value;
        }
        break;
      case "ifsc":
        if (/^[A-Z0-9]{0,11}$/.test(value.toUpperCase())) {
          processedValue = value.toUpperCase();
        }
        break;
      case "email":
        if (value.length <= 100) {
          processedValue = value.toLowerCase();
        }
        break;
        case "grossSalary":
  if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
    processedValue = value;
  }
  break;
      default:
        processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle phone number change with country code
  const handlePhoneChange = (phoneNumber) => {
    setFormData((prev) => ({
      ...prev,
      phone: phoneNumber,
    }));

    // Clear error for phone if exists
    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (name.length > 100) return "Name cannot exceed 100 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return "Name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email format";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return "Phone number is required";
    if (!phone.startsWith("+"))
      return "Please enter a valid phone number with country code";
    if (phone.replace(/\D/g, "").length < 10)
      return "Phone number must be at least 10 digits";
    return "";
  };

  const validateAadhaar = (aadhaar) => {
    if (!aadhaar.trim()) return "Aadhaar number is required";
    if (!/^\d{12}$/.test(aadhaar)) return "Aadhaar number must be 12 digits";
    return "";
  };

  const validatePAN = (pan) => {
    if (!pan.trim()) return "PAN is required";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan))
      return "Invalid PAN format (e.g., ABCDE1234F)";
    return "";
  };

  const validateUAN = (uan) => {
    // If UAN is provided, validate it, otherwise it's optional
    if (uan && uan.trim() !== "") {
      if (!/^\d{12}$/.test(uan)) return "UAN must be 12 digits";
    }
    return "";
  };

  const validateBankAccount = (account) => {
    if (!account.trim()) return "Account number is required";
    if (!/^\d{9,20}$/.test(account))
      return "Account number must be 9-20 digits";
    return "";
  };

  const validateIFSC = (ifsc) => {
    if (!ifsc.trim()) return "IFSC code is required";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc))
      return "Invalid IFSC format (e.g., SBIN0000456)";
    return "";
  };

  const validateRequired = (fieldName, value, displayName) => {
    if (!value.trim()) return `${displayName} is required`;
    return "";
  };

  const validateDate = (fieldName, value, displayName) => {
    if (!value) return `${displayName} is required`;
    const date = new Date(value);
    const today = new Date();

    if (fieldName === "dateOfBirth") {
      const minAgeDate = new Date();
      minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);
      if (date > minAgeDate) return "Employee must be at least 18 years old";
    }

    if (fieldName === "dateOfJoining") {
      if (date > today) return "Date of joining cannot be in the future";
    }

    return "";
  };

  // Main validation function
  const validateForm = () => {
    const newErrors = {};

    // Basic information
    newErrors.name = validateName(formData.name);

    newErrors.dateOfJoining = validateDate(
      "dateOfJoining",
      formData.dateOfJoining,
      "Date of joining"
    );
    newErrors.dateOfBirth = validateDate(
      "dateOfBirth",
      formData.dateOfBirth,
      "Date of birth"
    );


    // Contact information
    newErrors.email = validateEmail(formData.email);
    newErrors.phone = validatePhone(formData.phone);

    // Identification
    newErrors.aadhaarNumber = validateAadhaar(formData.aadhaarNumber);
    newErrors.pan = validatePAN(formData.pan);

    // Bank information
    newErrors.accountHolderName = validateRequired(
      "accountHolderName",
      formData.accountHolderName,
      "Account holder name"
    );
    newErrors.bankName = validateRequired(
      "bankName",
      formData.bankName,
      "Bank name"
    );
    newErrors.accountNumber = validateBankAccount(formData.accountNumber);
    newErrors.ifsc = validateIFSC(formData.ifsc);

    // Validate date order
    if (formData.dateOfJoining && formData.dateOfBirth) {
      const joinDate = new Date(formData.dateOfJoining);
      const birthDate = new Date(formData.dateOfBirth);
      if (joinDate < birthDate) {
        newErrors.dateOfJoining =
          "Date of joining cannot be before date of birth";
      }
    }

    // Aadhaar photo validation
    if (!attachment) {
      newErrors.aadhaarPhoto = "Aadhaar photo is required";
    }

    // Inside validateForm function, add:

// Gross Salary validation
newErrors.grossSalary = validateRequired(
  "grossSalary", 
  formData.grossSalary, 
  "Gross salary"
);

// Optional: Add numeric validation
if (formData.grossSalary && !/^\d+(\.\d{1,2})?$/.test(formData.grossSalary)) {
  newErrors.grossSalary = "Please enter a valid salary amount (e.g., 50000 or 50000.50)";
}

// Aadhaar photo validations
if (!attachment) {
  newErrors.aadhaarPhoto = "Aadhaar front photo is required";
}

if (!attachmentBack) {
  newErrors.aadhaarPhotoBack = "Aadhaar back side is required";
}

if (!attachmentPan) {
  newErrors.panPhoto = "PAN Card or License is required";
}


    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors(filteredErrors);

    // Focus on first error if any
    if (Object.keys(filteredErrors).length > 0) {
      focusOnFirstError(filteredErrors);
    }

    return Object.keys(filteredErrors).length === 0;


  };

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error("Please fix all form errors before submitting.");
    return;
  }

  setLoading(true);
  try {
    let aadhaarPhotoBase64 = null;
    let aadhaarPhotoBackBase64 = null;
    let panPhotoBase64 = null;
    
    if (attachment) {
      aadhaarPhotoBase64 = await convertFileToBase64(attachment.file);
    }
    if (attachmentBack) {
      aadhaarPhotoBackBase64 = await convertFileToBase64(attachmentBack.file);
    }
    if (attachmentPan) {
      panPhotoBase64 = await convertFileToBase64(attachmentPan.file);
    }

    const payload = {
      name: formData.name.trim(),
      dateOfJoining: formData.dateOfJoining,
      uan: formData.uan,
      dateOfBirth: formData.dateOfBirth,
      fatherName: formData.fatherName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone,
      aadhaarNumber: formData.aadhaarNumber,
      gender: formData.gender,
      married: formData.married,
      pan: formData.pan,
      accountHolderName: formData.accountHolderName.trim(),
      bankName: formData.bankName.trim(),
      accountNumber: formData.accountNumber,
      ifsc: formData.ifsc,
      grossSalary: formData.grossSalary,
      aadhaarPhoto: aadhaarPhotoBase64,
      aadhaarPhotoBack: aadhaarPhotoBackBase64,
      panPhoto: panPhotoBase64,
    };

      const response = await axiosInstance.post("createPf", payload);

      if (response.data) {
        toast.success("PF record created successfully!");
        onSuccess(response.data);
        onClose();
      } else {
        throw new Error("No response data received");
      }
    } catch (error) {
      console.error("Error creating PF record:", error);
      if (error.response) {
        if (error.response.status === 500) {
          toast.error(
            "Server error: " +
            (error.response.data?.message || "Check console for details")
          );
        } else if (error.response.status === 400) {
          toast.error(
            "Validation error: " +
            (error.response.data?.message || "Please check all fields")
          );
        } else {
          toast.error(
            "Failed to create PF record: " +
            (error.response.data?.message || "Unknown error")
          );
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to create PF record. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for date restrictions
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Calculate max date for date of birth (18 years ago)
  const getMaxBirthDate = () => {
    const today = new Date();
    const maxDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return maxDate.toISOString().split("T")[0];
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

  // Render Basic Tab
  const renderBasicTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Employee Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required={true}
          error={errors.name}
          placeholder="Enter full name"
          maxLength={100}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.name = el)}
        />
    <GlobalInputField
  label="Father's Name"
  name="fatherName"
  value={formData.fatherName}
  onChange={handleChange}
  error={errors.fatherName}
  placeholder="Enter father's name"
  maxLength={100}
  className="text-sm"
  ref={(el) => (errorFieldRefs.current.fatherName = el)}
/>
        <GlobalInputField
          label="Date of Joining"
          name="dateOfJoining"
          type="date"
          value={formData.dateOfJoining}
          onChange={handleChange}
          required={true}
          error={errors.dateOfJoining}
          max={getTodayDate()}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.dateOfJoining = el)}
        />
        <GlobalInputField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required={true}
          error={errors.dateOfBirth}
          max={getMaxBirthDate()}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.dateOfBirth = el)}
        />
        <GlobalInputField
          label="UAN Number"
          name="uan"
          value={formData.uan}
          onChange={handleChange}
          error={errors.uan}
          placeholder="12 digit UAN (Optional)"
          maxLength={12}
          pattern="\d{12}"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.uan = el)}
        />
        <GlobalInputField
  label="Gross Salary (₹)"
  name="grossSalary"
  value={formData.grossSalary}
  onChange={handleChange}
  required={true}
  error={errors.grossSalary}
  placeholder="e.g., 50000.00"
  className="text-sm"
  ref={(el) => (errorFieldRefs.current.grossSalary = el)}
/>
      </div>
    </div>
  );

  // Render Contact Tab with PhoneInput
  const renderContactTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required={true}
          error={errors.email}
          placeholder="employee@example.com"
          maxLength={100}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.email = el)}
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span>Phone Number</span>
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div
            className={`phone-input-wrapper ${errors.phone ? "border-red-500 rounded-lg" : ""
              }`}
          >
            <PhoneInput
              country={"in"}
              value={formData.phone || ""}
              onChange={(value, country, e, formattedValue) => {
                const completeNumber = value.startsWith("+")
                  ? value
                  : `+${value}`;
                handlePhoneChange(completeNumber);
              }}
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
          {errors.phone && (
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
              {errors.phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Render Identification Tab
  const renderIdentificationTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Aadhaar Number"
          name="aadhaarNumber"
          value={formData.aadhaarNumber}
          onChange={handleChange}
          required={true}
          error={errors.aadhaarNumber}
          placeholder="12 digit Aadhaar"
          maxLength={12}
          pattern="\d{12}"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.aadhaarNumber = el)}
        />
        <GlobalSelectField
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={genderOptions}
          className="text-sm"
        />
        <GlobalInputField
          label="PAN Number"
          name="pan"
          value={formData.pan}
          onChange={handleChange}
          required={true}
          error={errors.pan}
          placeholder="ABCDE1234F"
          maxLength={10}
          pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.pan = el)}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Marital Status
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                name="married"
                checked={formData.married}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Married</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Bank Tab
  const renderBankTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Account Holder Name"
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleChange}
          required={true}
          error={errors.accountHolderName}
          placeholder="Name as per bank record"
          maxLength={100}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.accountHolderName = el)}
        />
        <GlobalInputField
          label="Bank Name"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          required={true}
          error={errors.bankName}
          placeholder="Bank name"
          maxLength={100}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.bankName = el)}
        />
        <GlobalInputField
          label="Account Number"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          required={true}
          error={errors.accountNumber}
          placeholder="9-20 digit account number"
          maxLength={20}
          pattern="\d{9,20}"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.accountNumber = el)}
        />
        <GlobalInputField
          label="IFSC Code"
          name="ifsc"
          value={formData.ifsc}
          onChange={handleChange}
          required={true}
          error={errors.ifsc}
          placeholder="SBIN0000456"
          maxLength={11}
          pattern="[A-Z]{4}0[A-Z0-9]{6}"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.ifsc = el)}
        />
      </div>
    </div>
  );


  // Preview Aadhaar Back Side attachment
const handlePreviewAttachmentBack = () => {
  if (!attachmentBack) return;
  try {
    if (attachmentBack.type.includes("image")) {
      const blobUrl = URL.createObjectURL(attachmentBack.file);
      const newWindow = window.open(blobUrl, "_blank");
      if (newWindow) {
        newWindow.focus();
        newWindow.onload = () => {
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 1000);
        };
        setTimeout(() => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (e) { }
        }, 5000);
      } else {
        toast.error("Popup blocked. Please allow popups to preview image.");
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.maxWidth = "90vw";
          img.style.maxHeight = "90vh";
          const modal = document.createElement("div");
          modal.style.position = "fixed";
          modal.style.top = "0";
          modal.style.left = "0";
          modal.style.width = "100%";
          modal.style.height = "100%";
          modal.style.backgroundColor = "rgba(0,0,0,0.8)";
          modal.style.display = "flex";
          modal.style.alignItems = "center";
          modal.style.justifyContent = "center";
          modal.style.zIndex = "9999";
          modal.style.cursor = "pointer";
          modal.appendChild(img);
          modal.onclick = () => document.body.removeChild(modal);
          document.body.appendChild(modal);
        };
        reader.readAsDataURL(attachmentBack.file);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      }
    }
  } catch (error) {
    console.error("Error previewing attachment:", error);
    toast.error("Failed to preview image");
  }
};

// Preview PAN/License attachment
const handlePreviewAttachmentPan = () => {
  if (!attachmentPan) return;
  try {
    if (attachmentPan.type.includes("image")) {
      const blobUrl = URL.createObjectURL(attachmentPan.file);
      const newWindow = window.open(blobUrl, "_blank");
      if (newWindow) {
        newWindow.focus();
        newWindow.onload = () => {
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 1000);
        };
        setTimeout(() => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (e) { }
        }, 5000);
      } else {
        toast.error("Popup blocked. Please allow popups to preview image.");
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.maxWidth = "90vw";
          img.style.maxHeight = "90vh";
          const modal = document.createElement("div");
          modal.style.position = "fixed";
          modal.style.top = "0";
          modal.style.left = "0";
          modal.style.width = "100%";
          modal.style.height = "100%";
          modal.style.backgroundColor = "rgba(0,0,0,0.8)";
          modal.style.display = "flex";
          modal.style.alignItems = "center";
          modal.style.justifyContent = "center";
          modal.style.zIndex = "9999";
          modal.style.cursor = "pointer";
          modal.appendChild(img);
          modal.onclick = () => document.body.removeChild(modal);
          document.body.appendChild(modal);
        };
        reader.readAsDataURL(attachmentPan.file);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      }
    }
  } catch (error) {
    console.error("Error previewing attachment:", error);
    toast.error("Failed to preview image");
  }
};

// Download Aadhaar Back Side attachment
const handleDownloadAttachmentBack = () => {
  if (!attachmentBack) return;
  try {
    const blobUrl = URL.createObjectURL(attachmentBack.file);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = attachmentBack.fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (e) { }
    }, 100);
    toast.success(`Downloading ${attachmentBack.fileName}`);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    toast.error("Failed to download file");
  }
};

// Download PAN/License attachment
const handleDownloadAttachmentPan = () => {
  if (!attachmentPan) return;
  try {
    const blobUrl = URL.createObjectURL(attachmentPan.file);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = attachmentPan.fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (e) { }
    }, 100);
    toast.success(`Downloading ${attachmentPan.fileName}`);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    toast.error("Failed to download file");
  }
};

// Remove Aadhaar Back Side attachment
const handleRemoveAttachmentBack = () => {
  if (attachmentBack) {
    if (attachmentBack.preview) {
      URL.revokeObjectURL(attachmentBack.preview);
    }
    setAttachmentBack(null);
    setAttachmentErrorBack("");
    toast.success("Aadhaar back side removed");
  }
};

// Remove PAN/License attachment
const handleRemoveAttachmentPan = () => {
  if (attachmentPan) {
    if (attachmentPan.preview) {
      URL.revokeObjectURL(attachmentPan.preview);
    }
    setAttachmentPan(null);
    setAttachmentErrorPan("");
    toast.success("PAN/License removed");
  }
};
  // Render Document Tab
// Replace the entire renderDocumentTab function with:

const renderDocumentTab = () => (
  <div className="space-y-6">
    {/* Aadhaar Front Side */}
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">Aadhaar Front Side</h4>
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleAttachmentChange}
          className="hidden"
          id="aadhaar-upload-front"
          accept="image/*"
        />
        <label
          htmlFor="aadhaar-upload-front"
          className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${attachment
              ? "bg-green-50 border-green-300 hover:border-green-400"
              : errors.aadhaarPhoto
                ? "bg-red-50 border-red-300 hover:border-red-400"
                : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
            }`}
        >
          <div className="text-center">
            <svg
              className={`w-8 h-8 mx-auto mb-2 ${attachment
                  ? "text-green-500"
                  : errors.aadhaarPhoto
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
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
            <p
              className={`text-sm ${attachment
                  ? "text-green-700"
                  : errors.aadhaarPhoto
                    ? "text-red-700"
                    : "text-gray-600"
                }`}
            >
              {attachment
                ? "Aadhaar front side uploaded ✓"
                : "Click to upload Aadhaar front side"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, GIF, WebP, BMP (Max 200KB)
            </p>
          </div>
        </label>
      </div>
      {errors.aadhaarPhoto && (
        <p className="mt-2 text-xs text-red-600">{errors.aadhaarPhoto}</p>
      )}
      {attachmentError && (
        <p className="mt-2 text-xs text-red-600">{attachmentError}</p>
      )}
      
      {attachment && (
        <div className="mt-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
            <div
              className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
              onClick={handlePreviewAttachment}
              title="Click to preview"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded border border-gray-200 overflow-hidden">
                <img
                  src={attachment.preview}
                  alt="Aadhaar preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 text-xs truncate hover:text-blue-600">
                  {attachment.fileName}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviewAttachment}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                title="Preview"
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
              <button
                type="button"
                onClick={handleDownloadAttachment}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                title="Download"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                title="Remove"
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
        </div>
      )}
    </div>

    {/* Aadhaar Back Side */}
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">Aadhaar Back Side</h4>
      <div className="relative">
        <input
          type="file"
          onChange={handleAttachmentChangeBack}
          className="hidden"
          id="aadhaar-upload-back"
          accept="image/*"
        />
        <label
          htmlFor="aadhaar-upload-back"
          className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${attachmentBack
              ? "bg-green-50 border-green-300 hover:border-green-400"
              : errors.aadhaarPhotoBack
                ? "bg-red-50 border-red-300 hover:border-red-400"
                : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
            }`}
        >
          <div className="text-center">
            <svg
              className={`w-8 h-8 mx-auto mb-2 ${attachmentBack
                  ? "text-green-500"
                  : errors.aadhaarPhotoBack
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
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
            <p
              className={`text-sm ${attachmentBack
                  ? "text-green-700"
                  : errors.aadhaarPhotoBack
                    ? "text-red-700"
                    : "text-gray-600"
                }`}
            >
              {attachmentBack
                ? "Aadhaar back side uploaded ✓"
                : "Click to upload Aadhaar back side"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, GIF, WebP, BMP (Max 200KB)
            </p>
          </div>
        </label>
      </div>
      {errors.aadhaarPhotoBack && (
        <p className="mt-2 text-xs text-red-600">{errors.aadhaarPhotoBack}</p>
      )}
      {attachmentErrorBack && (
        <p className="mt-2 text-xs text-red-600">{attachmentErrorBack}</p>
      )}
      
      {attachmentBack && (
        <div className="mt-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
            <div
              className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
              onClick={handlePreviewAttachmentBack}
              title="Click to preview"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded border border-gray-200 overflow-hidden">
                <img
                  src={attachmentBack.preview}
                  alt="Aadhaar back preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 text-xs truncate hover:text-blue-600">
                  {attachmentBack.fileName}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(attachmentBack.size)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviewAttachmentBack}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                title="Preview"
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
              <button
                type="button"
                onClick={handleDownloadAttachmentBack}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                title="Download"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRemoveAttachmentBack}
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                title="Remove"
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
        </div>
      )}
    </div>

    {/* PAN Card or License */}
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">PAN Card or License</h4>
      <div className="relative">
        <input
          type="file"
          onChange={handleAttachmentChangePan}
          className="hidden"
          id="pan-upload"
          accept="image/*"
        />
        <label
          htmlFor="pan-upload"
          className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${attachmentPan
              ? "bg-green-50 border-green-300 hover:border-green-400"
              : errors.panPhoto
                ? "bg-red-50 border-red-300 hover:border-red-400"
                : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
            }`}
        >
          <div className="text-center">
            <svg
              className={`w-8 h-8 mx-auto mb-2 ${attachmentPan
                  ? "text-green-500"
                  : errors.panPhoto
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
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
            <p
              className={`text-sm ${attachmentPan
                  ? "text-green-700"
                  : errors.panPhoto
                    ? "text-red-700"
                    : "text-gray-600"
                }`}
            >
              {attachmentPan
                ? "PAN/License uploaded ✓"
                : "Click to upload PAN Card or License"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, GIF, WebP, BMP (Max 200KB)
            </p>
          </div>
        </label>
      </div>
      {errors.panPhoto && (
        <p className="mt-2 text-xs text-red-600">{errors.panPhoto}</p>
      )}
      {attachmentErrorPan && (
        <p className="mt-2 text-xs text-red-600">{attachmentErrorPan}</p>
      )}
      
      {attachmentPan && (
        <div className="mt-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
            <div
              className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
              onClick={handlePreviewAttachmentPan}
              title="Click to preview"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-white rounded border border-gray-200 overflow-hidden">
                <img
                  src={attachmentPan.preview}
                  alt="PAN/License preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 text-xs truncate hover:text-blue-600">
                  {attachmentPan.fileName}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(attachmentPan.size)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviewAttachmentPan}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                title="Preview"
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
              <button
                type="button"
                onClick={handleDownloadAttachmentPan}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50"
                title="Download"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleRemoveAttachmentPan}
                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                title="Remove"
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
        </div>
      )}
    </div>
  </div>
);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200 flex flex-col">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Create PF Record</h2>
                <p className="text-blue-100 text-xs">
                  Fill in the employee PF information
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
                className={`relative flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${activeTab === tab.id
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
            {activeTab === "contact" && renderContactTab()}
            {activeTab === "identification" && renderIdentificationTab()}
            {activeTab === "bank" && renderBankTab()}
            {activeTab === "document" && renderDocumentTab()}
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Create PF Record
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

export default CreatePFModal;
