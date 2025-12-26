// PublicPFForm.jsx
import React, { useState, useEffect } from "react";
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      setFormData((prev) => ({
        ...prev,
        aadhaarPhoto: base64String,
      }));
      toast.success("Aadhaar photo uploaded successfully");
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);
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
        aadhaarPhoto: formData.aadhaarPhoto || "",
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
      });
      setPhone("");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dateOfJoining
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.uan ? "border-red-500" : "border-gray-300"
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dateOfBirth ? "border-red-500" : "border-gray-300"
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fatherName ? "border-red-500" : "border-gray-300"
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
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
                    className={`phone-input-wrapper ${
                      errors.phone ? "border-red-500 rounded-lg" : ""
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.aadhaarNumber
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                    errors.pan ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {errors.pan && (
                  <p className="text-red-500 text-xs mt-1">{errors.pan}</p>
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.accountHolderName
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.bankName ? "border-red-500" : "border-gray-300"
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.accountNumber
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                      errors.ifsc ? "border-red-500" : "border-gray-300"
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

            {/* Aadhaar Photo Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Document Upload
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Photo (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="aadhaarPhoto"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="aadhaarPhoto"
                          name="aadhaarPhoto"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                {formData.aadhaarPhoto && (
                  <p className="text-green-600 text-sm mt-2">
                    ✓ Aadhaar photo uploaded successfully
                  </p>
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
