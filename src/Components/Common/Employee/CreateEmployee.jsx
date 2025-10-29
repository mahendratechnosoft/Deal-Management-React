import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import TopBar from "../../Pages/Admin/TopBarAdmin";
import Sidebar from "../../Pages/Admin/SidebarAdmin";

function CreateEmployee() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  // State fields updated to match the employee API
  const [formData, setFormData] = useState({
    loginEmail: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    gender: "",
    description: "",
    profileImageBase64: "", // API expects a Base64 string
  });

  const [errors, setErrors] = useState({});
  const checkEmailAvailability = async (email) => {
    // 1. Check format first
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors((prev) => ({
        ...prev,
        loginEmail: "Email address is invalid",
      }));
      return; // Don't hit API if format is wrong
    }

    setIsVerifyingEmail(true); // Start verification
    setErrors((prev) => ({ ...prev, loginEmail: "" })); // Clear old errors

    try {
      // Corrected API path from /admin//checkEmail to /admin/checkEmail
      const response = await axiosInstance.get(`/checkEmail/${email}`);

      // response.data === true means email exists (as per your prompt)
      if (response.data === true) {
        setErrors((prev) => ({
          ...prev,
          loginEmail: "This email is already in use.",
        }));
      } else {
        // Email is valid and available, clear error
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
      setIsVerifyingEmail(false); // Stop verification
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "loginEmail") {
      if (value.trim() === "") {
        setErrors((prev) => ({
          ...prev,
          loginEmail: "",
        }));
      } else {
        checkEmailAvailability(value);
      }
    } else {
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  /**
   * Handles file input change and converts the image to Base64
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          profileImageBase64: "Invalid file type. Please select a JPG or PNG.",
        }));
        return;
      }
      // Check file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profileImageBase64: "File is too large. Maximum size is 5MB.",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.toString().split(",")[1];

        setFormData((prev) => ({
          ...prev,
          profileImageBase64: base64String, // Only store the pure Base64 data
        }));
      };
      reader.readAsDataURL(file);

      // Clear error if one was set
      if (errors.profileImageBase64) {
        setErrors((prev) => ({
          ...prev,
          profileImageBase64: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Full name is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    if (isVerifyingEmail) {
      newErrors.loginEmail = "Verifying email, please wait...";
    } else if (!formData.loginEmail?.trim()) {
      newErrors.loginEmail = "Email is required";
    } else if (errors.loginEmail) {
      newErrors.loginEmail = errors.loginEmail;
    } else if (!/\S+@\S+\.\S+/.test(formData.loginEmail)) {
      newErrors.loginEmail = "Email address is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Use axiosInstance to post. The formData state already matches the API body.
      const response = await axiosInstance.post(
        "/admin/createEmployee",
        formData
      );

      alert("Employee created successfully!");
      resetForm();
      navigate("/Admin/EmployeeList"); // Navigate to EmployeeList
    } catch (error) {
      console.error("Error creating employee:", error);

      if (error.request) {
        alert(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        alert("Failed to create employee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      loginEmail: "",
      password: "",
      name: "",
      phone: "",
      address: "",
      gender: "",
      description: "",
      profileImageBase64: "",
    });
    setErrors({});

    // Reset the file input field
    const fileInput = document.getElementById("profileImageInput");
    if (fileInput) fileInput.value = null;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <TopBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "ml-0 lg:ml-5" : "ml-0"
          }`}
        >
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => navigate("/Admin/EmployeeList")} // Changed navigation
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Employees
                </button>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Create New Employee
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Add a new employee to the system
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/Admin/EmployeeList")} // Changed navigation
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="createEmployeeForm" // Changed form ID
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      "Creating..."
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
                        Create Employee
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Container */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <form
                    id="createEmployeeForm" // Changed form ID
                    onSubmit={handleSubmit}
                    className="p-6"
                  >
                    <div className="space-y-6">
                      {/* Profile Image Section (MOVED TO TOP) */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1a2 2 0 00-2.828 0L8 14m0 0l-4 4h16l-4-4z"
                              ></path>
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              Profile Image
                            </h2>
                            <p className="text-gray-600 text-sm">
                              Upload employee's profile picture
                            </p>
                          </div>
                        </div>

                        {/* Image Preview and Upload Area */}
                        <div className="flex flex-col items-center">
                          <input
                            type="file"
                            id="profileImageInput"
                            name="profileImageBase64"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            className="hidden" // Input is hidden, triggered by the label
                          />

                          <label
                            htmlFor="profileImageInput"
                            className="cursor-pointer"
                          >
                            {formData.profileImageBase64 ? (
                              // Show Preview
                              <img
                                src={`data:image/;base64,${formData.profileImageBase64}`}
                                alt="Profile Preview"
                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-sm"
                              />
                            ) : (
                              // Show Placeholder
                              <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 hover:border-gray-400">
                                <svg
                                  className="w-12 h-12"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span className="text-xs font-medium mt-1">
                                  Upload Image
                                </span>
                              </div>
                            )}
                          </label>
                          {errors.profileImageBase64 && (
                            <p className="mt-2 text-xs text-red-600 text-center">
                              {errors.profileImageBase64}
                            </p>
                          )}
                        </div>
                      </section>

                      {/* Account Information Section */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              Account Information
                            </h2>
                            <p className="text-gray-600 text-sm">
                              Employee login and contact details
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.name
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter full name"
                            />
                            {errors.name && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email *{" "}
                            </label>
                            <input
                              type="email"
                              name="loginEmail"
                              value={formData.loginEmail}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.loginEmail
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter login email"
                            />
                            {errors.loginEmail && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.loginEmail}
                              </p>
                            )}
                          </div>

                          {/* Password with Show/Hide */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password *
                            </label>
                            <div className="relative">
                              <input
                                type={isPasswordVisible ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                  errors.password
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="Enter password"
                              />
                              <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              >
                                {isPasswordVisible ? (
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
                                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3.82 3.82l16.36 16.36"
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
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                            {errors.password && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.password}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone *
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.phone
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter phone number"
                            />
                            {errors.phone && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </section>

                      {/* Personal Details Section */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              Personal Details
                            </h2>
                            <p className="text-gray-600 text-sm">
                              Address and descriptive information
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gender *
                            </label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.gender
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            {errors.gender && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.gender}
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <textarea
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                              placeholder="Enter employee's full address"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                              placeholder="Additional notes or description (e.g., job role, skills)"
                            />
                          </div>
                        </div>
                      </section>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEmployee;
