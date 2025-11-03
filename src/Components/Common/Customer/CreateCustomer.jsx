import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";

function CreateCustomer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { LayoutComponent, role } = useLayout();

  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    mobile: "",
    website: "",
    industry: "",
    revenue: "",
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName?.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.industry?.trim()) newErrors.industry = "Industry is required";

    if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (formData.mobile && !/^[0-9+\-\s()]{10,}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid mobile number";
    }

    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
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
        phone: formData.phone || null,
        mobile: formData.mobile || null,
        website: formData.website || null,
        industry: formData.industry,
        revenue: formData.revenue ? parseFloat(formData.revenue) : 0,
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
      navigate("/Admin/CustomerList");
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error.response?.data?.message) {
        toast.error(
          `Failed to create customer: ${error.response.data.message}`
        );
      } else {
        toast.error("Failed to create customer. Please try again.");
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
      navigate("/Admin/CustomerList");
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      borderColor: "#d1d5db",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
  };

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => navigate("/Admin/CustomerList")}
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
              Back to Customers
            </button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Create New Customer
              </h1>
              <p className="text-gray-600 text-sm">
                Add a new customer to your CRM
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
                form="createCustomerForm"
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
                    Create Customer
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
                id="createCustomerForm"
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Company Information
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Basic customer details
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div className="relative">
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          className={`w-full px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer appearance-none bg-white ${
                            errors.industry
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Industry</option>
                          <option value="Software Development">
                            Software Development
                          </option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                          <option value="Retail">Retail</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Other">Other</option>
                        </select>
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                          Industry *
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
                        {errors.industry && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.industry}
                          </p>
                        )}
                      </div>

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
                          Annual Revenue (₹)
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className={`w-full px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${
                            errors.website
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Website
                        </label>
                        {errors.website && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.website}
                          </p>
                        )}
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
                          Customer contact details
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Phone Number
                        </label>
                        {errors.phone && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          className={`w-full px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer ${
                            errors.mobile ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Mobile Number
                        </label>
                        {errors.mobile && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.mobile}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Billing Address Section */}
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
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Billing Address
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Primary business address
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 relative">
                        <input
                          type="text"
                          name="billingStreet"
                          value={formData.billingStreet}
                          onChange={handleChange}
                          className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Street Address
                        </label>
                      </div>

                      <div className="relative">
                        <Select
                          name="billingCountry"
                          value={dropdownData.countries.find(
                            (option) => option.value === formData.billingCountry
                          )}
                          onChange={handleBillingCountryChange}
                          options={dropdownData.countries}
                          placeholder=" "
                          isSearchable
                          styles={customStyles}
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                          Country
                        </label>
                      </div>

                      <div className="relative">
                        <Select
                          key={`billing-state-${formData.billingCountry}`}
                          name="billingState"
                          value={dropdownData.billingStates.find(
                            (option) => option.value === formData.billingState
                          )}
                          onChange={handleBillingStateChange}
                          options={dropdownData.billingStates}
                          placeholder=" "
                          isSearchable
                          isDisabled={!formData.billingCountry}
                          styles={customStyles}
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                          State
                        </label>
                      </div>

                      <div className="relative">
                        <Select
                          key={`billing-city-${formData.billingState}`}
                          name="billingCity"
                          value={dropdownData.billingCities.find(
                            (option) => option.value === formData.billingCity
                          )}
                          onChange={handleBillingCityChange}
                          options={dropdownData.billingCities}
                          placeholder=" "
                          isSearchable
                          isDisabled={!formData.billingState}
                          styles={customStyles}
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                          City
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="billingZipCode"
                          value={formData.billingZipCode}
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

                  {/* Shipping Address Section */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
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
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            Shipping Address
                          </h2>
                          <p className="text-gray-600 text-sm">
                            Delivery and shipping address
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sameAsBilling"
                          checked={sameAsBilling}
                          onChange={(e) => setSameAsBilling(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor="sameAsBilling"
                          className="text-sm text-gray-700"
                        >
                          Same as billing address
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 relative">
                        <input
                          type="text"
                          name="shippingStreet"
                          value={formData.shippingStreet}
                          onChange={handleChange}
                          disabled={sameAsBilling}
                          className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          Street Address
                        </label>
                      </div>

                      <div className="relative">
                        <Select
                          name="shippingCountry"
                          value={dropdownData.countries.find(
                            (option) =>
                              option.value === formData.shippingCountry
                          )}
                          onChange={handleShippingCountryChange}
                          options={dropdownData.countries}
                          placeholder=" "
                          isSearchable
                          isDisabled={sameAsBilling}
                          styles={customStyles}
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                          Country
                        </label>
                      </div>

                      <div className="relative">
                        <Select
                          key={`shipping-state-${formData.shippingCountry}`}
                          name="shippingState"
                          value={dropdownData.shippingStates.find(
                            (option) => option.value === formData.shippingState
                          )}
                          onChange={handleShippingStateChange}
                          options={dropdownData.shippingStates}
                          placeholder=" "
                          isSearchable
                          isDisabled={
                            !formData.shippingCountry || sameAsBilling
                          }
                          styles={customStyles}
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                          State
                        </label>
                      </div>

                      <div className="relative">
                        <Select
                          key={`shipping-city-${formData.shippingState}`}
                          name="shippingCity"
                          value={dropdownData.shippingCities.find(
                            (option) => option.value === formData.shippingCity
                          )}
                          onChange={handleShippingCityChange}
                          options={dropdownData.shippingCities}
                          placeholder=" "
                          isSearchable
                          isDisabled={!formData.shippingState || sameAsBilling}
                          styles={customStyles}
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 z-10 pointer-events-none">
                          City
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          name="shippingZipCode"
                          value={formData.shippingZipCode}
                          onChange={handleChange}
                          disabled={sameAsBilling}
                          className="w-full px-3 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm peer disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder=" "
                        />
                        <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 pointer-events-none">
                          ZIP Code
                        </label>
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
                        placeholder="Enter additional notes or description about the customer"
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

export default CreateCustomer;
