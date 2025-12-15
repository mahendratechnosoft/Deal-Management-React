import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import { useLayout } from "../../Layout/useLayout";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";

import { hasPermission } from "../../BaseComponet/permissions";
import {
  FormInput,
  FormPhoneInputFloating,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";
import { showConfirmDialog } from "../../BaseComponet/alertUtils";

function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { LayoutComponent, role } = useLayout();
  const [employeeId, setEmployeeId] = useState("");
  const canEdit = hasPermission("lead", "Edit");

  const [timestamps, setTimestamps] = useState({
    createdDate: "",
    updatedDate: "",
  });

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
    followUp: "",
  });

  const [dropdownData, setDropdownData] = useState({
    countries: [],
    states: [],
    cities: [],
  });

  const [errors, setErrors] = useState({});

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

  // Fetch lead data
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

        if (!leadData) {
          toast.error("Lead data not found in response!");
          navigateBasedOnRole();
          return;
        }

        // Store timestamps
        setTimestamps({
          createdDate: leadData.createdDate,
          updatedDate: leadData.updatedDate,
        });

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
          followUp: leadData.followUp ? leadData.followUp.substring(0, 16) : "",
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

            setFormData((prev) => ({
              ...prev,
              country: countryCode,
            }));

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
      navigateBasedOnRole();
    };

    fetchLeadData();
  }, [id, navigate, role]);

  // Handle country change
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

  // Handle state change
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

  // Handle city change
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

  // Handle phone change
  const handlePhoneChange = (fieldName, phone) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: phone,
    }));
  };

  // Handle regular input change
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

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName?.trim())
      newErrors.clientName = "Client name is required";
    if (!formData.companyName?.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.mobileNumber?.trim())
      newErrors.mobileNumber = "Primary number is required";

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.state && !formData.country) {
      newErrors.country = "Country is required when state is selected";
    }
    if (formData.city && !formData.state) {
      newErrors.state = "State is required when city is selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
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
          ? dropdownData.countries.find((c) => c.value === formData.country)
              ?.label
          : "",
        state: formData.state
          ? dropdownData.states.find((s) => s.value === formData.state)?.label
          : "",
        city: formData.city,
        zipCode: formData.zipCode,
        description: formData.description,
        followUp: formData.followUp
          ? formData.followUp + ":00.000000000"
          : null,
        createdDate: timestamps.createdDate,
        updatedDate: timestamps.updatedDate,
      };

      if (role === "ROLE_EMPLOYEE" && employeeId) {
        submitData.employeeId = employeeId;
      }

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
      } else {
        toast.error("Failed to update lead. Please try again.");
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
        navigate("/Admin/LeadList");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/LeadList");
      }
    }
  };

  // Loading state
  if (isLoading) {
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
                  {/* Basic Information Section Skeleton */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="skeleton w-8 h-8 rounded-lg"></div>
                      <div className="skeleton h-6 w-48 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(6)].map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="skeleton h-4 w-24 rounded"></div>
                          <div className="skeleton h-10 w-full rounded"></div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Address Section Skeleton */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="skeleton w-8 h-8 rounded-lg"></div>
                      <div className="skeleton h-6 w-40 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="skeleton h-4 w-20 rounded"></div>
                          <div className="skeleton h-10 w-full rounded"></div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Lead Details Section Skeleton */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="skeleton w-8 h-8 rounded-lg"></div>
                      <div className="skeleton h-6 w-32 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="skeleton h-4 w-28 rounded"></div>
                          <div className="skeleton h-10 w-full rounded"></div>
                        </div>
                      ))}
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
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="bg-white h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Compact Header */}
        <div className="bg-white border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate(
                    role === "ROLE_ADMIN"
                      ? "/Admin/LeadList"
                      : "/Employee/LeadList"
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
                  Edit Lead
                </h1>
                <p className="text-xs text-gray-600">
                  Update lead information for {formData.clientName}
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
              {hasPermission("lead", "Edit") && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Lead"
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
                {/* Left Column - Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Lead Details
                  </h3>

                  <div className="space-y-4">
                    {/* Client Name & Company Name */}
                    <div className="grid grid-cols-2 gap-2">
                      <FormInput
                        label="Client Name"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleChange}
                        required={true}
                        error={errors.clientName}
                        background="white"
                      />

                      <FormInput
                        label="Company Name"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required={true}
                        error={errors.companyName}
                        background="white"
                      />
                    </div>

                    {/* Phone Numbers */}
                    <div className="grid grid-cols-2 gap-2">
                      <FormPhoneInputFloating
                        label="Primary Number"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={(phone) =>
                          handlePhoneChange("mobileNumber", phone)
                        }
                        required={true}
                        error={errors.mobileNumber}
                        background="white"
                      />

                      <FormPhoneInputFloating
                        label="Secondary Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(phone) =>
                          handlePhoneChange("phoneNumber", phone)
                        }
                        error={errors.phoneNumber}
                        background="white"
                      />
                    </div>

                    {/* Email & Website */}
                    <div className="grid grid-cols-2 gap-2">
                      <FormInput
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        error={errors.email}
                        background="white"
                      />

                      <FormInput
                        label="Website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        background="white"
                      />
                    </div>

                    {/* Revenue & Industry */}
                    <div className="grid grid-cols-2 gap-2">
                      <FormSelect
                        label="Industry"
                        name="industry"
                        className="setbg-white"
                        value={[
                          { value: "Technology", label: "Technology" },
                          { value: "Healthcare", label: "Healthcare" },
                          { value: "Finance", label: "Finance" },
                          { value: "Education", label: "Education" },
                          { value: "Manufacturing", label: "Manufacturing" },
                          { value: "Retail", label: "Retail" },
                          { value: "Real Estate", label: "Real Estate" },
                          { value: "Other", label: "Other" },
                        ].find((opt) => opt.value === formData.industry)}
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, {
                            name: "industry",
                          })
                        }
                        options={[
                          { value: "Technology", label: "Technology" },
                          { value: "Healthcare", label: "Healthcare" },
                          { value: "Finance", label: "Finance" },
                          { value: "Education", label: "Education" },
                          { value: "Manufacturing", label: "Manufacturing" },
                          { value: "Retail", label: "Retail" },
                          { value: "Real Estate", label: "Real Estate" },
                          { value: "Other", label: "Other" },
                        ]}
                        background="white"
                      />

                      <FormSelect
                        label="Source"
                        name="source"
                        value={[
                          { value: "Instagram", label: "Instagram" },
                          { value: "Website", label: "Website" },
                          { value: "Referral", label: "Referral" },
                          { value: "Social Media", label: "Social Media" },
                          { value: "Trade Show", label: "Trade Show" },
                          { value: "Email Campaign", label: "Email Campaign" },
                          { value: "Website Form", label: "Website Form" },
                        ].find((opt) => opt.value === formData.source)}
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, { name: "source" })
                        }
                        options={[
                          { value: "Instagram", label: "Instagram" },
                          { value: "Website", label: "Website" },
                          { value: "Referral", label: "Referral" },
                          { value: "Social Media", label: "Social Media" },
                          { value: "Trade Show", label: "Trade Show" },
                          { value: "Email Campaign", label: "Email Campaign" },
                          { value: "Website Form", label: "Website Form" },
                        ]}
                        background="white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <FormInput
                        label="Follow-Up Date & Time"
                        name="followUp"
                        value={formData.followUp}
                        onChange={handleChange}
                        type="datetime-local"
                        background="white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <FormTextarea
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={2}
                      background="white"
                      maxLength={5000}
                      showCount={true}
                    />
                  </div>
                </div>

                {/* Right Column - Lead Details & Address */}
                <div className="space-y-4">
                  {/* Lead Details */}

                  {/* Address Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                      Address Information
                    </h3>

                    <div className="space-y-4">
                      <FormInput
                        label="Street Address"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        background="white"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <FormSelect
                          label="Country"
                          name="country"
                          className="setbg-white"
                          value={dropdownData.countries.find(
                            (opt) => opt.value === formData.country
                          )}
                          onChange={handleCountryChange}
                          options={dropdownData.countries}
                          isSearchable
                          error={errors.country}
                          background="white"
                        />

                        <FormSelect
                          label="State"
                          name="state"
                          className="setbg-white"
                          value={dropdownData.states.find(
                            (opt) => opt.value === formData.state
                          )}
                          onChange={handleStateChange}
                          options={dropdownData.states}
                          isSearchable
                          isDisabled={!formData.country}
                          error={errors.state}
                          background="white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <FormSelect
                          label="City"
                          name="city"
                          className="setbg-white"
                          value={dropdownData.cities.find(
                            (opt) => opt.value === formData.city
                          )}
                          onChange={handleCityChange}
                          options={dropdownData.cities}
                          isSearchable
                          isDisabled={!formData.state}
                          error={errors.city}
                          background="white"
                        />

                        <FormInput
                          label="ZIP Code"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          background="white"
                        />
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

export default EditLead;
