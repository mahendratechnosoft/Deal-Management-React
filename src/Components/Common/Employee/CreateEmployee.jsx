import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import TopBar from "../../Pages/Admin/TopBarAdmin";
import Sidebar from "../../Pages/Admin/SidebarAdmin";
import Select from "react-select";
import toast from "react-hot-toast";

const customReactSelectStyles = (hasError) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: "42px",

    backgroundColor: state.isDisabled ? "#f3f4f6" : "transparent",
    cursor: state.isDisabled ? "not-allowed" : "default",
    borderColor: state.isDisabled // Check disabled first
      ? "#d1d5db" // gray-300
      : hasError
      ? "#ef4444" // red-500
      : state.isFocused
      ? "#3b82f6" // blue-500
      : "#d1d5db", // gray-300
    borderRadius: "0.5rem", // rounded-lg
    borderWidth: state.isFocused ? "2px" : "1px",
    boxShadow: "none", // Remove default shadow
    "&:hover": {
      borderColor: state.isDisabled
        ? "#d1d5db"
        : hasError
        ? "#ef4444"
        : state.isFocused
        ? "#3b82f6"
        : "#9ca3af", // gray-400
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "6px 8px",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "transparent",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 50,
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "#9ca3af" : "hsl(0, 0%, 20%)",
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "#9ca3af" : provided.color,
  }),
});
const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

function CreateEmployee() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const [isGenderFocused, setIsGenderFocused] = useState(false);
  const [isDeptFocused, setIsDeptFocused] = useState(false);
  const [isRoleFocused, setIsRoleFocused] = useState(false);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  const [isDeptLoading, setIsDeptLoading] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);

  // State fields updated to match the employee API
  const [formData, setFormData] = useState({
    loginEmail: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    gender: "",
    description: "",
    profileImageBase64: "",
    departmentId: "",
    roleId: "",
    departmentName: "",
    roleName: "",
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
          profileImageBase64: base64String,
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

  const handleGenderChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      gender: selectedOption ? selectedOption.value : "",
    }));
    if (errors.gender) {
      setErrors((prev) => ({
        ...prev,
        gender: "",
      }));
    }
  };

  const loadDepartments = async () => {
    // Only fetch if options are not already loaded
    if (departmentOptions.length > 0) {
      return;
    }
    setIsDeptLoading(true);
    try {
      const response = await axiosInstance.get("/admin/getAllDepartment");
      const options = response.data.map((dept) => ({
        value: dept.departmentId,
        label: dept.name,
      }));
      setDepartmentOptions(options);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    } finally {
      setIsDeptLoading(false);
    }
  };

  const loadRoles = async () => {
    if (!formData.departmentId) {
      return;
    }
    setIsRoleLoading(true);
    try {
      const response = await axiosInstance.get(
        `/admin/getRoleByDepartment/${formData.departmentId}`
      );
      const options = response.data.map((role) => ({
        value: role.roleId,
        label: role.name,
      }));
      setRoleOptions(options);
    } catch (error) {
      console.error("Failed to fetch roles", error);
      setRoleOptions([]); // Clear options on error
    } finally {
      setIsRoleLoading(false);
    }
  };

  const handleDepartmentChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      departmentId: selectedOption ? selectedOption.value : "",
      departmentName: selectedOption ? selectedOption.label : "",
      roleId: "",
      roleName: "",
    }));
    setRoleOptions([]);

    if (errors.departmentId) {
      setErrors((prev) => ({ ...prev, departmentId: "" }));
    }
    if (errors.roleId) {
      setErrors((prev) => ({ ...prev, roleId: "" }));
    }
  };

  const handleRoleChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      roleId: selectedOption ? selectedOption.value : "",
      roleName: selectedOption ? selectedOption.label : "",
    }));
    if (errors.roleId) {
      setErrors((prev) => ({ ...prev, roleId: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Full name is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.departmentId)
      newErrors.departmentId = "Department is required";
    if (!formData.roleId) newErrors.roleId = "Role is required";

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

      toast.success("Employee created successfully!");
      resetForm();
      navigate("/Admin/EmployeeList"); // Navigate to EmployeeList
    } catch (error) {
      console.error("Error creating employee:", error);

      if (error.request) {
        toast.error(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        toast.error("Failed to create employee. Please try again.");
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
      departmentId: "",
      roleId: "",
      departmentName: "",
      roleName: "",
    });
    setErrors({});
    setDepartmentOptions([]);
    setRoleOptions([]);
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
            {/* ... (Header JSX is unchanged) ... */}
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
                    {/* Profile Image Section (UNCHANGED) */}
                    <section>
                      {/* ... (Profile Image JSX is unchanged) ... */}
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
                        {/* ... (Section header is unchanged) ... */}
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
                        {/* --- Full Name --- */}
                        <div className="relative">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`block w-full px-3 py-2.5 bg-transparent border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm ${
                              errors.name
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder=" "
                          />
                          <label
                            htmlFor="name"
                            className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5 peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none ${
                              errors.name
                                ? "text-red-600"
                                : "text-gray-500 peer-focus:text-blue-600"
                            }`}
                          >
                            Full Name *
                          </label>
                          {errors.name && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        {/* --- Email --- */}
                        <div className="relative">
                          <input
                            type="email"
                            name="loginEmail"
                            id="loginEmail"
                            value={formData.loginEmail}
                            onChange={handleChange}
                            className={`block w-full px-3 py-2.5 bg-transparent border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm ${
                              errors.loginEmail
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder=" "
                          />
                          <label
                            htmlFor="loginEmail"
                            className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5 peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none ${
                              errors.loginEmail
                                ? "text-red-600"
                                : "text-gray-500 peer-focus:text-blue-600"
                            }`}
                          >
                            Email *
                          </label>
                          {errors.loginEmail && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.loginEmail}
                            </p>
                          )}
                        </div>

                        {/* --- Password --- */}
                        <div className="relative">
                          <input
                            type={isPasswordVisible ? "text" : "password"}
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`block w-full px-3 py-2.5 bg-transparent border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm ${
                              errors.password
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder=" "
                          />
                          <label
                            htmlFor="password"
                            className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5 peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none ${
                              errors.password
                                ? "text-red-600"
                                : "text-gray-500 peer-focus:text-blue-600"
                            }`}
                          >
                            Password *
                          </label>
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
                          {errors.password && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.password}
                            </p>
                          )}
                        </div>

                        {/* --- Phone --- */}
                        <div className="relative">
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`block w-full px-3 py-2.5 bg-transparent border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm ${
                              errors.phone
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                            placeholder=" "
                          />
                          <label
                            htmlFor="phone"
                            className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5 peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none ${
                              errors.phone
                                ? "text-red-600"
                                : "text-gray-500 peer-focus:text-blue-600"
                            }`}
                          >
                            Phone *
                          </label>
                          {errors.phone && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                        <div className="relative">
                          <label
                            htmlFor="departmentId"
                            className={`absolute text-sm duration-300 transform z-10 origin-[0] bg-white px-2 left-1 pointer-events-none
                              ${
                                isDeptFocused || formData.departmentId
                                  ? "scale-75 -translate-y-4 top-2"
                                  : "scale-100 translate-y-0 top-2.5"
                              }
                              ${
                                errors.departmentId
                                  ? "text-red-600"
                                  : isDeptFocused
                                  ? "text-blue-600"
                                  : "text-gray-500"
                              }
                            `}
                          >
                            Department *
                          </label>
                          <Select
                            id="departmentId"
                            name="departmentId"
                            options={departmentOptions}
                            value={departmentOptions.find(
                              (option) => option.value === formData.departmentId
                            )}
                            onChange={handleDepartmentChange}
                            onMenuOpen={loadDepartments}
                            onFocus={() => setIsDeptFocused(true)}
                            onBlur={() => setIsDeptFocused(false)}
                            isLoading={isDeptLoading}
                            menuPlacement="auto"
                            maxMenuHeight={150}
                            styles={customReactSelectStyles(
                              !!errors.departmentId
                            )}
                            placeholder=" "
                            isClearable
                          />
                          {errors.departmentId && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.departmentId}
                            </p>
                          )}
                        </div>
                        {/* --- END DEPARTMENT DROPDOWN --- */}
                        <div className="relative">
                          <label
                            htmlFor="roleId"
                            className={`absolute text-sm duration-300 transform z-10 origin-[0] px-2 left-1 pointer-events-none
                            ${
                              isRoleFocused || formData.roleId
                                ? "scale-75 -translate-y-4 top-2" // Floated state
                                : "scale-100 translate-y-0 top-2.5" // Centered state
                            }
                            ${
                              errors.roleId
                                ? "text-red-600" // Error color
                                : isRoleFocused
                                ? "text-blue-600" // Focus color
                                : "text-gray-500" // Default color
                            }
                            ${
                              !formData.departmentId
                                ? "text-gray-400 bg-gray-100" // Disabled text and bg
                                : "bg-white" // Normal bg
                            }
                          `}
                          >
                            Role *
                          </label>
                          <Select
                            id="roleId"
                            name="roleId"
                            options={roleOptions}
                            value={
                              roleOptions.find(
                                (option) => option.value === formData.roleId
                              ) || null
                            }
                            onChange={handleRoleChange}
                            onMenuOpen={loadRoles}
                            onFocus={() => setIsRoleFocused(true)}
                            onBlur={() => setIsRoleFocused(false)}
                            isLoading={isRoleLoading}
                            isDisabled={!formData.departmentId} // Disabled until dept is selected
                            menuPlacement="auto"
                            maxMenuHeight={150}
                            styles={customReactSelectStyles(!!errors.roleId)}
                            placeholder=" "
                            isClearable
                          />
                          {errors.roleId && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.roleId}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Personal Details Section */}
                    <section>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* --- Gender --- */}
                        <div className="relative">
                          <label
                            htmlFor="gender"
                            className={`absolute text-sm duration-300 transform z-10 origin-[0] bg-white px-2 left-1 pointer-events-none
                            ${
                              isGenderFocused || formData.gender
                                ? "scale-75 -translate-y-4 top-2" // Floated state
                                : "scale-100 translate-y-0 top-2.5" // Centered state
                            }
                            ${
                              errors.gender
                                ? "text-red-600" // Error color
                                : isGenderFocused
                                ? "text-blue-600" // Focus color
                                : "text-gray-500" // Default color
                            }
                          `}
                          >
                            Gender *
                          </label>
                          <Select
                            id="gender"
                            name="gender"
                            options={genderOptions}
                            value={genderOptions.find(
                              (option) => option.value === formData.gender
                            )}
                            onChange={handleGenderChange}
                            onFocus={() => setIsGenderFocused(true)}
                            onBlur={() => setIsGenderFocused(false)}
                            menuPlacement="auto" // This makes it open up or down
                            maxMenuHeight={150} // This adds a scrollbar if needed
                            styles={customReactSelectStyles(!!errors.gender)}
                            placeholder=" " // Required for the floating label to work'
                            isClearable
                          />
                          {errors.gender && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.gender}
                            </p>
                          )}
                        </div>

                        {/* --- Address --- */}
                        <div className="relative md:col-span-2">
                          <textarea
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className="block w-full px-3 py-2.5 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 peer text-sm resize-none"
                            placeholder=" "
                          />
                          <label
                            htmlFor="address"
                            className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none"
                          >
                            Address
                          </label>
                        </div>

                        {/* --- Description --- */}
                        <div className="relative md:col-span-2">
                          <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="block w-full px-3 py-2.5 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 peer text-sm resize-none"
                            placeholder=" "
                          />
                          <label
                            htmlFor="description"
                            className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none"
                          >
                            Description
                          </label>
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
  );
}

export default CreateEmployee;
