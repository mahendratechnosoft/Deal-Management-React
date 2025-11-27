import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLayout } from "../../Layout/useLayout";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Select from "react-select";
import { City, Country, State } from "country-state-city";
import {
  FormInput,
  FormNumberInputWithPrefix,
  FormPhoneInputFloating,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";
import CustomeImageUploader from "../../BaseComponet/CustomeImageUploader";
import { hasPermission } from "../../BaseComponet/permissions";

function EditProforma() {
  const { proformaInvoiceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { LayoutComponent, role } = useLayout();

  // Media & UI States
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [stampUrl, setStampUrl] = useState(null);
  const [companyMediaLoading, setCompanyMediaLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [isRecipientLoading, setIsRecipientLoading] = useState(false);

  // Track items deleted during editing
  const [deletedItemIds, setDeletedItemIds] = useState([]);

  const canEdit = hasPermission("proformaInvoice", "Edit");
  const canDelete = hasPermission("proformaInvoice", "Delete");

  // Main Form State
  const [proformaInfo, setProformaInfo] = useState({
    proformaInvoiceId: "",
    employeeId: "",
    assignTo: "",
    proformaInvoiceNumber: "",
    currencyType: "INR",
    discount: 0,
    taxType: "GST",
    taxPercentage: 18,
    dueDate: "",
    invoiceDate: "",
    totalAmount: 0,
    paidAmount: 0,
    status: "Unpaid",
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

  const hasPayments = (Number(proformaInfo.paidAmount) || 0) > 0;
  const isFormEditable = canEdit && !hasPayments;

  console.log("isFormEditable", isFormEditable);

  const [isSameAsBilling, setIsSameAsBilling] = useState(false);
  const [proformaContent, setProformaContent] = useState([]);

  // Address Select Options
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [shippingStates, setShippingStates] = useState([]);
  const [shippingCities, setShippingCities] = useState([]);

  // Selected Objects for React-Select
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [selectedShippingCountry, setSelectedShippingCountry] = useState(null);
  const [selectedShippingState, setSelectedShippingState] = useState(null);
  const [selectedShippingCity, setSelectedShippingCity] = useState(null);

  // Other Select Options
  const [taxRateInput, setTaxRateInput] = useState("18");
  const [assignToOptions, setAssignToOptions] = useState([]);
  const [isAssignToLoading, setIsAssignToLoading] = useState(false);
  const [relatedIdOptions, setRelatedIdOptions] = useState([]);
  const [isRelatedIdLoading, setIsRelatedIdLoading] = useState(false);

  // Static Options
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
  const currencyOptions = [
    { value: "INR", label: "INR" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ];

  //Helper: Find Address Objects
  const findAddressObjects = (
    countryStr,
    stateStr,
    cityStr,
    allCountriesList
  ) => {
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

    const countryObj = allCountriesList.find(
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

    if (cityObj) {
      address.selectedCity = cityObj;
      address.city = cityObj.label;
    } else {
      address.city = cityStr;
    }

    return address;
  };

  //Data Population Effect ---
  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true);
      try {
        // A. Load Countries First
        const allCountries = Country.getAllCountries().map((c) => ({
          value: c.isoCode,
          label: c.name,
          ...c,
        }));
        setCountries(allCountries);

        // B. Fetch Invoice Data
        if (!proformaInvoiceId) return;
        const response = await axiosInstance.get(
          `getProformaInvoiceById/${proformaInvoiceId}`
        );
        const { proformaInvoiceInfo, proformaInvoiceContents } = response.data;

        // C. Resolve Addresses
        const billingObj = findAddressObjects(
          proformaInvoiceInfo.billingCountry,
          proformaInvoiceInfo.billingState,
          proformaInvoiceInfo.billingCity,
          allCountries
        );

        // Determine if Shipping is same as Billing
        const isAddressSame =
          proformaInvoiceInfo.shippingStreet ===
            proformaInvoiceInfo.billingStreet &&
          proformaInvoiceInfo.shippingCountry ===
            proformaInvoiceInfo.billingCountry &&
          proformaInvoiceInfo.shippingState ===
            proformaInvoiceInfo.billingState &&
          proformaInvoiceInfo.shippingCity ===
            proformaInvoiceInfo.billingCity &&
          proformaInvoiceInfo.shippingZipCode ===
            proformaInvoiceInfo.billingZipCode;

        setIsSameAsBilling(isAddressSame);

        let shippingObj = {};
        if (isAddressSame) {
          shippingObj = { ...billingObj };
        } else {
          shippingObj = findAddressObjects(
            proformaInvoiceInfo.shippingCountry,
            proformaInvoiceInfo.shippingState,
            proformaInvoiceInfo.shippingCity,
            allCountries
          );
        }

        // D. Set Dropdown Options & Selections
        setSelectedCountry(billingObj.selectedCountry);
        setStates(billingObj.states);
        setSelectedState(billingObj.selectedState);
        setCities(billingObj.cities);
        setSelectedCity(billingObj.selectedCity);

        setSelectedShippingCountry(shippingObj.selectedCountry);
        setShippingStates(shippingObj.states || []);
        setSelectedShippingState(shippingObj.selectedState);
        setShippingCities(shippingObj.cities || []);
        setSelectedShippingCity(shippingObj.selectedCity);

        // E. Tax Logic
        setTaxRateInput(String(proformaInvoiceInfo.taxPercentage || 0));

        // F. Set Main State
        setProformaInfo({
          ...proformaInvoiceInfo,
          invoiceDate:
            proformaInvoiceInfo.proformaInvoiceDate?.split("T")[0] || "",
          dueDate: proformaInvoiceInfo.dueDate?.split("T")[0] || "",
        });

        // G. Set Content
        setProformaContent(proformaInvoiceContents || []);

        // H. Initial Load of Related Options (to show correct label)
        if (proformaInvoiceInfo.relatedTo && proformaInvoiceInfo.relatedId) {
          let endpoint =
            proformaInvoiceInfo.relatedTo === "lead"
              ? "getLeadNameAndId"
              : "getCustomerListWithNameAndId";
          try {
            const relRes = await axiosInstance.get(endpoint);
            const mapped = relRes.data.map((item) => ({
              label: item.clientName || item.companyName,
              value: item.leadId || item.id,
            }));
            setRelatedIdOptions(mapped);
          } catch (e) {
            console.error("Error loading initial related options", e);
          }
        }

        // I. Initial Load of Assign To Options
        if (proformaInvoiceInfo.employeeId) {
          try {
            const empRes = await axiosInstance.get("getEmployeeNameAndId");
            setAssignToOptions(
              empRes.data.map((emp) => ({
                label: emp.name,
                value: emp.employeeId,
              }))
            );
          } catch (e) {
            console.error("Error loading employee options", e);
          }
        }
      } catch (error) {
        console.error("Error loading proforma:", error);
        toast.error("Failed to load invoice details");
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [proformaInvoiceId]);

  // Kept: Load company signature/stamp
  useEffect(() => {
    const fetchCompanyMedia = async () => {
      if (!role) {
        setCompanyMediaLoading(false);
        return;
      }
      setCompanyMediaLoading(true);
      let endpoint = role === "ROLE_ADMIN" ? "getAdminInfo" : "getEmployeeInfo";
      if (role !== "ROLE_ADMIN" && role !== "ROLE_EMPLOYEE") {
        setCompanyMediaLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(endpoint);
        const data = response.data;
        let sigData =
          role === "ROLE_ADMIN"
            ? data.companySignature
            : data.admin
            ? data.admin.companySignature
            : null;
        let stampData =
          role === "ROLE_ADMIN"
            ? data.companyStamp
            : data.admin
            ? data.admin.companyStamp
            : null;

        if (sigData) setSignatureUrl(`data:;base64,${sigData}`);
        if (stampData) setStampUrl(`data:;base64,${stampData}`);

        console.log("Signature URL:", signatureUrl);
        console.log("Stamp URL:", stampUrl);

        setProformaInfo((prev) => ({
          ...prev,
          companySignature: sigData || "",
          companyStamp: stampData || "",
        }));
      } catch (error) {
        console.error("Failed to load company media:", error);
      } finally {
        setCompanyMediaLoading(false);
      }
    };
    fetchCompanyMedia();
  }, [role]);

  // Calculations
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
    const grandTotal = taxableAmount + tax;
    return { subtotal: sub, taxAmount: tax, total: grandTotal };
  }, [proformaContent, proformaInfo.discount, taxRateInput]);

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

  // --- Handlers (Synced with CreateProforma) ---

  const handleCancel = () => {
    if (role === "ROLE_ADMIN") navigate("/Proforma");
    else if (role === "ROLE_EMPLOYEE") navigate("/Employee/Proforma");
    else navigate("/login");
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setProformaInfo((prev) => {
      const newState = { ...prev, [name]: value };
      // Sync Shipping if Checked
      if (isSameAsBilling) {
        if (name === "billingStreet") newState.shippingStreet = value;
        else if (name === "billingZipCode") newState.shippingZipCode = value;
      }
      return newState;
    });
    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const handlePhoneChange = (fieldName, phone) => {
    setProformaInfo((prev) => ({
      ...prev,
      [fieldName]: phone,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    if (name === "assignTo") {
      setProformaInfo((prev) => ({
        ...prev,
        assignTo: selectedOption?.label || "",
        employeeId: selectedOption?.value || "",
      }));
    } else if (name === "relatedTo") {
      // In Edit, changing Related To clears the related ID
      setProformaInfo((prev) => ({
        ...prev,
        relatedTo: selectedOption?.value || "",
        relatedId: "",
      }));
      setRelatedIdOptions([]);
      resetRecipientFields();
    } else {
      setProformaInfo((prev) => ({
        ...prev,
        [name]: selectedOption?.value || "",
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

      // 1. Process Billing Address
      const billingAddress = findAddressObjects(
        recipientData.countryStr,
        recipientData.stateStr,
        recipientData.cityStr,
        countries
      );

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
            shippingCityStr,
            countries
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

  // --- Address Handlers (Synced) ---

  const handleSameAsBillingChange = (e) => {
    const isChecked = e.target.checked;
    setIsSameAsBilling(isChecked);

    if (isChecked) {
      // Copy Billing -> Shipping State
      setProformaInfo((prev) => ({
        ...prev,
        shippingStreet: prev.billingStreet,
        shippingCity: prev.billingCity,
        shippingState: prev.billingState,
        shippingCountry: prev.billingCountry,
        shippingZipCode: prev.billingZipCode,
      }));
      // Copy Dropdown Objects
      setSelectedShippingCountry(selectedCountry);
      setSelectedShippingState(selectedState);
      setSelectedShippingCity(selectedCity);
      setShippingStates(states);
      setShippingCities(cities);
    } else {
      // Reset Shipping (Optional: You can leave data or clear it.
      // CreateProforma clears it, so we clear it here for sync)
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

  const handleBillingCountryChange = (opt) => {
    setSelectedCountry(opt);
    setSelectedState(null);
    setCities([]);
    setSelectedCity(null);

    let newStates = opt
      ? State.getStatesOfCountry(opt.value).map((s) => ({
          value: s.isoCode,
          label: s.name,
          ...s,
        }))
      : [];
    setStates(newStates);

    setProformaInfo((prev) => ({
      ...prev,
      billingCountry: opt ? opt.label : "",
      billingState: "",
      billingCity: "",
      ...(isSameAsBilling && {
        shippingCountry: opt ? opt.label : "",
        shippingState: "",
        shippingCity: "",
      }),
    }));

    if (isSameAsBilling) {
      setSelectedShippingCountry(opt);
      setSelectedShippingState(null);
      setShippingStates(newStates);
      setSelectedShippingCity(null);
      setShippingCities([]);
    }
  };

  const handleBillingStateChange = (opt) => {
    setSelectedState(opt);
    setSelectedCity(null);

    let newCities =
      opt && selectedCountry
        ? City.getCitiesOfState(selectedCountry.value, opt.value).map((c) => ({
            value: c.name,
            label: c.name,
            ...c,
          }))
        : [];
    setCities(newCities);

    setProformaInfo((prev) => ({
      ...prev,
      billingState: opt ? opt.label : "",
      billingCity: "",
      ...(isSameAsBilling && {
        shippingState: opt ? opt.label : "",
        shippingCity: "",
      }),
    }));

    if (isSameAsBilling) {
      setSelectedShippingState(opt);
      setSelectedShippingCity(null);
      setShippingCities(newCities);
    }
  };

  const handleBillingCityChange = (opt) => {
    setSelectedCity(opt);
    setProformaInfo((prev) => ({
      ...prev,
      billingCity: opt ? opt.value : "",
      ...(isSameAsBilling && { shippingCity: opt ? opt.value : "" }),
    }));
    if (isSameAsBilling) setSelectedShippingCity(opt);
  };

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

  const handleShippingStateChange = (opt) => {
    setSelectedShippingState(opt);
    setSelectedShippingCity(null);
    if (opt && selectedShippingCountry) {
      setShippingCities(
        City.getCitiesOfState(selectedShippingCountry.value, opt.value).map(
          (c) => ({ value: c.name, label: c.name, ...c })
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

  // --- Content Handlers ---
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
    const itemToRemove = list[index];

    // If item exists in DB (has ID), mark for deletion
    if (itemToRemove.proformaInvoiceContentId) {
      setDeletedItemIds((prev) => [
        ...prev,
        itemToRemove.proformaInvoiceContentId,
      ]);
    }

    list.splice(index, 1);
    setProformaContent(list);
  };

  const handleImageUpload = (file, fieldName) => {
    if (!file) {
      setProformaInfo((prev) => ({ ...prev, [fieldName]: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];

      setProformaInfo((prev) => ({
        ...prev,
        [fieldName]: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  // --- Loaders ---
  const loadAssignToOptions = async () => {
    if (isAssignToLoading || assignToOptions.length > 0) return;
    setIsAssignToLoading(true);
    try {
      const response = await axiosInstance.get("getEmployeeNameAndId");
      setAssignToOptions(
        response.data.map((emp) => ({ label: emp.name, value: emp.employeeId }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsAssignToLoading(false);
    }
  };

  const loadRelatedIdOptions = async () => {
    if (
      isRelatedIdLoading ||
      !proformaInfo.relatedTo ||
      relatedIdOptions.length > 0
    )
      return;
    setIsRelatedIdLoading(true);
    let endpoint =
      proformaInfo.relatedTo === "lead"
        ? "getLeadNameAndId"
        : "getCustomerListWithNameAndId";
    try {
      const response = await axiosInstance.get(endpoint);
      setRelatedIdOptions(
        response.data.map((item) => ({
          label: item.clientName || item.companyName,
          value: item.leadId || item.id,
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsRelatedIdLoading(false);
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
    if (
      !proformaInfo.mobileNumber ||
      proformaInfo.mobileNumber.toString().length < 5
    ) {
      newErrors.mobileNumber = "Mobile Number is required";
    }

    const combinedErrors = { ...errors, ...newErrors };
    Object.keys(combinedErrors).forEach((key) => {
      if (!combinedErrors[key]) {
        delete combinedErrors[key];
      }
    });

    setErrors(combinedErrors);
    return Object.keys(combinedErrors).length === 0;
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    setLoading(true);
    try {
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
          proformaInvoiceContentId: item.proformaInvoiceContentId || null, // Null for new items
          proformaInvoiceId: proformaInfo.proformaInvoiceId,
          item: item.item,
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          sacCode: item.sacCode || "",
        })),
      };

      await axiosInstance.put("updateProformaInvoice", payload);
      if (deletedItemIds.length > 0) {
        await axiosInstance.delete("deleteProformaInvoiceContent", {
          data: deletedItemIds,
        });
      }
      toast.success("Proforma Invoice updated successfully!");

      if (role === "ROLE_ADMIN") navigate("/Proforma");
      else if (role === "ROLE_EMPLOYEE") navigate("/Employee/Proforma");
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error(error.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 h-[90vh] overflow-y-auto">
        <div className="p-2 bg-gray-50 border-b border-gray-200">
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
                Edit Proforma Invoice
              </h1>
              <p className="text-gray-600 text-sm">
                Update existing proforma details
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
              {isFormEditable && (
                <button
                  type="submit"
                  form="editProformaForm"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Proforma"}
                </button>
              )}
            </div>
          </div>
        </div>

        {hasPayments && !isFetching && (
          <div className="mt-4 mx-2 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Editing Disabled:</strong> This Proforma Invoice
                  cannot be modified because a payment of{" "}
                  <span className="font-bold">
                    {currencySymbol}
                    {proformaInfo.paidAmount}
                  </span>{" "}
                  has already been recorded.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- Form --- */}
        <div
          className={`h-[72vh] overflow-hidden ${
            !isFormEditable
              ? "disabled-form pointer-events-none opacity-60"
              : ""
          }`}
        >
          {isFetching ? (
            <div className="mt-4 h-full overflow-hidden animate-pulse bg-white p-6 rounded-lg border border-gray-200 space-y-8">
              {/* Skeleton: Details & Recipient */}
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
                <div className="space-y-6">
                  <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded md:col-span-2"></div>
                  </div>
                </div>
                <div className="space-y-6 mt-8 lg:mt-0 lg:border-l lg:border-gray-200 lg:pl-8">
                  <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded md:col-span-2"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Skeleton: Addresses */}
              <div className="pt-8 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Skeleton: Table */}
              <div className="pt-8 border-t border-gray-100">
                <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-12 bg-gray-50 rounded w-full mb-2"></div>
                <div className="h-12 bg-gray-50 rounded w-full mb-2"></div>
                <div className="h-12 bg-gray-50 rounded w-full"></div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              id="editProformaForm"
              className="mt-4 h-full overflow-y-auto no-scrollbar"
            >
              <div className="bg-white p-6 rounded-lg space-y-8 shadow-sm border border-gray-200">
                {/* Section 1: Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8">
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
                        onChange={() => {}}
                        disabled={true}
                        className="cursor-not-allowed"
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
                        label="Assign To (Optional)"
                        name="assignTo"
                        value={assignToOptions.find(
                          (o) => o.value === proformaInfo.employeeId
                        )}
                        onChange={(opt) => handleSelectChange("assignTo", opt)}
                        options={assignToOptions}
                        onMenuOpen={loadAssignToOptions}
                        isLoading={isAssignToLoading}
                      />
                    </div>
                  </div>

                  {/* Section 1b: Recipient */}
                  <div className="space-y-6 mt-8 lg:mt-0 lg:border-l lg:border-gray-200 lg:pl-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                      Recipient Information
                      <span
                        className={`ml-2 inline-block px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                          proformaInfo.status === "Paid"
                            ? "bg-green-100 text-green-600"
                            : proformaInfo.status === "Partially Paid"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {proformaInfo.status?.toUpperCase()}
                      </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* <FormSelect
                        label="Related To"
                        name="relatedTo"
                        value={relatedOptions.find(
                          (o) => o.value === proformaInfo.relatedTo
                        )}
                        onChange={(opt) => handleSelectChange("relatedTo", opt)}
                        options={relatedOptions}
                      /> */}
                      <FormSelect
                        label="Customer"
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
                        // className="md:col-span-2"
                        required
                        error={errors.companyName}
                      />
                      <FormInput
                        label="Email"
                        name="email"
                        value={proformaInfo.email}
                        onChange={handleInfoChange}
                        type="text"
                        required
                        error={errors.email}
                      />
                      <FormPhoneInputFloating
                        label="Mobile Number"
                        name="mobileNumber"
                        value={proformaInfo.mobileNumber}
                        onChange={(phone) =>
                          handlePhoneChange("mobileNumber", phone)
                        }
                        error={errors.mobileNumber}
                        background="white"
                      />
                      <FormInput
                        label="GSTIN"
                        name="gstin"
                        value={proformaInfo.gstin}
                        onChange={handleInfoChange}
                      />
                      <FormInput
                        label="PAN Number"
                        name="panNumber"
                        value={proformaInfo.panNumber}
                        onChange={handleInfoChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Address */}
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 pt-8 border-t border-gray-200">
                  {/* Billing */}
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
                      />
                      <FormSelect
                        label="Country"
                        name="billingCountry"
                        value={selectedCountry}
                        onChange={handleBillingCountryChange}
                        options={countries}
                      />
                      <FormSelect
                        label="State"
                        name="billingState"
                        value={selectedState}
                        onChange={handleBillingStateChange}
                        options={states}
                        isDisabled={!selectedCountry}
                      />
                      <FormSelect
                        label="City"
                        name="billingCity"
                        value={selectedCity}
                        onChange={handleBillingCityChange}
                        options={cities}
                        isDisabled={!selectedState}
                      />
                      <FormInput
                        label="Billing Zip Code"
                        name="billingZipCode"
                        value={proformaInfo.billingZipCode}
                        onChange={handleInfoChange}
                      />
                    </div>
                  </div>

                  {/* Shipping */}
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
                          onChange={handleSameAsBillingChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                        disabled={isSameAsBilling}
                        className="md:col-span-2"
                      />
                      <FormSelect
                        label="Country"
                        name="shippingCountry"
                        value={selectedShippingCountry}
                        onChange={handleShippingCountryChange}
                        options={countries}
                        isDisabled={isSameAsBilling}
                      />
                      <FormSelect
                        label="State"
                        name="shippingState"
                        value={selectedShippingState}
                        onChange={handleShippingStateChange}
                        options={shippingStates}
                        isDisabled={isSameAsBilling || !selectedShippingCountry}
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
                        isDisabled={isSameAsBilling || !selectedShippingState}
                      />
                      <FormInput
                        label="Shipping Zip Code"
                        name="shippingZipCode"
                        value={proformaInfo.shippingZipCode}
                        onChange={handleInfoChange}
                        disabled={isSameAsBilling}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Items */}
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
                      onChange={(opt) =>
                        handleSelectChange("currencyType", opt)
                      }
                      options={currencyOptions}
                      className="w-48"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/4">
                            Item
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/4">
                            Description
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            SAC Code
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Rate ({currencySymbol})
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-50 divide-y divide-gray-200">
                        {proformaContent.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-2 py-2 align-top">
                              <textarea
                                type="text"
                                name="item"
                                value={item.item}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-full border border-gray-300 rounded-md 
                                         sm:text-sm px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 
                                         focus:ring-blue-500 transition-colors min-h-[40px]"
                                placeholder="Item Name"
                              />
                            </td>
                            <td className="px-2 py-2 align-top">
                              <textarea
                                type="text"
                                name="description"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-full border border-gray-300 rounded-md 
                                         sm:text-sm px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 
                                         focus:ring-blue-500 transition-colors min-h-[40px]"
                                placeholder="Description"
                              />
                            </td>
                            <td className="px-2 py-2 align-top">
                              <input
                                type="text"
                                name="sacCode"
                                value={item.sacCode}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-20 border border-gray-300 rounded-lg shadow-sm sm:text-sm 
                                        px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 
                                        focus:ring-blue-500 transition-colors"
                                placeholder="SAC"
                              />
                            </td>
                            <td className="px-2 py-2 align-top">
                              <input
                                type="number"
                                name="quantity"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-20 border border-gray-300 rounded-lg shadow-sm sm:text-sm 
                                        px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 
                                        focus:ring-blue-500 transition-colors"
                                min="1"
                              />
                            </td>
                            <td className="px-2 py-2 align-top">
                              <input
                                type="number"
                                name="rate"
                                value={item.rate}
                                onChange={(e) => handleItemChange(index, e)}
                                className="w-20 border border-gray-300 rounded-lg shadow-sm sm:text-sm 
                                        px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 
                                        focus:ring-blue-500 transition-colors"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 font-medium align-top">
                              {currencySymbol}
                              {(item.quantity * item.rate).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-center align-top">
                              <button
                                className={`${
                                  canDelete ? "allow-click" : ""
                                } text-red-600 hover:text-red-900 font-medium transition-colors 
      duration-200 flex items-center gap-1 text-xs
      ${
        proformaContent.length === 1 || !canDelete
          ? "pointer-events-none opacity-50"
          : ""
      }`}
                                onClick={() => handleRemoveItem(index)}
                                title="Remove Item"
                                type="button"
                                disabled={proformaContent.length === 1}
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
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Add New Item
                  </button>
                </div>

                {/* Section 4: Summary */}
                <div className="pt-8 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="w-full md:w-1/2 lg:flex-1 space-y-4">
                      <FormTextarea
                        label="Notes"
                        name="notes"
                        value={proformaInfo.notes}
                        onChange={handleInfoChange}
                        rows={5}
                      />
                      <FormTextarea
                        label="Terms & Conditions"
                        name="termsAndConditions"
                        value={proformaInfo.termsAndConditions}
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
                          value={proformaInfo.discount}
                          onChange={(e) => {
                            let value = parseFloat(e.target.value);
                            if (value > 100) e.target.value = "100";
                            if (value < 0) e.target.value = "0";
                            handleInfoChange(e);
                          }}
                          className="w-20 border border-gray-300 rounded-lg shadow-sm sm:text-sm 
                                        px-1 py-1 outline-none focus:border-blue-500 focus:ring-1 
                                        focus:ring-blue-500 transition-colors"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <Select
                          value={taxOptions.find(
                            (o) => o.value === proformaInfo.taxType
                          )}
                          onChange={(opt) => {
                            handleSelectChange("taxType", opt);
                            if (opt) setTaxRateInput(String(opt.defaultRate));
                            else setTaxRateInput("0");
                            setProformaInfo((p) => ({
                              ...p,
                              taxPercentage: opt ? opt.defaultRate : 0,
                            }));
                          }}
                          options={taxOptions}
                        />
                        <FormInput
                          label="Tax %"
                          name="taxRateInput"
                          type="number"
                          value={taxRateInput}
                          onChange={(e) => {
                            setTaxRateInput(e.target.value);
                            setProformaInfo((p) => ({
                              ...p,
                              taxPercentage: Number(e.target.value) || 0,
                            }));
                          }}
                          disabled={proformaInfo.taxType === "No Tax"}
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

                {/* Section 5: Signature */}
                <div className="pt-8 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Signature & Stamp
                  </h2>

                  {/* Loading State Wrapper */}
                  {companyMediaLoading ? (
                    <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <span className="text-gray-500">
                        Loading Company Media...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Signature Uploader */}
                      <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Authorized Signature
                        </label>
                        <CustomeImageUploader
                          initialBase64={proformaInfo.companySignature}
                          onFileChange={(file) =>
                            handleImageUpload(file, "companySignature")
                          }
                        />
                      </div>

                      {/* Stamp Uploader */}
                      <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company Stamp
                        </label>
                        <CustomeImageUploader
                          initialBase64={proformaInfo.companyStamp}
                          onFileChange={(file) =>
                            handleImageUpload(file, "companyStamp")
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-6" />
            </form>
          )}
        </div>
      </div>
    </LayoutComponent>
  );
}

export default EditProforma;
