// PublicPFForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";




function PublicPFForm() {
  const { contactId, formId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");

  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

const [uploadedBackFileName, setUploadedBackFileName] = useState(""); // NEW
const [uploadedPanFileName, setUploadedPanFileName] = useState(""); // NEW
const [draggingOver, setDraggingOver] = useState(null); // NEW: Track which file is being dragged over

  const userData = JSON.parse(localStorage.getItem("userData")) || {};
const fileInputBackRef = useRef(null); // NEW
const fileInputPanRef = useRef(null); // NEW

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
    aadhaarPhoto: "",
    aadhaarPhotoBack: "",
    panPhoto: "",
    grossSalary: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (contactId) {
      console.log("Contact ID from URL:", contactId);
      console.log("Form ID from URL:", formId);
    }
  }, [contactId, formId]);

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
    if (!uan.trim()) return "UAN is required";
    if (!/^\d{12}$/.test(uan)) return "UAN must be 12 digits";
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

  // Main validation function - This actually calls all the validation functions
  const validateForm = () => {
    const newErrors = {};

    // Basic information
    newErrors.name = validateName(formData.name);
    newErrors.fatherName = validateRequired(
      "fatherName",
      formData.fatherName,
      "Father's name"
    );
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
    newErrors.uan = validateUAN(formData.uan);

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


    // Inside validateForm function, add this:
newErrors.grossSalary = validateRequired(
  "grossSalary", 
  formData.grossSalary, 
  "Gross salary"
);

// Optional: Add numeric validation
if (formData.grossSalary && !/^\d+(\.\d{1,2})?$/.test(formData.grossSalary)) {
  newErrors.grossSalary = "Please enter a valid salary amount (e.g., 50000 or 50000.50)";
}

// Also add validation for the new file uploads (optional but recommended):
if (!formData.aadhaarPhotoBack) {
  newErrors.aadhaarPhotoBack = "Aadhaar back side is required";
}

if (!formData.panPhoto) {
  newErrors.panPhoto = "PAN Card or License is required";
}
    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== "")
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

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

    // Input formatting
    switch (name) {
      case "name":
      case "fatherName":
      case "accountHolderName":
          case "grossSalary":
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      processedValue = value;
    }
    break;
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

  // Handle phone number change using react-phone-input-2
  const handlePhoneChange = (value, country, e, formattedValue) => {
    // The value includes country code, e.g., "91XXXXXXXXXX"
    // Convert to full format with + sign
    const completeNumber = value.startsWith("+") ? value : `+${value}`;

    setPhone(value); // Store just the value for display
    setFormData((prev) => ({
      ...prev,
      phone: completeNumber, // Store complete number with + for submission
    }));

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

// Update handleFileChange to handle multiple files
const handleFileChange = (e, type = 'front') => {
  const file = e.target.files[0];
  if (!file) return;
  processFile(file, type);
};

// Update handleDrop to handle multiple drop zones
const handleDrop = (e, type = 'front') => {
  e.preventDefault();
  setIsDragging(false);
  setDraggingOver(null);
  
  const file = e.dataTransfer.files[0];
  if (file) {
    processFile(file, type);
  }
};

// Update processFile to handle different file types
const processFile = (file, type = 'front') => {
  // Validation
  if (!file.type.startsWith("image/")) {
    toast.error("Please upload an image file (JPEG, PNG, JPG, GIF)");
    return;
  }

if (file.size > 200 * 1024) { // 200KB = 200 * 1024 bytes
  toast.error("File size should be less than 200KB");
  return;
}

  // Set file name based on type
  if (type === 'front') {
    setUploadedFileName(file.name);
  } else if (type === 'back') {
    setUploadedBackFileName(file.name);
  } else if (type === 'pan') {
    setUploadedPanFileName(file.name);
  }

  // Preview image
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64String = reader.result.split(",")[1];
    
    if (type === 'front') {
      setFormData((prev) => ({
        ...prev,
        aadhaarPhoto: base64String,
      }));
      toast.success("Aadhaar front photo uploaded successfully!");
    } else if (type === 'back') {
      setFormData((prev) => ({
        ...prev,
        aadhaarPhotoBack: base64String,
      }));
      toast.success("Aadhaar back photo uploaded successfully!");
    } else if (type === 'pan') {
      setFormData((prev) => ({
        ...prev,
        panPhoto: base64String,
      }));
      toast.success("PAN/License photo uploaded successfully!");
    }
  };
  reader.onerror = () => {
    toast.error("Failed to read file. Please try again.");
    if (type === 'front') setUploadedFileName("");
    else if (type === 'back') setUploadedBackFileName("");
    else if (type === 'pan') setUploadedPanFileName("");
  };
  reader.readAsDataURL(file);
};

// Update handleRemoveFile to handle different file types
const handleRemoveFile = (type = 'front') => {
  if (type === 'front') {
    setFormData((prev) => ({
      ...prev,
      aadhaarPhoto: "",
    }));
    setUploadedFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  } else if (type === 'back') {
    setFormData((prev) => ({
      ...prev,
      aadhaarPhotoBack: "",
    }));
    setUploadedBackFileName("");
    if (fileInputBackRef.current) fileInputBackRef.current.value = "";
  } else if (type === 'pan') {
    setFormData((prev) => ({
      ...prev,
      panPhoto: "",
    }));
    setUploadedPanFileName("");
    if (fileInputPanRef.current) fileInputPanRef.current.value = "";
  }
  toast.success("File removed");
};

// Update handleUploadClick to handle different file inputs
const handleUploadClick = (type = 'front') => {
  if (type === 'front') fileInputRef.current?.click();
  else if (type === 'back') fileInputBackRef.current?.click();
  else if (type === 'pan') fileInputPanRef.current?.click();
};

// Update drag handlers
const handleDragOver = (e, type = 'front') => {
  e.preventDefault();
  setIsDragging(true);
  setDraggingOver(type);
};

const handleDragLeave = (e, type = 'front') => {
  e.preventDefault();
  setIsDragging(false);
  setDraggingOver(null);
};

  // Handle drag and drop
  




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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all form errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        contactId: contactId,
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
        aadhaarPhoto: formData.aadhaarPhoto || "",
         aadhaarPhotoBack: formData.aadhaarPhotoBack || "", // NEW
  panPhoto: formData.panPhoto || "",
      };

      const response = await axiosInstance.post("/submitPfForm", submitData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      await Swal.fire({
        title: "Success!",
        text: "PF form submitted successfully!",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        customClass: {
          popup: "rounded-lg",
          confirmButton: "px-4 py-2 rounded-lg",
        },
      });

      // Reset form
      setFormData({
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
        aadhaarPhoto: "",

          grossSalary: "", // NEW

  aadhaarPhotoBack: "", // NEW
  panPhoto: "", // NEW
      });
      setPhone("");
      setUploadedFileName(""); // Add this
setUploadedBackFileName(""); // Add this
setUploadedPanFileName(""); 
    } catch (error) {
      console.error("Error submitting form:", error);

      let errorMessage = "Error submitting form. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      await Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
        customClass: {
          popup: "rounded-lg",
          confirmButton: "px-4 py-2 rounded-lg",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Helper function to render file upload component
const renderFileUpload = (type, fileData, fileName, placeholderText) => {
  const isActiveDragging = isDragging && draggingOver === type;
  
  return (
    <>
      {/* Preview Section */}
      {fileData && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{fileName || `${type.toUpperCase()} Document`}</p>
                <p className="text-xs text-gray-500">✓ Successfully uploaded</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveFile(type)}
              className="ml-3 p-1.5 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors"
              title="Remove file"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className={`${!fileData ? 'block' : 'hidden'}`} onClick={() => handleUploadClick(type)}>
        <div
          className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
            isActiveDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
          onDragOver={(e) => handleDragOver(e, type)}
          onDragLeave={(e) => handleDragLeave(e, type)}
          onDrop={(e) => handleDrop(e, type)}
        >
          <div className="px-6 pt-10 pb-9 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <button
                type="button"
                onClick={() => handleUploadClick(type)}
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              >
                Click to upload
              </button>
              {" or drag and drop"}
            </p>
            <p className="text-xs text-gray-500 mb-3">{placeholderText}</p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 200KB</p>

            {/* Hidden File Input */}
            <input
              ref={type === 'front' ? fileInputRef : type === 'back' ? fileInputBackRef : fileInputPanRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, type)}
              className="sr-only"
            />
          </div>

          {/* Drag overlay */}
          {isActiveDragging && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <svg className="h-12 w-12 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-blue-600 font-medium">Drop file here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center space-x-3">
                  {/* Logo with proper background */}
                  {userData?.logo && (
                    <div className="flex items-center justify-center rounded-lg p-2 w-full">
                      <img
                        src={`data:image/png;base64,${userData?.logo}`}
                        alt="Mtech Logo"
                        className="w-15 h-10 object-contain"
                      />
                    </div>
                  )}
                </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Employee PF Registration
            </h1>

            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">
                Secure & Encrypted Submission
              </span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Provident Fund Details Form
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Enter your full name"
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Date of Joining */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfJoining
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                    max={getTodayDate()}
                  />
                  {errors.dateOfJoining && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dateOfJoining}
                    </p>
                  )}
                </div>

                {/* UAN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UAN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="uan"
                    value={formData.uan}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.uan ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="12-digit UAN number"
                    maxLength={12}
                  />
                  {errors.uan && (
                    <p className="text-red-500 text-xs mt-1">{errors.uan}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                      }`}
                    max={getMaxBirthDate()}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fatherName ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Enter father's name"
                    maxLength={100}
                  />
                  {errors.fatherName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fatherName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="your.email@example.com"
                    maxLength={100}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone Input with react-phone-input-2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`phone-input-wrapper ${errors.phone ? "border-red-500 rounded-lg" : ""
                      }`}
                  >
                    <PhoneInput
                      country={"in"}
                      value={phone}
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
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.aadhaarNumber
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                    placeholder="12-digit Aadhaar number"
                    maxLength={12}
                  />
                  {errors.aadhaarNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.aadhaarNumber}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Marital Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="married"
                    name="married"
                    checked={formData.married}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="married"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Married
                  </label>
                </div>
              </div>

              {/* PAN */}
              <div className="md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${errors.pan ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {errors.pan && (
                  <p className="text-red-500 text-xs mt-1">{errors.pan}</p>
                )}
              </div>

              {/* Gross Salary */}
<div className="md:w-1/2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Gross Salary (₹) <span className="text-red-500">*</span>
  </label>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <span className="text-gray-500">₹</span>
    </div>
    <input
      type="text"
      name="grossSalary"
      value={formData.grossSalary}
      onChange={handleChange}
      className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        errors.grossSalary ? "border-red-500" : "border-gray-300"
      }`}
      placeholder="e.g., 50000.00"
    />
  </div>
  {errors.grossSalary && (
    <p className="text-red-500 text-xs mt-1">{errors.grossSalary}</p>
  )}
</div>
            </div>

            {/* Bank Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Bank Account Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Holder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.accountHolderName
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                    placeholder="As per bank records"
                    maxLength={100}
                  />
                  {errors.accountHolderName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.accountHolderName}
                    </p>
                  )}
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bankName ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="Bank name"
                    maxLength={100}
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.bankName}
                    </p>
                  )}
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.accountNumber
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                    placeholder="Bank account number"
                    maxLength={20}
                  />
                  {errors.accountNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.accountNumber}
                    </p>
                  )}
                </div>

                {/* IFSC Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${errors.ifsc ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder="SBIN0001234"
                    maxLength={11}
                  />
                  {errors.ifsc && (
                    <p className="text-red-500 text-xs mt-1">{errors.ifsc}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
<div className="space-y-6">
  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
    Document Upload
  </h3>

  {/* Aadhaar Front Side */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Aadhaar Front Side <span className="text-red-500">*</span>
    </label>
    {renderFileUpload(
      'front',
      formData.aadhaarPhoto,
      uploadedFileName,
      "Upload front side of Aadhaar"
    )}
    {errors.aadhaarPhoto && (
      <p className="text-red-500 text-xs mt-2">{errors.aadhaarPhoto}</p>
    )}
  </div>

  {/* Aadhaar Back Side */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Aadhaar Back Side <span className="text-red-500">*</span>
    </label>
    {renderFileUpload(
      'back',
      formData.aadhaarPhotoBack,
      uploadedBackFileName,
      "Upload back side of Aadhaar"
    )}
    {errors.aadhaarPhotoBack && (
      <p className="text-red-500 text-xs mt-2">{errors.aadhaarPhotoBack}</p>
    )}
  </div>

  {/* PAN Card or License */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      PAN Card or License <span className="text-red-500">*</span>
    </label>
    {renderFileUpload(
      'pan',
      formData.panPhoto,
      uploadedPanFileName,
      "Upload PAN Card or License"
    )}
    {errors.panPhoto && (
      <p className="text-red-500 text-xs mt-2">{errors.panPhoto}</p>
    )}
  </div>
</div>
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 duration-300 shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit PF Details"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            All information provided will be kept confidential and used only for
            PF registration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PublicPFForm;
