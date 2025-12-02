import React, { useState } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalPhoneInputField
} from '../../BaseComponet/CustomerFormInputs';

function CreateAdminModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const [formData, setFormData] = useState({
    loginEmail: '',
    companyEmail: '',
    name: '',
    phone: '',
    address: '',
    companyName: '',
    gstNumber: '',
    password: '',
    expiryDate: ''
  });

  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateGST = (gst) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

const validatePhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digit characters except the leading +
  const cleanedPhone = phone.replace(/[^\d+]/g, '');
  
  // For Indian numbers: check if it's a valid format with country code
  if (cleanedPhone.startsWith('+91')) {
    const localNumber = cleanedPhone.replace('+91', '');
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(localNumber);
  }
  
  // For other country codes, do basic length check
  // You can add more specific country validations if needed
  return cleanedPhone.length >= 10;
};

  // Email availability check
  const checkEmailAvailability = async (email) => {
    if (!validateEmail(email)) {
      setErrors((prev) => ({
        ...prev,
        loginEmail: "Email address is invalid",
      }));
      return;
    }

    setIsVerifyingEmail(true);
    setErrors((prev) => ({ ...prev, loginEmail: "" }));

    try {
      const response = await axiosInstance.get(`/checkEmail/${email}`);
      if (response.data === true) {
        setErrors((prev) => ({
          ...prev,
          loginEmail: "This email is already in use.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          loginEmail: "",
        }));
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setErrors((prev) => ({
        ...prev,
        loginEmail: "Could not verify email. Please try again.",
      }));
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle email change with debounced validation
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear existing email error
    if (errors.loginEmail) {
      setErrors(prev => ({
        ...prev,
        loginEmail: ""
      }));
    }

    // Check email availability after a delay (debounce)
    if (value && validateEmail(value)) {
      const timer = setTimeout(() => {
        checkEmailAvailability(value);
      }, 1000);

      return () => clearTimeout(timer);
    }
  };

  // ✅ REMOVED: handlePhoneChange function - not needed

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // // Name validation
    // if (!formData.name?.trim()) {
    //   newErrors.name = "Admin name is required";
    // }

    // Login Email validation
    if (!formData.loginEmail?.trim()) {
      newErrors.loginEmail = "Login email is required";
    } else if (!validateEmail(formData.loginEmail)) {
      newErrors.loginEmail = "Please enter a valid email address";
    } else if (errors.loginEmail && errors.loginEmail.includes("already in use")) {
      newErrors.loginEmail = errors.loginEmail;
    }

    // Company Email validation
    if (!formData.companyEmail?.trim()) {
      newErrors.companyEmail = "Company email is required";
    } else if (!validateEmail(formData.companyEmail)) {
      newErrors.companyEmail = "Please enter a valid company email address";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // Company Name validation
    if (!formData.companyName?.trim()) {
      newErrors.companyName = "Company name is required";
    }

    // GST Number validation
    if (!formData.gstNumber?.trim()) {
      newErrors.gstNumber = "GST number is required";
    } else if (!validateGST(formData.gstNumber.toUpperCase())) {
      newErrors.gstNumber = "Please enter a valid GST number";
    }

    // Address validation
    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character";
    }

    // Expiry Date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = "Expiry date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final email check before submission
    if (formData.loginEmail && validateEmail(formData.loginEmail)) {
      await checkEmailAvailability(formData.loginEmail);

      if (errors.loginEmail && errors.loginEmail.includes("already in use")) {
        toast.error("Please use a different email address.");
        return;
      }
    }

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        loginEmail: formData.loginEmail.trim(),
        companyEmail: formData.companyEmail.trim(),
        name: formData.name.trim(),
        phone: formData.phone,
        address: formData.address.trim(),
        companyName: formData.companyName.trim(),
        gstNumber: formData.gstNumber.toUpperCase().trim(),
        password: formData.password,
        expiryDate: new Date(formData.expiryDate).toISOString()
      };

      await axiosInstance.post('createAdmin', payload);
      toast.success('Admin created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating admin:', error);
      if (error.response?.data?.message) {
        if (error.response.data.message.includes("email") || error.response.data.message.includes("Email")) {
          setErrors(prev => ({
            ...prev,
            loginEmail: "This email is already registered. Please use a different email."
          }));
          toast.error("This email is already registered. Please use a different email.");
        } else {
          toast.error(`Failed to create admin: ${error.response.data.message}`);
        }
      } else {
        toast.error('Failed to create admin. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date for expiry (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Custom Password Input Component
  const PasswordInputField = ({
    label,
    name,
    value,
    onChange,
    required = false,
    error,
    showPassword,
    onToggleVisibility,
    placeholder = "",
    className = ""
  }) => {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>

        <div className="relative">
          <GlobalInputField
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            error={error}
            placeholder={placeholder}
            type={showPassword ? "text" : "password"}
            className="mb-0"
          />

          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? (
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
            ) : (
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
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )}
          </button>
        </div>

        {error && (
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
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-3">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Admin</h2>
                <p className="text-blue-100 text-sm">
                  Fill in the admin information below
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 transform hover:scale-110"
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
        <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* <GlobalInputField
                  label="Admin Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={true}
                  error={errors.name}
                  placeholder="Enter admin full name"
                /> */}

                <GlobalInputField
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required={true}
                  error={errors.companyName}
                  placeholder="Enter company name"
                />

                <div className="space-y-2">
                  <GlobalInputField
                    label="Login Email"
                    name="loginEmail"
                    type="email"
                    value={formData.loginEmail}
                    onChange={handleEmailChange}
                    required={true}
                    error={errors.loginEmail}
                    placeholder="Enter login email address"
                  />
                  {isVerifyingEmail && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Checking email availability...
                    </p>
                  )}
                </div>

                <GlobalInputField
                  label="Company Email"
                  name="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  required={true}
                  error={errors.companyEmail}
                  placeholder="Enter company email address"
                />

                {/* ✅ FIXED: Using handleChange (regular handler) */}
                <GlobalPhoneInputField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange} // ✅ Use regular handler
                  required={true}
                  error={errors.phone}
                />

                <GlobalInputField
                  label="GST Number"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  required={true}
                  error={errors.gstNumber}
                  placeholder="Enter GST number"
                />

                <GlobalInputField
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required={true}
                  error={errors.expiryDate}
                  min={getMinDate()}
                />

                <PasswordInputField
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={true}
                  error={errors.password}
                  showPassword={showPassword}
                  onToggleVisibility={() => setShowPassword(!showPassword)}
                  placeholder="Enter password"
                />
              </div>

              <div className="mt-4">
                <GlobalTextAreaField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required={true}
                  error={errors.address}
                  placeholder="Enter complete address"
                  rows={3}
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
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 font-medium flex items-center gap-2 hover:shadow-sm text-sm"
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
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading ||
                isVerifyingEmail ||
                (errors.loginEmail &&
                  errors.loginEmail.includes("already in use"))
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Create Admin
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAdminModal;