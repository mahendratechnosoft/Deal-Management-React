import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../../Layout/useLayout";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Select from "react-select";
import { City, Country, State } from "country-state-city";
import {
  FormInput,
  FormInputWithPrefix,
  FormNumberInputWithPrefix,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";

function CreateProposal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { LayoutComponent, role } = useLayout();
  const [errors, setErrors] = useState({});
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [stampUrl, setStampUrl] = useState(null);
  const [companyMediaLoading, setCompanyMediaLoading] = useState(true);

  const [proposalInfo, setProposalInfo] = useState({
    employeeId: null,
    assignTo: "",
    proposalNumber: "",
    currencyType: "INR",
    discount: 0,
    taxType: "GST",
    taxPercentage: 18,
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
    notes: "",
    termsAndConditions: "",
    companySignature: "",
    companyStamp: "",
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
  const [isRecipientLoading, setIsRecipientLoading] = useState(false);

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
    getNextProposalNumber();
  }, []);

  useEffect(() => {
    const fetchAndPopulateData = async () => {
      if (
        !proposalInfo.relatedId ||
        !proposalInfo.relatedTo ||
        countries.length === 0
      ) {
        return;
      }

      setIsRecipientLoading(true);
      let endpoint = "";
      let recipientData = {};

      try {
        if (proposalInfo.relatedTo === "lead") {
          endpoint = `getLeadById/${proposalInfo.relatedId}`;
          const response = await axiosInstance.get(endpoint);
          const { lead } = response.data;

          recipientData = {
            companyName: lead.companyName,
            email: lead.email,
            mobile: lead.mobileNumber,
            street: lead.street,
            cityStr: lead.city,
            stateStr: lead.state,
            countryStr: lead.country,
            zipCode: lead.zipCode,
          };
        } else if (proposalInfo.relatedTo === "customer") {
          endpoint = `getCustomerById/${proposalInfo.relatedId}`;
          const response = await axiosInstance.get(endpoint);
          const customer = response.data;

          recipientData = {
            companyName: customer.companyName,
            email: customer.email || null,
            mobile: customer.mobile,
            street: customer.billingStreet,
            cityStr: customer.billingCity,
            stateStr: customer.billingState,
            countryStr: customer.billingCountry,
            zipCode: customer.billingZipCode,
          };
        }

        // 1. Populate simple fields
        setProposalInfo((prev) => ({
          ...prev,
          companyName: recipientData.companyName || "",
          email: recipientData.email || "",
          mobileNumber: recipientData.mobile || "",
          street: recipientData.street || "",
          zipCode: recipientData.zipCode || "",
          city: "",
          state: "",
          country: "",
        }));

        // 2. Handle Country
        const countryObj = countries.find(
          (c) => c.label === recipientData.countryStr
        );

        if (!countryObj) {
          setSelectedCountry(null);
          setSelectedState(null);
          setSelectedCity(null);
          setStates([]);
          setCities([]);
          setIsRecipientLoading(false);
          return;
        }

        setSelectedCountry(countryObj);
        setProposalInfo((prev) => ({ ...prev, country: countryObj.label }));

        // 3. Handle State
        const newStates = State.getStatesOfCountry(countryObj.value).map(
          (s) => ({
            value: s.isoCode,
            label: s.name,
            ...s,
          })
        );
        setStates(newStates); // Set the options

        const stateObj = newStates.find(
          (s) => s.label === recipientData.stateStr
        );

        if (!stateObj) {
          setSelectedState(null);
          setSelectedCity(null);
          setCities([]);
          setIsRecipientLoading(false);
          return;
        }

        setSelectedState(stateObj);
        setProposalInfo((prev) => ({ ...prev, state: stateObj.label }));

        // 4. Handle City
        const newCities = City.getCitiesOfState(
          countryObj.value,
          stateObj.value
        ).map((c) => ({
          value: c.name,
          label: c.name,
          ...c,
        }));
        setCities(newCities); // Set the options

        const cityObj = newCities.find(
          (c) => c.label === recipientData.cityStr
        );

        if (cityObj) {
          setSelectedCity(cityObj);
          setProposalInfo((prev) => ({ ...prev, city: cityObj.label }));
        } else {
          setSelectedCity(null);
          setProposalInfo((prev) => ({ ...prev, city: "" }));
        }
      } catch (error) {
        console.error("Failed to load recipient data:", error);
        toast.error("Could not load recipient details.");
        setSelectedCountry(null);
        setSelectedState(null);
        setSelectedCity(null);
        setStates([]);
        setCities([]);
      } finally {
        setIsRecipientLoading(false);
      }
    };

    fetchAndPopulateData();
  }, [proposalInfo.relatedId, proposalInfo.relatedTo, countries]);

  useEffect(() => {
    const fetchCompanyMedia = async () => {
      if (!role) {
        setCompanyMediaLoading(false);
        return;
      }

      setCompanyMediaLoading(true);
      let endpoint = "";

      if (role === "ROLE_ADMIN") {
        endpoint = "getAdminInfo";
      } else if (role === "ROLE_EMPLOYEE") {
        endpoint = "getEmployeeInfo";
      } else {
        setCompanyMediaLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(endpoint);
        const data = response.data;

        let sigData = null;
        let stampData = null;

        if (role === "ROLE_ADMIN") {
          sigData = data.companySignature;
          stampData = data.companyStamp;
        } else if (role === "ROLE_EMPLOYEE" && data.admin) {
          sigData = data.admin.companySignature;
          stampData = data.admin.companyStamp;
        }

        if (sigData) {
          setSignatureUrl(`data:;base64,${sigData}`);
        }

        if (stampData) {
          setStampUrl(`data:;base64,${stampData}`);
        }

        setProposalInfo((prev) => ({
          ...prev,
          companySignature: sigData || "",
          companyStamp: stampData || "",
        }));
      } catch (error) {
        console.error("Failed to load company media:", error);
        toast.error("Could not load signature and stamp.");
      } finally {
        setCompanyMediaLoading(false);
      }
    };

    fetchCompanyMedia();
  }, [role]);

  const getNextProposalNumber = async () => {
    try {
      const responce = await axiosInstance.get("getNextProposalNumber");
      console.log("Next Proposal Number:", responce);
      setProposalInfo((prev) => ({
        ...prev,
        proposalNumber: responce.data,
      }));
    } catch (error) {
      console.error("Failed to fetch max proposal number:", error);
      toast.error("Failed to fetch max proposal number.");
    }
  };

  const handleCancel = () => {
    if (role === "ROLE_ADMIN") {
      navigate("/Proposal");
    } else if (role === "ROLE_EMPLOYEE") {
      navigate("/Employee/Proposal");
    } else {
      navigate("/login");
    }
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setProposalInfo((prev) => ({ ...prev, [name]: value }));

    if (name === "proposalNumber") {
      checkProposalNumberUniqueness(value);
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    if (name === "assignTo") {
      setProposalInfo((prev) => ({
        ...prev,
        assignTo: selectedOption ? selectedOption.label : "",
        employeeId: selectedOption ? selectedOption.value : "",
      }));

      if (errors.assignTo) {
        setErrors((prev) => ({ ...prev, assignTo: "" }));
      }
    } else if (name === "relatedTo") {
      setProposalInfo((prev) => ({
        ...prev,
        relatedTo: selectedOption ? selectedOption.value : "",
        relatedId: "",
        companyName: "",
        mobileNumber: "",
        email: "",
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      }));
      setRelatedIdOptions([]);
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedCity(null);
      setStates([]);
      setCities([]);

      if (errors.relatedTo) setErrors((prev) => ({ ...prev, relatedTo: "" }));
      if (errors.relatedId) setErrors((prev) => ({ ...prev, relatedId: "" }));
    } else {
      setProposalInfo((prev) => ({
        ...prev,
        [name]: selectedOption ? selectedOption.value : "",
      }));

      if (name === "relatedId") {
        setProposalInfo((prev) => ({
          ...prev,
          relatedId: selectedOption ? selectedOption.value : "",
          companyName: "",
          mobileNumber: "",
          email: "",
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        }));
        setSelectedCountry(null);
        setSelectedState(null);
        setSelectedCity(null);
        setStates([]);
        setCities([]);
      }

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
        return "";
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
      const response = await axiosInstance.get("getEmployeeNameAndId");
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
        endpoint = "getLeadNameAndId";
        const response = await axiosInstance.get(endpoint);
        mappedOptions = response.data.map((lead) => ({
          label: lead.clientName,
          value: lead.leadId,
        }));
      } else if (proposalInfo.relatedTo === "customer") {
        endpoint = "getCustomerListWithNameAndId";
        const response = await axiosInstance.get(endpoint);
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

  const checkProposalNumberUniqueness = async (number) => {
    // Don't check if the number is empty
    if (!number || number.trim().length === 0) {
      setErrors((prev) => ({
        ...prev,
        proposalNumber: "Proposal Number is required",
      }));
      return;
    }

    try {
      const response = await axiosInstance.get(
        `isProposalNumberUnique/${number}`
      );
      if (response.data === false) {
        // Not unique
        setErrors((prev) => ({
          ...prev,
          proposalNumber:
            "This proposal number is already taken. Please choose a unique number.",
        }));
      } else {
        // It is unique, clear any errors for this field
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.proposalNumber;
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Failed to check proposal number uniqueness:", error);
      toast.error("Could not verify proposal number uniqueness.");
      setErrors((prev) => ({
        ...prev,
        proposalNumber: "Error checking uniqueness.",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!proposalInfo.proposalNumber)
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

    const combinedErrors = { ...errors, ...newErrors };
    Object.keys(combinedErrors).forEach((key) => {
      if (!combinedErrors[key]) {
        delete combinedErrors[key];
      }
    });

    setErrors(combinedErrors);
    return Object.keys(combinedErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    setErrors({});
    setLoading(true);

    const payload = {
      proposalInfo: {
        ...proposalInfo,
        proposalNumber: parseInt(proposalInfo.proposalNumber),
        discount: Number(total),
        totalAmmount: Number(proposalInfo.totalAmmount),
      },
      proposalContent: proposalContent.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      })),
    };

    try {
      await axiosInstance.post("createProposal", payload);
      console.log("Form Submitted:", payload);
      toast.success("Proposal created successfully!");
      setLoading(false);

      if (role === "ROLE_ADMIN") {
        navigate("/Proposal");
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
                  navigate("/Proposal");
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
                disabled={loading || isRecipientLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || isRecipientLoading ? (
                  "Loading..."
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
                    <FormNumberInputWithPrefix
                      label="Proposal Number"
                      name="proposalNumber"
                      prefix="PROP-"
                      value={proposalInfo.proposalNumber}
                      onChange={handleInfoChange}
                      required
                      error={errors.proposalNumber}
                      className="md:col-span-1"
                      minDigits={6}
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
                      isLoading={isRelatedIdLoading || isRecipientLoading}
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
                      disabled={isRecipientLoading}
                    />
                    <FormInput
                      label="Email"
                      name="email"
                      value={proposalInfo.email}
                      onChange={handleInfoChange}
                      type="email"
                      required
                      error={errors.email}
                      disabled={isRecipientLoading}
                    />
                    <FormInput
                      label="Mobile Number"
                      name="mobileNumber"
                      value={proposalInfo.mobileNumber}
                      onChange={handleInfoChange}
                      error={errors.mobileNumber}
                      disabled={isRecipientLoading}
                    />
                    <FormInput
                      label="Street Address"
                      name="street"
                      value={proposalInfo.street}
                      onChange={handleInfoChange}
                      required
                      error={errors.street}
                      disabled={isRecipientLoading}
                    />

                    {/* --- MODIFIED ONCHANGE --- */}
                    <FormSelect
                      label="Country"
                      name="country"
                      value={selectedCountry}
                      onChange={(opt) => {
                        setSelectedCountry(opt);
                        if (opt) {
                          const newStates = State.getStatesOfCountry(
                            opt.value
                          ).map((s) => ({
                            value: s.isoCode,
                            label: s.name,
                            ...s,
                          }));
                          setStates(newStates);
                          setProposalInfo((prev) => ({
                            ...prev,
                            country: opt.label,
                            state: "",
                            city: "",
                          }));
                        } else {
                          setStates([]);
                          setProposalInfo((prev) => ({
                            ...prev,
                            country: "",
                            state: "",
                            city: "",
                          }));
                        }
                        setSelectedState(null);
                        setCities([]);
                        setSelectedCity(null);
                        if (errors.country)
                          setErrors((prev) => ({
                            ...prev,
                            country: "",
                            state: "",
                            city: "",
                          }));
                      }}
                      options={countries}
                      required
                      error={errors.country}
                      isDisabled={isRecipientLoading}
                    />

                    {/* --- MODIFIED ONCHANGE --- */}
                    <FormSelect
                      label="State"
                      name="state"
                      value={selectedState}
                      onChange={(opt) => {
                        setSelectedState(opt);
                        if (opt) {
                          const newCities = City.getCitiesOfState(
                            selectedCountry.value,
                            opt.value
                          ).map((c) => ({
                            value: c.name,
                            label: c.name,
                            ...c,
                          }));
                          setCities(newCities);
                          setProposalInfo((prev) => ({
                            ...prev,
                            state: opt.label,
                            city: "",
                          }));
                        } else {
                          setCities([]);
                          setProposalInfo((prev) => ({
                            ...prev,
                            state: "",
                            city: "",
                          }));
                        }
                        setSelectedCity(null);
                        if (errors.state)
                          setErrors((prev) => ({
                            ...prev,
                            state: "",
                            city: "",
                          }));
                      }}
                      options={states}
                      required
                      isDisabled={!selectedCountry || isRecipientLoading}
                      error={errors.state}
                    />

                    {/* This was already correct, but just to be clear */}
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
                      isDisabled={!selectedState || isRecipientLoading}
                      error={errors.city}
                    />
                    <FormInput
                      label="Zip Code"
                      name="zipCode"
                      value={proposalInfo.zipCode}
                      onChange={handleInfoChange}
                      required
                      error={errors.zipCode}
                      disabled={isRecipientLoading}
                    />
                  </div>
                </div>
              </div>

              {/* --- Section 2: Proposal Items (with separator) --- */}
              <div className="pt-8 border-t border-gray-200">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {" "}
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
                    className="w-48"
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

              <div className="pt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="w-full md:w-1/2 lg:flex-1 space-y-4">
                    <FormTextarea
                      label="Notes"
                      name="notes"
                      value={proposalInfo.notes}
                      onChange={handleInfoChange}
                      rows={5}
                    />
                    <FormTextarea
                      label="Terms & Conditions"
                      name="termsAndConditions"
                      value={proposalInfo.termsAndConditions}
                      onChange={handleInfoChange}
                      rows={8}
                    />
                  </div>
                  <div className="w-full md:w-1/2 lg:w-1/3 space-y-4 bg-gray-50 p-4 rounded-lg">
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
                        onChange={(opt) => {
                          if (opt) {
                            handleSelectChange("taxType", opt);
                            setTaxRateInput(opt.defaultRate);
                            setProposalInfo((prev) => ({
                              ...prev,
                              taxPercentage: Number(opt.defaultRate) || 0,
                            }));
                          } else {
                            handleSelectChange("taxType", null);
                            setTaxRateInput("");
                            setProposalInfo((prev) => ({
                              ...prev,
                              taxPercentage: 0,
                            }));
                          }
                        }}
                        options={taxOptions}
                        className="w-full"
                        classNamePrefix="select"
                        menuPlacement="auto"
                      />
                      <FormInput
                        label="Tax %"
                        name="taxRateInput"
                        type="number"
                        value={taxRateInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTaxRateInput(value);
                          setProposalInfo((prev) => ({
                            ...prev,
                            taxPercentage: Number(value) || 0,
                          }));
                        }}
                        disabled={proposalInfo.taxType === "No Tax"}
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

              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Signature & Stamp
                </h2>
                <div className="flex flex-col md:flex-row w-1/2 gap-8">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authorized Signature
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 w-full flex items-center justify-center bg-gray-50 p-2">
                      {companyMediaLoading ? (
                        <span className="text-gray-400 text-sm">
                          Loading Signature...
                        </span>
                      ) : signatureUrl ? (
                        <img
                          src={signatureUrl}
                          alt="Authorized Signature"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm text-center px-4">
                          Please add signature from General Settings.
                        </span>
                      )}
                    </div>
                  </div>
                  {(companyMediaLoading || stampUrl) && (
                    <div className="w-full md:w-1/2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Stamp
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 w-full flex items-center justify-center bg-gray-50 p-2">
                        {companyMediaLoading ? (
                          <span className="text-gray-400 text-sm">
                            Loading Stamp...
                          </span>
                        ) : stampUrl ? (
                          <img
                            src={stampUrl}
                            alt="Company Stamp"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Stamp Image Not Available
                          </span>
                        )}
                      </div>
                    </div>
                  )}
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
