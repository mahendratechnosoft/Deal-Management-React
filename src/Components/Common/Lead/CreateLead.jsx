import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import Sidebar from "../../Pages/Admin/SidebarAdmin";
import TopBar from "../../Pages/Admin/TopBarAdmin";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
function CreateLead() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fixed fields as per API
  const [formData, setFormData] = useState({
    employeeId: "",
    assignTo: "",
    status: "New Lead",
    source: "",
    clientName: "",
    revenue: "",
    street: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    description: "",
  });

  // Get user role from localStorage
  const getUserRole = () => {
    return localStorage.getItem("role");
  };

  const [dropdownData, setDropdownData] = useState({
    countries: [],
    states: [],
    cities: [],
    zipCodes: [],
  });

  const [errors, setErrors] = useState({});

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // Initialize countries on component mount
  useEffect(() => {
    const countries = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
      phonecode: country.phonecode,
      flag: country.flag,
    }));

    setDropdownData((prev) => ({
      ...prev,
      countries,
    }));
  }, []);

  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      const states = State.getStatesOfCountry(formData.country).map(
        (state) => ({
          value: state.isoCode,
          label: state.name,
        })
      );

      setDropdownData((prev) => ({
        ...prev,
        states,
        cities: [],
        zipCodes: [],
      }));

      // Reset state, city, and zipCode when country changes
      setFormData((prev) => ({
        ...prev,
        state: "",
        city: "",
        zipCode: "",
      }));
    }
  }, [formData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const cities = City.getCitiesOfState(
        formData.country,
        formData.state
      ).map((city) => ({
        value: city.name,
        label: city.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        cities,
        zipCodes: [],
      }));

      // Reset city and zipCode when state changes
      setFormData((prev) => ({
        ...prev,
        city: "",
        zipCode: "",
      }));
    }
  }, [formData.country, formData.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));

    // Clear error when user selects an option
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fixed fields
    if (!formData.clientName?.trim())
      newErrors.clientName = "Client name is required";
    if (!formData.source?.trim()) newErrors.source = "Lead source is required";
    if (!formData.employeeId?.trim())
      newErrors.employeeId = "Employee ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
   e.preventDefault();
   if (!validateForm()) return;

   setLoading(true);
   try {
     const role = getUserRole();

     if (!role) {
       toast.error("Please login first");
       navigate("/login");
       return;
     }

     // Prepare the data in API format with only fixed fields
     const submitData = {
       employeeId: formData.employeeId,
       assignTo: formData.assignTo,
       status: formData.status,
       source: formData.source,
       clientName: formData.clientName,
       revenue: formData.revenue ? parseFloat(formData.revenue) : 0,
       street: formData.street,
       country: formData.country
         ? dropdownData.countries.find((c) => c.value === formData.country)
             ?.label
         : "",
       state: formData.state
         ? dropdownData.states.find((s) => s.value === formData.state)?.label
         : "",
       city: formData.city,
       zipCode: formData.zipCode,
       description: formData.description,
     };

     console.log("Submitting data:", submitData);

     // Use axiosInstance for API call - it will automatically handle:
     // - Role-based URL prefix (admin/ or employee/)
     // - Authorization header with Bearer token
     // - Error handling for 401/403
     const response = await axiosInstance.post("createLead", submitData);

     toast.success("Lead created successfully!");
     resetForm();

     // Navigate based on role
     if (role === "ROLE_ADMIN") {
       navigate("/Admin/LeadList");
     } else {
       navigate("/Employee/LeadList");
     }
   } catch (error) {
     console.error("Error creating lead:", error);

     // The axios interceptor will handle 401/403 errors automatically
     // For other errors, show appropriate message
     if (error.response?.data?.message) {
       toast.error(`Failed to create lead: ${error.response.data.message}`);
     } else if (
       error.name === "TypeError" &&
       error.message.includes("Failed to fetch")
     ) {
       toast.error(
         "Cannot connect to server. Please check if the backend is running."
       );
     } else {
       toast.error("Failed to create lead. Please try again.");
     }
   } finally {
     setLoading(false);
   }
 };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      assignTo: "",
      status: "New Lead",
      source: "",
      clientName: "",
      revenue: "",
      street: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
      description: "",
    });

    setDropdownData({
      countries: dropdownData.countries, // Keep countries
      states: [],
      cities: [],
      zipCodes: [],
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      borderColor:
        errors.country || errors.state || errors.city ? "#ef4444" : "#d1d5db",
      "&:hover": {
        borderColor:
          errors.country || errors.state || errors.city ? "#ef4444" : "#3b82f6",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <TopBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div
          className={`flex-1 flex flex-col h-[90vh] overflow-y-auto transition-all duration-300 CRM-scroll-width-none ${
            sidebarOpen ? "ml-0 lg:ml-5" : "ml-0"
          } scrollbar-hide`}
        >
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            {/* Header */}
            <div className="">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => navigate("/Admin/LeadList")}
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
                  Back to Leads
                </button>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Create New Lead
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Add a new lead to your sales pipeline
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/Admin/LeadList")}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="createLeadForm"
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
                        Create Lead
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
                    id="createLeadForm"
                    onSubmit={handleSubmit}
                    className="p-6"
                  >
                    <div className="space-y-6">
                      {/* Basic Information Section */}
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
                              Basic Information
                            </h2>
                            <p className="text-gray-600 text-sm">
                              Primary lead details
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Client Name *
                            </label>
                            <input
                              type="text"
                              name="clientName"
                              value={formData.clientName}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.clientName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter client name"
                            />
                            {errors.clientName && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.clientName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Employee ID *
                            </label>
                            <input
                              type="text"
                              name="employeeId"
                              value={formData.employeeId}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.employeeId
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter employee ID"
                            />
                            {errors.employeeId && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.employeeId}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Assign To
                            </label>
                            <input
                              type="text"
                              name="assignTo"
                              value={formData.assignTo}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Enter assignee ID"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Revenue
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              name="revenue"
                              value={formData.revenue}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Enter revenue amount"
                            />
                          </div>
                        </div>
                      </section>

                      {/* Lead Details Section */}
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
                              Lead Details
                            </h2>
                            <p className="text-gray-600 text-sm">
                              Sales pipeline information
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="New Lead">New Lead</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Proposal">Proposal</option>
                              <option value="Negotiation">Negotiation</option>
                              <option value="Closed Won">Closed Won</option>
                              <option value="Closed Lost">Closed Lost</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Lead Source *
                            </label>
                            <select
                              name="source"
                              value={formData.source}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.source
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <option value="">Select Source</option>
                              <option value="Instagram">Instagram</option>
                              <option value="Website">Website</option>
                              <option value="Referral">Referral</option>
                              <option value="Social Media">Social Media</option>
                              <option value="Trade Show">Trade Show</option>
                              <option value="Email Campaign">
                                Email Campaign
                              </option>
                            </select>
                            {errors.source && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.source}
                              </p>
                            )}
                          </div>
                        </div>
                      </section>

                      {/* Address Information Section */}
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
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              Address Information
                            </h2>
                            <p className="text-gray-600 text-sm">
                              Client location details
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Street
                            </label>
                            <input
                              type="text"
                              name="street"
                              value={formData.street}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Enter street address"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Country *
                            </label>
                            <Select
                              name="country"
                              value={dropdownData.countries.find(
                                (option) => option.value === formData.country
                              )}
                              onChange={(selectedOption) =>
                                handleSelectChange(selectedOption, {
                                  name: "country",
                                })
                              }
                              options={dropdownData.countries}
                              placeholder="Select Country"
                              isSearchable
                              styles={customStyles}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State *
                            </label>
                            <Select
                              name="state"
                              value={dropdownData.states.find(
                                (option) => option.value === formData.state
                              )}
                              onChange={(selectedOption) =>
                                handleSelectChange(selectedOption, {
                                  name: "state",
                                })
                              }
                              options={dropdownData.states}
                              placeholder="Select State"
                              isSearchable
                              isDisabled={!formData.country}
                              styles={customStyles}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City *
                            </label>
                            <Select
                              name="city"
                              value={dropdownData.cities.find(
                                (option) => option.value === formData.city
                              )}
                              onChange={(selectedOption) =>
                                handleSelectChange(selectedOption, {
                                  name: "city",
                                })
                              }
                              options={dropdownData.cities}
                              placeholder="Select City"
                              isSearchable
                              isDisabled={!formData.state}
                              styles={customStyles}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              ZIP Code
                            </label>
                            <input
                              type="text"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Enter ZIP code"
                            />
                          </div>
                        </div>
                      </section>

                      {/* Description Section */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
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
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              Description
                            </h2>
                            <p className="text-gray-600 text-sm">
                              Additional notes and information
                            </p>
                          </div>
                        </div>

                        <div>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                            placeholder="Enter additional notes or description"
                          />
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

export default CreateLead;
