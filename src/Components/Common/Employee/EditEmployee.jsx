import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import TopBar from "../../Pages/Admin/TopBarAdmin";
import Sidebar from "../../Pages/Admin/SidebarAdmin";
import Select from "react-select"; // Import react-select
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";

// --- STYLES AND OPTIONS (Copied from CreateEmployee) ---
const customReactSelectStyles = (hasError) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: "42px",
    backgroundColor: state.isDisabled ? "#f3f4f6" : "transparent",
    cursor: state.isDisabled ? "not-allowed" : "default",
    borderColor: state.isDisabled
      ? "#d1d5db"
      : hasError
        ? "#ef4444"
        : state.isFocused
          ? "#3b82f6"
          : "#d1d5db",
    borderRadius: "0.5rem",
    borderWidth: state.isFocused ? "2px" : "1px",
    boxShadow: "none",
    "&:hover": {
      borderColor: state.isDisabled
        ? "#d1d5db"
        : hasError
          ? "#ef4444"
          : state.isFocused
            ? "#3b82f6"
            : "#9ca3af",
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
// --- END STYLES AND OPTIONS ---

function EditEmployee() {
  const { LayoutComponent, role } = useLayout();

  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [isGenderFocused, setIsGenderFocused] = useState(false);
  const [isDeptFocused, setIsDeptFocused] = useState(false);
  const [isRoleFocused, setIsRoleFocused] = useState(false);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  const [isDeptLoading, setIsDeptLoading] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);

  const [moduleAccess, setModuleAccess] = useState(null);

  const [formData, setFormData] = useState({
    loginEmail: "",
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

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) {
        alert("Employee ID not found in URL.");
        navigate("/Admin/EmployeeList");
        return;
      }
      setInitialLoading(true);
      try {
        const response = await axiosInstance.get(
          `/admin/getEmployeeById/${employeeId}`
        );
        const employeeData = response.data;

        // Populate form data
        setFormData({
          loginEmail: employeeData.loginEmail || "",
          name: employeeData.name || "",
          phone: employeeData.phone || "",
          address: employeeData.address || "",
          gender: employeeData.gender || "",
          description: employeeData.description || "",
          profileImageBase64: employeeData.profileImage || "",
          departmentId: employeeData.departmentId || "",
          roleId: employeeData.roleId || "",
          departmentName: employeeData.departmentName || "",
          roleName: employeeData.roleName || "",
        });
        setModuleAccess(employeeData.moduleAccess || null);
        // --- PRE-POPULATE DROPDOWNS ---
        // Pre-fill department options with the current value
        if (employeeData.departmentId && employeeData.departmentName) {
          setDepartmentOptions([
            {
              value: employeeData.departmentId,
              label: employeeData.departmentName,
            },
          ]);
        }
        // Pre-fill role options with the current value
        if (employeeData.roleId && employeeData.roleName) {
          setRoleOptions([
            { value: employeeData.roleId, label: employeeData.roleName },
          ]);
        }
        // --- END ---
      } catch (error) {
        console.error("Error fetching employee data:", error);
        alert("Failed to fetch employee details. Please try again.");
        navigate("/Admin/EmployeeList");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    // ... (This function is unchanged)
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          profileImageBase64: "Invalid file type. Please select a JPG or PNG.",
        }));
        return;
      }
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

      if (errors.profileImageBase64) {
        setErrors((prev) => ({ ...prev, profileImageBase64: "" }));
      }
    }
  };

  // --- NEW HANDLERS (Copied from CreateEmployee) ---
  const handleGenderChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      gender: selectedOption ? selectedOption.value : "",
    }));
    if (errors.gender) {
      setErrors((prev) => ({ ...prev, gender: "" }));
    }
  };

  const loadDepartments = async () => {
    // Only fetch if options are not already loaded (or just has the 1 pre-filled value)
    if (departmentOptions.length > 1) {
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
    // Only fetch if options are not already loaded (or just has the 1 pre-filled value)
    if (roleOptions.length > 1 && roleOptions[0]?.value === formData.roleId) {
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
      setRoleOptions([]);
    } finally {
      setIsRoleLoading(false);
    }
  };

  const handleDepartmentChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      departmentId: selectedOption ? selectedOption.value : "",
      departmentName: selectedOption ? selectedOption.label : "",
      roleId: "", // Reset role
      roleName: "", // Reset role
    }));
    setRoleOptions([]); // Clear old role options

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

  const handleAccessChange = (field, value) => {
    setModuleAccess((prev) => {
      // If moduleAccess is null, initialize it
      if (!prev) {
        return {
          leadAccess: false,
          moduleAccessId: null,
          leadViewAll: false,
          leadCreate: false,
          leadDelete: false,
          leadEdit: false,

          customerAccess: false,
          customerViewAll: false,
          customerCreate: false,
          customerDelete: false,
          customerEdit: false,

          proposalAccess: false,
          proposalViewAll: false,
          proposalCreate: false,
          proposalDelete: false,
          proposalEdit: false,

          proformaInvoiceAccess: false,
          proformaInvoiceViewAll: false,
          proformaInvoiceCreate: false,
          proformaInvoiceDelete: false,
          proformaInvoiceEdit: false,

          invoiceAccess: false,
          invoiceViewAll: false,
          invoiceCreate: false,
          invoiceDelete: false,
          invoiceEdit: false,

          paymentAccess: false,
          paymentViewAll: false,
          paymentcreate: false,
          paymentDelete: false,
          paymentEdit: false,
          // accountViewAll: false,
          // accountCreate: false,
          // accountDelete: false,
          // accountEdit: false,
          // dealViewAll: false,
          // dealCreate: false,
          // dealDelete: false,
          // dealEdit: false,
          // contactViewAll: false,
          // contactCreate: false,
          // contactDelete: false,
          // contactEdit: false,


          [field]: value, // Set the one that was just toggled
        };
      }
      // Otherwise, just update the existing object
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Full name is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    // --- VALIDATE NEW FIELDS ---
    if (!formData.departmentId)
      newErrors.departmentId = "Department is required";
    if (!formData.roleId) newErrors.roleId = "Role is required";
    // --- END ---

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      ...formData,
      profileImage: formData.profileImageBase64,
      employeeId: employeeId,
      moduleAccess: moduleAccess,
    };
    delete payload.profileImageBase64;
    try {
      const response = await axiosInstance.put(
        "/admin/updateEmployee",
        payload
      );

      toast.success("Employee updated successfully!");
      navigate("/Admin/EmployeeList");
    } catch (error) {
      console.error("Error updating employee:", error);
      if (error.request) {
        toast.error(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        toast.error("Failed to update employee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!toggleSidebar);
  };

  if (initialLoading) {
    // ... (Loading state is unchanged)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading employee data...</p>
      </div>
    );
  }

  const getAccess = (field) => {
    return moduleAccess ? moduleAccess[field] : false;
  };

  return (
    <LayoutComponent>

      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          {/* Header */}
          {/* ... (Header JSX is unchanged) ... */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => navigate("/Admin/EmployeeList")}
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
                  Edit Employee {/* Changed Title */}
                </h1>
                <p className="text-gray-600 text-sm">
                  Update employee details
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/Admin/EmployeeList")}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="editEmployeeForm" // Changed form ID
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {/* Save Icon or Check Icon */}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Save Changes {/* Changed Button Text */}
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
                id="editEmployeeForm" // Changed form ID
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
                          Update employee's profile picture
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <input
                        type="file"
                        id="profileImageInput"
                        name="profileImageBase64"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="profileImageInput"
                        className="cursor-pointer"
                      >
                        {formData.profileImageBase64 ? (
                          <img
                            src={`data:image/jpeg;base64,${formData.profileImageBase64}`} // Construct data URL
                            alt="Profile Preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-sm"
                          />
                        ) : (
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
                          {" "}
                          {errors.profileImageBase64}{" "}
                        </p>
                      )}
                    </div>
                  </section>

                  {/* --- Account Information Section (MODIFIED) --- */}
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
                          className={`block w-full px-3 py-2.5 bg-transparent border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm ${errors.name
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          placeholder=" "
                        />
                        <label
                          htmlFor="name"
                          className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5 peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none ${errors.name
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

                      {/* --- Email (Disabled) --- */}
                      <div className="relative">
                        <input
                          type="email"
                          name="loginEmail"
                          id="loginEmail"
                          value={formData.loginEmail}
                          onChange={handleChange}
                          disabled // Make email non-editable
                          className="block w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm cursor-not-allowed"
                          placeholder=" "
                        />
                        <label
                          htmlFor="loginEmail"
                          className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-100 px-2 left-1 pointer-events-none"
                        >
                          Email * (Cannot be changed)
                        </label>
                      </div>

                      {/* --- Phone --- */}
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`block w-full px-3 py-2.5 bg-transparent border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm ${errors.phone
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            }`}
                          placeholder=" "
                        />
                        <label
                          htmlFor="phone"
                          className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5 peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none ${errors.phone
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
                      <div></div>

                      {/* --- Department Dropdown --- */}
                      <div className="relative">
                        <label
                          htmlFor="departmentId"
                          className={`absolute text-sm duration-300 transform z-10 origin-[0] bg-white px-2 left-1 pointer-events-none
                              ${isDeptFocused || formData.departmentId
                              ? "scale-75 -translate-y-4 top-2"
                              : "scale-100 translate-y-0 top-2.5"
                            }
                              ${errors.departmentId
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
                          value={
                            departmentOptions.find(
                              (option) =>
                                option.value === formData.departmentId
                            ) || null
                          }
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

                      {/* --- Role Dropdown --- */}
                      <div className="relative">
                        <label
                          htmlFor="roleId"
                          className={`absolute text-sm duration-300 transform z-10 origin-[0] px-2 left-1 pointer-events-none
                              ${isRoleFocused || formData.roleId
                              ? "scale-75 -translate-y-4 top-2"
                              : "scale-100 translate-y-0 top-2.5"
                            }
                              ${errors.roleId
                              ? "text-red-600"
                              : isRoleFocused
                                ? "text-blue-600"
                                : "text-gray-500"
                            }
                              ${!formData.departmentId
                              ? "text-gray-400 bg-gray-100"
                              : "bg-white"
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
                          isDisabled={!formData.departmentId}
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

                  {/* --- Personal Details Section (MODIFIED) --- */}
                  <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* --- Gender --- */}
                      <div className="relative">
                        <label
                          htmlFor="gender"
                          className={`absolute text-sm duration-300 transform z-10 origin-[0] bg-white px-2 left-1 pointer-events-none
                              ${isGenderFocused || formData.gender
                              ? "scale-75 -translate-y-4 top-2"
                              : "scale-100 translate-y-0 top-2.5"
                            }
                              ${errors.gender
                              ? "text-red-600"
                              : isGenderFocused
                                ? "text-blue-600"
                                : "text-gray-500"
                            }
                            `}
                        >
                          Gender *
                        </label>
                        <Select
                          id="gender"
                          name="gender"
                          options={genderOptions}
                          value={
                            genderOptions.find(
                              (option) => option.value === formData.gender
                            ) || null
                          }
                          onChange={handleGenderChange}
                          onFocus={() => setIsGenderFocused(true)}
                          onBlur={() => setIsGenderFocused(false)}
                          menuPlacement="auto"
                          maxMenuHeight={150}
                          styles={customReactSelectStyles(!!errors.gender)}
                          placeholder=" "
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

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          ></path>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Module Access
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Set permissions for CRM modules
                        </p>
                      </div>
                    </div>




                    <div className="space-y-4">
                      {/* Leads Permissions */}
                      <ModuleAccessGroup
                        title="Leads Permissions"
                        permissions={[
                          { label: "Access", field: "leadAccess" },
                          { label: "View All", field: "leadViewAll" },
                          { label: "Create", field: "leadCreate" },
                          { label: "Edit", field: "leadEdit" },
                          { label: "Delete", field: "leadDelete" },
                        ]}
                        getAccess={getAccess}
                        handleAccessChange={handleAccessChange}
                      />

                      {/* Customer Permissions */}
                      <ModuleAccessGroup
                        title="Customer Permissions"
                        permissions={[
                          { label: "Access", field: "customerAccess" },
                          { label: "View All", field: "customerViewAll" },
                          { label: "Create", field: "customerCreate" },
                          { label: "Edit", field: "customerEdit" },
                          { label: "Delete", field: "customerDelete" },
                        ]}
                        getAccess={getAccess}
                        handleAccessChange={handleAccessChange}
                      />

                      {/* Proposal Permissions */}
                      <ModuleAccessGroup
                        title="Proposal Permissions"
                        permissions={[
                          { label: "Access", field: "proposalAccess" },
                          { label: "View All", field: "proposalViewAll" },
                          { label: "Create", field: "proposalCreate" },
                          { label: "Edit", field: "proposalEdit" },
                          { label: "Delete", field: "proposalDelete" },
                        ]}
                        getAccess={getAccess}
                        handleAccessChange={handleAccessChange}
                      />

                      {/* Proforma Invoice Permissions */}
                      <ModuleAccessGroup
                        title="Proforma Invoice Permissions"
                        permissions={[
                          { label: "Access", field: "proformaInvoiceAccess" },
                          { label: "View All", field: "proformaInvoiceViewAll" },
                          { label: "Create", field: "proformaInvoiceCreate" },
                          { label: "Edit", field: "proformaInvoiceEdit" },
                          { label: "Delete", field: "proformaInvoiceDelete" },
                        ]}
                        getAccess={getAccess}
                        handleAccessChange={handleAccessChange}
                      />

                      {/* Invoice Permissions */}
                      <ModuleAccessGroup
                        title="Invoice Permissions"
                        permissions={[
                          { label: "Access", field: "invoiceAccess" },
                          { label: "View All", field: "invoiceViewAll" },
                          { label: "Create", field: "invoiceCreate" },
                          { label: "Edit", field: "invoiceEdit" },
                          { label: "Delete", field: "invoiceDelete" },
                        ]}
                        getAccess={getAccess}
                        handleAccessChange={handleAccessChange}
                      />

                      {/* Payment Permissions */}
                      <ModuleAccessGroup
                        title="Payment Permissions"
                        permissions={[
                          { label: "Access", field: "paymentAccess" },
                          { label: "View All", field: "paymentViewAll" },
                          { label: "Create", field: "paymentcreate" },
                          { label: "Edit", field: "paymentEdit" },
                          { label: "Delete", field: "paymentDelete" },
                        ]}
                        getAccess={getAccess}
                        handleAccessChange={handleAccessChange}
                      />


                    </div>
                  </section>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>

  );
}


function ModuleAccessGroup({
  title,
  permissions,
  getAccess,
  handleAccessChange,
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {permissions.map((perm) => (
          <AccessToggle
            key={perm.field}
            field={perm.field}
            label={perm.label}
            isChecked={getAccess(perm.field)}
            onChange={(isChecked) => handleAccessChange(perm.field, isChecked)}
          />
        ))}
      </div>
    </div>
  );
}

function AccessToggle({ field, label, isChecked, onChange }) {
  const handleToggle = () => {
    onChange(!isChecked);
  };

  return (
    <label
      htmlFor={field}
      className="flex items-center cursor-pointer select-none"
    >
      <div className="relative">
        <input
          type="checkbox"
          id={field}
          checked={isChecked}
          onChange={handleToggle}
          className="sr-only"
        />
        <div
          className={`block w-10 h-6 rounded-full transition-colors ${isChecked ? "bg-blue-600" : "bg-gray-300"
            }`}
        ></div>
        <div
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${isChecked ? "translate-x-4" : "translate-x-0"
            }`}
        ></div>
      </div>
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default EditEmployee;
