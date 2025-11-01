import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";

import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import SidebarEmployee from "../../Pages/Employee/SidebarEmployee";
import TopBarEmployee from "../../Pages/Employee/TopBarEmployee";
import TopBar from "../../Pages/Admin/TopBarAdmin";
import Sidebar from "../../Pages/Admin/SidebarAdmin";

function CreateLead() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    assignTo: "",
    status: "New Lead",
    source: "",
    clientName: "",
    revenue: "",
    mobileNumber: "",
    phoneNumber: "",
    email: "",
    website: "",
    industry: "",
    priority: "",
    street: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    description: "",
  });

  const [role, setRole] = useState("");

  useEffect(() => {
    // Get user role from localStorage using the exact variable name
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setRole(userData.role); // Use the exact property name from your localStorage
      } catch (error) {
        console.error("Error parsing userData:", error);
      }
    }
  }, []);
  const [dropdownData, setDropdownData] = useState({
    countries: [],
    states: [],
    cities: [],
  });

  const [errors, setErrors] = useState({});

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
      }));
    }
  }, [formData.country]);

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
      }));
    }
  }, [formData.country, formData.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName?.trim())
      newErrors.clientName = "Client name is required";
    if (!formData.companyName?.trim())
      newErrors.companyName = "Company name is required";

    if (formData.state && !formData.country) {
      newErrors.country = "Country is required when state is selected";
    }
    if (formData.city && !formData.state) {
      newErrors.state = "State is required when city is selected";
    }
    if (formData.city && !formData.country) {
      newErrors.country = "Country is required when city is selected";
    }

    if (formData.street || formData.zipCode) {
      if (formData.city && !formData.state) {
        newErrors.state = "State is required when city is provided";
      }
      if (formData.state && !formData.country) {
        newErrors.country = "Country is required when state is provided";
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      formData.mobileNumber &&
      !/^[0-9+\-\s()]{10,}$/.test(formData.mobileNumber)
    ) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        companyName: formData.companyName,
        assignTo: formData.assignTo,
        status: formData.status,
        source: formData.source,
        clientName: formData.clientName,
        revenue: formData.revenue ? parseFloat(formData.revenue) : 0,
        mobileNumber: formData.mobileNumber || null,
        phoneNumber: formData.phoneNumber || null,
        email: formData.email || null,
        website: formData.website || null,
        industry: formData.industry || null,
        priority: formData.priority || null,
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

      await axiosInstance.post("createLead", submitData);

      toast.success("Lead created successfully!");
      if (role === "ROLE_ADMIN") {
        navigate("/Admin/LeadList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/LeadList");
      }
    } catch (error) {
      console.error("Error creating lead:", error);
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

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      // Navigate based on user role
      if (role === "ROLE_ADMIN") {
        navigate("/Admin/LeadList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/LeadList");
      } else {
        navigate("/login"); // Fallback to login
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  const handleCountryChange = (selectedOption) => {
    const countryCode = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      state: "",
      city: "",
      zipCode: "",
    }));

    if (countryCode) {
      const states = State.getStatesOfCountry(countryCode).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        states,
        cities: [],
      }));
    } else {
      setDropdownData((prev) => ({
        ...prev,
        states: [],
        cities: [],
      }));
    }

    if (errors.country || errors.state || errors.city) {
      setErrors((prev) => ({
        ...prev,
        country: "",
        state: "",
        city: "",
      }));
    }
  };

  const handleStateChange = (selectedOption) => {
    const stateCode = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      state: stateCode,
      city: "",
      zipCode: "",
    }));

    if (stateCode && formData.country) {
      const cities = City.getCitiesOfState(formData.country, stateCode).map(
        (city) => ({
          value: city.name,
          label: city.name,
        })
      );

      setDropdownData((prev) => ({
        ...prev,
        cities,
      }));
    } else {
      setDropdownData((prev) => ({
        ...prev,
        cities: [],
      }));
    }

    if (errors.state || errors.city) {
      setErrors((prev) => ({
        ...prev,
        state: "",
        city: "",
      }));
    }
  };

  const handleCityChange = (selectedOption) => {
    const cityName = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));

    if (errors.city) {
      setErrors((prev) => ({
        ...prev,
        city: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* TopBar based on role */}
      {role === "ROLE_ADMIN" ? (
        <TopBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      ) : role === "ROLE_EMPLOYEE" ? (
        <TopBarEmployee
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
      ) : null}

      <div className="flex flex-1 overflow-hidden">
        {role === "ROLE_ADMIN" ? (
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        ) : role === "ROLE_EMPLOYEE" ? (
          <SidebarEmployee isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        ) : null}

        <div
          className={`flex-1 flex flex-col h-[90vh] overflow-y-auto transition-all duration-300 CRM-scroll-width-none ${
            sidebarOpen ? "ml-0 lg:ml-5" : "ml-0"
          } scrollbar-hide`}
        >
          <div className="p-4 bg-gray-50 border-b border-gray-200">
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
                    onClick={handleCancel}
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

            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <form
                    id="createLeadForm"
                    onSubmit={handleSubmit}
                    className="p-6"
                  >
                    <div className="space-y-6">
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
                          <div className="relative">
                            <input
                              type="text"
                              name="clientName"
                              value={formData.clientName}
                              onChange={handleChange}
                              className={`w-full px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${
                                errors.clientName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                              Client Name *
                            </label>
                            {errors.clientName && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.clientName}
                              </p>
                            )}
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              className={`w-full px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${
                                errors.companyName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                              Company Name *
                            </label>
                            {errors.companyName && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.companyName}
                              </p>
                            )}
                          </div>

                          {/* Assign To Field with Floating Label */}
                          <div className="relative">
                            <input
                              type="text"
                              name="assignTo"
                              value={formData.assignTo}
                              onChange={handleChange}
                              className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                              placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                              Assign To
                            </label>
                          </div>

                          {/* Revenue Field with Floating Label */}
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              name="revenue"
                              value={formData.revenue}
                              onChange={handleChange}
                              className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                              placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                              Revenue
                            </label>
                          </div>
                        </div>
                      </section>

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
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              Contact Information
                            </h2>
                            <p className="text-gray-600 text-sm">
                              Client contact details
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Mobile Number Field with Floating Label */}
                          <div className="relative">
                            <input
                              type="text"
                              name="mobileNumber"
                              value={formData.mobileNumber}
                              onChange={handleChange}
                              className={`w-full px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${
                                errors.mobileNumber
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                              Mobile Number
                            </label>
                            {errors.mobileNumber && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.mobileNumber}
                              </p>
                            )}
                          </div>

                          {/* Phone Number Field with Floating Label */}
                          <div className="relative">
                            <input
                              type="text"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                              placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                              Phone Number
                            </label>
                          </div>

                          {/* Email Field with Floating Label */}
                          <div className="relative">
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${
                                errors.email
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                              Email
                            </label>
                            {errors.email && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.email}
                              </p>
                            )}
                          </div>

                          {/* Website Field with Floating Label */}
                          <div className="relative">
                            <input
                              type="url"
                              name="website"
                              value={formData.website}
                              onChange={handleChange}
                              className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                              placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                              Website
                            </label>
                          </div>
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
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
                          {/* Status Field with Floating Label */}
                          <div className="relative">
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white"
                            >
                              <option value="New Lead">New Lead</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Proposal">Proposal</option>
                              <option value="Negotiation">Negotiation</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                              Status
                            </label>
                            {/* Dropdown arrow icon */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Lead Source Field with Floating Label */}
                          <div className="relative">
                            <select
                              name="source"
                              value={formData.source}
                              onChange={handleChange}
                              className={`w-full px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white ${
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
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                              Lead Source *
                            </label>
                            {/* Dropdown arrow icon */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                            {errors.source && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.source}
                              </p>
                            )}
                          </div>

                          {/* Industry Field with Floating Label */}
                          <div className="relative">
                            <select
                              name="industry"
                              value={formData.industry}
                              onChange={handleChange}
                              className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white"
                            >
                              <option value="">Select Industry</option>
                              <option value="Technology">Technology</option>
                              <option value="Healthcare">Healthcare</option>
                              <option value="Finance">Finance</option>
                              <option value="Education">Education</option>
                              <option value="Manufacturing">
                                Manufacturing
                              </option>
                              <option value="Retail">Retail</option>
                              <option value="Real Estate">Real Estate</option>
                              <option value="Other">Other</option>
                            </select>
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                              Industry
                            </label>
                            {/* Dropdown arrow icon */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Priority Field with Floating Label */}
                          <div className="relative">
                            <select
                              name="priority"
                              value={formData.priority}
                              onChange={handleChange}
                              className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white"
                            >
                              <option value="">Select Priority</option>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                              Priority
                            </label>
                            {/* Dropdown arrow icon */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </section>

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
                          {/* Street Field with Floating Label */}
                          <div className="md:col-span-2 relative">
                            <input
                              type="text"
                              name="street"
                              value={formData.street}
                              onChange={handleChange}
                              className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                              placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                              Street
                            </label>
                          </div>

                          {/* Country Field with Floating Label */}
                          <div className="relative">
                            <Select
                              name="country"
                              value={dropdownData.countries.find(
                                (option) => option.value === formData.country
                              )}
                              onChange={handleCountryChange}
                              options={dropdownData.countries}
                              placeholder=" "
                              isSearchable
                              styles={customStyles}
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                              Country
                            </label>
                            {errors.country && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.country}
                              </p>
                            )}
                          </div>

                          {/* State Field with Floating Label */}
                          <div className="relative">
                            <Select
                              key={`state-${formData.country}`}
                              name="state"
                              value={dropdownData.states.find(
                                (option) => option.value === formData.state
                              )}
                              onChange={handleStateChange}
                              options={dropdownData.states}
                              placeholder=" "
                              isSearchable
                              isDisabled={!formData.country}
                              styles={customStyles}
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                              State
                            </label>
                            {errors.state && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.state}
                              </p>
                            )}
                          </div>

                          {/* City Field with Floating Label */}
                          <div className="relative">
                            <Select
                              key={`city-${formData.state}`}
                              name="city"
                              value={dropdownData.cities.find(
                                (option) => option.value === formData.city
                              )}
                              onChange={handleCityChange}
                              options={dropdownData.cities}
                              placeholder=" "
                              isSearchable
                              isDisabled={!formData.state}
                              styles={customStyles}
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                              City
                            </label>
                            {errors.city && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.city}
                              </p>
                            )}
                          </div>

                          {/* ZIP Code Field with Floating Label */}
                          <div className="relative">
                            <input
                              type="text"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleChange}
                              className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                              placeholder=" "
                            />
                            <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                              ZIP Code
                            </label>
                          </div>
                        </div>
                      </section>

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
