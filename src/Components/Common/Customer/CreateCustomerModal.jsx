import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const customReactSelectStyles = (hasError) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: "40px",
    borderColor: state.isFocused
      ? "#3b82f6"
      : hasError
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
  menuList: (base) => ({
    ...base,
    maxHeight: "150px",
    padding: "4px 0",
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
});

// GST Validation Function
// GST Validation Function
const validateGST = (gstin) => {
  if (!gstin) return ""; // Empty is valid (optional field)

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(gstin)) {
    return "Invalid GSTIN format (e.g., 07AABCU9603R1ZM)";
  }
  return "";
};

// PAN Validation Function
const validatePAN = (pan) => {
  if (!pan) return ""; // Empty is valid (optional field)

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan)) {
    return "Invalid PAN format (e.g., ABCDE1234F)";
  }
  return "";
};

// Update handleChange function to include validation:
const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  // Validate GST and PAN in real-time (only if field has value)
  if (name === "gstin") {
    const gstError = validateGST(value);
    setErrors((prev) => ({
      ...prev,
      gstin: gstError,
    }));
  }

  if (name === "panNumber") {
    const panError = validatePAN(value);
    setErrors((prev) => ({
      ...prev,
      panNumber: panError,
    }));
  }

  if (errors[name]) {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }
};

function CreateCustomerModal({ onClose, onSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { LayoutComponent, role } = useLayout();
  const [activeTab, setActiveTab] = useState("basic"); // "basic", "address", "additional"

  // Separate states for phone display and data
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [mobileDisplay, setMobileDisplay] = useState("");

  const [phoneData, setPhoneData] = useState({
    country: "in",
    completeNumber: "",
  });

  const [mobileData, setMobileData] = useState({
    country: "in",
    completeNumber: "",
  });

  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    mobile: "",
    email: "",
    website: "",
    industry: "",
    revenue: "",
    gstin: "",
    panNumber: "",
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingCountry: "",
    billingZipCode: "",
    shippingStreet: "",
    shippingCity: "",
    shippingState: "",
    shippingCountry: "",
    shippingZipCode: "",
    description: "",
  });

  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    countries: [],
    billingStates: [],
    billingCities: [],
    shippingStates: [],
    shippingCities: [],
  });

  const [errors, setErrors] = useState({});

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

  // Handle billing country change
  useEffect(() => {
    if (formData.billingCountry) {
      const billingStates = State.getStatesOfCountry(
        formData.billingCountry
      ).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        billingStates,
        billingCities: [],
      }));
    }
  }, [formData.billingCountry]);

  // Handle billing state change
  useEffect(() => {
    if (formData.billingCountry && formData.billingState) {
      const billingCities = City.getCitiesOfState(
        formData.billingCountry,
        formData.billingState
      ).map((city) => ({
        value: city.name,
        label: city.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        billingCities,
      }));
    }
  }, [formData.billingCountry, formData.billingState]);

  // Handle shipping country change
  useEffect(() => {
    if (formData.shippingCountry) {
      const shippingStates = State.getStatesOfCountry(
        formData.shippingCountry
      ).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        shippingStates,
        shippingCities: [],
      }));
    }
  }, [formData.shippingCountry]);

  // Handle shipping state change
  useEffect(() => {
    if (formData.shippingCountry && formData.shippingState) {
      const shippingCities = City.getCitiesOfState(
        formData.shippingCountry,
        formData.shippingState
      ).map((city) => ({
        value: city.name,
        label: city.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        shippingCities,
      }));
    }
  }, [formData.shippingCountry, formData.shippingState]);

  // Copy billing address to shipping when checkbox is checked
  useEffect(() => {
    if (sameAsBilling) {
      setFormData((prev) => ({
        ...prev,
        shippingStreet: prev.billingStreet,
        shippingCity: prev.billingCity,
        shippingState: prev.billingState,
        shippingCountry: prev.billingCountry,
        shippingZipCode: prev.billingZipCode,
      }));
    }
  }, [
    sameAsBilling,
    formData.billingStreet,
    formData.billingCity,
    formData.billingState,
    formData.billingCountry,
    formData.billingZipCode,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate GST and PAN in real-time
    if (name === "gstin") {
      const gstError = validateGST(value);
      setErrors((prev) => ({
        ...prev,
        gstin: gstError,
      }));
    }

    if (name === "panNumber") {
      const panError = validatePAN(value);
      setErrors((prev) => ({
        ...prev,
        panNumber: panError,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle phone change with react-phone-input-2
  const handlePhoneChange = (value, country, e, formattedValue) => {
    const countryCode = country.countryCode;
    const countryDialCode = country.dialCode;

    const completeNumber = `+${countryDialCode}${value.slice(countryDialCode.length)}`;
    const displayNumber = value;

    setPhoneDisplay(displayNumber);
    setPhoneData({
      country: countryCode,
      completeNumber: completeNumber,
    });

    setFormData((prev) => ({
      ...prev,
      phone: completeNumber,
    }));

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

  // Handle mobile change with react-phone-input-2
  const handleMobileChange = (value, country, e, formattedValue) => {
    const countryCode = country.countryCode;
    const countryDialCode = country.dialCode;

    const completeNumber = `+${countryDialCode}${value.slice(countryDialCode.length)}`;
    const displayNumber = value;

    setMobileDisplay(displayNumber);
    setMobileData({
      country: countryCode,
      completeNumber: completeNumber,
    });

    setFormData((prev) => ({
      ...prev,
      mobile: completeNumber,
    }));

    if (errors.mobile) {
      setErrors((prev) => ({
        ...prev,
        mobile: "",
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

  const handleBillingCountryChange = (selectedOption) => {
    const countryCode = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      billingCountry: countryCode,
      billingState: "",
      billingCity: "",
      billingZipCode: "",
    }));

    if (countryCode) {
      const billingStates = State.getStatesOfCountry(countryCode).map(
        (state) => ({
          value: state.isoCode,
          label: state.name,
        })
      );

      setDropdownData((prev) => ({
        ...prev,
        billingStates,
        billingCities: [],
      }));
    } else {
      setDropdownData((prev) => ({
        ...prev,
        billingStates: [],
        billingCities: [],
      }));
    }
  };

  const handleBillingStateChange = (selectedOption) => {
    const stateCode = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      billingState: stateCode,
      billingCity: "",
      billingZipCode: "",
    }));

    if (stateCode && formData.billingCountry) {
      const billingCities = City.getCitiesOfState(
        formData.billingCountry,
        stateCode
      ).map((city) => ({
        value: city.name,
        label: city.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        billingCities,
      }));
    } else {
      setDropdownData((prev) => ({
        ...prev,
        billingCities: [],
      }));
    }
  };

  const handleBillingCityChange = (selectedOption) => {
    const cityName = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      billingCity: cityName,
    }));
  };

  const handleShippingCountryChange = (selectedOption) => {
    const countryCode = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      shippingCountry: countryCode,
      shippingState: "",
      shippingCity: "",
      shippingZipCode: "",
    }));

    if (countryCode) {
      const shippingStates = State.getStatesOfCountry(countryCode).map(
        (state) => ({
          value: state.isoCode,
          label: state.name,
        })
      );

      setDropdownData((prev) => ({
        ...prev,
        shippingStates,
        shippingCities: [],
      }));
    } else {
      setDropdownData((prev) => ({
        ...prev,
        shippingStates: [],
        shippingCities: [],
      }));
    }
  };

  const handleShippingStateChange = (selectedOption) => {
    const stateCode = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      shippingState: stateCode,
      shippingCity: "",
      shippingZipCode: "",
    }));

    if (stateCode && formData.shippingCountry) {
      const shippingCities = City.getCitiesOfState(
        formData.shippingCountry,
        stateCode
      ).map((city) => ({
        value: city.name,
        label: city.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        shippingCities,
      }));
    } else {
      setDropdownData((prev) => ({
        ...prev,
        shippingCities: [],
      }));
    }
  };

  const handleShippingCityChange = (selectedOption) => {
    const cityName = selectedOption ? selectedOption.value : "";

    setFormData((prev) => ({
      ...prev,
      shippingCity: cityName,
    }));
  };

  // Update validateForm function:
  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName?.trim())
      newErrors.companyName = "Company name is required";

    // Add email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.website && !/^(https?:\/\/)?.+\..+/.test(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }

    // Validate GST only if user has entered something
    if (formData.gstin && formData.gstin.trim()) {
      const gstError = validateGST(formData.gstin);
      if (gstError) {
        newErrors.gstin = gstError;
      }
    }

    // Validate PAN only if user has entered something
    if (formData.panNumber && formData.panNumber.trim()) {
      const panError = validatePAN(formData.panNumber);
      if (panError) {
        newErrors.panNumber = panError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        companyName: formData.companyName,
        email: formData.email || null,
        phone: formData.phone || null,
        mobile: formData.mobile || null,
        website: formData.website || null,
        industry: formData.industry,
        revenue: formData.revenue ? parseFloat(formData.revenue) : 0,
        gstin: formData.gstin || null,
        panNumber: formData.panNumber || null,
        billingStreet: formData.billingStreet || null,
        billingCity: formData.billingCity || null,
        billingState: formData.billingState
          ? dropdownData.billingStates.find(
            (s) => s.value === formData.billingState
          )?.label
          : null,
        billingCountry: formData.billingCountry
          ? dropdownData.countries.find(
            (c) => c.value === formData.billingCountry
          )?.label
          : null,
        billingZipCode: formData.billingZipCode || null,
        shippingStreet: formData.shippingStreet || null,
        shippingCity: formData.shippingCity || null,
        shippingState: formData.shippingState
          ? dropdownData.shippingStates.find(
            (s) => s.value === formData.shippingState
          )?.label
          : null,
        shippingCountry: formData.shippingCountry
          ? dropdownData.countries.find(
            (c) => c.value === formData.shippingCountry
          )?.label
          : null,
        shippingZipCode: formData.shippingZipCode || null,
        description: formData.description || null,
      };

      await axiosInstance.post("createCustomer", submitData);

      toast.success("Customer created successfully!");
      if (onSuccess) {
        onSuccess();
      } else {
        navigateCustList();
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error.response?.data?.message) {
        toast.error(
          `Failed to create customer: ${error.response.data.message}`
        );
      } else if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        toast.error("Cannot connect to server. Please check if the backend is running.");
      } else {
        toast.error("Failed to create customer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigateCustList();
    }
  };

  const navigateCustList = () => {
    if (role === "ROLE_ADMIN") {
      navigate("/Admin/CustomerList");
    } else if (role === "ROLE_EMPLOYEE") {
      navigate("/Employee/CustomerList");
    }
  };

  const industryOptions = [
    { value: "Software Development", label: "Software Development" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Finance", label: "Finance" },
    { value: "Education", label: "Education" },
    { value: "Retail", label: "Retail" },
    { value: "Real Estate", label: "Real Estate" },
    { value: "Other", label: "Other" },
  ];

  // Tab navigation component
  const TabNavigation = () => (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        <button
          type="button"
          onClick={() => setActiveTab("basic")}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === "basic"
            ? "border-blue-500 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Basic Information
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("address")}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === "address"
            ? "border-blue-500 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Address Information
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("additional")}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === "additional"
            ? "border-blue-500 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Additional Details
          </div>
        </button>
      </nav>
    </div>
  );

  // Render basic information tab
  const renderBasicInfoTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.companyName ? "border-red-500" : "border-gray-300"
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


        {/* Industry */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Industry
          </label>
          <Select
            name="industry"
            value={industryOptions.find(
              (option) => option.value === formData.industry
            )}
            onChange={(selectedOption) =>
              handleSelectChange(selectedOption, { name: "industry" })
            }
            menuPosition="fixed"

            options={industryOptions}
            menuPlacement="auto"
            maxMenuHeight={150}
            placeholder="Select industry"
            isSearchable
            styles={customReactSelectStyles(!!errors.industry)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.email ? "border-red-500" : "border-gray-300"
              }`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-500 text-xs flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>
        {/* Revenue */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Annual Revenue
          </label>
          <input
            type="number"
            step="0.01"
            name="revenue"
            value={formData.revenue}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Enter annual revenue"
          />
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.website ? "border-red-500" : "border-gray-300"
              }`}
            placeholder="Enter website URL"
          />
          {errors.website && (
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
              {errors.website}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Primary Number
          </label>
          <div className={`phone-input-wrapper ${errors.phone ? "border-red-500 rounded-lg" : ""}`}>
            <PhoneInput
              country={"in"}
              value={mobileDisplay}
              onChange={handleMobileChange}
              enableSearch={true}
              placeholder="Enter phone number"
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
          {errors.phone && (
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
              {errors.phone}
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Secondary Number
          </label>
          <div className={`phone-input-wrapper ${errors.mobile ? "border-red-500 rounded-lg" : ""}`}>
            <PhoneInput
              country={"in"}
              value={phoneDisplay}
              onChange={handlePhoneChange}
              enableSearch={true}
              placeholder="Enter mobile number"
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
          {errors.mobile && (
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
              {errors.mobile}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Render address information tab
  const renderAddressInfoTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Address */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Billing Address</h4>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Street Address</label>
            <input
              type="text"
              name="billingStreet"
              value={formData.billingStreet}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter street address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Country</label>
            <Select
              name="billingCountry"
              value={dropdownData.countries.find(
                (option) => option.value === formData.billingCountry
              )}
              onChange={handleBillingCountryChange}
              options={dropdownData.countries}
              placeholder="Select country"
              isSearchable
              styles={customReactSelectStyles(false)}
              menuPlacement="top"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">State</label>
              <Select
                key={`billing-state-${formData.billingCountry}`}
                name="billingState"
                value={dropdownData.billingStates.find(
                  (option) => option.value === formData.billingState
                )}
                onChange={handleBillingStateChange}
                options={dropdownData.billingStates}
                placeholder="Select state"
                isSearchable
                isDisabled={!formData.billingCountry}
                styles={customReactSelectStyles(false)}
                menuPlacement="top"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">City</label>
              <Select
                key={`billing-city-${formData.billingState}`}
                name="billingCity"
                value={dropdownData.billingCities.find(
                  (option) => option.value === formData.billingCity
                )}
                onChange={handleBillingCityChange}
                options={dropdownData.billingCities}
                placeholder="Select city"
                isSearchable
                isDisabled={!formData.billingState}
                styles={customReactSelectStyles(false)}
                menuPlacement="top"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">ZIP Code</label>
            <input
              type="text"
              name="billingZipCode"
              value={formData.billingZipCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter ZIP code"
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Shipping Address</h4>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sameAsBilling"
                checked={sameAsBilling}
                onChange={(e) => setSameAsBilling(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="sameAsBilling" className="text-sm text-gray-700">
                Same as billing
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Street Address</label>
            <input
              type="text"
              name="shippingStreet"
              value={formData.shippingStreet}
              onChange={handleChange}
              disabled={sameAsBilling}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter street address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Country</label>
            <Select
              name="shippingCountry"
              value={dropdownData.countries.find(
                (option) => option.value === formData.shippingCountry
              )}
              onChange={handleShippingCountryChange}
              options={dropdownData.countries}
              placeholder="Select country"
              isSearchable
              isDisabled={sameAsBilling}
              styles={customReactSelectStyles(false)}
              menuPlacement="top"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">State</label>
              <Select
                key={`shipping-state-${formData.shippingCountry}`}
                name="shippingState"
                value={dropdownData.shippingStates.find(
                  (option) => option.value === formData.shippingState
                )}
                onChange={handleShippingStateChange}
                options={dropdownData.shippingStates}
                placeholder="Select state"
                isSearchable
                isDisabled={!formData.shippingCountry || sameAsBilling}
                styles={customReactSelectStyles(false)}
                menuPlacement="top"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">City</label>
              <Select
                key={`shipping-city-${formData.shippingState}`}
                name="shippingCity"
                value={dropdownData.shippingCities.find(
                  (option) => option.value === formData.shippingCity
                )}
                onChange={handleShippingCityChange}
                options={dropdownData.shippingCities}
                placeholder="Select city"
                isSearchable
                isDisabled={!formData.shippingState || sameAsBilling}
                styles={customReactSelectStyles(false)}
                menuPlacement="top"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">ZIP Code</label>
            <input
              type="text"
              name="shippingZipCode"
              value={formData.shippingZipCode}
              onChange={handleChange}
              disabled={sameAsBilling}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter ZIP code"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render additional details tab
  const renderAdditionalDetailsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GSTIN */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            GSTIN
          </label>
          <input
            type="text"
            name="gstin"
            value={formData.gstin}
            onChange={handleChange}
            maxLength={15}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase ${errors.gstin ? "border-red-500" : "border-gray-300"
              }`}
            placeholder="Enter GSTIN (optional)"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.gstin && (
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
              {errors.gstin}
            </p>
          )}
          {!errors.gstin && formData.gstin && (
            <p className="text-green-500 text-xs flex items-center gap-1">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Valid GSTIN format
            </p>
          )}
        </div>

        {/* PAN Number */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            PAN Number
          </label>
          <input
            type="text"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
            maxLength={10}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 uppercase ${errors.panNumber ? "border-red-500" : "border-gray-300"
              }`}
            placeholder="Enter PAN number (optional)"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.panNumber && (
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
              {errors.panNumber}
            </p>
          )}
          {!errors.panNumber && formData.panNumber && (
            <p className="text-green-500 text-xs flex items-center gap-1">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Valid PAN format
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
          placeholder="Enter customer description"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Customer</h2>
                <p className="text-green-100 text-sm">
                  Fill in the customer information below
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

        {/* Tab Navigation */}
        <TabNavigation />

        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[calc(80vh-180px)]">
          <form onSubmit={handleSubmit} className="p-6">
            {activeTab === "basic" && renderBasicInfoTab()}
            {activeTab === "address" && renderAddressInfoTab()}
            {activeTab === "additional" && renderAdditionalDetailsTab()}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (activeTab === "address") setActiveTab("basic");
                  else if (activeTab === "additional") setActiveTab("address");
                }}
                disabled={activeTab === "basic"}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 font-medium flex items-center gap-2 hover:shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

              <button
                type="button"
                onClick={() => {
                  if (activeTab === "basic") setActiveTab("address");
                  else if (activeTab === "address") setActiveTab("additional");
                }}
                disabled={activeTab === "additional"}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 font-medium flex items-center gap-2 hover:shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>

            <div className="flex items-center gap-3">
              {/* <button
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
              </button> */}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 text-sm"
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
                    Create Customer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>



      <style jsx>{`
      
      .react-tel-input .country-list {
  position: fixed !important;
  z-index: 9999 !important;
  max-height: 200px;
  overflow-y: auto;
 }
      `}</style>
    </div>



  );
}

export default CreateCustomerModal;