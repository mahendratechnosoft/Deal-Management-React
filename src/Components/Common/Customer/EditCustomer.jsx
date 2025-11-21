import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import { FormInput, FormPhoneInputFloating, FormSelect, FormTextarea } from "../../BaseComponet/CustomeFormComponents";



function EditCustomer() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { LayoutComponent, role } = useLayout();

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
    employeeId: "",
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

  // Add this useEffect to handle initial data setup after customer fetch
  useEffect(() => {
    if (!fetchLoading && formData.billingCountry) {
      // Map country names to ISO codes
      const countries = Country.getAllCountries();

      // Find ISO code for billing country
      const billingCountryObj = countries.find(
        (country) => country.name === formData.billingCountry
      );

      if (billingCountryObj) {
        // Set the billing country ISO code for dropdown
        setFormData((prev) => ({
          ...prev,
          billingCountry: billingCountryObj.isoCode,
        }));

        // Load states for the billing country
        const billingStates = State.getStatesOfCountry(
          billingCountryObj.isoCode
        ).map((state) => ({
          value: state.isoCode,
          label: state.name,
        }));

        // Find ISO code for billing state
        const billingStateObj = billingStates.find(
          (state) => state.label === formData.billingState
        );

        if (billingStateObj) {
          setFormData((prev) => ({
            ...prev,
            billingState: billingStateObj.value,
          }));

          // Load cities for the billing state
          const billingCities = City.getCitiesOfState(
            billingCountryObj.isoCode,
            billingStateObj.value
          ).map((city) => ({
            value: city.name,
            label: city.name,
          }));

          setDropdownData((prev) => ({
            ...prev,
            billingStates,
            billingCities,
          }));
        } else {
          setDropdownData((prev) => ({
            ...prev,
            billingStates,
            billingCities: [],
          }));
        }
      }

      // Handle shipping address similarly if not same as billing
      if (!sameAsBilling && formData.shippingCountry) {
        const shippingCountryObj = countries.find(
          (country) => country.name === formData.shippingCountry
        );

        if (shippingCountryObj) {
          setFormData((prev) => ({
            ...prev,
            shippingCountry: shippingCountryObj.isoCode,
          }));

          const shippingStates = State.getStatesOfCountry(
            shippingCountryObj.isoCode
          ).map((state) => ({
            value: state.isoCode,
            label: state.name,
          }));

          const shippingStateObj = shippingStates.find(
            (state) => state.label === formData.shippingState
          );

          if (shippingStateObj) {
            setFormData((prev) => ({
              ...prev,
              shippingState: shippingStateObj.value,
            }));

            const shippingCities = City.getCitiesOfState(
              shippingCountryObj.isoCode,
              shippingStateObj.value
            ).map((city) => ({
              value: city.name,
              label: city.name,
            }));

            setDropdownData((prev) => ({
              ...prev,
              shippingStates,
              shippingCities,
            }));
          } else {
            setDropdownData((prev) => ({
              ...prev,
              shippingStates,
              shippingCities: [],
            }));
          }
        }
      }
    }
  }, [
    fetchLoading,
    formData.billingCountry,
    formData.billingState,
    formData.shippingCountry,
    formData.shippingState,
    sameAsBilling,
  ]);

  // Fetch customer data

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setFetchLoading(true);
        const response = await axiosInstance.get(
          `getCustomerById/${customerId}`
        );
        const customer = response.data;

        // Set form data with customer information (keep country/state as names initially)
        setFormData({
          companyName: customer.companyName || "",
          phone: customer.phone || "",
          email: customer.email || "",
          mobile: customer.mobile || "",
          website: customer.website || "",
          industry: customer.industry || "",
          revenue: customer.revenue || "",
          gstin: customer.gstin || "",
          panNumber: customer.panNumber || "",
          billingStreet: customer.billingStreet || "",
          billingCity: customer.billingCity || "",
          billingState: customer.billingState || "", // Keep as name initially
          billingCountry: customer.billingCountry || "", // Keep as name initially
          billingZipCode: customer.billingZipCode || "",
          shippingStreet: customer.shippingStreet || "",
          shippingCity: customer.shippingCity || "",
          shippingState: customer.shippingState || "", // Keep as name initially
          shippingCountry: customer.shippingCountry || "", // Keep as name initially
          shippingZipCode: customer.shippingZipCode || "",
          description: customer.description || "",
          employeeId: customer.employeeId || "",
        });

        // Check if shipping address is same as billing
        const isSameAddress =
          customer.shippingStreet === customer.billingStreet &&
          customer.shippingCity === customer.billingCity &&
          customer.shippingState === customer.billingState &&
          customer.shippingCountry === customer.billingCountry &&
          customer.shippingZipCode === customer.billingZipCode;

        setSameAsBilling(isSameAddress);
      } catch (error) {
        console.error("Error fetching customer:", error);
        toast.error("Failed to load customer data");
        if (role === "ROLE_ADMIN") {
          navigate("/Admin/CustomerList");
        } else if (role === "ROLE_EMPLOYEE") {
          navigate("/Employee/CustomerList");
        }
      } finally {
        setFetchLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId, navigate, role]);
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

    // Validate email in real-time
    if (name === "email") {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          email: "",
        }));
      }
    }

    if (errors[name] && name !== "email") {
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

  // Add this function to your EditCustomer component, right after the handleChange function
  const handlePhoneChange = (fieldName, phone) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: phone
    }));
  };
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        customerId: customerId,
        companyName: formData.companyName,
        phone: formData.phone || null,
        email: formData.email || null,
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
          )?.label || formData.billingState // Fallback to stored name
          : null,
        billingCountry: formData.billingCountry
          ? dropdownData.countries.find(
            (c) => c.value === formData.billingCountry
          )?.label || formData.billingCountry // Fallback to stored name
          : null,
        billingZipCode: formData.billingZipCode || null,
        shippingStreet: formData.shippingStreet || null,
        shippingCity: formData.shippingCity || null,
        shippingState: formData.shippingState
          ? dropdownData.shippingStates.find(
            (s) => s.value === formData.shippingState
          )?.label || formData.shippingState // Fallback to stored name
          : null,
        shippingCountry: formData.shippingCountry
          ? dropdownData.countries.find(
            (c) => c.value === formData.shippingCountry
          )?.label || formData.shippingCountry // Fallback to stored name
          : null,
        shippingZipCode: formData.shippingZipCode || null,
        description: formData.description || null,
        employeeId: formData.employeeId || null,
      };

      await axiosInstance.put("updateCustomer", submitData);
      toast.success("Customer updated successfully!");

      if (role === "ROLE_ADMIN") {
        navigate("/Admin/CustomerList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/CustomerList");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error.response?.data?.message) {
        toast.error(`Failed to update customer: ${error.response.data.message}`);
      } else {
        toast.error("Failed to update customer. Please try again.");
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
        navigate("/Admin/CustomerList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/CustomerList");
      }
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "36px",
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

  if (fetchLoading) {
    return (
      <LayoutComponent>
        <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="skeleton h-4 w-24 rounded"></div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="space-y-2">
                <div className="skeleton h-6 w-48 rounded"></div>
                <div className="skeleton h-4 w-64 rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="skeleton h-9 w-20 rounded"></div>
                <div className="skeleton h-9 w-32 rounded"></div>
              </div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 space-y-6">
                  {/* Company Information Section Skeleton */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="skeleton w-8 h-8 rounded-lg"></div>
                      <div className="skeleton h-6 w-48 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(8)].map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="skeleton h-4 w-24 rounded"></div>
                          <div className="skeleton h-10 w-full rounded"></div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Address Information Section Skeleton */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="skeleton w-8 h-8 rounded-lg"></div>
                      <div className="skeleton h-6 w-40 rounded"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Billing Address Skeleton */}
                      <div className="space-y-4">
                        <div className="skeleton h-6 w-32 rounded mb-2"></div>
                        {[...Array(5)].map((_, index) => (
                          <div key={index} className="space-y-2">
                            <div className="skeleton h-4 w-20 rounded"></div>
                            <div className="skeleton h-10 w-full rounded"></div>
                          </div>
                        ))}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="skeleton h-4 w-12 rounded"></div>
                            <div className="skeleton h-10 w-full rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="skeleton h-4 w-16 rounded"></div>
                            <div className="skeleton h-10 w-full rounded"></div>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address Skeleton */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="skeleton h-6 w-36 rounded"></div>
                          <div className="flex items-center gap-2">
                            <div className="skeleton h-4 w-4 rounded"></div>
                            <div className="skeleton h-4 w-24 rounded"></div>
                          </div>
                        </div>
                        {[...Array(5)].map((_, index) => (
                          <div key={index} className="space-y-2">
                            <div className="skeleton h-4 w-20 rounded"></div>
                            <div className="skeleton h-10 w-full rounded"></div>
                          </div>
                        ))}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="skeleton h-4 w-12 rounded"></div>
                            <div className="skeleton h-10 w-full rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="skeleton h-4 w-16 rounded"></div>
                            <div className="skeleton h-10 w-full rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Description Section Skeleton */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="skeleton w-8 h-8 rounded-lg"></div>
                      <div className="skeleton h-6 w-32 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="skeleton h-4 w-24 rounded"></div>
                      <div className="skeleton h-24 w-full rounded"></div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>

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
      </LayoutComponent>
    );
  }



  return (
    <LayoutComponent>
      <div className=" bg-white h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Compact Header */}
        <div className="bg-white border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(role === "ROLE_ADMIN" ? "/Admin/CustomerList" : "/Employee/CustomerList")}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Edit Customer</h1>
                <p className="text-xs text-gray-600">Update customer information</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Ultra Compact Form */}
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Company Information</h3>

                {/* Left Column - Company Info */}
                <div className="space-y-4">
                  {/* Company Name */}
                  <FormInput
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required={true}
                    error={errors.companyName}
                    className="mb-4"
                    background="white"
                  />

                  {/* Industry & Revenue */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <FormSelect
                      label="Industry"
                      name="industry"
                      background="white"
                      className="setbg-white"
                      value={[
                        { value: "Software Development", label: "Software" },
                        { value: "Manufacturing", label: "Manufacturing" },
                        { value: "Healthcare", label: "Healthcare" },
                        { value: "Finance", label: "Finance" }
                      ].find(opt => opt.value === formData.industry)}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "industry" })}
                      options={[
                        { value: "Software Development", label: "Software" },
                        { value: "Manufacturing", label: "Manufacturing" },
                        { value: "Healthcare", label: "Healthcare" },
                        { value: "Finance", label: "Finance" }
                      ]}
                      error={errors.industry}
                    />

                    <FormInput
                      label="Revenue (₹)"
                      name="revenue"
                      value={formData.revenue}
                      onChange={handleChange}
                      type="number"
                      background="white"
                      error={errors.revenue}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Website */}
                    <FormInput
                      label="Website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      error={errors.website}
                      background="white"
                      className=""
                    />
                    {/* Email */}
                    <FormInput
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      error={errors.email}
                      background="white"
                      className=""
                    /></div>

                  {/* GSTIN & PAN */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <FormInput
                      label="GSTIN"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      error={errors.gstin}
                      background="white"
                    />

                    <FormInput
                      label="PAN Number"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      error={errors.panNumber}
                      background="white"
                    />
                  </div>

                  {/* Phone Numbers */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <FormPhoneInputFloating
                      label="Primary Number"
                      name="phone"
                      value={formData.phone}
                      onChange={(phone) => handlePhoneChange('phone', phone)}
                      required={true}
                      error={errors.phone}
                      background="white"
                    />

                    <FormPhoneInputFloating
                      label="Secondary Number"
                      name="mobile"
                      value={formData.mobile}
                      onChange={(phone) => handlePhoneChange('mobile', phone)}
                      error={errors.mobile}
                      background="white"
                    />
                  </div>

                  {/* Description */}
                  <FormTextarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="mb-4"
                    background="white"
                  />
                </div>
              </div>

              {/* Right Column - Address Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Address Information</h3>

                  <div className="space-y-4">
                    {/* Billing Address */}
                    {/* Billing Address */}
                    <div className="space-y-3 mb-4">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Billing Address</h4>

                      <div className="space-y-3">
                        <FormInput
                          label="Street Address"
                          name="billingStreet"
                          value={formData.billingStreet}
                          onChange={handleChange}
                          background="white"
                          className="mb-4"
                        />

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <FormSelect
                            label="Country"
                            name="billingCountry"
                            className="setbg-white"
                            value={dropdownData.countries.find(opt => opt.value === formData.billingCountry)}
                            onChange={handleBillingCountryChange}
                            options={dropdownData.countries}
                            isSearchable
                            error={errors.billingCountry}
                            background="white"
                          />

                          <FormSelect
                            label="State"
                            name="billingState"
                            className="setbg-white"
                            value={dropdownData.billingStates.find(opt => opt.value === formData.billingState)}
                            onChange={handleBillingStateChange}
                            options={dropdownData.billingStates}
                            isSearchable
                            isDisabled={!formData.billingCountry}
                            error={errors.billingState}
                            background="white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <FormSelect
                            label="City"
                            name="billingCity"
                            className="setbg-white"
                            value={dropdownData.billingCities.find(opt => opt.value === formData.billingCity)}
                            onChange={handleBillingCityChange}
                            options={dropdownData.billingCities}
                            isSearchable
                            isDisabled={!formData.billingState}
                            error={errors.billingCity}
                            background="white"
                          />

                          <FormInput
                            label="ZIP Code"
                            name="billingZipCode"
                            value={formData.billingZipCode}
                            onChange={handleChange}
                            error={errors.billingZipCode}
                            background="white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {/* Shipping Address */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Shipping Address</h4>
                        <div className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            id="sameAsBilling"
                            checked={sameAsBilling}
                            onChange={(e) => setSameAsBilling(e.target.checked)}
                            className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="sameAsBilling" className="text-xs text-gray-700">
                            Same as billing
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Street Address */}
                        <FormInput
                          label="Street Address"
                          name="shippingStreet"
                          value={formData.shippingStreet}
                          onChange={handleChange}
                          disabled={sameAsBilling}
                          error={errors.shippingStreet}
                          background="white"
                          className="mb-4"
                        />

                        {/* Country & State */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <FormSelect
                            label="Country"
                            name="shippingCountry"
                            className="setbg-white"
                            value={dropdownData.countries.find(opt => opt.value === formData.shippingCountry)}
                            onChange={handleShippingCountryChange}
                            options={dropdownData.countries}
                            isSearchable
                            isDisabled={sameAsBilling}
                            error={errors.shippingCountry}
                            background="white"
                          />

                          <FormSelect
                            label="State"
                            name="shippingState"
                            className="setbg-white"
                            value={dropdownData.shippingStates.find(opt => opt.value === formData.shippingState)}
                            onChange={handleShippingStateChange}
                            options={dropdownData.shippingStates}
                            isSearchable
                            isDisabled={!formData.shippingCountry || sameAsBilling}
                            error={errors.shippingState}
                            background="white"
                          />
                        </div>

                        {/* City & ZIP Code */}
                        <div className="grid grid-cols-2 gap-2">
                          <FormSelect
                            label="City"
                            name="shippingCity"
                            className="setbg-white"
                            value={dropdownData.shippingCities.find(opt => opt.value === formData.shippingCity)}
                            onChange={handleShippingCityChange}
                            options={dropdownData.shippingCities}
                            isSearchable
                            isDisabled={!formData.shippingState || sameAsBilling}
                            error={errors.shippingCity}
                            background="white"
                          />

                          <FormInput
                            label="ZIP Code"
                            name="shippingZipCode"
                            value={formData.shippingZipCode}
                            onChange={handleChange}
                            disabled={sameAsBilling}
                            error={errors.shippingZipCode}
                            background="white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </LayoutComponent>
  );
}

export default EditCustomer;
