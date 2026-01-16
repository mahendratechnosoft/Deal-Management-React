import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
} from "../../BaseComponet/CustomerFormInputs";
import ExpenseCategoryDropdown from "./ExpenseCategoryDropdown";
import FileUploadComponent from "./FileUploadComponent";
import FinancialsTaxSection from "./FinancialsTaxSection";

function CreateExpenseModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [categoriesData, setCategoriesData] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [paymentModes, setPaymentModes] = useState([]);
  const [loadingPaymentModes, setLoadingPaymentModes] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // Tab state
  const [tabErrors, setTabErrors] = useState({}); // Track which tabs have errors

  const [tdsApplicable, setTdsApplicable] = useState(false);
  const [tdsAmount, setTdsAmount] = useState(0);
  const [payableAmount, setPayableAmount] = useState(0);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);

  const [taxableAmountWithoutTax, setTaxableAmountWithoutTax] = useState(0);

  // Refs for focusing on error fields
  const errorFieldRefs = useRef({});

  // Updated tax options to match API response
  const taxOptions = [
    { value: "No Tax", label: "No Tax", defaultRate: 0 },
    { value: "SGST", label: "SGST", defaultRate: 9 },
    { value: "CGST", label: "CGST", defaultRate: 9 },
    { value: "CGST_SGST", label: "CGST + SGST", defaultRate: 18 }, // Changed from CGST+SGST
    { value: "GST", label: "GST", defaultRate: 18 },
    { value: "IGST", label: "IGST", defaultRate: 18 },
    { value: "Custom", label: "Custom", defaultRate: "" },
  ];
  // Main form state
  const [formData, setFormData] = useState({
    // Basic Information
    vendorId: "",
    vendorName: "",
    expenseCategoryId: "",
    expenseCategoryName: "",
    expenseType: "GOODS",
    hsnSac: "",
    note: "",
    customerId: "",
    customerName: "",
    billable: false,

    // Dates & Currency
    expenseDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    currency: "INR",

    // Financials & Tax
    taxableAmount: 0,
    taxInvoiceInclusive: false,
    taxType: "No Tax", // Updated default to "No Tax"
    taxPercentage: 0,
    cgstPercentage: 0,
    sgstPercentage: 0,
    tdsPercentage: 0,

    // Payment Status
    status: "UNPAID",
    paidAmount: 0,
    paymentProfileId: "",

    // Attachment fields
    receiptAttachment: "",
    attachmentFileName: "",
    attachmentFileType: "",
  });

  const [errors, setErrors] = useState({});

  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);

  // Options for dropdowns
  const expenseTypeOptions = [
    { value: "GOODS", label: "Goods" },
    { value: "SERVICES", label: "Services" },
  ];

  const statusOptions = [
    { value: "UNPAID", label: "Unpaid" },
    { value: "PARTIALLY_PAID", label: "Partially Paid" },
    { value: "PAID", label: "Paid" },
  ];

  const currencyOptions = [
    { value: "INR", label: "INR" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ];

  // Tabs configuration
  const tabs = [
    {
      id: "basic",
      label: "Basic Information",
      fields: [
        "vendorId",
        "expenseCategoryId",
        "expenseType",
        "hsnSac",
        "note",
      ],
    },

    {
      id: "financial",
      label: "Financials & Tax",
      fields: [
        "taxableAmount",
        "taxType",
        "taxPercentage",
        "cgstPercentage",
        "sgstPercentage",
      ],
    },
    {
      id: "payment",
      label: "Payment Status",
      fields: ["status", "paidAmount", "paymentProfileId"],
    },
    {
      id: "attachments",
      label: "Attachments",
      fields: ["receiptAttachment"],
    },
  ];

  // Required fields configuration
  const requiredFields = {
    vendorId: true,
    expenseCategoryId: true,
    expenseType: true,
    hsnSac: true,
    expenseDate: true,

    taxableAmount: true,
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchVendors();
    fetchCategories();
    fetchCustomers();
    fetchPaymentModes();
  }, []);

  // Calculate due date when expense date changes (default 7 days)
  useEffect(() => {
    if (formData.expenseDate && !formData.dueDate) {
      const expenseDate = new Date(formData.expenseDate);
      const dueDate = new Date(expenseDate);
      dueDate.setDate(expenseDate.getDate() + 7);

      setFormData((prev) => ({
        ...prev,
        dueDate: dueDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.expenseDate]);

  // Calculate tax, TDS, and payable amounts
  useEffect(() => {
    const inputAmount = Number(formData.taxableAmount) || 0;
    let calculatedTaxableAmountWithoutTax = 0;
    let calculatedTaxAmount = 0;
    let calculatedTotalAmount = 0;

    // Determine tax rate based on tax type
    let taxRate = 0;
    switch (formData.taxType) {
      case "No Tax":
        taxRate = 0;
        break;
      case "SGST":
        taxRate = Number(formData.sgstPercentage) || 0;
        break;
      case "CGST":
        taxRate = Number(formData.cgstPercentage) || 0;
        break;
      case "CGST_SGST": // Changed from CGST+SGST
        // For CGST_SGST, taxPercentage is the total rate (e.g., 18)
        taxRate = Number(formData.taxPercentage) || 0;
        break;
      case "GST":
      case "IGST":
      case "Custom":
        taxRate = Number(formData.taxPercentage) || 0;
        break;
      default:
        taxRate = 0;
    }

    // Calculate based on inclusive/exclusive tax
    if (isTaxInclusive) {
      // Amount includes tax (e.g., 1180 includes 180 tax at 18%)
      calculatedTotalAmount = inputAmount;
      if (taxRate === 0) {
        calculatedTaxableAmountWithoutTax = inputAmount;
        calculatedTaxAmount = 0;
      } else {
        calculatedTaxableAmountWithoutTax = inputAmount / (1 + taxRate / 100);
        calculatedTaxAmount = inputAmount - calculatedTaxableAmountWithoutTax;
      }
    } else {
      // Amount excludes tax (e.g., 1000 + 180 tax = 1180)
      calculatedTaxableAmountWithoutTax = inputAmount;
      calculatedTaxAmount = (inputAmount * taxRate) / 100;
      calculatedTotalAmount = inputAmount + calculatedTaxAmount;
    }

    // Calculate TDS on taxable amount (without tax)
    const tdsRate = tdsApplicable ? Number(formData.tdsPercentage) || 0 : 0;
    const calculatedTdsAmount =
      (calculatedTaxableAmountWithoutTax * tdsRate) / 100;

    // Calculate payable amount (Total - TDS)
    const calculatedPayableAmount = calculatedTotalAmount - calculatedTdsAmount;

    // Calculate due amount based on payment status
    const paid = Number(formData.paidAmount) || 0;
    const calculatedDueAmount = calculatedPayableAmount - paid;

    // Update all state variables
    setTaxableAmountWithoutTax(calculatedTaxableAmountWithoutTax);
    setTaxAmount(calculatedTaxAmount);
    setTotalAmount(calculatedTotalAmount);
    setTdsAmount(calculatedTdsAmount);
    setPayableAmount(calculatedPayableAmount);
    setDueAmount(calculatedDueAmount);
  }, [
    formData.taxableAmount,
    formData.taxType,
    formData.taxPercentage,
    formData.cgstPercentage,
    formData.sgstPercentage,
    formData.tdsPercentage,
    formData.paidAmount,
    isTaxInclusive,
    tdsApplicable,
  ]);

  useEffect(() => {
    const selectedTaxOption = taxOptions.find(
      (option) => option.value === formData.taxType
    );

    if (selectedTaxOption && selectedTaxOption.defaultRate !== "") {
      const defaultRate = selectedTaxOption.defaultRate;

      switch (formData.taxType) {
        case "No Tax":
          setFormData((prev) => ({
            ...prev,
            taxPercentage: 0,
            cgstPercentage: 0,
            sgstPercentage: 0,
          }));
          break;
        case "SGST":
          setFormData((prev) => ({
            ...prev,
            taxPercentage: 0,
            cgstPercentage: 0,
            sgstPercentage: defaultRate,
          }));
          break;
        case "CGST":
          setFormData((prev) => ({
            ...prev,
            taxPercentage: 0,
            cgstPercentage: defaultRate,
            sgstPercentage: 0,
          }));
          break;
        case "GST":
        case "IGST":
          setFormData((prev) => ({
            ...prev,
            taxPercentage: defaultRate,
            cgstPercentage: 0,
            sgstPercentage: 0,
          }));
          break;
        case "CGST_SGST": // Changed from CGST+SGST
          setFormData((prev) => ({
            ...prev,
            taxPercentage: defaultRate, // Total rate (e.g., 18)
            cgstPercentage: defaultRate / 2, // Half for CGST (e.g., 9)
            sgstPercentage: defaultRate / 2, // Half for SGST (e.g., 9)
          }));
          break;
        case "Custom":
          // Keep existing values for custom
          break;
        default:
          break;
      }
    }
  }, [formData.taxType]);

  // Update paid amount when status changes
  useEffect(() => {
    if (formData.status === "PAID") {
      setFormData((prev) => ({
        ...prev,
        paidAmount: payableAmount, // Changed from totalAmount to payableAmount
      }));
    } else if (formData.status === "UNPAID") {
      setFormData((prev) => ({
        ...prev,
        paidAmount: 0,
        paymentProfileId: "",
      }));
    }
  }, [formData.status, payableAmount]); // Changed dependency to payableAmount

  // Update tab errors when errors change
  useEffect(() => {
    const newTabErrors = {};

    tabs.forEach((tab) => {
      const hasError = tab.fields.some((field) => {
        return errors[field];
      });

      newTabErrors[tab.id] = hasError;
    });

    setTabErrors(newTabErrors);
  }, [errors]);

  // Fetch vendor options
  const fetchVendors = async () => {
    if (loadingVendors || vendors.length > 0) return;

    setLoadingVendors(true);
    try {
      const response = await axiosInstance.get("getVendorNameAndId");
      const mappedOptions = response.data.map((vendor) => ({
        value: vendor.vendorId,
        label: vendor.vendorName,
        vendorCode: vendor.vendorCode,
      }));
      setVendors(mappedOptions);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setLoadingVendors(false);
    }
  };

  // Fetch category options
  const fetchCategories = async () => {
    if (loadingCategories) return;

    setLoadingCategories(true);
    try {
      const response = await axiosInstance.get("getAllExpenseCategories");
      const data = response.data;

      // Store the raw response data - this is what your dropdown expects
      setCategoriesData(data);

      // No need to set categories since we're using categoriesData directly

      // Log for debugging
      console.log("Categories data loaded:", data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch customer options
  const fetchCustomers = async () => {
    if (loadingCustomers || customers.length > 0) return;

    setLoadingCustomers(true);
    try {
      const response = await axiosInstance.get("getCustomerListWithNameAndId");
      const mappedOptions = response.data.map((customer) => ({
        value: customer.id,
        label: customer.companyName,
      }));
      setCustomers(mappedOptions);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Fetch payment mode options
  const fetchPaymentModes = async () => {
    if (loadingPaymentModes || paymentModes.length > 0) return;

    setLoadingPaymentModes(true);
    try {
      const response = await axiosInstance.get("getPaymentModesForInvoice");
      const mappedOptions = response.data.map((profile) => ({
        label: `${profile.profileName} (${profile.type})`,
        value: profile.paymentProfileId,
        isDefault: profile.default,
      }));
      setPaymentModes(mappedOptions);

      // Auto-select default payment mode if exists
      const defaultOption = mappedOptions.find((option) => option.isDefault);
      if (defaultOption) {
        setFormData((prev) => ({
          ...prev,
          paymentProfileId: defaultOption.value,
        }));
      }
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      toast.error("Failed to load payment modes");
    } finally {
      setLoadingPaymentModes(false);
    }
  };

  // Handle category selection from ExpenseCategoryDropdown
  const handleCategoryChange = (
    expenseCategoryId,
    expenseCategoryName = ""
  ) => {
    setFormData((prev) => ({
      ...prev,
      expenseCategoryId,
      expenseCategoryName,
    }));

    // Clear error for this field if exists
    if (errors.expenseCategoryId) {
      setErrors((prev) => ({
        ...prev,
        expenseCategoryId: "",
      }));
    }
  };

  // Handle vendor selection
  const handleVendorChange = (e) => {
    const vendorId = e.target.value;
    const selectedVendor = vendors.find((v) => v.value === vendorId);

    setFormData((prev) => ({
      ...prev,
      vendorId,
      vendorName: selectedVendor ? selectedVendor.label : "",
    }));

    // Clear error for this field if exists
    if (errors.vendorId) {
      setErrors((prev) => ({
        ...prev,
        vendorId: "",
      }));
    }
  };

  // Handle customer selection
  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = customers.find((c) => c.value === customerId);

    setFormData((prev) => ({
      ...prev,
      customerId,
      customerName: selectedCustomer ? selectedCustomer.label : null,
    }));
  };

  // Handle form field changes
  // Handle form field changes
  const handleChange = (field, value) => {
    // Special handling for status field
    if (field === "status") {
      if (value === "PAID") {
        // When status changed to PAID, set paidAmount to payableAmount
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          paidAmount: payableAmount,
        }));
      } else if (value === "UNPAID") {
        // When status changed to UNPAID, reset paidAmount and paymentProfileId
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          paidAmount: 0,
          paymentProfileId: "",
        }));
      } else {
        // For PARTIALLY_PAID or other statuses
        setFormData((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    } else {
      // For all other fields
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error for this field if exists
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle file upload
  // Handle file upload
  const handleFileUpload = (fileData) => {
    setFormData((prev) => ({
      ...prev,
      receiptAttachment: fileData.base64 || "",
      attachmentFileName: fileData.fileName || "",
      attachmentFileType: fileData.fileType || "",
    }));
  };
  // Add this new function for file removal
  const handleFileRemove = () => {
    setFormData((prev) => ({
      ...prev,
      receiptAttachment: "",
      attachmentFileName: "",
      attachmentFileType: "",
    }));
    toast.success("File removed");
  };

  // Handle select changes
  const handleSelectChange = (field, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    handleChange(field, value);

    // If expense type changes, clear HSN/SAC code
    if (field === "expenseType") {
      handleChange("hsnSac", "");
    }
  };

  // Handle number input changes
  const handleNumberChange = (field, value) => {
    // Special handling for paidAmount
    if (field === "paidAmount") {
      const numericValue = value === "" ? 0 : Number(value);

      // Validate against payableAmount
      if (numericValue > payableAmount) {
        // Auto-correct to max amount
        value = payableAmount;
      }

      // Check if paid amount equals payable amount
      if (Number(value) >= payableAmount) {
        // Auto-change status to PAID
        setFormData((prev) => ({
          ...prev,
          paidAmount: payableAmount,
          status: "PAID",
        }));
      }
      // If paid amount is > 0 but less than payable amount
      else if (Number(value) > 0) {
        // Ensure status is PARTIALLY_PAID
        if (formData.status !== "PARTIALLY_PAID") {
          setFormData((prev) => ({
            ...prev,
            paidAmount: Number(value),
            status: "PARTIALLY_PAID",
          }));
        } else {
          handleChange(field, Number(value));
        }
      }
      // If paid amount is 0
      else {
        handleChange(field, Number(value));
      }

      // Clear any errors
      if (errors.paidAmount) {
        setErrors((prev) => ({
          ...prev,
          paidAmount: "",
        }));
      }
      return;
    }

    // Original logic for other fields
    if (value === "" || (!isNaN(value) && Number(value) >= 0)) {
      handleChange(field, value === "" ? "" : Number(value));
    }
  };

  // Check if field is required
  const isFieldRequired = (field) => {
    return requiredFields[field];
  };

  // Focus on the first error field
  const focusOnFirstError = (newErrors) => {
    const firstErrorKey = Object.keys(newErrors)[0];
    if (firstErrorKey) {
      let errorTab = "basic";

      // Determine which tab the error field belongs to
      for (const tab of tabs) {
        if (tab.fields.includes(firstErrorKey)) {
          errorTab = tab.id;
          break;
        }
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

    // Basic Information validation
    if (!formData.vendorId) newErrors.vendorId = "Vendor is required";
    if (!formData.expenseCategoryId)
      newErrors.expenseCategoryId = "Category is required";

    if (formData.expenseType === "GOODS" && !formData.hsnSac) {
      newErrors.hsnSac = "HSN Code is required for Goods";
    } else if (formData.expenseType === "SERVICES" && !formData.hsnSac) {
      newErrors.hsnSac = "SAC Code is required for Services";
    }

    // Customer & Dates validation
    if (!formData.expenseDate)
      newErrors.expenseDate = "Expense date is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";

    // Financials & Tax validation
    if (!formData.taxableAmount || formData.taxableAmount <= 0) {
      newErrors.taxableAmount = "Taxable amount must be greater than 0";
    }

    // Tax validation based on tax type
    switch (formData.taxType) {
      case "SGST":
        if (formData.sgstPercentage < 0 || formData.sgstPercentage > 100) {
          newErrors.sgstPercentage = "SGST must be between 0 and 100";
        }
        break;
      case "CGST":
        if (formData.cgstPercentage < 0 || formData.cgstPercentage > 100) {
          newErrors.cgstPercentage = "CGST must be between 0 and 100";
        }
        break;
      case "CGST_SGST":
        if (formData.cgstPercentage < 0 || formData.cgstPercentage > 100) {
          newErrors.cgstPercentage = "CGST must be between 0 and 100";
        }
        if (formData.sgstPercentage < 0 || formData.sgstPercentage > 100) {
          newErrors.sgstPercentage = "SGST must be between 0 and 100";
        }
        // Validate total tax percentage
        const totalTax =
          (formData.cgstPercentage || 0) + (formData.sgstPercentage || 0);
        if (totalTax < 0 || totalTax > 100) {
          newErrors.taxPercentage = "Total tax must be between 0 and 100";
        }
        break;
      case "GST":
      case "IGST":
      case "Custom":
        if (formData.taxPercentage < 0 || formData.taxPercentage > 100) {
          newErrors.taxPercentage = "Tax percentage must be between 0 and 100";
        }
        break;
      case "No Tax":
        // No validation needed
        break;
      default:
        break;
    }

    // Payment Status validation
    if (formData.status === "PARTIALLY_PAID") {
      if (!formData.paymentProfileId) {
        newErrors.paymentProfileId =
          "Payment mode is required for partial payment";
      }
      if (!formData.paidAmount || formData.paidAmount <= 0) {
        newErrors.paidAmount = "Paid amount must be greater than 0";
      }
      if (formData.paidAmount >= payableAmount) {
        // Changed from totalAmount to payableAmount
        newErrors.paidAmount =
          "Paid amount cannot exceed or equal payable amount"; // Updated message
      }
    }

    if (formData.status === "PAID" && !formData.paymentProfileId) {
      newErrors.paymentProfileId = "Payment mode is required for paid status";
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
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setLoading(true);

    try {
      // Get selected vendor name
      const selectedVendor = vendors.find((v) => v.value === formData.vendorId);
      const vendorName = selectedVendor ? selectedVendor.label : "";

      // Get selected category name
      const expenseCategoryName = formData.expenseCategoryName;

      // Get selected customer name if any
      const selectedCustomer = customers.find(
        (c) => c.value === formData.customerId
      );
      const customerName = selectedCustomer ? selectedCustomer.label : null;

      // Prepare payload according to API format
      const payload = {
        vendorId: formData.vendorId,
        vendorName: vendorName,
        expenseCategoryId: formData.expenseCategoryId,
        expenseCategoryName: expenseCategoryName,
        expenseType: formData.expenseType,
        hsnSac: formData.hsnSac,
        note: formData.note,
        customerId: formData.customerId || null,
        customerName: customerName,
        expenseDate: formData.expenseDate,
        dueDate: formData.status !== "PAID" ? formData.dueDate : null, // Don't send due date if PAID
        currency: formData.currency,
        taxableAmount: Number(taxableAmountWithoutTax), // Send taxable amount without tax
        taxInvoiceInclusive: isTaxInclusive,
        taxType: formData.taxType, // Already in correct format (CGST_SGST)
        taxPercentage: Number(formData.taxPercentage) || 0,
        cgstPercentage: Number(formData.cgstPercentage) || 0,
        sgstPercentage: Number(formData.sgstPercentage) || 0,
        tdsPercentage: tdsApplicable ? Number(formData.tdsPercentage) || 0 : 0,
        tdsAmount: tdsApplicable ? tdsAmount : 0,
        status: formData.status,
        paidAmount: Number(formData.paidAmount) || 0,
        totalAmount: totalAmount,
        dueAmount: dueAmount,
        paymentProfileId: formData.paymentProfileId || null,
        billable: formData.billable,
        // Attachment fields
        receiptAttachment: formData.receiptAttachment || null,
        attachmentFileName: formData.attachmentFileName || null,
        attachmentFileType: formData.attachmentFileType || null,
      };

      console.log("Submitting payload:", payload);
      const response = await axiosInstance.post("createExpense", payload);
      toast.success("Expense created successfully!");
      onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create expense. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: formData.currency || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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

  // In CreateExpenseModal.jsx, update the renderBasicTab function:

  const renderBasicTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <ExpenseCategoryDropdown
            label={<>Expense Category</>}
            value={formData.expenseCategoryId}
            onChange={(categoryId, categoryName) =>
              handleCategoryChange(categoryId, categoryName)
            }
            error={errors.expenseCategoryId}
            required={true}
            loading={loadingCategories}
            categoriesData={categoriesData}
            className="text-sm"
          />
        </div>
        <GlobalSelectField
          label={
            <>
              Vendor
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="vendorId"
          value={formData.vendorId}
          onChange={handleVendorChange} // Use the new handler
          options={[
            { value: "", label: "Select vendor" },
            ...vendors.map((vendor) => ({
              value: vendor.value,
              label: vendor.label,
            })),
          ]}
          loading={loadingVendors}
          error={errors.vendorId}
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.vendorId = el)}
        />

        {/* Replace the GlobalSelectField for expenseCategoryId with our custom dropdown */}

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <span>Expense Type</span>
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex gap-4">
            {expenseTypeOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="expenseType"
                  value={option.value}
                  checked={formData.expenseType === option.value}
                  onChange={(e) => handleChange("expenseType", e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.expenseType && (
            <p className="text-red-500 text-xs">{errors.expenseType}</p>
          )}
        </div>

        <GlobalInputField
          label={
            <>
              {formData.expenseType === "GOODS" ? "HSN Code" : "SAC Code"}
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="hsnSac"
          value={formData.hsnSac}
          onChange={(e) => handleChange("hsnSac", e.target.value)}
          error={errors.hsnSac}
          placeholder={
            formData.expenseType === "GOODS"
              ? "Enter HSN code"
              : "Enter SAC code"
          }
          className="text-sm"
          ref={(el) => (errorFieldRefs.current.hsnSac = el)}
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="billable"
            name="billable"
            checked={formData.billable}
            onChange={(e) => handleChange("billable", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="billable" className="text-sm text-gray-700">
            Mark as Billable
          </label>
        </div>

        <GlobalInputField
          label={
            <>
              Expense Date
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="expenseDate"
          type="date"
          value={formData.expenseDate}
          onChange={(e) => handleChange("expenseDate", e.target.value)}
          error={errors.expenseDate}
          className="text-sm"
          min={getTodayDate()}
          ref={(el) => (errorFieldRefs.current.expenseDate = el)}
        />

        <div className="md:col-span-2">
          <GlobalTextAreaField
            label="Note"
            name="note"
            value={formData.note}
            onChange={(e) => handleChange("note", e.target.value)}
            placeholder="Enter expense description or notes"
            rows={3}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );

  // Remove the renderFinancialTab function and replace with:
  const renderFinancialTab = () => (
    <FinancialsTaxSection
      formData={formData}
      errors={errors}
      isTaxInclusive={isTaxInclusive}
      setIsTaxInclusive={setIsTaxInclusive}
      tdsApplicable={tdsApplicable}
      setTdsApplicable={setTdsApplicable}
      taxableAmountWithoutTax={taxableAmountWithoutTax}
      taxAmount={taxAmount}
      totalAmount={totalAmount}
      tdsAmount={tdsAmount}
      payableAmount={payableAmount}
      dueAmount={dueAmount}
      taxOptions={taxOptions}
      handleNumberChange={handleNumberChange}
      handleChange={handleChange}
      formatCurrency={formatCurrency}
      setErrorFieldRef={(field, el) => (errorFieldRefs.current[field] = el)}
    />
  );

  // Render Payment Status Tab
  const renderPaymentTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalSelectField
          label={
            <>
              Status
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="status"
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value)}
          options={statusOptions}
          className="text-sm"
        />

        {/* Show payment fields based on status */}
        {formData.status === "PAID" && (
          <>
            <GlobalInputField
              label={
                <>
                  Paid Amount
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              name="paidAmount"
              type="number"
              value={formData.paidAmount}
              disabled
              readOnly
              className="text-sm"
              prefix={
                formData.currency === "INR"
                  ? "₹"
                  : formData.currency === "USD"
                  ? "$"
                  : "€"
              }
              helperText={`Payable amount: ${formatCurrency(payableAmount)}`}
            />

            <GlobalSelectField
              label={
                <>
                  Payment Mode
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              name="paymentProfileId"
              value={formData.paymentProfileId}
              onChange={(e) => handleChange("paymentProfileId", e.target.value)}
              options={[
                { value: "", label: "Select payment mode" },
                ...paymentModes.map((mode) => ({
                  value: mode.value,
                  label: mode.label,
                })),
              ]}
              loading={loadingPaymentModes}
              error={errors.paymentProfileId}
              className="text-sm"
              ref={(el) => (errorFieldRefs.current.paymentProfileId = el)}
            />
          </>
        )}

        {formData.status === "PARTIALLY_PAID" && (
          <>
            <GlobalInputField
              label={
                <>
                  Paid Amount
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              name="paidAmount"
              type="number"
              value={formData.paidAmount}
              onChange={(e) => handleNumberChange("paidAmount", e.target.value)}
              error={errors.paidAmount}
              min="0"
              max={totalAmount}
              step="0.01"
              className="text-sm"
              prefix={
                formData.currency === "INR"
                  ? "₹"
                  : formData.currency === "USD"
                  ? "$"
                  : "€"
              }
              ref={(el) => (errorFieldRefs.current.paidAmount = el)}
            />

            <GlobalSelectField
              label={
                <>
                  Payment Mode
                  <span className="text-red-500 ml-1">*</span>
                </>
              }
              name="paymentProfileId"
              value={formData.paymentProfileId}
              onChange={(e) => handleChange("paymentProfileId", e.target.value)}
              options={[
                { value: "", label: "Select payment mode" },
                ...paymentModes.map((mode) => ({
                  value: mode.value,
                  label: mode.label,
                })),
              ]}
              loading={loadingPaymentModes}
              error={errors.paymentProfileId}
              className="text-sm"
              ref={(el) => (errorFieldRefs.current.paymentProfileId = el)}
            />

            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(dueAmount)}
              </p>
            </div>
          </>
        )}

        {formData.status !== "PAID" && (
          <GlobalInputField
            label={
              <>
                Due Date
                <span className="text-red-500 ml-1">*</span>
              </>
            }
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            error={errors.dueDate}
            className="text-sm"
            min={formData.expenseDate}
            ref={(el) => (errorFieldRefs.current.dueDate = el)}
          />
        )}

        <GlobalSelectField
          label="Customer (Optional)"
          name="customerId"
          value={formData.customerId}
          onChange={handleCustomerChange} // Use the new handler
          options={[
            { value: "", label: "Select customer" },
            ...customers.map((customer) => ({
              value: customer.value,
              label: customer.label,
            })),
          ]}
          loading={loadingCustomers}
          className="text-sm"
        />
      </div>
    </div>
  );

  // In CreateExpenseModal.jsx, update renderAttachmentsTab:
  const renderAttachmentsTab = () => {
    // Prepare current file data for FileUploadComponent
    const currentFile = formData.receiptAttachment
      ? {
          fileName: formData.attachmentFileName || "Uploaded File",
          fileType: formData.attachmentFileType || "application/octet-stream",
          base64: formData.receiptAttachment,
        }
      : null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <FileUploadComponent
            label="Receipt Attachment"
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            existingFile={null} // Not needed for create
            currentFile={currentFile} // Pass current file
            maxFileSize={5}
          />
        </div>
      </div>
    );
  };
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Create New Expense</h2>
                <p className="text-blue-100 text-xs">
                  Fill in the expense details below
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

        {/* Tab Navigation */}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit}>
            {activeTab === "basic" && renderBasicTab()}

            {activeTab === "financial" && renderFinancialTab()}
            {activeTab === "payment" && renderPaymentTab()}
            {activeTab === "attachments" && renderAttachmentsTab()}
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Create Expense
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

export default CreateExpenseModal;
