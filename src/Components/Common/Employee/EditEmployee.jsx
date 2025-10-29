import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import axiosInstance from "../../BaseComponet/axiosInstance"; // Assuming correct path
import TopBar from "../../Pages/Admin/TopBarAdmin"; // Assuming correct path
import Sidebar from "../../Pages/Admin/SidebarAdmin"; // Assuming correct path

function EditEmployee() {
  const navigate = useNavigate();
  const { employeeId } = useParams(); // Get employeeId from URL
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // For initial data fetch

  // State fields
  const [formData, setFormData] = useState({
    loginEmail: "", // Will be populated but disabled
    name: "",
    phone: "",
    address: "",
    gender: "",
    description: "",
    profileImageBase64: "", // API returns just base64, state expects just base64
  });

  const [errors, setErrors] = useState({});

  // Fetch employee data on component mount or when employeeId changes
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) {
        alert("Employee ID not found in URL.");
        navigate("/Admin/EmployeeList"); // Redirect if no ID
        return;
      }
      setInitialLoading(true);
      try {
        const response = await axiosInstance.get(
          `/admin/getEmployeeById/${employeeId}`
        );
        const employeeData = response.data;
        // Populate form data - map profileImage to profileImageBase64
        setFormData({
          loginEmail: employeeData.loginEmail || "",
          name: employeeData.name || "",
          phone: employeeData.phone || "",
          address: employeeData.address || "",
          gender: employeeData.gender || "",
          description: employeeData.description || "",
          profileImageBase64: employeeData.profileImage || "", // API gives 'profileImage'
        });
      } catch (error) {
        console.error("Error fetching employee data:", error);
        alert("Failed to fetch employee details. Please try again.");
        navigate("/Admin/EmployeeList"); // Redirect on error
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

  /**
   * Handles file input change and converts the image to Base64
   */
  const handleFileChange = (e) => {
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Full name is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    // Email is fetched and disabled, no need to validate its format here
    // Password is removed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      loginEmail: formData.loginEmail,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      gender: formData.gender,
      description: formData.description,
      profileImage: formData.profileImageBase64,
      employeeId: employeeId,
    };

    try {
      const response = await axiosInstance.put(
        "/admin/updateEmployee",
        payload
      );

      alert("Employee updated successfully!");
      navigate("/Admin/EmployeeList"); // Navigate back to list on success
    } catch (error) {
      console.error("Error updating employee:", error);
      if (error.request) {
        alert(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        alert("Failed to update employee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render loading state while fetching initial data
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading employee data...</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

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
                      {/* Profile Image Section */}
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
                              {" "}
                              Full Name *{" "}
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
                            {/* Email Field - Disabled */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {" "}
                              Email *{" "}
                            </label>
                            <input
                              type="email"
                              name="loginEmail"
                              value={formData.loginEmail}
                              onChange={handleChange}
                              disabled // Make email non-editable
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-100 cursor-not-allowed ${
                                errors.loginEmail
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter login email"
                            />
                            {/* No error message needed for disabled field */}
                          </div>
                          {/* Password Field Removed */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {" "}
                              Phone *{" "}
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
                              {" "}
                              Gender *{" "}
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
                              {" "}
                              Address{" "}
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
                              {" "}
                              Description{" "}
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

export default EditEmployee;
