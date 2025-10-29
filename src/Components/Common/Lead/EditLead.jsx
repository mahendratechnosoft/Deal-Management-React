import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import Sidebar from "../../Pages/Admin/SidebarAdmin";
import TopBar from "../../Pages/Admin/TopBarAdmin";
import { toast } from "react-hot-toast";
function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fixed fields as per API
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

  // Find country code by country name
  const findCountryCodeByName = (countryName) => {
    const country = Country.getAllCountries().find(
      (c) => c.name === countryName
    );
    return country ? country.isoCode : "";
  };

  // Find state code by state name and country code
  const findStateCodeByName = (stateName, countryCode) => {
    const states = State.getStatesOfCountry(countryCode);
    const state = states.find((s) => s.name === stateName);
    return state ? state.isoCode : "";
  };

  // Fetch lead data when component mounts
  useEffect(() => {
    const fetchLeadData = async () => {
      if (!id) {
        toast.error("Lead ID not found!");
        navigate("/Admin/LeadList");
        return;
      }

      setIsLoading(true);
      try {
        const token = getAuthToken();

        if (!token) {
          toast.error("Please login first");
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:8080/admin/getLeadById/${id}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");

          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        if (response.ok) {
          const apiResponse = await response.json();
          const leadData = apiResponse.lead; // Extract data from lead property

          console.log("Fetched lead data:", leadData);

          if (!leadData) {
            toast.error("Lead data not found in response!");
            navigate("/Admin/LeadList");
            return;
          }

          // Map API response to form data
          // Map API response to form data
          const mappedFormData = {
            companyName: leadData.companyName || "",
            assignTo: leadData.assignTo || "",
            status: leadData.status || "New Lead",
            source: leadData.source || "",
            clientName: leadData.clientName || "",
            revenue: leadData.revenue ? leadData.revenue.toString() : "",
            mobileNumber: leadData.mobileNumber || "",
            phoneNumber: leadData.phoneNumber || "",
            email: leadData.email || "",
            website: leadData.website || "",
            industry: leadData.industry || "",
            priority: leadData.priority || "",
            street: leadData.street || "",
            country: leadData.country || "",
            state: leadData.state || "",
            city: leadData.city || "",
            zipCode: leadData.zipCode || "",
            description: leadData.description || "",
          };

          setFormData(mappedFormData);

          // Handle country-state-city dropdowns
          if (leadData.country) {
            const countryCode = findCountryCodeByName(leadData.country);

            if (countryCode) {
              const states = State.getStatesOfCountry(countryCode).map(
                (state) => ({
                  value: state.isoCode,
                  label: state.name,
                })
              );

              setDropdownData((prev) => ({
                ...prev,
                states,
              }));

              // Set country code in form data for dropdown selection
              setFormData((prev) => ({
                ...prev,
                country: countryCode,
              }));

              // If state is set, load cities
              if (leadData.state) {
                const stateCode = findStateCodeByName(
                  leadData.state,
                  countryCode
                );

                if (stateCode) {
                  const cities = City.getCitiesOfState(
                    countryCode,
                    stateCode
                  ).map((city) => ({
                    value: city.name,
                    label: city.name,
                  }));

                  setDropdownData((prev) => ({
                    ...prev,
                    cities,
                  }));

                  // Set state code in form data for dropdown selection
                  setFormData((prev) => ({
                    ...prev,
                    state: stateCode,
                  }));
                }
              }
            }
          }
        } else {
          let errorMessage = "Failed to fetch lead data";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = (await response.text()) || errorMessage;
          }
          alert(`Failed to fetch lead: ${errorMessage}`);
          navigate("/Admin/LeadList");
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
        if (
          error.name === "TypeError" &&
          error.message.includes("Failed to fetch")
        ) {
          toast.error(
            "Cannot connect to server. Please check if the backend is running."
          );
        } else {
          toast.error("Failed to fetch lead data. Please try again.");
        }
        navigate("/Admin/LeadList");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadData();
  }, [id, navigate]);

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
      }));

      // Don't reset state and city here as we want to preserve existing values
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

    // Validate required fields
    if (!formData.clientName?.trim())
      newErrors.clientName = "Client name is required";
    if (!formData.companyName?.trim())
      newErrors.companyName = "Company name is required";

    // Validate country, state, city dependencies
    if (formData.state && !formData.country) {
      newErrors.country = "Country is required when state is selected";
    }
    if (formData.city && !formData.state) {
      newErrors.state = "State is required when city is selected";
    }
    if (formData.city && !formData.country) {
      newErrors.country = "Country is required when city is selected";
    }

    // If any address field is filled, validate the hierarchy
    if (formData.street || formData.zipCode) {
      if (formData.city && !formData.state) {
        newErrors.state = "State is required when city is provided";
      }
      if (formData.state && !formData.country) {
        newErrors.country = "Country is required when state is provided";
      }
    }

    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone number validation if provided
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
      const token = getAuthToken();

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      // Prepare the data in API format with only fixed fields
      // Prepare the data in API format with all fields
      const submitData = {
        id: id, // Include the lead ID for update
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
      console.log("Updating lead with data:", submitData);

      const response = await fetch(
        `http://localhost:8080/admin/updateLead`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(submitData),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      if (response.ok) {
        const result = await response.json();

        toast.success("Lead updated successfully!");
        navigate("/Admin/LeadList");
      } else {
        let errorMessage = "Failed to update lead";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = (await response.text()) || errorMessage;
        }
        alert(`Failed to update lead: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        alert(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        alert("Failed to update lead. Please try again.");
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
      navigate("/Admin/LeadList");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      // Re-fetch the original data
      window.location.reload();
    }
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

  // Handle country change - reset state and city
  const handleCountryChange = (selectedOption) => {
    const countryCode = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      state: "", // Reset state
      city: "", // Reset city
      zipCode: "", // Reset zip code
    }));

    // Update states based on selected country
    if (countryCode) {
      const states = State.getStatesOfCountry(countryCode).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        states,
        cities: [], // Reset cities
      }));
    } else {
      setDropdownData((prev) => ({
        ...prev,
        states: [],
        cities: [],
      }));
    }

    // Clear error when user selects an option
    if (errors.country || errors.state || errors.city) {
      setErrors((prev) => ({
        ...prev,
        country: "",
        state: "",
        city: "",
      }));
    }
  };

  // Handle state change - reset city
  const handleStateChange = (selectedOption) => {
    const stateCode = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      state: stateCode,
      city: "", // Reset city
      zipCode: "", // Reset zip code
    }));

    // Update cities based on selected state and country
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

    // Clear error when user selects an option
    if (errors.state || errors.city) {
      setErrors((prev) => ({
        ...prev,
        state: "",
        city: "",
      }));
    }
  };

  // Handle city change
  const handleCityChange = (selectedOption) => {
    const cityName = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));

    // Clear error when user selects an option
    if (errors.city) {
      setErrors((prev) => ({
        ...prev,
        city: "",
      }));
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">
            Loading lead information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <TopBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 flex flex-col h-[90vh] overflow-y-auto transition-all duration-300 CRM-scroll-width-none ${
            sidebarOpen ? "ml-0 lg:ml-5" : "ml-0"
          }`}
        >
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            {/* Header */}
            <div className="mb-4">
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
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 ">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Edit Lead</h1>
                  <p className="text-gray-600 text-sm">
                    Update lead information for {formData.clientName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    ID: {id}
                  </div>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    form="editLeadForm"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      "Updating..."
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
                        Update Lead
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
                    id="editLeadForm"
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
                              Company Name *
                            </label>
                            <input
                              type="text"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.companyName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter company name"
                            />
                            {errors.companyName && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.companyName}
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

                      {/* Contact Information Section */}
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
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mobile Number
                            </label>
                            <input
                              type="text"
                              name="mobileNumber"
                              value={formData.mobileNumber}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.mobileNumber
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter mobile number"
                            />
                            {errors.mobileNumber && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.mobileNumber}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            <input
                              type="text"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Enter phone number"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                errors.email
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter email address"
                            />
                            {errors.email && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.email}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Website
                            </label>
                            <input
                              type="url"
                              name="website"
                              value={formData.website}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder="Enter website URL"
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
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Industry
                            </label>
                            <select
                              name="industry"
                              value={formData.industry}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Priority
                            </label>
                            <select
                              name="priority"
                              value={formData.priority}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                              <option value="">Select Priority</option>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Urgent">Urgent</option>
                            </select>
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
                              onChange={handleCountryChange}
                              options={dropdownData.countries}
                              placeholder="Select Country"
                              isSearchable
                              styles={customStyles}
                            />
                            {errors.country && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.country}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State *
                            </label>
                            <Select
                              key={`state-${formData.country}`}
                              name="state"
                              value={dropdownData.states.find(
                                (option) => option.value === formData.state
                              )}
                              onChange={handleStateChange}
                              options={dropdownData.states}
                              placeholder="Select State"
                              isSearchable
                              isDisabled={!formData.country}
                              styles={customStyles}
                            />
                            {errors.state && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.state}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City *
                            </label>
                            <Select
                              key={`city-${formData.state}`}
                              name="city"
                              value={dropdownData.cities.find(
                                (option) => option.value === formData.city
                              )}
                              onChange={handleCityChange}
                              options={dropdownData.cities}
                              placeholder="Select City"
                              isSearchable
                              isDisabled={!formData.state}
                              styles={customStyles}
                            />
                            {errors.city && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.city}
                              </p>
                            )}
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

export default EditLead;
