import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../../Layout/useLayout";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Select from "react-select";
import { City, Country, State } from "country-state-city";

const customReactSelectStyles = (hasError) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: "38px",
    backgroundColor: state.isDisabled ? "#f3f4f6" : "transparent",
    cursor: state.isDisabled ? "not-allowed" : "default",
    borderColor: state.isDisabled
      ? "#d1d5db"
      : hasError
      ? "#ef4444"
      : state.isFocused
      ? "#3b82f6"
      : "#d1d5db",
    borderRadius: "0.5rem",
    borderWidth: state.isFocused ? "2px" : "1px",
    boxShadow: "none",
    "&:hover": {
      borderColor: state.isDisabled
        ? "#d1d5db"
        : hasError
        ? "#ef4444"
        : state.isFocused
        ? "#3b82f6"
        : "#9ca3af",
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "2px 8px",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "transparent",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 50,
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "#9ca3af" : "hsl(0, 0%, 20%)",
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    color: state.isDisabled ? "#9ca3af" : provided.color,
  }),
});

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  error,
  disabled = false, // <-- ADDED disabled prop
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      disabled={disabled} // <-- ADDED
      className={`block w-full px-3 py-2 bg-transparent border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm ${
        error
          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      }
      ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""} 
      `} // <-- ADDED disabled styles
    />
    <label
      htmlFor={name}
      className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2 peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none ${
        error ? "text-red-600" : "text-gray-500 peer-focus:text-blue-600"
      }
      ${disabled ? "text-gray-400" : ""}
      `} // <-- ADDED disabled styles
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// --- NEW COMPONENT FOR PROPOSAL NUMBER ---
const FormInputWithPrefix = ({
  label,
  name,
  value,
  onChange,
  prefix,
  type = "text",
  required = false,
  error,
  className = "",
}) => (
  <div className={`relative ${className}`}>
    {/* This div gets the focus-within styling */}
    <div
      className={`flex rounded-lg border
      ${error ? "border-red-500" : "border-gray-300"}
      ${
        !error &&
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
      }
      ${
        error &&
        "focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500"
      }
    `}
    >
      <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-300 rounded-l-lg">
        {prefix}
      </span>

      {/* Inner container for input + label, so label is positioned correctly */}
      <div className="relative w-full">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder=" " // This is the peer
          className="block w-full px-3 py-2 bg-transparent appearance-none focus:outline-none peer text-sm rounded-r-lg border-none" // Input has no border
        />
        <label
          htmlFor={name}
          className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2 peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none ${
            error ? "text-red-600" : "text-gray-500 peer-focus:text-blue-600"
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);
// --- END NEW COMPONENT ---

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  isDisabled = false,
  className = "",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = !!value;

  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={name}
        className={`absolute text-sm duration-300 transform z-10 origin-[0] px-2 left-1 pointer-events-none
        ${
          isFocused || hasValue
            ? "scale-75 -translate-y-4 top-2"
            : "scale-100 translate-y-0 top-1.5"
        }
        ${
          error ? "text-red-600" : isFocused ? "text-blue-600" : "text-gray-500"
        }
        ${isDisabled ? "text-gray-400 bg-gray-50" : "bg-white"}
      `}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        placeholder=" "
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        styles={customReactSelectStyles(!!error)}
        isDisabled={isDisabled}
        classNamePrefix="select"
        menuPlacement="auto"
        maxMenuHeight={200}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

function CreateProposal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { LayoutComponent, role } = useLayout();
  const [errors, setErrors] = useState({});

  const [proposalInfo, setProposalInfo] = useState({
    employeeId: "",
    assignTo: "",
    proposalNumber: "",
    currencyType: "INR",
    discount: 0,
    taxType: "GST",
    dueDate: "",
    proposalDate: new Date().toISOString().split("T")[0],
    totalAmmount: 0,
    status: "Draft",
    subject: "",
    relatedTo: "",
    relatedId: "",
    companyName: "",
    mobileNumber: "",
    email: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  const [proposalContent, setProposalContent] = useState([
    { item: "", description: "", quantity: 1, rate: 0 },
  ]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [taxRateInput, setTaxRateInput] = useState("18");
  const [assignToOptions, setAssignToOptions] = useState([]);
  const [isAssignToLoading, setIsAssignToLoading] = useState(false);
  const [relatedIdOptions, setRelatedIdOptions] = useState([]);
  const [isRelatedIdLoading, setIsRelatedIdLoading] = useState(false);

  const relatedOptions = [
    { value: "lead", label: "Lead" },
    { value: "customer", label: "Customer" },
  ];

  const taxOptions = [
    { value: "No Tax", label: "No Tax", defaultRate: 0 },
    { value: "SGST", label: "SGST", defaultRate: 9 },
    { value: "CGST", label: "CGST", defaultRate: 9 },
    { value: "GST", label: "GST", defaultRate: 18 },
    { value: "IGST", label: "IGST", defaultRate: 18 },
    { value: "Custom", label: "Custom", defaultRate: "" },
  ];
  const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Sent", label: "Sent" },
    { value: "Open", label: "Open" },
    { value: "Revised", label: "Revised" },
    { value: "Accepted", label: "Accepted" },
    { value: "Declined", label: "Declined" },
  ];
  const currencyOptions = [
    { value: "INR", label: "INR" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ];

  useEffect(() => {
    setCountries(
      Country.getAllCountries().map((c) => ({
        value: c.isoCode,
        label: c.name,
        ...c,
      }))
    );
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setStates(
        State.getStatesOfCountry(selectedCountry.value).map((s) => ({
          value: s.isoCode,
          label: s.name,
          ...s,
        }))
      );
      setCities([]);
      setSelectedState(null);
      setSelectedCity(null);
      setProposalInfo((prev) => ({
        ...prev,
        country: selectedCountry.label,
        state: "",
        city: "",
      }));

      if (errors.country)
        setErrors((prev) => ({ ...prev, country: "", state: "", city: "" }));
    } else {
      setStates([]);
      setCities([]);
      setSelectedState(null);
      setSelectedCity(null);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      setCities(
        City.getCitiesOfState(selectedCountry.value, selectedState.value).map(
          (c) => ({
            value: c.name,
            label: c.name,
            ...c,
          })
        )
      );
      setSelectedCity(null);
      setProposalInfo((prev) => ({
        ...prev,
        state: selectedState.label,
        city: "",
      }));
      if (errors.state) setErrors((prev) => ({ ...prev, state: "", city: "" }));
    } else {
      setCities([]);
      setSelectedCity(null);
    }
  }, [selectedState]);

  const handleCancel = () => {
    if (role === "ROLE_ADMIN") {
      navigate("/Admin/Proposal");
    } else if (role === "ROLE_EMPLOYEE") {
      navigate("/Employee/Proposal");
    } else {
      navigate("/login");
    }
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setProposalInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    if (name === "assignTo") {
      setProposalInfo((prev) => ({
        ...prev,
        assignTo: selectedOption ? selectedOption.label : "", // Set name
        employeeId: selectedOption ? selectedOption.value : "", // Set ID
      }));

      if (errors.assignTo) {
        setErrors((prev) => ({ ...prev, assignTo: "" }));
      }
    } else if (name === "relatedTo") {
      setProposalInfo((prev) => ({
        ...prev,
        relatedTo: selectedOption ? selectedOption.value : "",
        relatedId: "",
      }));
      setRelatedIdOptions([]);

      if (errors.relatedTo) setErrors((prev) => ({ ...prev, relatedTo: "" }));
      if (errors.relatedId) setErrors((prev) => ({ ...prev, relatedId: "" }));
    } else {
      setProposalInfo((prev) => ({
        ...prev,
        [name]: selectedOption ? selectedOption.value : "",
      }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...proposalContent];
    list[index][name] = value;
    setProposalContent(list);
  };

  const handleAddItem = () => {
    setProposalContent([
      ...proposalContent,
      { item: "", description: "", quantity: 1, rate: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    const list = [...proposalContent];
    list.splice(index, 1);
    setProposalContent(list);
  };

  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = proposalContent.reduce(
      (acc, item) =>
        acc + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );

    const discountAmount = (sub * (Number(proposalInfo.discount) || 0)) / 100;
    const taxableAmount = sub - discountAmount;
    const taxRate = (Number(taxRateInput) || 0) / 100;

    const tax = taxableAmount * taxRate;
    const grandTotal = taxableAmount + tax;

    return { subtotal: sub, taxAmount: tax, total: grandTotal };
  }, [proposalContent, proposalInfo.discount, taxRateInput]);

  const currencySymbol = useMemo(() => {
    switch (proposalInfo.currencyType) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return ""; // Fallback
    }
  }, [proposalInfo.currencyType]);

  useEffect(() => {
    setProposalInfo((prev) => ({ ...prev, totalAmmount: total }));
  }, [total]);

  const loadAssignToOptions = async () => {
    if (isAssignToLoading) {
      return;
    }
    setIsAssignToLoading(true);
    try {
      const response = await axiosInstance.get("/admin/getEmployeeNameAndId");
      const mappedOptions = response.data.map((emp) => ({
        label: emp.name,
        value: emp.employeeId,
      }));
      setAssignToOptions(mappedOptions);
    } catch (error) {
      console.error("Failed to load employee options:", error);
      toast.error("Failed to load employee options.");
    } finally {
      setIsAssignToLoading(false);
    }
  };

  const loadRelatedIdOptions = async () => {
    if (isRelatedIdLoading || !proposalInfo.relatedTo) {
      return;
    }

    setIsRelatedIdLoading(true);
    let endpoint = "";
    let mappedOptions = [];

    try {
      if (proposalInfo.relatedTo === "lead") {
        endpoint = "/admin/getLeadNameAndId";
        const response = await axiosInstance.get(endpoint);
        // Map API response (clientName, leadId) to (label, value)
        mappedOptions = response.data.map((lead) => ({
          label: lead.clientName,
          value: lead.leadId,
        }));
      } else if (proposalInfo.relatedTo === "customer") {
        endpoint = "/admin/getCustomerListWithNameAndId";
        const response = await axiosInstance.get(endpoint);
        // Map API response (companyName, id) to (label, value)
        mappedOptions = response.data.map((customer) => ({
          label: customer.companyName,
          value: customer.id,
        }));
      }

      setRelatedIdOptions(mappedOptions);
    } catch (error) {
      console.error(`Failed to load ${proposalInfo.relatedTo} list:`, error);
      toast.error(`Failed to load ${proposalInfo.relatedTo} list.`);
    } finally {
      setIsRelatedIdLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!proposalInfo.proposalNumber.trim())
      newErrors.proposalNumber = "Proposal Number is required";
    if (!proposalInfo.subject.trim()) newErrors.subject = "Subject is required";

    if (!proposalInfo.proposalDate)
      newErrors.proposalDate = "Proposal Date is required";
    if (!proposalInfo.status) newErrors.status = "Status is required";

    if (!proposalInfo.companyName.trim())
      newErrors.companyName = "Company Name is required";
    if (!proposalInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(proposalInfo.email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!proposalInfo.street.trim())
      newErrors.street = "Street Address is required";
    if (!selectedCountry) newErrors.country = "Country is required";
    if (!selectedState) newErrors.state = "State is required";
    if (!selectedCity) newErrors.city = "City is required";
    if (!proposalInfo.zipCode.trim())
      newErrors.zipCode = "Zip Code is required";

    if (!proposalInfo.currencyType)
      newErrors.currencyType = "Currency is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    setErrors({});
    setLoading(true);

    const effectiveTaxRate = Number(taxRateInput) || 0;

    const payload = {
      proposalInfo: {
        ...proposalInfo,
        proposalNumber: `PROP-${proposalInfo.proposalNumber}`,
        discount: Number(proposalInfo.discount),
        totalAmmount: Number(proposalInfo.totalAmmount),
        taxRate: effectiveTaxRate,
      },
      proposalContent: proposalContent.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
    };

    try {
      await axiosInstance.post("/admin/createProposal", payload);
      console.log("Form Submitted:", payload);
      toast.success("Proposal created successfully!");
      setLoading(false);

      if (role === "ROLE_ADMIN") {
        navigate("/Admin/Proposal");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/Proposal");
      }
    } catch (error) {
      console.error("Failed to create proposal:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create proposal. Please check the form."
      );
      setLoading(false);
    }
  };

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 h-[90vh] overflow-y-auto">
        <div className="p-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                if (role === "ROLE_ADMIN") {
                  navigate("/Admin/Proposal");
                } else if (role === "ROLE_EMPLOYEE") {
                  navigate("/Employee/Proposal");
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
              Back to Proposal
            </button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Create New Proposal
              </h1>
              <p className="text-gray-600 text-sm">
                Add a new proposal to your sales pipeline
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
                form="createProposalForm"
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
                    Create Proposal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="h-[72vh] overflow-hidden ">
          <form
            onSubmit={handleSubmit}
            id="createProposalForm"
            className="mt-4 h-full overflow-y-auto no-scrollbar"
          >
            <div className="bg-white p-6 rounded-lg space-y-8 shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Proposal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* --- MODIFIED SECTION --- */}
                    <FormInputWithPrefix
                      label="Proposal Number"
                      name="proposalNumber"
                      prefix="PROP-"
                      value={proposalInfo.proposalNumber}
                      onChange={handleInfoChange}
                      required
                      error={errors.proposalNumber}
                      className="md:col-span-1"
                    />
                    <FormInput
                      label="Subject"
                      name="subject"
                      value={proposalInfo.subject}
                      onChange={handleInfoChange}
                      required
                      error={errors.subject}
                      className="md:col-span-1"
                    />
                    <FormSelect
                      label="Related To"
                      name="relatedTo"
                      value={relatedOptions.find(
                        (o) => o.value === proposalInfo.relatedTo
                      )}
                      onChange={(opt) => handleSelectChange("relatedTo", opt)}
                      options={relatedOptions}
                      error={errors.relatedTo}
                    />
                    <FormSelect
                      label="Related Lead/Customer"
                      name="relatedId"
                      value={relatedIdOptions.find(
                        (o) => o.value === proposalInfo.relatedId
                      )}
                      onChange={(opt) => handleSelectChange("relatedId", opt)}
                      options={relatedIdOptions}
                      error={errors.relatedId}
                      onMenuOpen={loadRelatedIdOptions}
                      isLoading={isRelatedIdLoading}
                      isDisabled={!proposalInfo.relatedTo}
                    />
                    <FormSelect
                      label="Assign To"
                      name="assignTo"
                      value={assignToOptions.find(
                        (o) => o.value === proposalInfo.employeeId
                      )}
                      onChange={(opt) => handleSelectChange("assignTo", opt)}
                      options={assignToOptions}
                      error={errors.assignTo}
                      onMenuOpen={loadAssignToOptions}
                      isLoading={isAssignToLoading}
                    />
                    <FormInput
                      label="Proposal Date"
                      name="proposalDate"
                      value={proposalInfo.proposalDate}
                      onChange={handleInfoChange}
                      type="date"
                      required
                      error={errors.proposalDate}
                    />
                    <FormInput
                      label="Due Date"
                      name="dueDate"
                      value={proposalInfo.dueDate}
                      onChange={handleInfoChange}
                      type="date"
                      // required // <-- REMOVED
                      error={errors.dueDate}
                    />
                    <FormSelect
                      label="Status"
                      name="status"
                      value={statusOptions.find(
                        (o) => o.value === proposalInfo.status
                      )}
                      onChange={(opt) => handleSelectChange("status", opt)}
                      options={statusOptions}
                      required
                      error={errors.status}
                    />
                  </div>
                </div>

                {/* --- Column 2: Recipient Info (with separator) --- */}
                <div className="space-y-6 mt-8 lg:mt-0 lg:border-l lg:border-gray-200 lg:pl-8">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Recipient Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Company Name"
                      name="companyName"
                      value={proposalInfo.companyName}
                      onChange={handleInfoChange}
                      required
                      error={errors.companyName}
                    />
                    <FormInput
                      label="Email"
                      name="email"
                      value={proposalInfo.email}
                      onChange={handleInfoChange}
                      type="email"
                      required
                      error={errors.email}
                    />
                    <FormInput
                      label="Mobile Number"
                      name="mobileNumber"
                      value={proposalInfo.mobileNumber}
                      onChange={handleInfoChange}
                      error={errors.mobileNumber}
                    />
                    <FormInput
                      label="Street Address"
                      name="street"
                      value={proposalInfo.street}
                      onChange={handleInfoChange}
                      required
                      error={errors.street}
                    />
                    <FormSelect
                      label="Country"
                      name="country"
                      value={selectedCountry}
                      onChange={(opt) => {
                        setSelectedCountry(opt);
                        if (errors.country)
                          setErrors((prev) => ({ ...prev, country: "" }));
                      }}
                      options={countries}
                      required
                      error={errors.country}
                    />
                    <FormSelect
                      label="State"
                      name="state"
                      value={selectedState}
                      onChange={(opt) => {
                        setSelectedState(opt);
                        if (errors.state)
                          setErrors((prev) => ({ ...prev, state: "" }));
                      }}
                      options={states}
                      required
                      isDisabled={!selectedCountry}
                      error={errors.state}
                    />
                    <FormSelect
                      label="City"
                      name="city"
                      value={selectedCity}
                      onChange={(opt) => {
                        setSelectedCity(opt);
                        setProposalInfo((prev) => ({
                          ...prev,
                          city: opt ? opt.value : "",
                        }));
                        if (errors.city)
                          setErrors((prev) => ({ ...prev, city: "" }));
                      }}
                      options={cities}
                      required
                      isDisabled={!selectedState}
                      error={errors.city}
                    />
                    <FormInput
                      label="Zip Code"
                      name="zipCode"
                      value={proposalInfo.zipCode}
                      onChange={handleInfoChange}
                      required
                      error={errors.zipCode}
                    />
                  </div>
                </div>
              </div>

              {/* --- Section 2: Proposal Items (with separator) --- */}
              <div className="pt-8 border-t border-gray-200">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {" "}
                    {/* Removed mb-4 */}
                    Proposal Items
                  </h2>
                  <FormSelect
                    label="Currency"
                    name="currencyType"
                    value={currencyOptions.find(
                      (o) => o.value === proposalInfo.currencyType
                    )}
                    onChange={(opt) => handleSelectChange("currencyType", opt)}
                    options={currencyOptions}
                    required
                    error={errors.currencyType}
                    className="w-48" // MODIFIED: Added width class
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate ({currencySymbol})
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {proposalContent.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-2 py-2 align-middle">
                            <input
                              type="text"
                              name="item"
                              value={item.item}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                              placeholder="e.g., Website Design"
                            />
                          </td>
                          <td className="px-2 py-2 align-middle">
                            <input
                              type="text"
                              name="description"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-full border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                              placeholder="e.g., Responsive 5-page site"
                            />
                          </td>
                          <td className="px-2 py-2 align-middle">
                            <input
                              type="number"
                              name="quantity"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-20 border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                              min="1"
                            />
                          </td>
                          <td className="px-2 py-2 align-middle">
                            <input
                              type="number"
                              name="rate"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-32 border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 font-medium align-middle">
                            {currencySymbol}
                            {(item.quantity * item.rate).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-center align-middle">
                            <button
                              className="text-red-600 hover:text-red-900 font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
                              onClick={() => handleRemoveItem(index)}
                              title="Remove Item"
                              type="button"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Item
                </button>
              </div>

              {/* --- Section 3: Summary (with separator) --- */}
              <div className="pt-8 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-full md:w-1/2 lg:w-1/3 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                      Summary
                    </h2>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-800">
                        {currencySymbol}
                        {subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="discount" className="text-gray-600">
                        Discount (%):
                      </label>
                      <input
                        type="number"
                        name="discount"
                        id="discount"
                        value={proposalInfo.discount}
                        onChange={handleInfoChange}
                        className="w-24 border-gray-300 rounded-md shadow-sm sm:text-sm text-right"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 items-center">
                      <Select
                        id="taxType"
                        name="taxType"
                        value={taxOptions.find(
                          (o) => o.value === proposalInfo.taxType
                        )}
                        // --- MODIFIED --- onChange logic
                        onChange={(opt) => {
                          if (opt) {
                            handleSelectChange("taxType", opt);
                            setTaxRateInput(opt.defaultRate);
                          } else {
                            handleSelectChange("taxType", null);
                            setTaxRateInput("");
                          }
                        }}
                        options={taxOptions}
                        className="w-full"
                        classNamePrefix="select"
                        menuPlacement="auto"
                      />
                      <FormInput
                        label="Tax %"
                        name="taxRateInput" // --- MODIFIED ---
                        type="number"
                        value={taxRateInput} // --- MODIFIED ---
                        onChange={(e) => setTaxRateInput(e.target.value)} // --- MODIFIED ---
                        disabled={proposalInfo.taxType === "No Tax"} // --- MODIFIED ---
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax Amount:</span>
                      <span className="font-medium text-gray-800">
                        {currencySymbol}
                        {taxAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Grand Total:</span>
                        <span>
                          {currencySymbol}
                          {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-6" />
          </form>
        </div>
      </div>
    </LayoutComponent>
  );
}

export default CreateProposal;
