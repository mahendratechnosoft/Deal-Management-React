import React, { useState, useEffect } from "react";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";

// --- HELPER FUNCTION: Convert File to Base64 string ---
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
// ------------------------------------------------------

// --- VALIDATION FUNCTIONS ---
const validateName = (name) => {
  if (!name.trim()) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 50) return "Name cannot exceed 50 characters";

  return "";
};

const validateAge = (age) => {
  if (!age) return "Age is required";
  const ageNum = parseInt(age, 10);
  if (isNaN(ageNum)) return "Age must be a valid number";

  return "";
};

const validateDateOfBirth = (dob) => {
  if (!dob) return "Date of birth is required";

  const dobDate = new Date(dob);
  const today = new Date();

  if (dobDate > today) return "Date of birth cannot be in the future";

  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120);
  if (dobDate < minDate) return "Please enter a valid date of birth";

  return "";
};

const validateMobile = (mobile) => {
  if (!mobile) return "Mobile number is required";

  // Starts with 6,7,8,9 + 9 more digits
  const mobileRegex = /^[6-9]\d{9}$/;

  if (!mobileRegex.test(mobile)) {
    return "Please enter a valid 10-digit Indian mobile number";
  }

  return "";
};

const validateEmail = (email) => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  if (email.length > 100) return "Email cannot exceed 100 characters";
  return "";
};

const validatePincode = (pincode) => {
  if (!pincode) return "Pincode is required";
  const pincodeRegex = /^\d{6}$/;
  if (!pincodeRegex.test(pincode)) {
    return "Please enter a valid 6-digit pincode";
  }
  // Additional validation: First digit cannot be 0
  if (pincode.startsWith("0")) {
    return "Pincode cannot start with 0";
  }
  return "";
};

const validateHeight = (height) => {
  if (!height) return "Height is required";
  const heightNum = parseFloat(height);
  if (isNaN(heightNum)) return "Height must be a valid number";

  return "";
};

const validateWeight = (weight) => {
  if (!weight) return "Weight is required";
  const weightNum = parseFloat(weight);
  if (isNaN(weightNum)) return "Weight must be a valid number";

  return "";
};

const validateCity = (city) => {
  if (!city.trim()) return "City is required";
  if (city.length < 2) return "City must be at least 2 characters";
  if (city.length > 50) return "City cannot exceed 50 characters";

  // allow alphabets + space + . + ' + - + comma
  const cityRegex = /^[a-zA-Z\s.,'-]{2,}$/;

  if (!cityRegex.test(city.trim())) {
    return "Please enter a valid city name";
  }

  return "";
};

const validateProfession = (profession) => {
  if (!profession.trim()) return "Profession is required";
  if (profession.length < 2) return "Profession must be at least 2 characters";
  if (profession.length > 100) return "Profession cannot exceed 100 characters";
  return "";
};

const validateAddress = (address) => {
  if (!address.trim()) return "Address is required";
  if (address.length < 10) return "Address must be at least 10 characters";
  if (address.length > 500) return "Address cannot exceed 500 characters";
  return "";
};

const validateMaritalStatus = (status) => {
  if (!status) return "Marital status is required";
  return "";
};

const validateBloodGroup = (bloodGroup) => {
  if (!bloodGroup) return "Blood group is required";
  return "";
};

// File validation
const validateFile = (file, maxSizeMB = 5) => {
  if (!file) return "";

  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes

  if (!validTypes.includes(file.type)) {
    return `File must be an image (JPEG, PNG, JPG, WebP)`;
  }

  if (file.size > maxSize) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  return "";
};

const CreateDonar = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Initial state constant to avoid repetition
  const initialFormState = {
    name: "",
    maritalStatus: "",
    age: "",
    dateOfBirth: "",
    address: "",
    city: "",
    pincode: "",
    mobile: "",
    email: "",
    height: "",
    weight: "",
    bloodGroup: "",
    profession: "",
    education: "",
    selfPic: null,
    fullPic: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options define
  const statusOptionsMarried = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  const bloodGroupOptions = [
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
  ];

  const educationOptions = [
    { value: "below_10th", label: "Below 10th" },
    { value: "ssc_10th", label: "10th Pass (SSC)" },
    { value: "hsc_12th", label: "12th Pass (HSC)" },
    { value: "diploma", label: "Diploma" },
    { value: "iti_vocational", label: "ITI / Vocational Training" },
    { value: "ug_pursuing", label: "Undergraduate (UG) - Pursuing" },
    { value: "bachelor_completed", label: "Undergraduate (Bachelor’s Degree)" },
    { value: "pg_pursuing", label: "Postgraduate (PG) - Pursuing" },
    { value: "masters_completed", label: "Postgraduate (Master’s Degree)" },
    { value: "doctorate", label: "Doctorate (PhD)" },
    {
      value: "professional_course",
      label: "Professional Course (CA / CS / CMA)",
    },
    { value: "other", label: "Other" },
  ];

  // Required fields configuration
  const requiredFields = {
    name: true,
    maritalStatus: true,
    age: true,
    dateOfBirth: true,
    address: true,
    city: true,
    pincode: true,
    mobile: true,
    email: true,
    height: true,
    weight: true,
    bloodGroup: true,
    profession: true,
    education: false, // Optional
    selfPic: false, // Optional
    fullPic: false, // Optional
  };

  // Reset form when modal closes via props
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Validation Functions ---
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return validateName(value);
      case "age":
        return validateAge(value);
      case "dateOfBirth":
        return validateDateOfBirth(value);
      case "mobile":
        return validateMobile(value);
      case "email":
        return validateEmail(value);
      case "pincode":
        return validatePincode(value);
      case "height":
        return validateHeight(value);
      case "weight":
        return validateWeight(value);
      case "city":
        return validateCity(value);
      case "profession":
        return validateProfession(value);
      case "address":
        return validateAddress(value);
      case "maritalStatus":
        return validateMaritalStatus(value);
      case "bloodGroup":
        return validateBloodGroup(value);
      case "selfPic":
        return validateFile(value, 5); // 5MB max
      case "fullPic":
        return validateFile(value, 5); // 5MB max
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach((fieldName) => {
      if (requiredFields[fieldName] || formData[fieldName]) {
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (selectedOption, { name }) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files && files[0];

    if (file) {
      // Validate file immediately
      const error = validateFile(file, 5);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
        // Clear the file input
        e.target.value = "";
        setFormData((prev) => ({ ...prev, [name]: null }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: file }));
        // Clear error if validation passes
        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: "" }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setErrors({});
    onClose && onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Convert images to Base64 if they exist
      let selfPicBase64 = null;
      let fullPicBase64 = null;

      if (formData.selfPic instanceof File) {
        const result = await convertToBase64(formData.selfPic);
        selfPicBase64 = result.split(",")[1];
      }

      if (formData.fullPic instanceof File) {
        const result = await convertToBase64(formData.fullPic);
        fullPicBase64 = result.split(",")[1];
      }

      // 2. Prepare JSON payload
      const apiDataPayload = {
        name: formData.name,
        marriedStatus: formData.maritalStatus,
        age: Number(formData.age),
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        phoneNumber: formData.mobile,
        email: formData.email,
        height: Number(formData.height),
        weight: Number(formData.weight),
        bloodGroup: formData.bloodGroup,
        profession: formData.profession,
        education: formData.education,
        selfeImage: selfPicBase64,
        fullLengthImage: fullPicBase64,
      };

      // 3. Send JSON data using Axios
      const response = await axiosInstance.post("createDonor", apiDataPayload);

      toast.success("Donor created successfully!");
      setFormData(initialFormState);
      setErrors({});

      // Call onSuccess callback so parent can refresh data
      onSuccess && onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error creating donor:", error);
      const errMsg =
        error.response?.data?.message ||
        "Error creating donor. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderFormInput = (fieldConfig) => {
    const { label, name, type = "text", ...props } = fieldConfig;
    const isRequired = requiredFields[name];

    return (
      <div>
        <FormInput
          label={
            isRequired ? (
              <>
                {label} <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              label
            )
          }
          name={name}
          type={type}
          value={formData[name]}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder={props.placeholder}
          {...props}
        />

        {errors[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
        )}
      </div>
    );
  };

  const renderFormSelect = (fieldConfig) => {
    const { label, name, options, ...props } = fieldConfig;
    const isRequired = requiredFields[name];

    return (
      <div>
        <FormSelect
          label={
            isRequired ? (
              <>
                {label} <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              label
            )
          }
          name={name}
          value={options.find((o) => o.value === formData[name])}
          onChange={(option) => handleSelectChange(option, { name })}
          options={options}
          isDisabled={isSubmitting}
          placeholder={props.placeholder || `Select ${label.toLowerCase()}`}
          {...props}
        />

        {errors[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
        )}
      </div>
    );
  };

  const renderFormTextarea = (fieldConfig) => {
    const { label, name, rows = 3, ...props } = fieldConfig;
    const isRequired = requiredFields[name];

    return (
      <div>
        <FormTextarea
          label={
            isRequired ? (
              <>
                {label} <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              label
            )
          }
          name={name}
          value={formData[name]}
          onChange={handleChange}
          rows={rows}
          disabled={isSubmitting}
          placeholder={props.placeholder}
          {...props}
        />

        {errors[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Row - Fixed at top */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Create New Donor</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 hover:bg-gray-200 rounded-full transition-colors"
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- SECTION 1: PERSONAL INFORMATION --- */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Name */}
                {renderFormInput({
                  label: "Name",
                  name: "name",
                  placeholder: "Enter full name",
                })}

                {/* Marital Status */}
                {renderFormSelect({
                  label: "Marital Status",
                  name: "maritalStatus",
                  options: statusOptionsMarried,
                })}

                {/* Age */}
                {renderFormInput({
                  label: "Age",
                  name: "age",
                  type: "number",
                  placeholder: "e.g., 30",
                })}

                {/* Date of Birth */}
                {renderFormInput({
                  label: "Date of Birth",
                  name: "dateOfBirth",
                  type: "date",
                })}

                {/* Mobile Number */}
                {renderFormInput({
                  label: "Mobile Number",
                  name: "mobile",
                  type: "tel",
                  placeholder: "Enter 10-digit number",
                })}

                {/* Email ID */}
                {renderFormInput({
                  label: "Email ID",
                  name: "email",
                  type: "email",
                  placeholder: "john@example.com",
                })}

                {/* Height */}
                {renderFormInput({
                  label: "Height (cm)",
                  name: "height",
                  type: "number",
                  step: "0.01",
                  placeholder: "e.g., 175.5",
                })}

                {/* Weight */}
                {renderFormInput({
                  label: "Weight (kg)",
                  name: "weight",
                  type: "number",
                  step: "0.01",
                  placeholder: "e.g., 70.5",
                })}

                {/* Blood Group */}
                {renderFormSelect({
                  label: "Blood Group",
                  name: "bloodGroup",
                  options: bloodGroupOptions,
                })}

                {/* Educational Qualification */}
                {renderFormSelect({
                  label: "Education",
                  name: "education",
                  options: educationOptions,
                })}

                {/* Professional Qualification */}
                {renderFormInput({
                  label: "Profession",
                  name: "profession",
                  placeholder: "e.g., Software Engineer",
                })}
              </div>

              {/* Photos Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="selfPic"
                      className="text-sm font-medium text-gray-700"
                    >
                      Self Pic (Close-up){" "}
                      <span className="text-gray-400 text-xs">
                        (Optional, Max 5MB)
                      </span>
                    </label>
                    <input
                      id="selfPic"
                      type="file"
                      name="selfPic"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.selfPic && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.selfPic}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="fullPic"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full Length Pic{" "}
                      <span className="text-gray-400 text-xs">
                        (Optional, Max 5MB)
                      </span>
                    </label>
                    <input
                      id="fullPic"
                      type="file"
                      name="fullPic"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.fullPic && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fullPic}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* --- SECTION 2: ADDRESS INFORMATION --- */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Address Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address (Full Width) */}
                <div className="md:col-span-2">
                  {renderFormTextarea({
                    label: "Address",
                    name: "address",
                    rows: 3,
                    placeholder:
                      "Enter full residential address including street, landmark, etc.",
                  })}
                </div>

                {/* City */}
                {renderFormInput({
                  label: "City",
                  name: "city",
                  placeholder: "Enter city name",
                })}

                {/* Pincode */}
                {renderFormInput({
                  label: "Pincode",
                  name: "pincode",
                  placeholder: "e.g., 400001",
                })}
              </div>
            </div>

            {/* Footer - Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Save Donor"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDonar;
