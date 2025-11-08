
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { useLayout } from "../../Layout/useLayout";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { LayoutComponent, role } = useLayout();
  const [employeeId, setEmployeeId] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    assignTo: "",
    status: "",
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

  // Simplified phone states
  const [phoneData, setPhoneData] = useState({
    mobileNumber: "",
    phoneNumber: "",
  });

  const [dropdownData, setDropdownData] = useState({
    countries: [],
    states: [],
    cities: [],
  });

  const [errors, setErrors] = useState({});

  // Parse phone number from your format (+91)7732032039
  const parsePhoneNumber = (phoneString) => {
    if (!phoneString) return { country: "in", number: "" };

    console.log("Parsing phone:", phoneString);

    // Handle format: (+91)7732032039 or (+91) 7732032039
    const match = phoneString.match(/\(\+(\d+)\)\s*(\d+)/);
    if (match && match[1] && match[2]) {
      const countryCode = match[1];
      const localNumber = match[2];

      // Map country dial codes to country codes
      const dialCodeToCountry = {
        '91': 'in', // India
        '1': 'us',  // USA
        '44': 'gb', // UK
        '49': 'de', // Germany
        '86': 'cn', // China
        '81': 'jp', // Japan
        '33': 'fr', // France
        '39': 'it', // Italy
        '34': 'es', // Spain
        '7': 'ru',  // Russia
        '55': 'br', // Brazil
        '61': 'au', // Australia
        '52': 'mx', // Mexico
      };

      const country = dialCodeToCountry[countryCode] || "in";
      const fullNumber = `+${countryCode}${localNumber}`;

      console.log("Parsed result:", { country, fullNumber, localNumber });
      return { country, number: fullNumber };
    }

    // If it's already in international format
    if (phoneString.startsWith('+')) {
      // Extract country code from the number itself
      const countryFromNumber = phoneString.startsWith('+91') ? 'in' :
        phoneString.startsWith('+1') ? 'us' :
          phoneString.startsWith('+44') ? 'gb' : 'in';
      return { country: countryFromNumber, number: phoneString };
    }

    // Default to India
    return { country: "in", number: phoneString };
  };

  // Format phone number for your backend: (+91)7732032039
  const formatPhoneForBackend = (phoneString) => {
    if (!phoneString) return "";

    console.log("Formatting for backend:", phoneString);

    // If it's already in our format, return as is
    if (phoneString.match(/\(\+\d+\)\d+/)) {
      return phoneString;
    }

    // Extract country code and local number from international format
    const match = phoneString.match(/\+(\d+)(\d+)/);
    if (match && match[1] && match[2]) {
      const formatted = `(+${match[1]})${match[2]}`;
      console.log("Formatted for backend:", formatted);
      return formatted;
    }

    return phoneString;
  };

  // Handle phone change - much simpler with react-international-phone
  const handlePhoneChange = (value, type = "mobile") => {
    console.log("Phone changed:", { type, value });

    if (type === "mobile") {
      setPhoneData(prev => ({ ...prev, mobileNumber: value }));
      setFormData(prev => ({
        ...prev,
        mobileNumber: formatPhoneForBackend(value),
      }));
    } else {
      setPhoneData(prev => ({ ...prev, phoneNumber: value }));
      setFormData(prev => ({
        ...prev,
        phoneNumber: formatPhoneForBackend(value),
      }));
    }

    // Clear errors
    if (errors.mobileNumber || errors.phoneNumber) {
      setErrors(prev => ({
        ...prev,
        mobileNumber: "",
        phoneNumber: "",
      }));
    }
  };

  // Initialize countries
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

  const findCountryCodeByName = (countryName) => {
    const countries = Country.getAllCountries();
    const country = countries.find((c) => c.name === countryName);
    return country ? country.isoCode : "";
  };

  const findStateCodeByName = (stateName, countryCode) => {
    const states = State.getStatesOfCountry(countryCode);
    const state = states.find((s) => s.name === stateName);
    return state ? state.isoCode : "";
  };

  // Fetch lead data - SIMPLIFIED phone handling
  useEffect(() => {
    const fetchLeadData = async () => {
      if (!id) {
        toast.error("Lead ID not found!");
        navigateBasedOnRole();
        return;
      }

      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`getLeadById/${id}`);
        const apiResponse = response.data;
        const leadData = apiResponse.lead;

        console.log("Fetched lead data:", leadData);

        if (!leadData) {
          toast.error("Lead data not found in response!");
          navigateBasedOnRole();
          return;
        }

        if (leadData.employeeId) {
          setEmployeeId(leadData.employeeId);
        }

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
          createdDate: leadData.createdDate,
          updatedDate: leadData.updatedDate,
        };

        setFormData(mappedFormData);

        // SIMPLIFIED PHONE SETUP
        console.log("Setting up phone data:", {
          mobileNumber: leadData.mobileNumber,
          phoneNumber: leadData.phoneNumber,
        });

        // Parse and set mobile number
        if (leadData.mobileNumber) {
          const parsedMobile = parsePhoneNumber(leadData.mobileNumber);
          console.log("Mobile setup:", {
            original: leadData.mobileNumber,
            parsed: parsedMobile
          });
          setPhoneData(prev => ({ ...prev, mobileNumber: parsedMobile.number }));
        }

        // Parse and set phone number
        if (leadData.phoneNumber) {
          const parsedPhone = parsePhoneNumber(leadData.phoneNumber);
          console.log("Phone setup:", {
            original: leadData.phoneNumber,
            parsed: parsedPhone
          });
          setPhoneData(prev => ({ ...prev, phoneNumber: parsedPhone.number }));
        }

        // Handle country-state-city dropdowns (keep your existing code)
        if (leadData.country) {
          const countryCode = findCountryCodeByName(leadData.country);
          console.log("Country setup:", {
            original: leadData.country,
            code: countryCode
          });

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

            setFormData((prev) => ({
              ...prev,
              country: countryCode,
            }));

            if (leadData.state) {
              const stateCode = findStateCodeByName(leadData.state, countryCode);
              console.log("State setup:", {
                original: leadData.state,
                code: stateCode
              });

              if (stateCode) {
                const cities = City.getCitiesOfState(countryCode, stateCode).map((city) => ({
                  value: city.name,
                  label: city.name,
                }));

                setDropdownData((prev) => ({
                  ...prev,
                  cities,
                }));

                setFormData((prev) => ({
                  ...prev,
                  state: stateCode,
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
        handleFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };

    const navigateBasedOnRole = () => {
      if (role === "ROLE_ADMIN") {
        navigate("/Admin/LeadList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/LeadList");
      }
    };

    const handleFetchError = (error) => {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        toast.error("Cannot connect to server. Please check if the backend is running.");
      } else {
        toast.error("Failed to fetch lead data. Please try again.");
      }
      navigateBasedOnRole();
    };

    fetchLeadData();
  }, [id, navigate, role]);

  // Update validation to work with new format
  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName?.trim())
      newErrors.clientName = "Client name is required";
    if (!formData.companyName?.trim())
      newErrors.companyName = "Company name is required";

    // Primary number validation - simplified
    if (!formData.mobileNumber?.trim()) {
      newErrors.mobileNumber = "Primary number is required";
    } else {
      // Check if it's in valid format
      const isValidFormat = formData.mobileNumber.match(/\(\+\d+\)\d+/);
      if (!isValidFormat) {
        newErrors.mobileNumber = "Invalid phone number format";
      }
    }

    // Secondary number validation
    if (formData.phoneNumber?.trim()) {
      const isValidFormat = formData.phoneNumber.match(/\(\+\d+\)\d+/);
      if (!isValidFormat) {
        newErrors.phoneNumber = "Invalid phone number format";
      }
    }

    // Rest of your validation logic...
    if (formData.state && !formData.country) {
      newErrors.country = "Country is required when state is selected";
    }
    if (formData.city && !formData.state) {
      newErrors.state = "State is required when city is selected";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        id: id,
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
          ? dropdownData.countries.find((c) => c.value === formData.country)?.label
          : "",
        state: formData.state
          ? dropdownData.states.find((s) => s.value === formData.state)?.label
          : "",
        city: formData.city,
        zipCode: formData.zipCode,
        description: formData.description,
        createdDate: formData.createdDate,
        updatedDate: new Date().toISOString(),
      };

      if (role === "ROLE_EMPLOYEE" && employeeId) {
        submitData.employeeId = employeeId;
      }

      console.log("Updating lead with data:", submitData);

      await axiosInstance.put("updateLead", submitData);

      toast.success("Lead updated successfully!");
      if (role === "ROLE_ADMIN") {
        navigate("/Admin/LeadList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/LeadList");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      if (error.response?.data?.message) {
        toast.error(`Failed to update lead: ${error.response.data.message}`);
      } else if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        toast.error("Cannot connect to server. Please check if the backend is running.");
      } else {
        toast.error("Failed to update lead. Please try again.");
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
      if (role === "ROLE_ADMIN") {
        navigate("/Admin/LeadList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/LeadList");
      }
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      window.location.reload();
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "32px",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LayoutComponent>
          <div className=" bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
            {/* Header Skeleton */}
            <div className="mb-6">
              <div className="skeleton h-4 w-32 mb-2"></div>
              <div className="skeleton h-8 w-64 mb-2"></div>
              <div className="skeleton h-4 w-48"></div>
            </div>

            {/* Form Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Section Header Skeleton */}
              <div className="flex items-center gap-3 mb-6">
                <div className="skeleton w-8 h-8 rounded-lg"></div>
                <div className="skeleton h-6 w-48"></div>
              </div>

              {/* Form Fields Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="skeleton h-4 w-24"></div>
                    <div className="skeleton h-10 w-full"></div>
                  </div>
                ))}
              </div>

              {/* Address Section Skeleton */}
              <div className="flex items-center gap-3 mb-6">
                <div className="skeleton w-8 h-8 rounded-lg"></div>
                <div className="skeleton h-6 w-32"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-10 w-full"></div>
                  </div>
                ))}
              </div>

              {/* Lead Details Skeleton */}
              <div className="flex items-center gap-3 mb-6">
                <div className="skeleton w-8 h-8 rounded-lg"></div>
                <div className="skeleton h-6 w-36"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="skeleton h-4 w-28"></div>
                    <div className="skeleton h-10 w-full"></div>
                  </div>
                ))}
              </div>

              {/* Description Skeleton */}
              <div className="flex items-center gap-3 mb-6">
                <div className="skeleton w-8 h-8 rounded-lg"></div>
                <div className="skeleton h-6 w-40"></div>
              </div>
              <div className="skeleton h-32 w-full"></div>
            </div>
          </div>
        </LayoutComponent>

        <style jsx>{`
          .skeleton {
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 4px;
          }

          @keyframes loading {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                if (role === "ROLE_ADMIN") {
                  navigate("/Admin/LeadList");
                } else if (role === "ROLE_EMPLOYEE") {
                  navigate("/Employee/LeadList");
                }
              }}
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
              <h1 className="text-xl font-bold text-gray-900">Edit Lead</h1>
              <p className="text-gray-600 text-sm">
                Update lead information for {formData.clientName}
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

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <form id="editLeadForm" onSubmit={handleSubmit} className="p-6">
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
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${errors.clientName
                              ? "border-red-500"
                              : "border-gray-300"
                            }`}
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
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
                          className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${errors.companyName
                              ? "border-red-500"
                              : "border-gray-300"
                            }`}
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Company Name *
                        </label>
                        {errors.companyName && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.companyName}
                          </p>
                        )}
                      </div>

                      {/* UPDATED MOBILE NUMBER FIELD */}
                      <div className="relative">
                        <div className={`phone-input-wrapper ${errors.mobileNumber ? "border-red-500 rounded" : ""}`}>
                          <PhoneInput
                            defaultCountry="in"
                            value={phoneData.mobileNumber}
                            onChange={(value) => handlePhoneChange(value, "mobile")}
                            placeholder="Enter primary phone number"
                            inputClassName="w-full h-10 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 pointer-events-none">
                          Primary Number *
                        </label>
                        {errors.mobileNumber && (
                          <p className="mt-1 text-xs text-red-600">{errors.mobileNumber}</p>
                        )}
                        {/* {formData.mobileNumber && (
                  <p className="mt-1 text-xs text-gray-500">
                    Stored as: {formData.mobileNumber}
                  </p>
                )} */}
                      </div>

                      {/* UPDATED PHONE NUMBER FIELD */}
                      <div className="relative">
                        <div className={`phone-input-wrapper ${errors.phoneNumber ? "border-red-500 rounded" : ""}`}>
                          <PhoneInput
                            defaultCountry="in"
                            value={phoneData.phoneNumber}
                            onChange={(value) => handlePhoneChange(value, "phone")}
                            placeholder="Enter secondary phone number"
                            inputClassName="w-full h-10 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 pointer-events-none">
                          Secondary Number
                        </label>
                        {errors.phoneNumber && (
                          <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                        )}
                        {/* {formData.phoneNumber && (
                  <p className="mt-1 text-xs text-gray-500">
                    Stored as: {formData.phoneNumber}
                  </p>
                )} */}
                      </div>


                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${errors.email ? "border-red-500" : "border-gray-300"
                            }`}
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Email
                        </label>
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Website
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="md:col-span-2 relative">
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Street
                        </label>
                      </div>

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

                      <div className="relative">
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          ZIP Code
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
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white"
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
                      <div className="relative">
                        <select
                          name="source"
                          value={formData.source}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white ${errors.source ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                          <option value="">Select Source</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Website">Website</option>
                          <option value="Referral">Referral</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Trade Show">Trade Show</option>
                          <option value="Email Campaign">Email Campaign</option>
                        </select>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                          Lead Source *
                        </label>
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

                      <div className="relative">
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white"
                        >
                          <option value="">Select Industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Retail">Retail</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Other">Other</option>
                        </select>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                          Industry
                        </label>
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

                      <div className="relative">
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white"
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
    </LayoutComponent>
  );
}

export default EditLead;  