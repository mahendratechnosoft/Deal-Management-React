import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import {
  FormInput,
  FormPhoneInputFloating,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";

import { hasPermission } from "../../BaseComponet/permissions";
import { showConfirmDialog } from "../../BaseComponet/alertUtils";

function EditCustomer() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { LayoutComponent, role } = useLayout();
  const canEdit = hasPermission("customer", "Edit");
  const [originalCompanyName, setOriginalCompanyName] = useState("");

  // Add with other state declarations
  const [canCustomerLogin, setCanCustomerLogin] = useState(false);
  const [enableCustomerLogin, setEnableCustomerLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [originalLoginEmail, setOriginalLoginEmail] = useState("");
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

    loginEmail: "",
    loginPassword: "",
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

  useEffect(() => {
    // Get moduleAccess from localStorage or context
    const moduleAccess = localStorage.getItem("moduleAccess");
    if (moduleAccess) {
      try {
        const parsed = JSON.parse(moduleAccess);
        setCanCustomerLogin(parsed.canCustomerLogin === true);
      } catch (error) {
        console.error("Error parsing moduleAccess:", error);
      }
    }
  }, []);

  // Add this useEffect to clear password when toggle is turned off
  useEffect(() => {
    if (!enableCustomerLogin) {
      setFormData((prev) => ({
        ...prev,
        loginPassword: "",
      }));
      setErrors((prev) => ({
        ...prev,
        loginEmail: "",
        loginPassword: "",
      }));
    }
  }, [enableCustomerLogin]);

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
        setOriginalCompanyName(customer.companyName || "");
        setOriginalLoginEmail(customer.loginEmail || "");
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

          loginEmail: customer.loginEmail || "",
          loginPassword: "",
          userId: customer.userId || "",
        });

        // Check if shipping address is same as billing
        const isSameAddress =
          customer.shippingStreet === customer.billingStreet &&
          customer.shippingCity === customer.billingCity &&
          customer.shippingState === customer.billingState &&
          customer.shippingCountry === customer.billingCountry &&
          customer.shippingZipCode === customer.billingZipCode;

        setSameAsBilling(isSameAddress);

        if (customer.userId) {
          setEnableCustomerLogin(true);
        }
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

  // Add this useEffect to handle initial toggle state based on fetched data
  useEffect(() => {
    // If customer has userId and canCustomerLogin is true, enable the toggle
    if (formData.loginEmail && canCustomerLogin) {
      setEnableCustomerLogin(true);
    }
  }, [formData.loginEmail, canCustomerLogin]);

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

  const handleChange = async (e) => {
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

    // Check email availability when loginEmail changes
    if (name === "loginEmail" && value.trim()) {
      // Clear previous error first
      setErrors((prev) => ({ ...prev, loginEmail: "" }));

      // Validate email format
      if (!/\S+@\S+\.\S+/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          loginEmail: "Email address is invalid",
        }));
      } else {
        // Check availability after a short delay
        const timer = setTimeout(() => {
          checkEmailAvailability(value);
        }, 500); // 500ms debounce delay

        // Clear timeout on next change
        return () => clearTimeout(timer);
      }
    }

    if (errors[name] && name !== "email" && name !== "loginEmail") {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "companyName") {
      const customerNameError = await validateCompanyName(value);
      setErrors((prev) => ({
        ...prev,
        companyName: customerNameError,
      }));
    }
  };

  const validateCompanyName = async (name) => {
    if (!name) return "";

    if (
      name.trim().toLowerCase() === originalCompanyName.trim().toLowerCase()
    ) {
      return "";
    }

    try {
      const response = await axiosInstance.get(
        `checkCustomerIsExist/${encodeURIComponent(name.trim())}`
      );
      const data = response.data;
      console.log(response.data, typeof response.data);

      if (data) {
        return "Company name already exists";
      }
      return "";
    } catch (error) {
      console.error("Error checking company name:", error);
      return "Error checking company name";
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
    setFormData((prev) => ({
      ...prev,
      [fieldName]: phone,
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

    // Validate login credentials if canCustomerLogin is true and toggle is enabled
    if (canCustomerLogin && enableCustomerLogin) {
      if (!formData.loginEmail?.trim()) {
        newErrors.loginEmail = "Login email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.loginEmail)) {
        newErrors.loginEmail = "Please enter a valid email address";
      }

      // Only validate password if user has entered something (for change)
      if (formData.loginPassword && formData.loginPassword.length < 6) {
        newErrors.loginPassword = "Password must be at least 6 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      if (errors.loginEmail) {
        toast.error("Please fix the email error before submitting");
        return;
      }
  
    if (!validateForm()) return;

    const companyNameError = await validateCompanyName(formData.companyName);
    if (companyNameError) {
      setErrors((prev) => ({
        ...prev,
        companyName: companyNameError,
      }));
      toast.error(companyNameError);
      return; // Stop execution here
    }

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

        loginEmail: formData.loginEmail || null,
        password: formData.loginPassword || null,
        userId: formData.userId || null,
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
        toast.error(
          `Failed to update customer: ${error.response.data.message}`
        );
      } else {
        toast.error("Failed to update customer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const result = await showConfirmDialog(
      "Are you sure you want to cancel? Any unsaved changes will be lost."
    );

    if (result.isConfirmed) {
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

const checkEmailAvailability = async (email) => {
  if (!/\S+@\S+\.\S+/.test(email)) {
    setErrors((prev) => ({
      ...prev,
      loginEmail: "Email address is invalid",
    }));
    return;
  }

  // If the email hasn't changed from original, don't check availability
  if (email === originalLoginEmail) {
    setErrors((prev) => ({
      ...prev,
      loginEmail: "",
    }));
    return;
  }

  setIsVerifyingEmail(true);
  setErrors((prev) => ({ ...prev, loginEmail: "" }));

  try {
    const response = await axiosInstance.get(`/checkEmail/${email}`);
    // If email exists and it's not the current customer's email
    if (response.data === true) {
      setErrors((prev) => ({
        ...prev,
        loginEmail: "This email is already in use.",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        loginEmail: "",
      }));
    }
  } catch (error) {
    console.error("Error checking email:", error);
    setErrors((prev) => ({
      ...prev,
      loginEmail: "Could not verify email. Please try again.",
    }));
  } finally {
    setIsVerifyingEmail(false);
  }
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
                onClick={() =>
                  navigate(
                    role === "ROLE_ADMIN"
                      ? "/Admin/CustomerList"
                      : "/Employee/CustomerList"
                  )
                }
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded transition-colors"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Edit Customer
                </h1>
                <p className="text-xs text-gray-600">
                  Update customer information
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-sm transition-colors"
              >
                Cancel
              </button>
              {canEdit && (
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
                    "Update"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ultra Compact Form */}
        <div className="p-4">
          <div className={!canEdit ? "pointer-events-none opacity-60" : ""}>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Company Information
                  </h3>

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
                          { value: "Finance", label: "Finance" },
                          { value: "Education", label: "Education" }, // Added
                          { value: "Retail", label: "Retail" }, // Added
                          { value: "Real Estate", label: "Real Estate" }, // Added
                          { value: "Other", label: "Other" }, // Added
                        ].find((opt) => opt.value === formData.industry)}
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, {
                            name: "industry",
                          })
                        }
                        // In EditCustomer.js, replace the options array for the industry FormSelect
                        options={[
                          { value: "Software Development", label: "Software" },
                          { value: "Manufacturing", label: "Manufacturing" },
                          { value: "Healthcare", label: "Healthcare" },
                          { value: "Finance", label: "Finance" },
                          { value: "Education", label: "Education" }, // Added
                          { value: "Retail", label: "Retail" }, // Added
                          { value: "Real Estate", label: "Real Estate" }, // Added
                          { value: "Other", label: "Other" }, // Added
                        ]}
                        error={errors.industry}
                      />

                      <FormInput
                        label="Revenue"
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
                      />
                    </div>

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
                        value={formData.mobile}
                        onChange={(mobile) =>
                          handlePhoneChange("mobile", mobile)
                        }
                        required={true}
                        error={errors.mobile}
                        background="white"
                      />

                      <FormPhoneInputFloating
                        label="Secondary Number"
                        name="phone"
                        value={formData.phone}
                        onChange={(phone) => handlePhoneChange("phone", phone)}
                        error={errors.phone}
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

                    {/* Customer Login Section - Only show if canCustomerLogin is true */}
                    {canCustomerLogin && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        {/* Toggle Button */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Customer Login Credentials
                            </h3>
                          </div>

                          {/* Toggle Switch */}
                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">
                              {enableCustomerLogin ? "Enabled" : "Disabled"}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setEnableCustomerLogin(!enableCustomerLogin)
                              }
                              disabled={
                                !canCustomerLogin ||
                                (formData.loginEmail && !canCustomerLogin)
                              }
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                                enableCustomerLogin
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              } ${
                                !canCustomerLogin ||
                                (formData.loginEmail && !canCustomerLogin)
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  enableCustomerLogin
                                    ? "translate-x-5"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Login Credentials Form - Only show when toggle is enabled */}
                        {enableCustomerLogin && (
                          <div className="grid grid-cols-1 gap-3 bg-blue-50 p-3 rounded">
                            {/* Login Email */}
                            <div className="space-y-1">
                              <label className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                                <span>Login Email</span>
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="email"
                                  name="loginEmail"
                                  value={formData.loginEmail}
                                  onChange={handleChange}
                                  autoComplete="new-email"
                                  className={`w-full px-3 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10 ${
                                    errors.loginEmail
                                      ? "border-red-500"
                                      : formData.loginEmail &&
                                        !errors.loginEmail
                                      ? "border-green-500"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="Enter login email"
                                />
                                {isVerifyingEmail && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                )}
                                {!isVerifyingEmail &&
                                  formData.loginEmail &&
                                  !errors.loginEmail &&
                                  /\S+@\S+\.\S+/.test(formData.loginEmail) && (
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
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
                                    </div>
                                  )}
                              </div>
                              {errors.loginEmail ? (
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
                                  {errors.loginEmail}
                                </p>
                              ) : (
                                formData.loginEmail &&
                                /\S+@\S+\.\S+/.test(formData.loginEmail) && (
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
                                    Email format is valid
                                  </p>
                                )
                              )}
                            </div>

                            {/* Login Password - Always empty for edit */}
                            <div className="space-y-1">
                              <label className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                                <span>New Password</span>
                                <span className="text-xs text-gray-500">
                                  (leave blank to keep current)
                                </span>
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  name="loginPassword"
                                  value={formData.loginPassword}
                                  onChange={handleChange}
                                  autoComplete="new-password"
                                  className={`w-full px-3 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10 ${
                                    errors.loginPassword
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="Enter new password (min 6 characters)"
                                  minLength={6}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                  {showPassword ? (
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
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                      />
                                    </svg>
                                  ) : (
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
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                              {errors.loginPassword && (
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
                                  {errors.loginPassword}
                                </p>
                              )}
                              {!errors.loginPassword &&
                                formData.loginPassword && (
                                  <p
                                    className={`text-xs flex items-center gap-1 ${
                                      formData.loginPassword.length >= 6
                                        ? "text-green-500"
                                        : "text-yellow-500"
                                    }`}
                                  >
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
                                    Password strength (
                                    {formData.loginPassword.length}/6)
                                  </p>
                                )}
                              <p className="text-xs text-gray-500">
                                {formData.loginEmail
                                  ? "Customer currently has login access. Leave password blank to keep current password."
                                  : "Enable customer login access with email and optional password."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Address Information */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                      Address Information
                    </h3>

                    <div className="space-y-4">
                      {/* Billing Address */}
                      {/* Billing Address */}
                      <div className="space-y-3 mb-4">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                          Billing Address
                        </h4>

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
                              value={dropdownData.countries.find(
                                (opt) => opt.value === formData.billingCountry
                              )}
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
                              value={dropdownData.billingStates.find(
                                (opt) => opt.value === formData.billingState
                              )}
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
                              value={dropdownData.billingCities.find(
                                (opt) => opt.value === formData.billingCity
                              )}
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
                          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            Shipping Address
                          </h4>
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              id="sameAsBilling"
                              checked={sameAsBilling}
                              onChange={(e) =>
                                setSameAsBilling(e.target.checked)
                              }
                              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor="sameAsBilling"
                              className="text-xs text-gray-700"
                            >
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
                              value={dropdownData.countries.find(
                                (opt) => opt.value === formData.shippingCountry
                              )}
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
                              value={dropdownData.shippingStates.find(
                                (opt) => opt.value === formData.shippingState
                              )}
                              onChange={handleShippingStateChange}
                              options={dropdownData.shippingStates}
                              isSearchable
                              isDisabled={
                                !formData.shippingCountry || sameAsBilling
                              }
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
                              value={dropdownData.shippingCities.find(
                                (opt) => opt.value === formData.shippingCity
                              )}
                              onChange={handleShippingCityChange}
                              options={dropdownData.shippingCities}
                              isSearchable
                              isDisabled={
                                !formData.shippingState || sameAsBilling
                              }
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
      </div>
    </LayoutComponent>
  );
}

export default EditCustomer;
