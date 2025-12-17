import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
} from "../../BaseComponet/CustomerFormInputs";

function CreateAmcModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [activeTab, setActiveTab] = useState("client"); // Tab state
  const [selectedClientId, setSelectedClientId] = useState(""); // Track selected client ID
  const [tabErrors, setTabErrors] = useState({}); // Track which tabs have errors
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  // Refs for focusing on error fields
  const errorFieldRefs = useRef({});

  // Main form state matching API structure
  // Main form state matching API structure
  const [formData, setFormData] = useState({
    // AMC Info (always required)
    amcInfo: {
      adminId: null,
      employeeId: null,
      clinetName: "",
      companyName: "",
      contactPersonName: "",
      email: "",
      phoneNumber: "",
      websiteURL: "",
      technology: "",
      hostingProvider: "",
      domainProvider: "",
      assingedTo: "",
    },

    // AMC History Info (optional - can be null)
    amcHistoryInfo: {
      amcStartDate: "",
      amcEndDate: "",
      amcAmount: "",
      amcScope: "",
      amcRecycleType: "",
      sequence: 1,
      paid: false,
    },

    // AMC Domain History Info (optional - can be null)
    amcDomainHistoryInfo: {
      domainStartDate: "",
      domainRenewalDate: "",
      domainAmount: "",
      domainRenewalCycle: "",
      sequence: 1,
      paid: false,
    },

    gsuiteDetails: {
      domainName: "",
      platform: "",
      gsuitStartDate: "",
      gsuitRenewalDate: "",
      adminEmail: "",
      adminPassword: "",
      totalLicenses: "",
      gsuitAmount: "",
      paidBy: "ADMIN",
      purchasedViaReseller: false,
      resellerName: "",
      gsuitRenewalCycle: null,
      sequence: 1,
      paid: false,
    },
  });

  const [errors, setErrors] = useState({});

  // Options for dropdowns
  const recycleTypeOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Half-Yearly", label: "Half-Yearly" },
    { value: "Yearly", label: "Yearly" },
    { value: "2 Years", label: "2 Years" },
  ];

  const domainRenewalOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Half-Yearly", label: "Half-Yearly" },
    { value: "1 Year", label: "1 Year" },
    { value: "2 Years", label: "2 Years" },
    { value: "3 Years", label: "3 Years" },
  ];

  const technologyOptions = [
    { value: "Java Spring Boot", label: "Java Spring Boot" },
    { value: "Node.js", label: "Node.js" },
    { value: "Python Django", label: "Python Django" },
    { value: "React.js", label: "React.js" },
    { value: "Angular", label: "Angular" },
    { value: "PHP Laravel", label: "PHP Laravel" },
    { value: ".NET Core", label: ".NET Core" },
    { value: "Ruby on Rails", label: "Ruby on Rails" },
    { value: "Wix", label: "Wix" },
    { value: "WordPress", label: "WordPress" },
    { value: "Shopify", label: "Shopify" },
    { value: "Other", label: "Other" },
  ];

  const hostingProviderOptions = [
    { value: "Wix", label: "Wix" },
    { value: "AWS", label: "AWS" },
    { value: "Azure", label: "Microsoft Azure" },
    { value: "Google Cloud", label: "Google Cloud" },
    { value: "Digital Ocean", label: "Digital Ocean" },
    { value: "Hostinger", label: "Hostinger" },
    { value: "Bluehost", label: "Bluehost" },
    { value: "GoDaddy", label: "GoDaddy" },
    { value: "Other", label: "Other" },
  ];

  const domainProviderOptions = [
    { value: "Wix", label: "Wix" },
    { value: "Hostinger", label: "Hostinger" },
    { value: "GoDaddy", label: "GoDaddy" },
    { value: "Namecheap", label: "Namecheap" },
    { value: "Google Domains", label: "Google Domains" },
    { value: "Cloudflare", label: "Cloudflare" },
    { value: "Name.com", label: "Name.com" },
    { value: "Other", label: "Other" },
  ];

  // NEW: GSuite options
  const paidByOptions = [
    { value: "ADMIN", label: "Paid by Admin" },
    { value: "CLIENT", label: "Paid by Client" },
  ];

  const gsuiteRenewalCycleOptions = [
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "YEARLY", label: "Yearly" },
    { value: "2_YEARS", label: "2 Years" },
    { value: "3_YEARS", label: "3 Years" },
  ];

  const platformOptions = [
    { value: "Google Workspace", label: "Google Workspace" },
    { value: "Hostinger", label: "Hostinger" },
    { value: "Godaddy", label: "Godaddy" },
    { value: "Microsoft 365", label: "Microsoft 365" },
    { value: "Zoho Workplace", label: "Zoho Workplace" },
  ];

  // Tabs configuration - ADDED 'gsuite' tab
  const tabs = [
    {
      id: "client",
      label: "Client Information",
      fields: ["companyName", "contactPersonName", "email", "phoneNumber"],
    },
    {
      id: "technical",
      label: "Technical Information",
      fields: ["technology", "assingedTo"],
    },
    {
      id: "amc",
      label: "AMC Details",
      fields: ["amcStartDate", "amcEndDate", "amcAmount", "amcScope"],
    },
    {
      id: "domain",
      label: "Domain Details",
      fields: ["domainStartDate", "domainRenewalDate", "domainAmount"],
    },
    {
      id: "gsuite",
      label: "GSuite Details",
      fields: ["domainName", "adminEmail", "totalLicenses", "gsuitAmount"],
    }, // NEW
  ];

  // Required fields configuration - ADDED gsuite fields
  // Required fields configuration - UPDATE AMC and Domain to be optional
  const requiredFields = {
    amcInfo: {
      companyName: true,
      contactPersonName: true,
      email: true,
      phoneNumber: true,
      technology: true,
      assingedTo: true,
    },
    amcHistoryInfo: {
      amcStartDate: false, // Changed from true to false
      amcEndDate: false, // Changed from true to false
      amcAmount: false, // Changed from true to false
      amcScope: false, // Changed from true to false
    },
    amcDomainHistoryInfo: {
      domainStartDate: false, // Changed from true to false
      domainRenewalDate: false, // Changed from true to false
      domainAmount: false, // Changed from true to false
    },
    gsuiteDetails: {
      domainName: false,
      adminEmail: false,
      totalLicenses: false,
      gsuitAmount: false,
    },
  };

  // Fetch employees and clients on component mount
  useEffect(() => {
    fetchEmployees();
    fetchClients();
  }, []);

  // Update tab errors when errors change
  useEffect(() => {
    const newTabErrors = {};

    tabs.forEach((tab) => {
      const hasError = tab.fields.some((field) => {
        if (tab.id === "client" || tab.id === "technical") {
          return errors[`amcInfo.${field}`];
        } else if (tab.id === "amc") {
          return errors[`amcHistoryInfo.${field}`];
        } else if (tab.id === "domain") {
          return errors[`amcDomainHistoryInfo.${field}`];
        } else if (tab.id === "gsuite") {
          return errors[`gsuiteDetails.${field}`];
        }
        return false;
      });

      newTabErrors[tab.id] = hasError;
    });

    setTabErrors(newTabErrors);
  }, [errors]);

  // Auto-calculate GSuite renewal date
  useEffect(() => {
    if (
      formData.gsuiteDetails.gsuitStartDate &&
      formData.gsuiteDetails.gsuitRenewalCycle
    ) {
      const renewalDate = calculateGSuiteRenewalDate(
        formData.gsuiteDetails.gsuitStartDate,
        formData.gsuiteDetails.gsuitRenewalCycle
      );
      if (
        renewalDate &&
        renewalDate !== formData.gsuiteDetails.gsuitRenewalDate
      ) {
        handleChange("gsuiteDetails", "gsuitRenewalDate", renewalDate);
      }
    }
  }, [
    formData.gsuiteDetails.gsuitStartDate,
    formData.gsuiteDetails.gsuitRenewalCycle,
  ]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await axiosInstance.get("getEmployeeNameAndId");
      if (response.data && Array.isArray(response.data)) {
        const formattedEmployees = response.data.map((emp) => ({
          value: emp.employeeId || emp.id,
          label: emp.name,
        }));
        setEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await axiosInstance.get("getCustomerListWithNameAndId");
      if (response.data && Array.isArray(response.data)) {
        setClients(response.data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoadingClients(false);
    }
  };

  // Fetch customer details by ID
  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axiosInstance.get(`getCustomerById/${customerId}`);
      if (response.data) {
        const customer = response.data;
        return {
          contactPersonName: "",
          email: customer.email || "",
          phoneNumber: customer.mobile || customer.phone || "",
          websiteURL: customer.website || "",
          companyName: customer.companyName || "",
        };
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
    return null;
  };

  // Handle form field changes
  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Clear error for this field if exists
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`${section}.${field}`]: "",
      }));
    }
  };

  // Handle phone number with country code
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Remove non-numeric characters except plus sign
    const cleanedValue = value.replace(/[^\d+]/g, "");

    // Ensure it starts with country code if not already
    let formattedValue = cleanedValue;
    if (!formattedValue.startsWith("+91") && !formattedValue.startsWith("+")) {
      formattedValue = "+91" + formattedValue;
    } else if (
      formattedValue.startsWith("+") &&
      !formattedValue.startsWith("+91")
    ) {
      // If starts with different country code, keep it
      formattedValue = formattedValue;
    }

    handleChange("amcInfo", "phoneNumber", formattedValue);
  };

  // Handle client selection - auto-fill client details
  const handleClientChange = async (clientId) => {
    setSelectedClientId(clientId);

    if (!clientId) {
      setFormData((prev) => ({
        ...prev,
        amcInfo: {
          ...prev.amcInfo,
          clinetName: "",
          companyName: "",
          contactPersonName: "",
          email: "",
          phoneNumber: "",
          websiteURL: "",
          employeeId: "",
        },
      }));
      return;
    }

    try {
      const customerDetails = await fetchCustomerDetails(clientId);

      if (customerDetails) {
        const selectedClient = clients.find((client) => client.id === clientId);

        setFormData((prev) => ({
          ...prev,
          amcInfo: {
            ...prev.amcInfo,
            clinetName: selectedClient?.companyName || "",
            companyName: selectedClient?.companyName || "",
            contactPersonName: customerDetails.contactPersonName || "",
            email: customerDetails.email || "",
            phoneNumber: customerDetails.phoneNumber || "",
            websiteURL: customerDetails.websiteURL || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error handling client change:", error);
    }
  };

  // Calculate AMC end date
  const calculateAmcEndDate = (startDate, recycleType) => {
    if (!startDate) return "";

    const date = new Date(startDate);

    switch (recycleType) {
      case "Monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "Quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "Half-Yearly":
        date.setMonth(date.getMonth() + 6);
        break;
      case "Yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      case "2 Years":
        date.setFullYear(date.getFullYear() + 2);
        break;
      default:
        date.setFullYear(date.getFullYear() + 1);
    }

    return date.toISOString().split("T")[0];
  };

  // Calculate domain renewal date
  const calculateDomainRenewalDate = (startDate, cycle) => {
    if (!startDate) return "";

    const date = new Date(startDate);

    switch (cycle) {
      case "Monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "Quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "Half-Yearly":
        date.setMonth(date.getMonth() + 6);
        break;
      case "1 Year":
        date.setFullYear(date.getFullYear() + 1);
        break;
      case "2 Years":
        date.setFullYear(date.getFullYear() + 2);
        break;
      case "3 Years":
        date.setFullYear(date.getFullYear() + 3);
        break;
      default:
        date.setFullYear(date.getFullYear() + 1);
    }

    return date.toISOString().split("T")[0];
  };

  // NEW: Calculate GSuite renewal date
  const calculateGSuiteRenewalDate = (startDate, cycle) => {
    if (!startDate) return "";

    const date = new Date(startDate);

    switch (cycle) {
      case "MONTHLY":
        date.setMonth(date.getMonth() + 1);
        break;
      case "QUARTERLY":
        date.setMonth(date.getMonth() + 3);
        break;
      case "YEARLY":
        date.setFullYear(date.getFullYear() + 1);
        break;
      case "2_YEARS":
        date.setFullYear(date.getFullYear() + 2);
        break;
      case "3_YEARS":
        date.setFullYear(date.getFullYear() + 3);
        break;
      default:
        date.setFullYear(date.getFullYear() + 1);
    }

    return date.toISOString().split("T")[0];
  };

  // Handle AMC start date change
  const handleAmcStartDateChange = (date) => {
    handleChange("amcHistoryInfo", "amcStartDate", date);

    const endDate = calculateAmcEndDate(
      date,
      formData.amcHistoryInfo.amcRecycleType
    );
    handleChange("amcHistoryInfo", "amcEndDate", endDate);
  };

  // Handle AMC recycle type change
  const handleAmcRecycleTypeChange = (type) => {
    handleChange("amcHistoryInfo", "amcRecycleType", type);

    if (formData.amcHistoryInfo.amcStartDate) {
      const endDate = calculateAmcEndDate(
        formData.amcHistoryInfo.amcStartDate,
        type
      );
      handleChange("amcHistoryInfo", "amcEndDate", endDate);
    }
  };

  // Handle domain start date change
  const handleDomainStartDateChange = (date) => {
    handleChange("amcDomainHistoryInfo", "domainStartDate", date);

    const renewalDate = calculateDomainRenewalDate(
      date,
      formData.amcDomainHistoryInfo.domainRenewalCycle
    );
    handleChange("amcDomainHistoryInfo", "domainRenewalDate", renewalDate);
  };

  // Handle domain renewal cycle change
  const handleDomainRenewalCycleChange = (cycle) => {
    handleChange("amcDomainHistoryInfo", "domainRenewalCycle", cycle);

    if (formData.amcDomainHistoryInfo.domainStartDate) {
      const renewalDate = calculateDomainRenewalDate(
        formData.amcDomainHistoryInfo.domainStartDate,
        cycle
      );
      handleChange("amcDomainHistoryInfo", "domainRenewalDate", renewalDate);
    }
  };

  // NEW: Handle GSuite start date change
  const handleGSuiteStartDateChange = (date) => {
    handleChange("gsuiteDetails", "gsuitStartDate", date);

    const renewalDate = calculateGSuiteRenewalDate(
      date,
      formData.gsuiteDetails.gsuitRenewalCycle
    );
    handleChange("gsuiteDetails", "gsuitRenewalDate", renewalDate);
  };

  // NEW: Handle GSuite renewal cycle change
  const handleGSuiteRenewalCycleChange = (cycle) => {
    handleChange("gsuiteDetails", "gsuitRenewalCycle", cycle);

    if (formData.gsuiteDetails.gsuitStartDate) {
      const renewalDate = calculateGSuiteRenewalDate(
        formData.gsuiteDetails.gsuitStartDate,
        cycle
      );
      handleChange("gsuiteDetails", "gsuitRenewalDate", renewalDate);
    }
  };

  // NEW: Handle purchasedViaReseller toggle
  const handleResellerToggle = (checked) => {
    handleChange("gsuiteDetails", "purchasedViaReseller", checked);
    if (!checked) {
      handleChange("gsuiteDetails", "resellerName", "");
    }
  };

  // Check if field is required
  const isFieldRequired = (section, field) => {
    return requiredFields[section] && requiredFields[section][field];
  };

  // Focus on the first error field
  const focusOnFirstError = (newErrors) => {
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      let errorTab = "client";
      let errorField = "";

      if (firstErrorKey.startsWith("amcInfo.")) {
        errorField = firstErrorKey.replace("amcInfo.", "");
        if (
          ["companyName", "contactPersonName", "email", "phoneNumber"].includes(
            errorField
          )
        ) {
          errorTab = "client";
        } else if (["technology", "assingedTo"].includes(errorField)) {
          errorTab = "technical";
        }
      } else if (firstErrorKey.startsWith("amcHistoryInfo.")) {
        errorTab = "amc";
        errorField = firstErrorKey.replace("amcHistoryInfo.", "");
      } else if (firstErrorKey.startsWith("amcDomainHistoryInfo.")) {
        errorTab = "domain";
        errorField = firstErrorKey.replace("amcDomainHistoryInfo.", "");
      } else if (firstErrorKey.startsWith("gsuiteDetails.")) {
        errorTab = "gsuite";
        errorField = firstErrorKey.replace("gsuiteDetails.", "");
      }

      setActiveTab(errorTab);

      setTimeout(() => {
        const fieldRef = errorFieldRefs.current[firstErrorKey];
        if (fieldRef && fieldRef.focus) {
          fieldRef.focus();
          fieldRef.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate AMC Info (keep these required)
    if (!formData.amcInfo.companyName?.trim()) {
      newErrors["amcInfo.companyName"] = "Company name is required";
    }

    if (!formData.amcInfo.contactPersonName?.trim()) {
      newErrors["amcInfo.contactPersonName"] =
        "Contact person name is required";
    }

    if (!formData.amcInfo.email?.trim()) {
      newErrors["amcInfo.email"] = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.amcInfo.email)) {
      newErrors["amcInfo.email"] = "Email is invalid";
    }

    if (!formData.amcInfo.phoneNumber?.trim()) {
      newErrors["amcInfo.phoneNumber"] = "Phone number is required";
    } else if (!formData.amcInfo.phoneNumber.startsWith("+")) {
      newErrors["amcInfo.phoneNumber"] =
        "Please enter a valid phone number with country code";
    }

    if (!formData.amcInfo.technology) {
      newErrors["amcInfo.technology"] = "Technology is required";
    }

    if (!formData.amcInfo.assingedTo) {
      newErrors["amcInfo.assingedTo"] = "Assigned to is required";
    }

    if (
      formData.gsuiteDetails.totalLicenses &&
      (isNaN(formData.gsuiteDetails.totalLicenses) ||
        parseInt(formData.gsuiteDetails.totalLicenses) <= 0)
    ) {
      newErrors["gsuiteDetails.totalLicenses"] =
        "Total licenses must be a positive number";
    }

    if (
      formData.gsuiteDetails.gsuitAmount &&
      (isNaN(formData.gsuiteDetails.gsuitAmount) ||
        parseFloat(formData.gsuiteDetails.gsuitAmount) <= 0)
    ) {
      newErrors["gsuiteDetails.gsuitAmount"] =
        "GSuite amount must be a positive number";
    }

    if (
      formData.gsuiteDetails.adminEmail &&
      !/\S+@\S+\.\S+/.test(formData.gsuiteDetails.adminEmail)
    ) {
      newErrors["gsuiteDetails.adminEmail"] = "Admin email is invalid";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusOnFirstError(newErrors);
      return false;
    }

    return true;
  };

 const handleSubmit = async (e) => {
   e.preventDefault();

   if (!validateForm()) {
     toast.error("Please fix the form errors before submitting.", {});
     return;
   }

   setLoading(true);
   try {
     // Prepare the complete payload matching the required structure
     const payload = {
       amcInfo: {
         adminId: formData.amcInfo.adminId || null,
         employeeId: formData.amcInfo.employeeId || null,
         clinetName: formData.amcInfo.clinetName || "",
         companyName: formData.amcInfo.companyName || "",
         contactPersonName: formData.amcInfo.contactPersonName || "",
         email: formData.amcInfo.email || "",
         phoneNumber: formData.amcInfo.phoneNumber || "",
         websiteURL: formData.amcInfo.websiteURL || "",
         technology: formData.amcInfo.technology || "",
         hostingProvider: formData.amcInfo.hostingProvider || "",
         domainProvider: formData.amcInfo.domainProvider || "",
         assingedTo: formData.amcInfo.assingedTo || "",
       },
     };

     // Check if AMC History Info has any data
     const isAmcHistoryFilled =
       formData.amcHistoryInfo.amcStartDate ||
       formData.amcHistoryInfo.amcEndDate ||
       formData.amcHistoryInfo.amcAmount ||
       formData.amcHistoryInfo.amcScope;

     if (isAmcHistoryFilled) {
       payload.amcHistoryInfo = {
         amcStartDate: formData.amcHistoryInfo.amcStartDate || null,
         amcEndDate: formData.amcHistoryInfo.amcEndDate || null,
         amcAmount: formData.amcHistoryInfo.amcAmount
           ? parseFloat(formData.amcHistoryInfo.amcAmount)
           : null,
         amcScope: formData.amcHistoryInfo.amcScope || "",
         amcRecycleType: formData.amcHistoryInfo.amcRecycleType || "",
         sequence: formData.amcHistoryInfo.sequence || 1,
       };
     } else {
       payload.amcHistoryInfo = null;
     }

     // Check if Domain History Info has any data
     const isDomainHistoryFilled =
       formData.amcDomainHistoryInfo.domainStartDate ||
       formData.amcDomainHistoryInfo.domainRenewalDate ||
       formData.amcDomainHistoryInfo.domainAmount;

     if (isDomainHistoryFilled) {
       payload.amcDomainHistoryInfo = {
         domainStartDate: formData.amcDomainHistoryInfo.domainStartDate || null,
         domainRenewalDate:
           formData.amcDomainHistoryInfo.domainRenewalDate || null,
         domainAmount: formData.amcDomainHistoryInfo.domainAmount || null,
         domainRenewalCycle:
           formData.amcDomainHistoryInfo.domainRenewalCycle || "",
         sequence: formData.amcDomainHistoryInfo.sequence || 1,
       };
     } else {
       payload.amcDomainHistoryInfo = null;
     }

     // Check if ANY GSuite field has data
     const isAnyGSuiteFieldFilled = Object.entries(formData.gsuiteDetails).some(
       ([key, value]) => {
         // Skip these fields as they don't indicate user intent to fill GSuite
         if (
           key === "sequence" ||
           key === "paid" ||
           key === "purchasedViaReseller" ||
           key === "resellerName" ||
           key === "paidBy" || // We'll handle this separately
           key === "gsuitRenewalCycle" // Optional field
         ) {
           return false;
         }

         // Check if field has a non-empty value
         if (typeof value === "string") {
           return value.trim() !== "";
         } else if (typeof value === "number") {
           return value > 0;
         }
         return Boolean(value);
       }
     );

     // If ANY GSuite field is filled, include the entire object with ADMIN as default
     if (isAnyGSuiteFieldFilled) {
       payload.amcGsuitHistory = {
         domainName: formData.gsuiteDetails.domainName || "",
         platform: formData.gsuiteDetails.platform || "",
         gsuitStartDate: formData.gsuiteDetails.gsuitStartDate || null,
         gsuitRenewalDate: formData.gsuiteDetails.gsuitRenewalDate || null,
         adminEmail: formData.gsuiteDetails.adminEmail || "",
         adminPassword: formData.gsuiteDetails.adminPassword || "",
         totalLicenses: formData.gsuiteDetails.totalLicenses
           ? parseInt(formData.gsuiteDetails.totalLicenses)
           : null,
         gsuitAmount: formData.gsuiteDetails.gsuitAmount || null,
         paidBy: "ADMIN", // Always set to ADMIN when GSuite is included
         purchasedViaReseller:
           formData.gsuiteDetails.purchasedViaReseller || false,
         resellerName: formData.gsuiteDetails.resellerName || "",
         gsuitRenewalCycle: formData.gsuiteDetails.gsuitRenewalCycle || "",
         sequence: 1,
       };
     } else {
       // If NO GSuite fields are filled, send null
       payload.amcGsuitHistory = null;
     }

     console.log(
       "Sending AMC creation payload:",
       JSON.stringify(payload, null, 2)
     );

     // Send single POST request with all data
     const response = await axiosInstance.post("createAMC", payload);

     if (response.data) {
       console.log("AMC created successfully:", response.data);
       toast.success("AMC created successfully!");

       onSuccess(response.data);
       onClose();
     } else {
       throw new Error("No response data received");
     }
   } catch (error) {
     console.error("Error creating AMC:", error);

     if (error.response) {
       if (error.response.status === 400) {
         toast.error(
           "Validation error: " +
             (error.response.data?.message || "Check your input")
         );
       } else if (error.response.status === 500) {
         toast.error(
           "Server error: " +
             (error.response.data?.message || "Internal server error")
         );
       } else {
         toast.error(
           "Failed to create AMC: " +
             (error.response.data?.message || "Unknown error")
         );
       }
     } else if (error.request) {
       toast.error("Network error. Please check your connection.");
     } else {
       toast.error("Failed to create AMC. Please try again.");
     }
   } finally {
     setLoading(false);
   }
 };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Handle next button click
  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  // Check if current tab is last tab
  const isLastTab = () => {
    return activeTab === tabs[tabs.length - 1].id;
  };

  // Check if current tab is first tab
  const isFirstTab = () => {
    return activeTab === tabs[0].id;
  };

  // Render Client Tab
  const renderClientTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Select Existing Client */}
        <div className="md:col-span-2">
          <GlobalSelectField
            label="Select Client"
            name="client"
            value={selectedClientId}
            onChange={(e) => handleClientChange(e.target.value)}
            options={[
              { value: "", label: "Select a client" },
              ...clients.map((client) => ({
                value: client.id,
                label:
                  client.companyName || `Client ${client.id.substring(0, 8)}`,
              })),
            ]}
            loading={loadingClients}
            className="text-sm"
          />
        </div>
        <GlobalInputField
          label={
            <>
              Client Name
              {isFieldRequired("amcInfo", "clinetName") && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </>
          }
          name="clinetName"
          value={formData.amcInfo.clinetName}
          onChange={(e) =>
            handleChange("amcInfo", "clinetName", e.target.value)
          }
          error={errors["amcInfo.clinetName"]}
          placeholder="Enter client name"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current["amcInfo.clinetName"] = el)}
        />
        <GlobalInputField
          label={
            <>
              Company Name
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="companyName"
          value={formData.amcInfo.companyName}
          onChange={(e) =>
            handleChange("amcInfo", "companyName", e.target.value)
          }
          error={errors["amcInfo.companyName"]}
          placeholder="Enter company name"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current["amcInfo.companyName"] = el)}
        />
        <GlobalInputField
          label={
            <>
              Contact Person Name
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="contactPersonName"
          value={formData.amcInfo.contactPersonName}
          onChange={(e) =>
            handleChange("amcInfo", "contactPersonName", e.target.value)
          }
          error={errors["amcInfo.contactPersonName"]}
          placeholder="Enter contact person name"
          className="text-sm"
          ref={(el) =>
            (errorFieldRefs.current["amcInfo.contactPersonName"] = el)
          }
        />
        <GlobalInputField
          label={
            <>
              Email
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="email"
          type="email"
          value={formData.amcInfo.email}
          onChange={(e) => handleChange("amcInfo", "email", e.target.value)}
          error={errors["amcInfo.email"]}
          placeholder="client@company.com"
          className="text-sm"
          ref={(el) => (errorFieldRefs.current["amcInfo.email"] = el)}
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span>Phone Number</span>
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div
            className={`phone-input-wrapper ${
              errors["amcInfo.phoneNumber"] ? "border-red-500 rounded-lg" : ""
            }`}
          >
            <PhoneInput
              country={"in"}
              value={formData.amcInfo.phoneNumber || ""}
              onChange={(value, country, e, formattedValue) => {
                const completeNumber = value.startsWith("+")
                  ? value
                  : `+${value}`;
                handleChange("amcInfo", "phoneNumber", completeNumber);
              }}
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
          {errors["amcInfo.phoneNumber"] && (
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
              {errors["amcInfo.phoneNumber"]}
            </p>
          )}
        </div>
        <GlobalInputField
          label="Website URL"
          name="websiteURL"
          value={formData.amcInfo.websiteURL}
          onChange={(e) =>
            handleChange("amcInfo", "websiteURL", e.target.value)
          }
          placeholder="https://www.example.com"
          className="text-sm"
        />
      </div>
    </div>
  );

  // Render Technical Tab
  // Render Technical Tab - Update hostingProvider default
  const renderTechnicalTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalSelectField
          label={
            <>
              Technology
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="technology"
          value={formData.amcInfo.technology}
          onChange={(e) =>
            handleChange("amcInfo", "technology", e.target.value)
          }
          options={[
            { value: "", label: "Select technology" },
            ...technologyOptions,
          ]}
          error={errors["amcInfo.technology"]}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current["amcInfo.technology"] = el)}
        />

        <GlobalSelectField
          label="Domain Provider"
          name="domainProvider"
          value={formData.amcInfo.domainProvider || ""}
          onChange={(e) =>
            handleChange("amcInfo", "domainProvider", e.target.value)
          }
          options={[
            { value: "", label: "Select domain provider" },
            ...domainProviderOptions,
          ]}
          className="text-sm"
        />

        <GlobalSelectField
          label="Hosting Provider"
          name="hostingProvider"
          value={formData.amcInfo.hostingProvider || ""}
          onChange={(e) =>
            handleChange("amcInfo", "hostingProvider", e.target.value)
          }
          options={[
            { value: "", label: "Select hosting provider" },
            ...hostingProviderOptions,
          ]}
          className="text-sm"
        />

        <GlobalSelectField
          label={
            <>
              Assigned To
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="assingedTo"
          value={formData.amcInfo.assingedTo}
          onChange={(e) =>
            handleChange("amcInfo", "assingedTo", e.target.value)
          }
          options={[
            { value: "", label: "Select employee" },
            ...employees.map((emp) => ({ value: emp.value, label: emp.label })),
          ]}
          loading={loadingEmployees}
          error={errors["amcInfo.assingedTo"]}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current["amcInfo.assingedTo"] = el)}
        />
      </div>
    </div>
  );

  // Render AMC Tab
  // Render AMC Tab
  const renderAmcTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="AMC Start Date"
          name="amcStartDate"
          type="date"
          value={formData.amcHistoryInfo.amcStartDate || ""}
          onChange={(e) => handleAmcStartDateChange(e.target.value)}
          error={errors["amcHistoryInfo.amcStartDate"]}
          className="text-sm"
          min={getTodayDate()}
          ref={(el) =>
            (errorFieldRefs.current["amcHistoryInfo.amcStartDate"] = el)
          }
        />

        <GlobalInputField
          label="AMC End Date"
          name="amcEndDate"
          type="date"
          value={formData.amcHistoryInfo.amcEndDate || ""}
          onChange={(e) =>
            handleChange("amcHistoryInfo", "amcEndDate", e.target.value)
          }
          error={errors["amcHistoryInfo.amcEndDate"]}
          className="text-sm"
          readOnly
          style={{ backgroundColor: "#f9f9f9" }}
          ref={(el) =>
            (errorFieldRefs.current["amcHistoryInfo.amcEndDate"] = el)
          }
        />

        <GlobalInputField
          label="AMC Amount"
          name="amcAmount"
          type="number"
          value={formData.amcHistoryInfo.amcAmount || ""}
          onChange={(e) =>
            handleChange("amcHistoryInfo", "amcAmount", e.target.value)
          }
          error={errors["amcHistoryInfo.amcAmount"]}
          placeholder="25000"
          min="0"
          step="0.01"
          className="text-sm"
          ref={(el) =>
            (errorFieldRefs.current["amcHistoryInfo.amcAmount"] = el)
          }
        />

        <GlobalSelectField
          label="AMC Recycle Type"
          name="amcRecycleType"
          value={formData.amcHistoryInfo.amcRecycleType || ""}
          onChange={(e) => handleAmcRecycleTypeChange(e.target.value)}
          options={[
            { value: "", label: "Select recycle type" },
            ...recycleTypeOptions,
          ]}
          className="text-sm"
        />
      </div>

      <div>
        <GlobalTextAreaField
          label="AMC Scope"
          name="amcScope"
          value={formData.amcHistoryInfo.amcScope || ""}
          onChange={(e) =>
            handleChange("amcHistoryInfo", "amcScope", e.target.value)
          }
          error={errors["amcHistoryInfo.amcScope"]}
          placeholder="e.g., Full website maintenance, bug fixes, security patches, monthly reports, 24/7 support..."
          rows={4}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current["amcHistoryInfo.amcScope"] = el)}
        />
      </div>
    </div>
  );

  // Render Domain Tab
  // Render Domain Tab
  const renderDomainTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Domain Start Date"
          name="domainStartDate"
          type="date"
          value={formData.amcDomainHistoryInfo.domainStartDate || ""}
          onChange={(e) => handleDomainStartDateChange(e.target.value)}
          error={errors["amcDomainHistoryInfo.domainStartDate"]}
          className="text-sm"
          ref={(el) =>
            (errorFieldRefs.current["amcDomainHistoryInfo.domainStartDate"] =
              el)
          }
        />

        <GlobalInputField
          label="Domain Renewal Date"
          name="domainRenewalDate"
          type="date"
          value={formData.amcDomainHistoryInfo.domainRenewalDate || ""}
          onChange={(e) =>
            handleChange(
              "amcDomainHistoryInfo",
              "domainRenewalDate",
              e.target.value
            )
          }
          error={errors["amcDomainHistoryInfo.domainRenewalDate"]}
          className="text-sm"
          readOnly
          style={{ backgroundColor: "#f9f9f9" }}
          ref={(el) =>
            (errorFieldRefs.current["amcDomainHistoryInfo.domainRenewalDate"] =
              el)
          }
        />

        <GlobalInputField
          label="Domain Amount"
          name="domainAmount"
          type="number"
          value={formData.amcDomainHistoryInfo.domainAmount || ""}
          onChange={(e) =>
            handleChange("amcDomainHistoryInfo", "domainAmount", e.target.value)
          }
          error={errors["amcDomainHistoryInfo.domainAmount"]}
          placeholder="1200"
          min="0"
          step="0.01"
          className="text-sm"
          ref={(el) =>
            (errorFieldRefs.current["amcDomainHistoryInfo.domainAmount"] = el)
          }
        />

        <GlobalSelectField
          label="Domain Renewal Cycle"
          name="domainRenewalCycle"
          value={formData.amcDomainHistoryInfo.domainRenewalCycle || ""}
          onChange={(e) => handleDomainRenewalCycleChange(e.target.value)}
          options={[
            { value: "", label: "Select renewal cycle" },
            ...domainRenewalOptions,
          ]}
          className="text-sm"
        />
      </div>
    </div>
  );

  // Render GSuite Tab (Already provided in previous response, but included for completeness)
  // Render GSuite Tab
  const renderGSuiteTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label="Domain Name"
          name="domainName"
          value={formData.gsuiteDetails.domainName || ""}
          onChange={(e) =>
            handleChange("gsuiteDetails", "domainName", e.target.value)
          }
          placeholder="examplecompany.com"
          className="text-sm"
          ref={(el) =>
            (errorFieldRefs.current["gsuiteDetails.domainName"] = el)
          }
        />
        <GlobalSelectField
          label="Platform"
          name="platform"
          value={formData.gsuiteDetails.platform || ""}
          onChange={(e) =>
            handleChange("gsuiteDetails", "platform", e.target.value)
          }
          options={[
            { value: "", label: "Select platform" },
            ...platformOptions,
          ]}
          className="text-sm"
        />
        <GlobalInputField
          label="GSuite Start Date"
          name="gsuitStartDate"
          type="date"
          value={formData.gsuiteDetails.gsuitStartDate || ""}
          onChange={(e) => handleGSuiteStartDateChange(e.target.value)}
          className="text-sm"
          min={getTodayDate()}
          ref={(el) =>
            (errorFieldRefs.current["gsuiteDetails.gsuitStartDate"] = el)
          }
        />
        <GlobalInputField
          label="GSuite Renewal Date"
          name="gsuitRenewalDate"
          type="date"
          value={formData.gsuiteDetails.gsuitRenewalDate || ""}
          onChange={(e) =>
            handleChange("gsuiteDetails", "gsuitRenewalDate", e.target.value)
          }
          className="text-sm"
          readOnly
          style={{ backgroundColor: "#f9f9f9" }}
          ref={(el) =>
            (errorFieldRefs.current["gsuiteDetails.gsuitRenewalDate"] = el)
          }
        />
        <GlobalInputField
          label="Admin Email"
          name="adminEmail"
          type="email"
          value={formData.gsuiteDetails.adminEmail || ""}
          onChange={(e) =>
            handleChange("gsuiteDetails", "adminEmail", e.target.value)
          }
          error={errors["gsuiteDetails.adminEmail"]}
          placeholder="admin@example.com"
          className="text-sm"
          ref={(el) =>
            (errorFieldRefs.current["gsuiteDetails.adminEmail"] = el)
          }
          autoComplete="new-email"
        />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Admin Password
          </label>
          <div className="relative">
            <input
              type={showAdminPassword ? "text" : "password"}
              name="adminPassword"
              value={formData.gsuiteDetails.adminPassword || ""}
              onChange={(e) =>
                handleChange("gsuiteDetails", "adminPassword", e.target.value)
              }
              placeholder="Enter admin password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-10 text-sm"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowAdminPassword(!showAdminPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showAdminPassword ? (
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
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
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
        </div>
        <GlobalInputField
          label="Total Licenses"
          name="totalLicenses"
          type="number"
          value={formData.gsuiteDetails.totalLicenses || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || parseInt(value) > 0) {
              handleChange("gsuiteDetails", "totalLicenses", value);
            }
          }}
          error={errors["gsuiteDetails.totalLicenses"]}
          placeholder="25"
          min="1"
          className="text-sm"
          ref={(el) =>
            (errorFieldRefs.current["gsuiteDetails.totalLicenses"] = el)
          }
        />
        <GlobalInputField
          label="GSuite Amount"
          name="gsuitAmount"
          type="number"
          value={formData.gsuiteDetails.gsuitAmount || ""}
          onChange={(e) =>
            handleChange("gsuiteDetails", "gsuitAmount", e.target.value)
          }
          error={errors["gsuiteDetails.gsuitAmount"]}
          placeholder="45000"
          min="0"
          step="0.01"
          className="text-sm"
          ref={(el) =>
            (errorFieldRefs.current["gsuiteDetails.gsuitAmount"] = el)
          }
        />

        <GlobalSelectField
          label="Paid By"
          name="paidBy"
          value={formData.gsuiteDetails.paidBy || "ADMIN"} // Default to ADMIN
          onChange={(e) =>
            handleChange("gsuiteDetails", "paidBy", e.target.value)
          }
          options={paidByOptions}
          className="text-sm"
        />

        <GlobalSelectField
          label="GSuite Renewal Cycle"
          name="gsuitRenewalCycle"
          value={formData.gsuiteDetails.gsuitRenewalCycle || ""} // Handle null
          onChange={(e) => {
            const value = e.target.value === "" ? null : e.target.value;
            handleGSuiteRenewalCycleChange(value);
          }}
          options={[
            { value: "", label: "Select renewal cycle" },
            ...gsuiteRenewalCycleOptions,
          ]}
          className="text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="purchasedViaReseller"
            checked={formData.gsuiteDetails.purchasedViaReseller || false}
            onChange={(e) => handleResellerToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="purchasedViaReseller"
            className="text-sm text-gray-700"
          >
            Purchased via Reseller
          </label>
        </div>

        {formData.gsuiteDetails.purchasedViaReseller && (
          <GlobalInputField
            label="Reseller Name"
            name="resellerName"
            value={formData.gsuiteDetails.resellerName || ""}
            onChange={(e) =>
              handleChange("gsuiteDetails", "resellerName", e.target.value)
            }
            placeholder="Google Authorized Partner Pvt Ltd"
            className="text-sm"
          />
        )}
      </div>
    </div>
  );

  // ... keep the rest of your render functions (technical, amc, domain) exactly as they are ...

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-3">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  Create Annual Maintenance Charges (AMC)
                </h2>
                <p className="text-blue-100 text-xs">
                  Fill in the AMC details below
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition"
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
            </button>
          </div>
        </div>

        {/* Tab Navigation - ADDED GSuite tab */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                } ${tabErrors[tab.id] ? "pr-8" : ""}`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                {tabErrors[tab.id] && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body - Updated to include GSuite tab */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit}>
            {activeTab === "client" && renderClientTab()}
            {activeTab === "technical" && renderTechnicalTab()}
            {activeTab === "amc" && renderAmcTab()}
            {activeTab === "domain" && renderDomainTab()}
            {activeTab === "gsuite" && renderGSuiteTab()} {/* NEW */}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>

            {!isFirstTab() && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
              >
                Previous
              </button>
            )}

            {!isLastTab() ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Create AMC
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAmcModal;
