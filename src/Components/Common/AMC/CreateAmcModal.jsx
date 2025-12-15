import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField
} from '../../BaseComponet/CustomerFormInputs';

function CreateAmcModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [activeTab, setActiveTab] = useState('client'); // Tab state
  const [selectedClientId, setSelectedClientId] = useState(''); // Track selected client ID
  const [tabErrors, setTabErrors] = useState({}); // Track which tabs have errors

  // Refs for focusing on error fields
  const errorFieldRefs = useRef({});

  // Main form state matching API structure
  const [formData, setFormData] = useState({
    // AMC Info
    amcInfo: {
      adminId: "ADMIN123", // You might want to get this from auth context
      employeeId: "",
      clinetName: "",
      companyName: "",
      contactPersonName: "",
      email: "",
      phoneNumber: "",
      websiteURL: "",
      technology: "",
      hostingProvider: "Wix", // Set Wix as default
      domainProvider: "",
      assingedTo: ""
    },
    
    // AMC History Info
    amcHistoryInfo: {
      amcStartDate: "",
      amcEndDate: "",
      amcAmount: "",
      amcScope: "",
      amcRecycleType: "Yearly",
      sequence: 1
    },
    
    // AMC Domain History Info
    amcDomainHistoryInfo: {
      domainStartDate: "",
      domainRenewalDate: "",
      domainAmount: "",
      domainRenewalCycle: "1 Year",
      sequence: 1
    }
  });

  const [errors, setErrors] = useState({});

  // Options for dropdowns
  const recycleTypeOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Half-Yearly", label: "Half-Yearly" },
    { value: "Yearly", label: "Yearly" },
    { value: "2 Years", label: "2 Years" }
  ];

  const domainRenewalOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Half-Yearly", label: "Half-Yearly" },
    { value: "1 Year", label: "1 Year" },
    { value: "2 Years", label: "2 Years" },
    { value: "3 Years", label: "3 Years" }
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
    { value: "Other", label: "Other" }
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
    { value: "Other", label: "Other" }
  ];

  const domainProviderOptions = [
    { value: "Wix", label: "Wix" },
    { value: "GoDaddy", label: "GoDaddy" },
    { value: "Namecheap", label: "Namecheap" },
    { value: "Google Domains", label: "Google Domains" },
    { value: "Cloudflare", label: "Cloudflare" },
    { value: "Name.com", label: "Name.com" },
    { value: "Other", label: "Other" }
  ];

  // Tabs configuration
  const tabs = [
    { id: 'client', label: 'Client Information', fields: ['companyName', 'contactPersonName', 'email', 'phoneNumber'] },
    { id: 'technical', label: 'Technical Information', fields: ['technology', 'assingedTo'] },
    { id: 'amc', label: 'AMC Details', fields: ['amcStartDate', 'amcEndDate', 'amcAmount', 'amcScope'] },
    { id: 'domain', label: 'Domain Details', fields: ['domainStartDate', 'domainRenewalDate', 'domainAmount'] }
  ];

  // Required fields configuration
  const requiredFields = {
    amcInfo: {
      companyName: true,
      contactPersonName: true,
      email: true,
      phoneNumber: true,
      technology: true,
      assingedTo: true
    },
    amcHistoryInfo: {
      amcStartDate: true,
      amcEndDate: true,
      amcAmount: true,
      amcScope: true
    },
    amcDomainHistoryInfo: {
      domainStartDate: true,
      domainRenewalDate: true,
      domainAmount: true
    }
  };

  // Fetch employees and clients on component mount
  useEffect(() => {
    fetchEmployees();
    fetchClients();
  }, []);

  // Update tab errors when errors change
  useEffect(() => {
    const newTabErrors = {};
    
    tabs.forEach(tab => {
      const hasError = tab.fields.some(field => {
        if (tab.id === 'client' || tab.id === 'technical') {
          return errors[`amcInfo.${field}`];
        } else if (tab.id === 'amc') {
          return errors[`amcHistoryInfo.${field}`];
        } else if (tab.id === 'domain') {
          return errors[`amcDomainHistoryInfo.${field}`];
        }
        return false;
      });
      
      newTabErrors[tab.id] = hasError;
    });
    
    setTabErrors(newTabErrors);
  }, [errors]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await axiosInstance.get('getEmployeeNameAndId');
      if (response.data && Array.isArray(response.data)) {
        const formattedEmployees = response.data.map(emp => ({
          value: emp.employeeId || emp.id,
          label: emp.name
        }));
        setEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await axiosInstance.get('getCustomerListWithNameAndId');
      if (response.data && Array.isArray(response.data)) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
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
          contactPersonName: "", // Not available in API response
          email: customer.email || "",
          phoneNumber: customer.mobile || customer.phone || "",
          websiteURL: customer.website || "",
          companyName: customer.companyName || ""
        };
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
    return null;
  };

  // Handle form field changes
  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear error for this field if exists
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: ""
      }));
    }
  };

  // Handle client selection - auto-fill client details
  const handleClientChange = async (clientId) => {
    setSelectedClientId(clientId);
    
    if (!clientId) {
      // Clear client details if no client selected
      setFormData(prev => ({
        ...prev,
        amcInfo: {
          ...prev.amcInfo,
          clinetName: "",
          companyName: "",
          contactPersonName: "",
          email: "",
          phoneNumber: "",
          websiteURL: "",
          employeeId: ""
        }
      }));
      return;
    }

    try {
      // Fetch customer details
      const customerDetails = await fetchCustomerDetails(clientId);
      
      if (customerDetails) {
        // Get selected client company name
        const selectedClient = clients.find(client => client.id === clientId);
        
        setFormData(prev => ({
          ...prev,
          amcInfo: {
            ...prev.amcInfo,
            clinetName: selectedClient?.companyName || "",
            companyName: selectedClient?.companyName || "",
            contactPersonName: customerDetails.contactPersonName || "",
            email: customerDetails.email || "",
            phoneNumber: customerDetails.phoneNumber || "",
            websiteURL: customerDetails.websiteURL || ""
          }
        }));
      }
    } catch (error) {
      console.error('Error handling client change:', error);
    }
  };

  // Auto-calculate AMC end date based on start date and recycle type
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
    
    return date.toISOString().split('T')[0];
  };

  // Auto-calculate domain renewal date based on start date and cycle
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
    
    return date.toISOString().split('T')[0];
  };

  // Handle AMC start date change
  const handleAmcStartDateChange = (date) => {
    handleChange("amcHistoryInfo", "amcStartDate", date);
    
    // Auto-calculate end date
    const endDate = calculateAmcEndDate(date, formData.amcHistoryInfo.amcRecycleType);
    handleChange("amcHistoryInfo", "amcEndDate", endDate);
  };

  // Handle AMC recycle type change
  const handleAmcRecycleTypeChange = (type) => {
    handleChange("amcHistoryInfo", "amcRecycleType", type);
    
    // Recalculate end date if start date exists
    if (formData.amcHistoryInfo.amcStartDate) {
      const endDate = calculateAmcEndDate(formData.amcHistoryInfo.amcStartDate, type);
      handleChange("amcHistoryInfo", "amcEndDate", endDate);
    }
  };

  // Handle domain start date change
  const handleDomainStartDateChange = (date) => {
    handleChange("amcDomainHistoryInfo", "domainStartDate", date);
    
    // Auto-calculate renewal date
    const renewalDate = calculateDomainRenewalDate(date, formData.amcDomainHistoryInfo.domainRenewalCycle);
    handleChange("amcDomainHistoryInfo", "domainRenewalDate", renewalDate);
  };

  // Handle domain renewal cycle change
  const handleDomainRenewalCycleChange = (cycle) => {
    handleChange("amcDomainHistoryInfo", "domainRenewalCycle", cycle);
    
    // Recalculate renewal date if start date exists
    if (formData.amcDomainHistoryInfo.domainStartDate) {
      const renewalDate = calculateDomainRenewalDate(
        formData.amcDomainHistoryInfo.domainStartDate, 
        cycle
      );
      handleChange("amcDomainHistoryInfo", "domainRenewalDate", renewalDate);
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
      // Switch to the tab containing the error
      let errorTab = 'client';
      let errorField = '';
      
      if (firstErrorKey.startsWith('amcInfo.')) {
        errorField = firstErrorKey.replace('amcInfo.', '');
        if (['companyName', 'contactPersonName', 'email', 'phoneNumber'].includes(errorField)) {
          errorTab = 'client';
        } else if (['technology', 'assingedTo'].includes(errorField)) {
          errorTab = 'technical';
        }
      } else if (firstErrorKey.startsWith('amcHistoryInfo.')) {
        errorTab = 'amc';
        errorField = firstErrorKey.replace('amcHistoryInfo.', '');
      } else if (firstErrorKey.startsWith('amcDomainHistoryInfo.')) {
        errorTab = 'domain';
        errorField = firstErrorKey.replace('amcDomainHistoryInfo.', '');
      }
      
      // Switch to the tab with error
      setActiveTab(errorTab);
      
      // Focus on the field after a small delay to allow tab switch
      setTimeout(() => {
        const fieldRef = errorFieldRefs.current[firstErrorKey];
        if (fieldRef && fieldRef.focus) {
          fieldRef.focus();
          fieldRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate AMC Info
    if (!formData.amcInfo.companyName?.trim()) {
      newErrors["amcInfo.companyName"] = "Company name is required";
    }

    if (!formData.amcInfo.contactPersonName?.trim()) {
      newErrors["amcInfo.contactPersonName"] = "Contact person name is required";
    }

    if (!formData.amcInfo.email?.trim()) {
      newErrors["amcInfo.email"] = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.amcInfo.email)) {
      newErrors["amcInfo.email"] = "Email is invalid";
    }

    if (!formData.amcInfo.phoneNumber?.trim()) {
      newErrors["amcInfo.phoneNumber"] = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.amcInfo.phoneNumber)) {
      newErrors["amcInfo.phoneNumber"] = "Phone number must be 10 digits";
    }

    if (!formData.amcInfo.technology) {
      newErrors["amcInfo.technology"] = "Technology is required";
    }

    if (!formData.amcInfo.assingedTo) {
      newErrors["amcInfo.assingedTo"] = "Assigned to is required";
    }

    // Validate AMC History Info
    if (!formData.amcHistoryInfo.amcStartDate) {
      newErrors["amcHistoryInfo.amcStartDate"] = "AMC start date is required";
    }

    if (!formData.amcHistoryInfo.amcEndDate) {
      newErrors["amcHistoryInfo.amcEndDate"] = "AMC end date is required";
    }

    if (!formData.amcHistoryInfo.amcAmount) {
      newErrors["amcHistoryInfo.amcAmount"] = "AMC amount is required";
    } else if (isNaN(formData.amcHistoryInfo.amcAmount) || parseFloat(formData.amcHistoryInfo.amcAmount) <= 0) {
      newErrors["amcHistoryInfo.amcAmount"] = "AMC amount must be a positive number";
    }

    if (!formData.amcHistoryInfo.amcScope?.trim()) {
      newErrors["amcHistoryInfo.amcScope"] = "AMC scope is required";
    }

    // Validate Domain History Info
    if (!formData.amcDomainHistoryInfo.domainStartDate) {
      newErrors["amcDomainHistoryInfo.domainStartDate"] = "Domain start date is required";
    }

    if (!formData.amcDomainHistoryInfo.domainRenewalDate) {
      newErrors["amcDomainHistoryInfo.domainRenewalDate"] = "Domain renewal date is required";
    }

    if (!formData.amcDomainHistoryInfo.domainAmount) {
      newErrors["amcDomainHistoryInfo.domainAmount"] = "Domain amount is required";
    } else if (isNaN(formData.amcDomainHistoryInfo.domainAmount) || parseFloat(formData.amcDomainHistoryInfo.domainAmount) <= 0) {
      newErrors["amcDomainHistoryInfo.domainAmount"] = "Domain amount must be a positive number";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      focusOnFirstError(newErrors);
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.", {
       
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare payload
      const payload = {
        amcInfo: {
          ...formData.amcInfo,
          // Ensure adminId is set (you might get this from auth context)
          adminId: formData.amcInfo.adminId || "ADMIN123",
          // Convert amounts to numbers
          amcAmount: parseFloat(formData.amcHistoryInfo.amcAmount),
          domainAmount: parseFloat(formData.amcDomainHistoryInfo.domainAmount)
        },
        amcHistoryInfo: {
          ...formData.amcHistoryInfo,
          amcAmount: parseFloat(formData.amcHistoryInfo.amcAmount)
        },
        amcDomainHistoryInfo: {
          ...formData.amcDomainHistoryInfo,
          domainAmount: parseFloat(formData.amcDomainHistoryInfo.domainAmount)
        }
      };

      console.log('Sending AMC creation payload:', JSON.stringify(payload, null, 2));

      const response = await axiosInstance.post('createAMC', payload);

      if (response.data) {
        console.log('AMC created successfully:', response.data);
        toast.success('AMC created successfully!');
        
        // Pass created AMC data back to parent
        onSuccess(response.data);
        
        // Close modal
        onClose();
      } else {
        throw new Error('No response data received');
      }
    } catch (error) {
      console.error('Error creating AMC:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 400) {
          toast.error('Validation error: ' + (error.response.data?.message || 'Check your input'));
        } else if (error.response.status === 500) {
          toast.error('Server error: ' + (error.response.data?.message || 'Internal server error'));
        } else {
          toast.error('Failed to create AMC: ' + (error.response.data?.message || 'Unknown error'));
        }
      } else if (error.request) {
        console.error('Request error:', error.request);
        toast.error('Network error. Please check your connection.');
      } else {
        console.error('Error:', error.message);
        toast.error('Failed to create AMC. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Handle next button click
  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
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

  // Tab content components
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
              ...clients.map(client => ({ 
                value: client.id, 
                label: client.companyName || `Client ${client.id.substring(0, 8)}` 
              }))
            ]}
            loading={loadingClients}
            className="text-sm"
          />
        </div>

        <GlobalInputField
          label={
            <>
              Client Name
              {isFieldRequired('amcInfo', 'clinetName') && <span className="text-red-500 ml-1">*</span>}
            </>
          }
          name="clinetName"
          value={formData.amcInfo.clinetName}
          onChange={(e) => handleChange("amcInfo", "clinetName", e.target.value)}
          error={errors["amcInfo.clinetName"]}
          placeholder="Enter client name"
          className="text-sm"
          ref={(el) => errorFieldRefs.current["amcInfo.clinetName"] = el}
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
          onChange={(e) => handleChange("amcInfo", "companyName", e.target.value)}
          error={errors["amcInfo.companyName"]}
          placeholder="Enter company name"
          className="text-sm"
          ref={(el) => errorFieldRefs.current["amcInfo.companyName"] = el}
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
          onChange={(e) => handleChange("amcInfo", "contactPersonName", e.target.value)}
          error={errors["amcInfo.contactPersonName"]}
          placeholder="Enter contact person name"
          className="text-sm"
          ref={(el) => errorFieldRefs.current["amcInfo.contactPersonName"] = el}
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
          ref={(el) => errorFieldRefs.current["amcInfo.email"] = el}
        />

        <GlobalInputField
          label={
            <>
              Phone Number
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="phoneNumber"
          value={formData.amcInfo.phoneNumber}
          onChange={(e) => handleChange("amcInfo", "phoneNumber", e.target.value)}
          error={errors["amcInfo.phoneNumber"]}
          placeholder="9876543210"
          className="text-sm"
          ref={(el) => errorFieldRefs.current["amcInfo.phoneNumber"] = el}
        />

        <GlobalInputField
          label="Website URL"
          name="websiteURL"
          value={formData.amcInfo.websiteURL}
          onChange={(e) => handleChange("amcInfo", "websiteURL", e.target.value)}
          placeholder="https://www.example.com"
          className="text-sm"
        />
      </div>
    </div>
  );

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
          onChange={(e) => handleChange("amcInfo", "technology", e.target.value)}
          options={[
            { value: "", label: "Select technology" },
            ...technologyOptions
          ]}
          error={errors["amcInfo.technology"]}
          className="text-sm"
          ref={(el) => errorFieldRefs.current["amcInfo.technology"] = el}
        />

        <GlobalSelectField
          label="Domain Provider"
          name="domainProvider"
          value={formData.amcInfo.domainProvider}
          onChange={(e) => handleChange("amcInfo", "domainProvider", e.target.value)}
          options={[
            { value: "", label: "Select domain provider" },
            ...domainProviderOptions
          ]}
          className="text-sm"
        />

        <GlobalSelectField
          label="Hosting Provider"
          name="hostingProvider"
          value={formData.amcInfo.hostingProvider}
          onChange={(e) => handleChange("amcInfo", "hostingProvider", e.target.value)}
          options={[
            { value: "", label: "Select hosting provider" },
            ...hostingProviderOptions
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
          onChange={(e) => handleChange("amcInfo", "assingedTo", e.target.value)}
          options={[
            { value: "", label: "Select employee" },
            ...employees.map(emp => ({ value: emp.value, label: emp.label }))
          ]}
          loading={loadingEmployees}
          error={errors["amcInfo.assingedTo"]}
          className="text-sm"
          ref={(el) => errorFieldRefs.current["amcInfo.assingedTo"] = el}
        />
      </div>
    </div>
  );

  const renderAmcTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label={
            <>
              AMC Start Date
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="amcStartDate"
          type="date"
          value={formData.amcHistoryInfo.amcStartDate}
          onChange={(e) => handleAmcStartDateChange(e.target.value)}
          error={errors["amcHistoryInfo.amcStartDate"]}
          className="text-sm"
          min={getTodayDate()}
          ref={(el) => errorFieldRefs.current["amcHistoryInfo.amcStartDate"] = el}
        />

        <GlobalInputField
          label={
            <>
              AMC End Date
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="amcEndDate"
          type="date"
          value={formData.amcHistoryInfo.amcEndDate}
          onChange={(e) => handleChange("amcHistoryInfo", "amcEndDate", e.target.value)}
          error={errors["amcHistoryInfo.amcEndDate"]}
          className="text-sm"
          readOnly
          style={{ backgroundColor: '#f9f9f9' }}
          ref={(el) => errorFieldRefs.current["amcHistoryInfo.amcEndDate"] = el}
        />

        <GlobalInputField
          label={
            <>
              AMC Amount
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="amcAmount"
          type="number"
          value={formData.amcHistoryInfo.amcAmount}
          onChange={(e) => handleChange("amcHistoryInfo", "amcAmount", e.target.value)}
          error={errors["amcHistoryInfo.amcAmount"]}
          placeholder="25000"
          min="0"
          step="0.01"
          className="text-sm"
          ref={(el) => errorFieldRefs.current["amcHistoryInfo.amcAmount"] = el}
        />

        <GlobalSelectField
          label="AMC Recycle Type"
          name="amcRecycleType"
          value={formData.amcHistoryInfo.amcRecycleType}
          onChange={(e) => handleAmcRecycleTypeChange(e.target.value)}
          options={recycleTypeOptions}
          className="text-sm"
        />
      </div>

      <div>
        <GlobalTextAreaField
          label={
            <>
              AMC Scope
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="amcScope"
          value={formData.amcHistoryInfo.amcScope}
          onChange={(e) => handleChange("amcHistoryInfo", "amcScope", e.target.value)}
          error={errors["amcHistoryInfo.amcScope"]}
          placeholder="e.g., Full website maintenance, bug fixes, security patches, monthly reports, 24/7 support..."
          rows={4}
          className="text-sm"
          ref={(el) => errorFieldRefs.current["amcHistoryInfo.amcScope"] = el}
        />
      </div>
    </div>
  );

  const renderDomainTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlobalInputField
          label={
            <>
              Domain Start Date
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="domainStartDate"
          type="date"
          value={formData.amcDomainHistoryInfo.domainStartDate}
          onChange={(e) => handleDomainStartDateChange(e.target.value)}
          error={errors["amcDomainHistoryInfo.domainStartDate"]}
          className="text-sm"
          ref={(el) => errorFieldRefs.current["amcDomainHistoryInfo.domainStartDate"] = el}
        />

        <GlobalInputField
          label={
            <>
              Domain Renewal Date
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="domainRenewalDate"
          type="date"
          value={formData.amcDomainHistoryInfo.domainRenewalDate}
          onChange={(e) => handleChange("amcDomainHistoryInfo", "domainRenewalDate", e.target.value)}
          error={errors["amcDomainHistoryInfo.domainRenewalDate"]}
          className="text-sm"
          readOnly
          style={{ backgroundColor: '#f9f9f9' }}
          ref={(el) => errorFieldRefs.current["amcDomainHistoryInfo.domainRenewalDate"] = el}
        />

        <GlobalInputField
          label={
            <>
              Domain Amount
              <span className="text-red-500 ml-1">*</span>
            </>
          }
          name="domainAmount"
          type="number"
          value={formData.amcDomainHistoryInfo.domainAmount}
          onChange={(e) => handleChange("amcDomainHistoryInfo", "domainAmount", e.target.value)}
          error={errors["amcDomainHistoryInfo.domainAmount"]}
          placeholder="1200"
          min="0"
          step="0.01"
          className="text-sm"
          ref={(el) => errorFieldRefs.current["amcDomainHistoryInfo.domainAmount"] = el}
        />

        <GlobalSelectField
          label="Domain Renewal Cycle"
          name="domainRenewalCycle"
          value={formData.amcDomainHistoryInfo.domainRenewalCycle}
          onChange={(e) => handleDomainRenewalCycleChange(e.target.value)}
          options={domainRenewalOptions}
          className="text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header - Updated to blue gradient */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-3">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Create Annual Maintenance Charges (AMC)</h2>
                <p className="text-blue-100 text-xs">Fill in the AMC details below</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation - With error indicators */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } ${tabErrors[tab.id] ? 'pr-8' : ''}`}
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

        {/* Error summary banner */}
        {/* {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded mx-4 mt-4 p-3">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">
                  Please fix the following errors:
                </p>
                <ul className="mt-1 text-sm text-red-700 space-y-0.5">
                  {Object.entries(errors).slice(0, 3).map(([field, message]) => (
                    <li key={field} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>{message}</span>
                    </li>
                  ))}
                  {Object.keys(errors).length > 3 && (
                    <li className="text-red-600 italic">
                      ...and {Object.keys(errors).length - 3} more error(s)
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )} */}

        {/* Modal Body - Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit}>
            {/* Tab Content */}
            {activeTab === 'client' && renderClientTab()}
            {activeTab === 'technical' && renderTechnicalTab()}
            {activeTab === 'amc' && renderAmcTab()}
            {activeTab === 'domain' && renderDomainTab()}
          </form>
        </div>

        {/* Modal Footer - Simplified */}
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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