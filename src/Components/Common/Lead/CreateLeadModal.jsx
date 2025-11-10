import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { toast } from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";

function CreateLeadModal({ onClose, onSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const { LayoutComponent, role } = useLayout();

  const [formData, setFormData] = useState({
    companyName: "",
    assignTo: "",
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

  // Separate state for display values
  const [phoneDisplay, setPhoneDisplay] = useState({
    mobileNumber: "",
    phoneNumber: "",
  });
  const [phoneData, setPhoneData] = useState({
    primaryCountry: "in",
    secondaryCountry: "in",
  });

  const [dropdownData, setDropdownData] = useState({
    countries: [],
    states: [],
    cities: [],
  });

  const [errors, setErrors] = useState({});

  // Country digit limits
  const countryDigitLimits = {
    in: 10,
    us: 10,
    gb: 10,
    ca: 10,
    au: 9,
    de: 10,
    fr: 9,
    jp: 10,
    cn: 11,
  };

  const getDigitLimit = (countryCode) => {
    const code = countryCode ? countryCode.toLowerCase() : "us";
    return countryDigitLimits[code] || 10;
  };

const navItems = [
  { id: "basic", label: "Basic Information" },
  { id: "details", label: "Lead Details" },
  { id: "description", label: "Description" },
];


  // Load countries on component mount
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

  // Load states when country changes
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

  // Load cities when state changes
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

  // Handle input change
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

  // Handle phone change
  const handlePhoneChange = (value, country, type = "primary") => {
    const countryCode = country.countryCode;
    const countryDialCode = country.dialCode;

    const digitsOnly = value.replace(/\D/g, "");
    const containsSpaces = /\s/.test(value);

    if (containsSpaces) {
      if (type === "primary") {
        setPhoneDisplay((prev) => ({ ...prev, mobileNumber: value }));
        setFormData((prev) => ({
          ...prev,
          mobileNumber: value,
        }));
      } else {
        setPhoneDisplay((prev) => ({ ...prev, phoneNumber: value }));
        setFormData((prev) => ({
          ...prev,
          phoneNumber: value,
        }));
      }

      if (errors.mobileNumber || errors.phoneNumber) {
        setErrors((prev) => ({
          ...prev,
          mobileNumber: "",
          phoneNumber: "",
        }));
      }
      return;
    }

    const localNumber = digitsOnly.slice(countryDialCode.length);
    const completeNumber = `(+${countryDialCode})${localNumber}`;
    const displayNumber = `+${countryDialCode} ${localNumber}`;

    if (type === "primary") {
      setPhoneDisplay((prev) => ({ ...prev, mobileNumber: displayNumber }));
      setFormData((prev) => ({
        ...prev,
        mobileNumber: completeNumber,
      }));
      setPhoneData((prev) => ({
        ...prev,
        primaryCountry: countryCode,
      }));
    } else {
      setPhoneDisplay((prev) => ({ ...prev, phoneNumber: displayNumber }));
      setFormData((prev) => ({
        ...prev,
        phoneNumber: completeNumber,
      }));
      setPhoneData((prev) => ({
        ...prev,
        secondaryCountry: countryCode,
      }));
    }

    if (errors.mobileNumber || errors.phoneNumber) {
      setErrors((prev) => ({
        ...prev,
        mobileNumber: "",
        phoneNumber: "",
      }));
    }
  };

  // Handle select change
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

  // Country change handler
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

  // State change handler
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

  // City change handler
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

  // Validate current section
  const validateCurrentSection = () => {
    const newErrors = {};

    if (activeSection === "basic") {
      if (!formData.clientName?.trim())
        newErrors.clientName = "Client name is required";
      if (!formData.companyName?.trim())
        newErrors.companyName = "Company name is required";

      // Primary number validation
      if (!formData.mobileNumber?.trim()) {
        newErrors.mobileNumber = "Primary number is required";
      } else {
        if (/\s/.test(formData.mobileNumber)) {
          newErrors.mobileNumber = "Phone number should not contain spaces";
        } else {
          const match = formData.mobileNumber.match(/\(\+(\d+)\)(\d+)/);
          if (match && match[1] && match[2]) {
            const localNumber = match[2];
            const requiredLength = getDigitLimit(phoneData.primaryCountry);
            if (localNumber.length !== requiredLength) {
              newErrors.mobileNumber = `Phone number must be exactly ${requiredLength} digits for ${getCountryName(
                phoneData.primaryCountry
              )}`;
            }
          } else {
            newErrors.mobileNumber = "Invalid phone number format";
          }
        }
      }

      // Secondary number validation
      if (formData.phoneNumber?.trim()) {
        if (/\s/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = "Phone number should not contain spaces";
        } else {
          const match = formData.phoneNumber.match(/\(\+(\d+)\)(\d+)/);
          if (match && match[1] && match[2]) {
            const localNumber = match[2];
            const requiredLength = getDigitLimit(phoneData.secondaryCountry);
            if (localNumber.length !== requiredLength) {
              newErrors.phoneNumber = `Phone number must be exactly ${requiredLength} digits for ${getCountryName(
                phoneData.secondaryCountry
              )}`;
            }
          } else {
            newErrors.phoneNumber = "Invalid phone number format";
          }
        }
      }

      // Address validation
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
    } else if (activeSection === "details") {
      if (!formData.source?.trim())
        newErrors.source = "Lead source is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form validation for final submission
  const validateForm = () => {
    const newErrors = {};

    // Basic info validation
    if (!formData.clientName?.trim())
      newErrors.clientName = "Client name is required";
    if (!formData.companyName?.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.source?.trim())
      newErrors.source = "Lead source is required";

    // Primary number validation
    if (!formData.mobileNumber?.trim()) {
      newErrors.mobileNumber = "Primary number is required";
    } else {
      if (/\s/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = "Phone number should not contain spaces";
      } else {
        const match = formData.mobileNumber.match(/\(\+(\d+)\)(\d+)/);
        if (match && match[1] && match[2]) {
          const localNumber = match[2];
          const requiredLength = getDigitLimit(phoneData.primaryCountry);
          if (localNumber.length !== requiredLength) {
            newErrors.mobileNumber = `Phone number must be exactly ${requiredLength} digits for ${getCountryName(
              phoneData.primaryCountry
            )}`;
          }
        } else {
          newErrors.mobileNumber = "Invalid phone number format";
        }
      }
    }

    // Secondary number validation
    if (formData.phoneNumber?.trim()) {
      if (/\s/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number should not contain spaces";
      } else {
        const match = formData.phoneNumber.match(/\(\+(\d+)\)(\d+)/);
        if (match && match[1] && match[2]) {
          const localNumber = match[2];
          const requiredLength = getDigitLimit(phoneData.secondaryCountry);
          if (localNumber.length !== requiredLength) {
            newErrors.phoneNumber = `Phone number must be exactly ${requiredLength} digits for ${getCountryName(
              phoneData.secondaryCountry
            )}`;
          }
        } else {
          newErrors.phoneNumber = "Invalid phone number format";
        }
      }
    }

    // Address validation
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Show validation toast
  const showValidationToast = () => {
    const errorMessages = Object.values(errors).filter(msg => msg);
    if (errorMessages.length > 0) {
      toast.error(`Please fix the following errors: ${errorMessages.join(', ')}`);
    } else {
      toast.error("Please fill in all required fields before proceeding.");
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showValidationToast();
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        companyName: formData.companyName,
        assignTo: formData.assignTo,
        status: "New Lead",
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
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback navigation
        if (role === "ROLE_ADMIN") {
          navigate("/Admin/LeadList");
        } else if (role === "ROLE_EMPLOYEE") {
          navigate("/Employee/LeadList");
        }
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

  // Handle next section
  const handleNext = () => {
    if (!validateCurrentSection()) {
      showValidationToast();
      return;
    }
    
    const currentIndex = navItems.findIndex(
      (item) => item.id === activeSection
    );
    if (currentIndex < navItems.length - 1) {
      setActiveSection(navItems[currentIndex + 1].id);
    }
  };

  // Handle previous section
  const handlePrevious = () => {
    const currentIndex = navItems.findIndex(
      (item) => item.id === activeSection
    );
    if (currentIndex > 0) {
      setActiveSection(navItems[currentIndex - 1].id);
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      borderColor: state.isFocused
        ? "#3b82f6"
        : errors.country || errors.state || errors.city
        ? "#ef4444"
        : "#e5e7eb",
      borderWidth: "1px",
      borderRadius: "6px",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
      },
      backgroundColor: "white",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
      borderRadius: "6px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      "&:active": {
        backgroundColor: "#3b82f6",
        color: "white",
      },
    }),
  };

  // Get country name helper function
  const getCountryName = (countryCode) => {
    const country = dropdownData.countries.find((c) => c.value === countryCode);
    return country ? country.label : countryCode.toUpperCase();
  };

  // Handle cancel
  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      // Fallback navigation
      if (role === "ROLE_ADMIN") {
        navigate("/Admin/LeadList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/LeadList");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Lead</h2>
                <p className="text-blue-100 text-sm">
                  Fill in the lead information below
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
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

        {/* Navigation Tabs */}
{/* Modern Navigation Tabs */}
<div className="border-b border-gray-200 bg-white">
  <div className="flex space-x-1 p-4">
    {navItems.map((item) => (
      <button
        key={item.id}
        onClick={() => setActiveSection(item.id)}
        className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
          activeSection === item.id
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        {item.label}
      </button>
    ))}
  </div>
</div>
        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[calc(80vh-180px)]" >
          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Information Section */}
            {activeSection === "basic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Client Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span>Client Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.clientName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter client name"
                    />
                    {errors.clientName && (
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
                        {errors.clientName}
                      </p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span>Company Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.companyName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter company name"
                    />
                    {errors.companyName && (
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
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  {/* Primary Number */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span>Primary Number</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`phone-input-wrapper ${
                        errors.mobileNumber ? "border-red-500 rounded-lg" : ""
                      }`}
                    >
                      <PhoneInput
                        country={"in"}
                        value={phoneDisplay.mobileNumber}
                        onChange={(value, country) =>
                          handlePhoneChange(value, country, "primary")
                        }
                        enableSearch={true}
                        placeholder="Enter primary phone number"
                        inputClass="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        buttonClass="!border-r-0 !rounded-l"
                        inputStyle={{
                          width: "100%",
                          height: "40px",
                          borderLeft: "none",
                          borderTopLeftRadius: "0",
                          borderBottomLeftRadius: "0",
                        }}
                        buttonStyle={{
                          borderRight: "none",
                          borderTopRightRadius: "0",
                          borderBottomRightRadius: "0",
                          height: "40px",
                        }}
                      />
                    </div>
                    {errors.mobileNumber && (
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
                        {errors.mobileNumber}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {getCountryName(phoneData.primaryCountry)} format:{" "}
                      {getDigitLimit(phoneData.primaryCountry)} digits
                    </p>
                  </div>

                  {/* Secondary Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Secondary Number
                    </label>
                    <div
                      className={`phone-input-wrapper ${
                        errors.phoneNumber ? "border-red-500 rounded-lg" : ""
                      }`}
                    >
                      <PhoneInput
                        country={"in"}
                        value={phoneDisplay.phoneNumber}
                        onChange={(value, country) =>
                          handlePhoneChange(value, country, "secondary")
                        }
                        enableSearch={true}
                        placeholder="Enter secondary phone number"
                        inputClass="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        buttonClass="!border-r-0 !rounded-l"
                        inputStyle={{
                          width: "100%",
                          height: "40px",
                          borderLeft: "none",
                          borderTopLeftRadius: "0",
                          borderBottomLeftRadius: "0",
                        }}
                        buttonStyle={{
                          borderRight: "none",
                          borderTopRightRadius: "0",
                          borderBottomRightRadius: "0",
                          height: "40px",
                        }}
                      />
                    </div>
                    {errors.phoneNumber && (
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
                        {errors.phoneNumber}
                      </p>
                    )}
                    {formData.phoneNumber && (
                      <p className="text-xs text-gray-500 mt-1">
                        {getCountryName(phoneData.secondaryCountry)} format:{" "}
                        {getDigitLimit(phoneData.secondaryCountry)} digits
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
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
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter website URL"
                    />
                  </div>

                  {/* Street */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter street address"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Country
                    </label>
                    <Select
                      name="country"
                      value={dropdownData.countries.find(
                        (option) => option.value === formData.country
                      )}
                      onChange={handleCountryChange}
                      options={dropdownData.countries}
                      placeholder="Select country"
                      isSearchable
                      styles={customStyles}
                    />
                    {errors.country && (
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
                        {errors.country}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      State
                    </label>
                    <Select
                      key={`state-${formData.country}`}
                      name="state"
                      value={dropdownData.states.find(
                        (option) => option.value === formData.state
                      )}
                      onChange={handleStateChange}
                      options={dropdownData.states}
                      placeholder="Select state"
                      isSearchable
                      isDisabled={!formData.country}
                      styles={customStyles}
                    />
                    {errors.state && (
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
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      City
                    </label>
                    <Select
                      key={`city-${formData.state}`}
                      name="city"
                      value={dropdownData.cities.find(
                        (option) => option.value === formData.city
                      )}
                      onChange={handleCityChange}
                      options={dropdownData.cities}
                      placeholder="Select city"
                      isSearchable
                      isDisabled={!formData.state}
                      styles={customStyles}
                    />
                    {errors.city && (
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
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* ZIP Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Lead Details Section */}
            {activeSection === "details" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Lead Source */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span>Lead Source</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white ${
                        errors.source ? "border-red-500" : "border-gray-300"
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
                    {errors.source && (
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
                        {errors.source}
                      </p>
                    )}
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Industry
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
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
                  </div>

           
                  {/* Revenue */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Revenue
                    </label>
                    <input
                      type="number"
                      name="revenue"
                      value={formData.revenue}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter revenue amount"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description Section */}
            {activeSection === "description" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Enter additional notes, requirements, or description about this lead..."
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer */}
     {/* Modal Footer */}
<div className="border-t border-gray-200 bg-gray-50 p-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCancel}
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
    </div>

    <div className="flex items-center gap-2">
      {/* Previous Button - Show in all tabs except first */}
      {activeSection !== "basic" && (
        <button
          type="button"
          onClick={handlePrevious}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 font-medium flex items-center gap-2 text-sm"
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
          Previous
        </button>
      )}

      {/* Next Button - Show in all tabs except last */}
      {activeSection !== "description" ? (
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 text-sm"
        >
          Next
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm"
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
              Create Lead
            </>
          )}
        </button>
      )}
    </div>
  </div>
</div>
      </div>
    </div>
  );
}

export default CreateLeadModal;