import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../../Layout/useLayout";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Select from "react-select";
import { City, Country, State } from "country-state-city";
import {
  FormInput,
  FormNumberInputWithPrefix,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";

function CreateProforma() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { LayoutComponent, role } = useLayout();
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [stampUrl, setStampUrl] = useState(null);
  const [companyMediaLoading, setCompanyMediaLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [proformaInfo, setProformaInfo] = useState({
    employeeId: "",
    assignTo: "",
    proformaInvoiceNumber: "",
    currencyType: "INR",
    discount: 0,
    taxType: "GST",
    taxPercentage: 18,
    dueDate: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    totalAmount: 0,
    status: "Draft",
    relatedTo: "",
    relatedId: "",
    companyName: "",
    mobileNumber: "",
    email: "",
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
    notes: "",
    termsAndConditions: "",
    companySignature: "",
    companyStamp: "",
  });

  const [isSameAsBilling, setIsSameAsBilling] = useState(true);

  const [proformaContent, setProformaContent] = useState([
    { item: "", description: "", quantity: 1, rate: 0, sacCode: "" },
  ]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [shippingStates, setShippingStates] = useState([]);
  const [shippingCities, setShippingCities] = useState([]);
  const [selectedShippingCountry, setSelectedShippingCountry] = useState(null);
  const [selectedShippingState, setSelectedShippingState] = useState(null);
  const [selectedShippingCity, setSelectedShippingCity] = useState(null);

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
    { value: "UNPAID", label: "Unpaid" },
    { value: "PARTIALLY_PAID", label: "Partially Paid" },
    { value: "PAID", label: "Paid" },
  ];
  const currencyOptions = [
    { value: "INR", label: "INR" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ];

  // Helper function to find country/state/city objects from strings
  const findAddressObjects = (countryStr, stateStr, cityStr) => {
    const address = {
      country: countryStr || "",
      state: stateStr || "",
      city: cityStr || "",
      selectedCountry: null,
      selectedState: null,
      selectedCity: null,
      states: [],
      cities: [],
    };

    const countryObj = countries.find(
      (c) => c.label.toLowerCase() === countryStr?.toLowerCase().trim()
    );
    if (!countryObj) return address;

    address.selectedCountry = countryObj;
    address.country = countryObj.label;
    address.states = State.getStatesOfCountry(countryObj.value).map((s) => ({
      value: s.isoCode,
      label: s.name,
      ...s,
    }));

    const stateObj = address.states.find(
      (s) => s.label.toLowerCase() === stateStr?.toLowerCase().trim()
    );
    if (!stateObj) return address;

    address.selectedState = stateObj;
    address.state = stateObj.label;
    address.cities = City.getCitiesOfState(
      countryObj.value,
      stateObj.value
    ).map((c) => ({
      value: c.name,
      label: c.name,
      ...c,
    }));

    const cityObj = address.cities.find(
      (c) => c.label.toLowerCase() === cityStr?.toLowerCase().trim()
    );
    if (!cityObj) {
      // If city string exists but isn't in the list, just set the string value
      address.city = cityStr || "";
      return address;
    }

    address.selectedCity = cityObj;
    address.city = cityObj.label;

    return address;
  };

  // Helper function to reset all recipient fields
  const resetRecipientFields = () => {
    setProformaInfo((prev) => ({
      ...prev,
      relatedId: "",
      companyName: "",
      mobileNumber: "",
      email: "",
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
    }));

    setIsSameAsBilling(true);

    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setStates([]);
    setCities([]);

    setSelectedShippingCountry(null);
    setSelectedShippingState(null);
    setSelectedShippingCity(null);
    setShippingStates([]);
    setShippingCities([]);
  };

  // New function to fetch and populate all recipient data
  const fetchAndPopulateRecipientData = async (id) => {
    if (!id || !proformaInfo.relatedTo || countries.length === 0) {
      return;
    }

    setIsRecipientLoading(true);
    let endpoint = "";
    let recipientData = {};

    try {
      if (proformaInfo.relatedTo === "lead") {
        endpoint = `getLeadById/${id}`;
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
      } else if (proformaInfo.relatedTo === "customer") {
        endpoint = `getCustomerById/${id}`;
        const response = await axiosInstance.get(endpoint);
        const customer = response.data;
        recipientData = {
          companyName: customer.companyName,
          email: customer.email || null,
          mobile: customer.mobile,
          gstin: customer.gstin || "",
          panNumber: customer.panNumber || "",
          // Billing
          street: customer.billingStreet,
          cityStr: customer.billingCity,
          stateStr: customer.billingState,
          countryStr: customer.billingCountry,
          zipCode: customer.billingZipCode,
          // Shipping
          shippingStreetStr: customer.shippingStreet,
          shippingCityStr: customer.shippingCity,
          shippingStateStr: customer.shippingState,
          shippingCountryStr: customer.shippingCountry,
          shippingZipCodeStr: customer.shippingZipCode,
        };
      }
      console.log("recipientData.countryStr, ", recipientData.countryStr);

      // 1. Process Billing Address
      const billingAddress = findAddressObjects(
        recipientData.countryStr,
        recipientData.stateStr,
        recipientData.cityStr
      );

      console.log("billingAddress :", billingAddress);

      // 2. Process Shipping Address (if customer)
      let shippingAddress = {};
      let isSame = true;

      if (proformaInfo.relatedTo === "customer") {
        const {
          shippingStreetStr,
          shippingCityStr,
          shippingStateStr,
          shippingCountryStr,
          shippingZipCodeStr,
          street,
          cityStr,
          stateStr,
          countryStr,
          zipCode,
        } = recipientData;

        const areDifferent =
          (shippingStreetStr || "") !== (street || "") ||
          (shippingCityStr || "") !== (cityStr || "") ||
          (shippingStateStr || "") !== (stateStr || "") ||
          (shippingCountryStr || "") !== (countryStr || "") ||
          (shippingZipCodeStr || "") !== (zipCode || "");

        if (areDifferent) {
          isSame = false;
          shippingAddress = findAddressObjects(
            shippingCountryStr,
            shippingStateStr,
            shippingCityStr
          );
        }
      }

      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.companyName;
        delete updated.email;
        delete updated.mobileNumber;
        return updated;
      });

      // 3. Set all state in one go
      setProformaInfo((prev) => ({
        ...prev,
        companyName: recipientData.companyName || "",
        email: recipientData.email || "",
        mobileNumber: recipientData.mobile || "",
        gstin: recipientData.gstin || "",
        panNumber: recipientData.panNumber || "",

        // Set billing info from processed address
        billingStreet: recipientData.street || "",
        billingZipCode: recipientData.zipCode || "",
        billingCountry: billingAddress.country,
        billingState: billingAddress.state,
        billingCity: billingAddress.city,

        // Set shipping info based on 'isSame' flag
        shippingStreet: isSame
          ? recipientData.street || ""
          : recipientData.shippingStreetStr || "",
        shippingZipCode: isSame
          ? recipientData.zipCode || ""
          : recipientData.shippingZipCodeStr || "",
        shippingCountry: isSame
          ? billingAddress.country
          : shippingAddress.country || "",
        shippingState: isSame
          ? billingAddress.state
          : shippingAddress.state || "",
        shippingCity: isSame ? billingAddress.city : shippingAddress.city || "",
      }));

      // Set Billing Selects
      setSelectedCountry(billingAddress.selectedCountry);
      setSelectedState(billingAddress.selectedState);
      setSelectedCity(billingAddress.selectedCity);
      setStates(billingAddress.states);
      setCities(billingAddress.cities);

      // Set Shipping Selects
      setIsSameAsBilling(isSame);
      if (isSame) {
        setSelectedShippingCountry(billingAddress.selectedCountry);
        setSelectedShippingState(billingAddress.selectedState);
        setSelectedShippingCity(billingAddress.selectedCity);
        setShippingStates(billingAddress.states);
        setShippingCities(billingAddress.cities);
      } else {
        setSelectedShippingCountry(shippingAddress.selectedCountry);
        setSelectedShippingState(shippingAddress.selectedState);
        setSelectedShippingCity(shippingAddress.selectedCity);
        setShippingStates(shippingAddress.states || []);
        setShippingCities(shippingAddress.cities || []);
      }
    } catch (error) {
      console.error("Failed to load recipient data:", error);
      toast.error("Could not load recipient details.");
      resetRecipientFields(); // Reset on error
    } finally {
      setIsRecipientLoading(false);
    }
  };

  // --- useEffect Hooks ---
  // Kept: Load countries on mount
  useEffect(() => {
    setCountries(
      Country.getAllCountries().map((c) => ({
        value: c.isoCode,
        label: c.name,
        ...c,
      }))
    );
    getNextProformaNumber();
  }, []);

  // Kept: Load company signature/stamp
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

        setProformaInfo((prev) => ({
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

  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = proformaContent.reduce(
      (acc, item) =>
        acc + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );

    const discountAmount = (sub * (Number(proformaInfo.discount) || 0)) / 100;
    const taxableAmount = sub - discountAmount;
    const taxRate = (Number(taxRateInput) || 0) / 100;

    const tax = taxableAmount * taxRate;
    const grandTotal = taxableAmount;

    return { subtotal: sub, taxAmount: tax, total: grandTotal };
  }, [proformaContent, proformaInfo.discount, taxRateInput]);

  // Kept: Get currency symbol
  const currencySymbol = useMemo(() => {
    switch (proformaInfo.currencyType) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return "";
    }
  }, [proformaInfo.currencyType]);

  useEffect(() => {
    setProformaInfo((prev) => ({ ...prev, totalAmount: total }));
  }, [total]);

  const getNextProformaNumber = async () => {
    try {
      const responce = await axiosInstance.get("getNextProformaNumber");
      setProformaInfo((prev) => ({
        ...prev,
        proformaInvoiceNumber: responce.data,
      }));
    } catch (error) {
      console.error("Failed to fetch max proposal number:", error);
      toast.error("Failed to fetch max proposal number.");
    }
  };

  // --- Event Handlers ---

  const handleCancel = () => {
    if (role === "ROLE_ADMIN") {
      navigate("/Proforma");
    } else if (role === "ROLE_EMPLOYEE") {
      navigate("/Employee/Proforma");
    } else {
      navigate("/login");
    }
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setProformaInfo((prev) => {
      const newState = { ...prev, [name]: value };

      if (isSameAsBilling) {
        if (name === "billingStreet") {
          newState.shippingStreet = value;
        } else if (name === "billingZipCode") {
          newState.shippingZipCode = value;
        }
      }
      return newState;
    });

    if (name === "proformaInvoiceNumber") {
      checkProformaNumberUniqueness(value);
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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
      setProformaInfo((prev) => ({
        ...prev,
        assignTo: selectedOption ? selectedOption.label : "",
        employeeId: selectedOption ? selectedOption.value : "",
      }));
    } else if (name === "relatedTo") {
      setProformaInfo((prev) => ({
        ...prev,
        relatedTo: selectedOption ? selectedOption.value : "",
      }));
      resetRecipientFields();
      setRelatedIdOptions([]);
    } else {
      setProformaInfo((prev) => ({
        ...prev,
        [name]: selectedOption ? selectedOption.value : "",
      }));
    }
  };

  const handleRelatedIdChange = (selectedOption) => {
    if (selectedOption) {
      setProformaInfo((prev) => ({
        ...prev,
        relatedId: selectedOption.value,
      }));
      fetchAndPopulateRecipientData(selectedOption.value);
    } else {
      resetRecipientFields();
    }
  };

  // NEW: Handler for "Same as Billing" checkbox
  const handleSameAsBillingChange = (e) => {
    const isChecked = e.target.checked;
    setIsSameAsBilling(isChecked);

    if (isChecked) {
      // Copy billing to shipping
      setProformaInfo((prev) => ({
        ...prev,
        shippingStreet: prev.billingStreet,
        shippingCity: prev.billingCity,
        shippingState: prev.billingState,
        shippingCountry: prev.billingCountry,
        shippingZipCode: prev.billingZipCode,
      }));
      setSelectedShippingCountry(selectedCountry);
      setSelectedShippingState(selectedState);
      setSelectedShippingCity(selectedCity);
      setShippingStates(states);
      setShippingCities(cities);
    } else {
      // Clear shipping
      setProformaInfo((prev) => ({
        ...prev,
        shippingStreet: "",
        shippingCity: "",
        shippingState: "",
        shippingCountry: "",
        shippingZipCode: "",
      }));
      setSelectedShippingCountry(null);
      setSelectedShippingState(null);
      setSelectedShippingCity(null);
      setShippingStates([]);
      setShippingCities([]);
    }
  };

  // Handler for Billing Country dropdown
  const handleBillingCountryChange = (opt) => {
    setSelectedCountry(opt);
    setSelectedState(null);
    setCities([]);
    setSelectedCity(null);

    let newStates = [];
    if (opt) {
      newStates = State.getStatesOfCountry(opt.value).map((s) => ({
        value: s.isoCode,
        label: s.name,
        ...s,
      }));
    }
    setStates(newStates);

    setProformaInfo((prev) => ({
      ...prev,
      billingCountry: opt ? opt.label : "",
      billingState: "",
      billingCity: "",
      // Conditionally set shipping fields
      ...(isSameAsBilling && {
        shippingCountry: opt ? opt.label : "",
        shippingState: "",
        shippingCity: "",
      }),
    }));

    // Conditionally update shipping selects
    if (isSameAsBilling) {
      setSelectedShippingCountry(opt);
      setSelectedShippingState(null);
      setShippingStates(newStates);
      setSelectedShippingCity(null);
      setShippingCities([]);
    }
  };

  // Handler for Billing State dropdown
  const handleBillingStateChange = (opt) => {
    setSelectedState(opt);
    setSelectedCity(null);

    let newCities = [];
    if (opt && selectedCountry) {
      newCities = City.getCitiesOfState(selectedCountry.value, opt.value).map(
        (c) => ({
          value: c.name,
          label: c.name,
          ...c,
        })
      );
    }
    setCities(newCities);

    setProformaInfo((prev) => ({
      ...prev,
      billingState: opt ? opt.label : "",
      billingCity: "",
      // Conditionally set shipping fields
      ...(isSameAsBilling && {
        shippingState: opt ? opt.label : "",
        shippingCity: "",
      }),
    }));

    // Conditionally update shipping selects
    if (isSameAsBilling) {
      setSelectedShippingState(opt);
      setSelectedShippingCity(null);
      setShippingCities(newCities);
    }
  };

  // Handler for Billing City dropdown
  const handleBillingCityChange = (opt) => {
    setSelectedCity(opt);

    setProformaInfo((prev) => ({
      ...prev,
      billingCity: opt ? opt.value : "",
      // Conditionally set shipping field
      ...(isSameAsBilling && {
        shippingCity: opt ? opt.value : "",
      }),
    }));

    // Conditionally update shipping select
    if (isSameAsBilling) {
      setSelectedShippingCity(opt);
    }
  };

  // Handler for manual shipping country change
  const handleShippingCountryChange = (opt) => {
    setSelectedShippingCountry(opt);
    setSelectedShippingState(null);
    setSelectedShippingCity(null);

    if (opt) {
      setShippingStates(
        State.getStatesOfCountry(opt.value).map((s) => ({
          value: s.isoCode,
          label: s.name,
          ...s,
        }))
      );
      setShippingCities([]);
      setProformaInfo((prev) => ({
        ...prev,
        shippingCountry: opt.label,
        shippingState: "",
        shippingCity: "",
      }));
    } else {
      setShippingStates([]);
      setShippingCities([]);
      setProformaInfo((prev) => ({
        ...prev,
        shippingCountry: "",
        shippingState: "",
        shippingCity: "",
      }));
    }
  };

  // Handler for manual shipping state change
  const handleShippingStateChange = (opt) => {
    setSelectedShippingState(opt);
    setSelectedShippingCity(null);

    if (opt && selectedShippingCountry) {
      setShippingCities(
        City.getCitiesOfState(selectedShippingCountry.value, opt.value).map(
          (c) => ({
            value: c.name,
            label: c.name,
            ...c,
          })
        )
      );
      setProformaInfo((prev) => ({
        ...prev,
        shippingState: opt.label,
        shippingCity: "",
      }));
    } else {
      setShippingCities([]);
      setProformaInfo((prev) => ({
        ...prev,
        shippingState: "",
        shippingCity: "",
      }));
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...proformaContent];
    list[index][name] = value;
    setProformaContent(list);
  };

  const handleAddItem = () => {
    setProformaContent([
      ...proformaContent,
      { item: "", description: "", quantity: 1, rate: 0, sacCode: "" },
    ]);
  };

  const handleRemoveItem = (index) => {
    const list = [...proformaContent];
    list.splice(index, 1);
    setProformaContent(list);
  };

  // --- Async/Submit Handlers ---

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
    if (isRelatedIdLoading || !proformaInfo.relatedTo) {
      return;
    }

    setIsRelatedIdLoading(true);
    let endpoint = "";
    let mappedOptions = [];

    try {
      if (proformaInfo.relatedTo === "lead") {
        endpoint = "getLeadNameAndId";
        const response = await axiosInstance.get(endpoint);
        mappedOptions = response.data.map((lead) => ({
          label: lead.clientName,
          value: lead.leadId,
        }));
      } else if (proformaInfo.relatedTo === "customer") {
        endpoint = "getCustomerListWithNameAndId";
        const response = await axiosInstance.get(endpoint);
        mappedOptions = response.data.map((customer) => ({
          label: customer.companyName,
          value: customer.id,
        }));
      }

      setRelatedIdOptions(mappedOptions);
    } catch (error) {
      console.error(`Failed to load ${proformaInfo.relatedTo} list:`, error);
      toast.error(`Failed to load ${proformaInfo.relatedTo} list.`);
    } finally {
      setIsRelatedIdLoading(false);
    }
  };

  const checkProformaNumberUniqueness = async (number) => {
    if (!number || number.trim().length === 0) {
      setErrors((prev) => ({
        ...prev,
        proformaInvoiceNumber: "Proforma Number is required",
      }));
      return;
    }
    try {
      const response = await axiosInstance.get(
        `isProformaNumberUnique/${number}`
      );
      if (response.data === false) {
        setErrors((prev) => ({
          ...prev,
          proformaInvoiceNumber:
            "This proforma number is already taken. Please choose a unique number.",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.proformaInvoiceNumber;
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Failed to check proforma number uniqueness:", error);
      toast.error("Could not verify proforma number uniqueness.");
      setErrors((prev) => ({
        ...prev,
        proformaInvoiceNumber: "Error checking uniqueness.",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Proforma Number Validation (Required & 6 digits)
    if (!proformaInfo.proformaInvoiceNumber) {
      newErrors.proformaInvoiceNumber = "Proforma Number is required";
    }

    // 2. Invoice Date Validation
    if (!proformaInfo.invoiceDate) {
      newErrors.invoiceDate = "Invoice Date is required";
    }

    // 3. Company Name Validation
    if (!proformaInfo.companyName.trim()) {
      newErrors.companyName = "Company Name is required";
    }

    // 4. Email Validation
    if (!proformaInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(proformaInfo.email)) {
      newErrors.email = "Email address is invalid";
    }

    // 5. Mobile Number Validation
    if (!proformaInfo.mobileNumber) {
      newErrors.mobileNumber = "Mobile Number is required";
    }

    const combinedErrors = { ...errors, ...newErrors };
    setErrors(combinedErrors);
    return Object.keys(combinedErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    setLoading(true);

    const formattedDueDate = proformaInfo.dueDate
      ? `${proformaInfo.dueDate}T00:00:00`
      : null;
    const formattedInvoiceDate = `${proformaInfo.invoiceDate}T00:00:00`;

    const payload = {
      proformaInvoiceInfo: {
        ...proformaInfo,
        discount: Number(proformaInfo.discount),
        totalAmount: Number(proformaInfo.totalAmount),
        proformaInvoiceDate: formattedInvoiceDate,
        dueDate: formattedDueDate,
      },
      proformaInvoiceContents: proformaContent.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        sacCode: item.sacCode || "",
      })),
    };

    try {
      await axiosInstance.post("createProformaInvoice", payload);
      console.log("Form Submitted:", payload);
      toast.success("Proforma Invoice created successfully!");
      setLoading(false);

      if (role === "ROLE_ADMIN") {
        navigate("/Proforma");
      } else if (role === "ROLE_EMPLOYEE") {
        navigate("/Employee/Proforma");
      }
    } catch (error) {
      console.error("Failed to create proforma invoice:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create proforma invoice. Please check the form."
      );
      setLoading(false);
    }
  };

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 h-[90vh] overflow-y-auto">
        <div className="p-2 bg-gray-50 border-b border-gray-200">
          {/* --- Header --- */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleCancel}
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
              Back to Proforma Invoices
            </button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Create New Proforma Invoice
              </h1>
              <p className="text-gray-600 text-sm">
                Add a new proforma invoice to your records
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
                form="createProformaForm"
                disabled={loading || isRecipientLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Proforma"}
              </button>
            </div>
          </div>
        </div>

        {/* --- Form --- */}
        <div className="h-[72vh] overflow-hidden ">
          <form
            onSubmit={handleSubmit}
            id="createProformaForm"
            className="mt-4 h-full overflow-y-auto no-scrollbar"
          >
            <div className="bg-white p-6 rounded-lg space-y-8 shadow-sm border border-gray-200">
              {/* --- Section 1: Proforma Details & Recipient (Side-by-Side) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
                {/* --- Left Column: Proforma Details --- */}
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Proforma Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormNumberInputWithPrefix
                      label="Proforma Number"
                      name="proformaInvoiceNumber"
                      prefix="P_INV-"
                      value={proformaInfo.proformaInvoiceNumber}
                      onChange={handleInfoChange}
                      required
                      error={errors.proformaInvoiceNumber}
                      minDigits={6}
                    />
                    <FormInput
                      label="Invoice Date"
                      name="invoiceDate"
                      value={proformaInfo.invoiceDate}
                      onChange={handleInfoChange}
                      type="date"
                      required
                      error={errors.invoiceDate}
                    />
                    <FormInput
                      label="Due Date"
                      name="dueDate"
                      value={proformaInfo.dueDate}
                      onChange={handleInfoChange}
                      type="date"
                    />
                    <FormSelect
                      label="Status"
                      name="status"
                      value={statusOptions.find(
                        (o) => o.value === proformaInfo.status
                      )}
                      onChange={(opt) => handleSelectChange("status", opt)}
                      options={statusOptions}
                    />
                    <FormSelect
                      label="Assign To (Optional)"
                      name="assignTo"
                      value={assignToOptions.find(
                        (o) => o.value === proformaInfo.employeeId
                      )}
                      onChange={(opt) => handleSelectChange("assignTo", opt)}
                      options={assignToOptions}
                      onMenuOpen={loadAssignToOptions}
                      isLoading={isAssignToLoading}
                      className="md:col-span-2"
                    />
                  </div>
                </div>

                {/* --- Right Column: Recipient Info --- */}
                <div className="space-y-6 mt-8 lg:mt-0 lg:border-l lg:border-gray-200 lg:pl-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Recipient Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect
                      label="Related To"
                      name="relatedTo"
                      value={relatedOptions.find(
                        (o) => o.value === proformaInfo.relatedTo
                      )}
                      onChange={(opt) => handleSelectChange("relatedTo", opt)}
                      options={relatedOptions}
                    />
                    <FormSelect
                      label="Related Lead/Customer"
                      name="relatedId"
                      value={relatedIdOptions.find(
                        (o) => o.value === proformaInfo.relatedId
                      )}
                      onChange={handleRelatedIdChange}
                      options={relatedIdOptions}
                      onMenuOpen={loadRelatedIdOptions}
                      isLoading={isRelatedIdLoading}
                      isDisabled={!proformaInfo.relatedTo}
                    />
                    <FormInput
                      label="Company Name"
                      name="companyName"
                      value={proformaInfo.companyName}
                      onChange={handleInfoChange}
                      className="md:col-span-2"
                      disabled={isRecipientLoading}
                      required
                      error={errors.companyName}
                    />
                    <FormInput
                      label="Email"
                      name="email"
                      value={proformaInfo.email}
                      onChange={handleInfoChange}
                      type="text"
                      disabled={isRecipientLoading}
                      required
                      error={errors.email}
                    />
                    <FormInput
                      label="Mobile Number"
                      name="mobileNumber"
                      value={proformaInfo.mobileNumber}
                      onChange={handleInfoChange}
                      disabled={isRecipientLoading}
                      required
                      error={errors.mobileNumber}
                    />
                    <FormInput
                      label="GSTIN"
                      name="gstin"
                      value={proformaInfo.gstin}
                      onChange={handleInfoChange}
                      disabled={isRecipientLoading}
                    />
                    <FormInput
                      label="PAN Number"
                      name="panNumber"
                      value={proformaInfo.panNumber}
                      onChange={handleInfoChange}
                      disabled={isRecipientLoading}
                    />
                  </div>
                </div>
              </div>

              {/* --- Section 2: Address Information (Side-by-Side) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 pt-8 border-t border-gray-200">
                {/* --- Billing Column --- */}
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Billing Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Billing Street Address"
                      name="billingStreet"
                      value={proformaInfo.billingStreet}
                      onChange={handleInfoChange}
                      className="md:col-span-2"
                      disabled={isRecipientLoading}
                    />
                    <FormSelect
                      label="Country"
                      name="billingCountry"
                      value={selectedCountry}
                      onChange={handleBillingCountryChange}
                      options={countries}
                      isDisabled={isRecipientLoading}
                    />
                    <FormSelect
                      label="State"
                      name="billingState"
                      value={selectedState}
                      onChange={handleBillingStateChange}
                      options={states}
                      isDisabled={!selectedCountry || isRecipientLoading}
                    />
                    <FormSelect
                      label="City"
                      name="billingCity"
                      value={selectedCity}
                      onChange={handleBillingCityChange}
                      options={cities}
                      isDisabled={!selectedState || isRecipientLoading}
                    />
                    <FormInput
                      label="Billing Zip Code"
                      name="billingZipCode"
                      value={proformaInfo.billingZipCode}
                      onChange={handleInfoChange}
                      disabled={isRecipientLoading}
                    />
                  </div>
                </div>

                {/* --- Shipping Column --- */}
                <div className="space-y-6 mt-8 lg:mt-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Shipping Address
                    </h2>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sameAsBilling"
                        checked={isSameAsBilling}
                        onChange={handleSameAsBillingChange} // <-- UPDATED
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isRecipientLoading}
                      />
                      <label
                        htmlFor="sameAsBilling"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Same as Billing
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Shipping Street Address"
                      name="shippingStreet"
                      value={proformaInfo.shippingStreet}
                      onChange={handleInfoChange}
                      disabled={isSameAsBilling || isRecipientLoading}
                      className="md:col-span-2"
                    />
                    <FormSelect
                      label="Country"
                      name="shippingCountry"
                      value={selectedShippingCountry}
                      onChange={handleShippingCountryChange} // <-- UPDATED
                      options={countries}
                      isDisabled={isSameAsBilling || isRecipientLoading}
                    />
                    <FormSelect
                      label="State"
                      name="shippingState"
                      value={selectedShippingState}
                      onChange={handleShippingStateChange} // <-- UPDATED
                      options={shippingStates}
                      isDisabled={
                        isSameAsBilling ||
                        !selectedShippingCountry ||
                        isRecipientLoading
                      }
                    />
                    <FormSelect
                      label="City"
                      name="shippingCity"
                      value={selectedShippingCity}
                      onChange={(opt) => {
                        setSelectedShippingCity(opt);
                        setProformaInfo((prev) => ({
                          ...prev,
                          shippingCity: opt ? opt.value : "",
                        }));
                      }}
                      options={shippingCities}
                      isDisabled={
                        isSameAsBilling ||
                        !selectedShippingState ||
                        isRecipientLoading
                      }
                    />
                    <FormInput
                      label="Shipping Zip Code"
                      name="shippingZipCode"
                      value={proformaInfo.shippingZipCode}
                      onChange={handleInfoChange}
                      disabled={isSameAsBilling || isRecipientLoading}
                    />
                  </div>
                </div>
              </div>

              {/* --- Section 3: Proforma Items --- */}
              <div className="pt-8 border-t border-gray-200">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Proforma Items
                  </h2>
                  <FormSelect
                    label="Currency"
                    name="currencyType"
                    value={currencyOptions.find(
                      (o) => o.value === proformaInfo.currencyType
                    )}
                    onChange={(opt) => handleSelectChange("currencyType", opt)}
                    options={currencyOptions}
                    className="w-48"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SAC Code
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
                      {proformaContent.map((item, index) => (
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
                              type="text"
                              name="sacCode"
                              value={item.sacCode}
                              onChange={(e) => handleItemChange(index, e)}
                              className="w-24 border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                              placeholder="e.g., 998314"
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

              {/* --- Section 4: Notes, Terms, & Summary --- */}
              <div className="pt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  {/* Left Column: Notes & Terms */}
                  <div className="w-full md:w-1/2 lg:flex-1 space-y-4">
                    <FormTextarea
                      label="Notes"
                      name="notes"
                      value={proformaInfo.notes}
                      onChange={handleInfoChange}
                      rows={5}
                      placeholder="Enter any notes here..."
                    />
                    <FormTextarea
                      label="Terms & Conditions"
                      name="termsAndConditions"
                      value={proformaInfo.termsAndConditions}
                      onChange={handleInfoChange}
                      rows={8}
                      placeholder="Enter terms and conditions..."
                    />
                  </div>

                  {/* Right Column: Summary */}
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
                        value={proformaInfo.discount}
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
                          (o) => o.value === proformaInfo.taxType
                        )}
                        onChange={(opt) => {
                          if (opt) {
                            handleSelectChange("taxType", opt);
                            setTaxRateInput(opt.defaultRate);
                            setProformaInfo((prev) => ({
                              ...prev,
                              taxPercentage: Number(opt.defaultRate) || 0,
                            }));
                          } else {
                            handleSelectChange("taxType", null);
                            setTaxRateInput("");
                            setProformaInfo((prev) => ({
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
                          setProformaInfo((prev) => ({
                            ...prev,
                            taxPercentage: Number(value) || 0,
                          }));
                        }}
                        disabled={proformaInfo.taxType === "No Tax"}
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

              {/* --- Section 5: Signature & Stamp --- */}
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

export default CreateProforma;
