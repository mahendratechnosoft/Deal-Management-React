import React, { useState, useEffect } from 'react';
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
      hostingProvider: "",
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
      domainRenewalCycle: "Yearly",
      sequence: 1
    }
  });

  const [errors, setErrors] = useState({});

  // Options for dropdowns
  const recycleTypeOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Half-Yearly", label: "Half-Yearly" },
    { value: "Yearly", label: "Yearly" }
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
    { value: "Other", label: "Other" }
  ];

  const hostingProviderOptions = [
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
    { value: "GoDaddy", label: "GoDaddy" },
    { value: "Namecheap", label: "Namecheap" },
    { value: "Google Domains", label: "Google Domains" },
    { value: "Cloudflare", label: "Cloudflare" },
    { value: "Name.com", label: "Name.com" },
    { value: "Other", label: "Other" }
  ];

  // Fetch employees and clients on component mount
  useEffect(() => {
    fetchEmployees();
    fetchClients();
  }, []);

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
        const formattedClients = response.data.map(client => ({
          value: client.id,
          label: `${client.companyName || 'Client'} - ${client.contactPersonName || ''}`,
          clientData: client
        }));
        setClients(formattedClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
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
  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(client => client.value === clientId)?.clientData;
    
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        amcInfo: {
          ...prev.amcInfo,
          clinetName: selectedClient.contactPersonName || "",
          companyName: selectedClient.companyName || "",
          contactPersonName: selectedClient.contactPersonName || "",
          email: selectedClient.email || "",
          phoneNumber: selectedClient.phone || "",
          websiteURL: selectedClient.website || "",
          employeeId: selectedClient.assignedTo || ""
        }
      }));
    } else {
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
      case "Yearly":
        date.setFullYear(date.getFullYear() + 1);
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
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
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

      const response = await axiosInstance.post('/createAMC', payload);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Create Annual Maintenance Contract (AMC)</h2>
                <p className="text-green-100 text-xs">Fill in the AMC details below</p>
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

        {/* Modal Body - Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-3">
          <form onSubmit={handleSubmit}>
            {/* Client Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Client Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Select Existing Client */}
                <GlobalSelectField
                  label="Select Client (Optional)"
                  name="client"
                  value={formData.amcInfo.clinetName ? "selected" : ""}
                  onChange={(e) => handleClientChange(e.target.value)}
                  options={[
                    { value: "", label: "Select a client" },
                    ...clients.map(client => ({ value: client.value, label: client.label }))
                  ]}
                  loading={loadingClients}
                  className="text-sm"
                />

                <div className="md:col-span-2 h-px bg-gray-200 my-2"></div>

                {/* Client Details */}
                <GlobalInputField
                  label="Client Name *"
                  name="clinetName"
                  value={formData.amcInfo.clinetName}
                  onChange={(e) => handleChange("amcInfo", "clinetName", e.target.value)}
                  error={errors["amcInfo.clinetName"]}
                  placeholder="Enter client name"
                  className="text-sm"
                  required
                />

                <GlobalInputField
                  label="Company Name *"
                  name="companyName"
                  value={formData.amcInfo.companyName}
                  onChange={(e) => handleChange("amcInfo", "companyName", e.target.value)}
                  error={errors["amcInfo.companyName"]}
                  placeholder="Enter company name"
                  className="text-sm"
                  required
                />

                <GlobalInputField
                  label="Contact Person Name *"
                  name="contactPersonName"
                  value={formData.amcInfo.contactPersonName}
                  onChange={(e) => handleChange("amcInfo", "contactPersonName", e.target.value)}
                  error={errors["amcInfo.contactPersonName"]}
                  placeholder="Enter contact person name"
                  className="text-sm"
                  required
                />

                <GlobalInputField
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.amcInfo.email}
                  onChange={(e) => handleChange("amcInfo", "email", e.target.value)}
                  error={errors["amcInfo.email"]}
                  placeholder="client@company.com"
                  className="text-sm"
                  required
                />

                <GlobalInputField
                  label="Phone Number *"
                  name="phoneNumber"
                  value={formData.amcInfo.phoneNumber}
                  onChange={(e) => handleChange("amcInfo", "phoneNumber", e.target.value)}
                  error={errors["amcInfo.phoneNumber"]}
                  placeholder="9876543210"
                  className="text-sm"
                  required
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

            {/* Technical Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Technical Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <GlobalSelectField
                  label="Technology *"
                  name="technology"
                  value={formData.amcInfo.technology}
                  onChange={(e) => handleChange("amcInfo", "technology", e.target.value)}
                  options={[
                    { value: "", label: "Select technology" },
                    ...technologyOptions
                  ]}
                  error={errors["amcInfo.technology"]}
                  className="text-sm"
                  required
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
                  label="Assigned To *"
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
                  required
                />
              </div>
            </div>

            {/* AMC Contract Details Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                AMC Contract Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <GlobalInputField
                  label="AMC Start Date *"
                  name="amcStartDate"
                  type="date"
                  value={formData.amcHistoryInfo.amcStartDate}
                  onChange={(e) => handleAmcStartDateChange(e.target.value)}
                  error={errors["amcHistoryInfo.amcStartDate"]}
                  className="text-sm"
                  required
                  min={getTodayDate()}
                />

                <GlobalInputField
                  label="AMC End Date *"
                  name="amcEndDate"
                  type="date"
                  value={formData.amcHistoryInfo.amcEndDate}
                  onChange={(e) => handleChange("amcHistoryInfo", "amcEndDate", e.target.value)}
                  error={errors["amcHistoryInfo.amcEndDate"]}
                  className="text-sm"
                  required
                  readOnly
                  style={{ backgroundColor: '#f9f9f9' }}
                />

                <GlobalInputField
                  label="AMC Amount (₹) *"
                  name="amcAmount"
                  type="number"
                  value={formData.amcHistoryInfo.amcAmount}
                  onChange={(e) => handleChange("amcHistoryInfo", "amcAmount", e.target.value)}
                  error={errors["amcHistoryInfo.amcAmount"]}
                  placeholder="25000"
                  min="0"
                  step="0.01"
                  className="text-sm"
                  required
                />

                <GlobalSelectField
                  label="AMC Recycle Type *"
                  name="amcRecycleType"
                  value={formData.amcHistoryInfo.amcRecycleType}
                  onChange={(e) => handleAmcRecycleTypeChange(e.target.value)}
                  options={recycleTypeOptions}
                  className="text-sm"
                />

                <div className="md:col-span-2">
                  <GlobalTextAreaField
                    label="AMC Scope *"
                    name="amcScope"
                    value={formData.amcHistoryInfo.amcScope}
                    onChange={(e) => handleChange("amcHistoryInfo", "amcScope", e.target.value)}
                    error={errors["amcHistoryInfo.amcScope"]}
                    placeholder="e.g., Full website maintenance, bug fixes, security patches, monthly reports, 24/7 support..."
                    rows={3}
                    className="text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Domain Details Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Domain Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <GlobalInputField
                  label="Domain Start Date *"
                  name="domainStartDate"
                  type="date"
                  value={formData.amcDomainHistoryInfo.domainStartDate}
                  onChange={(e) => handleDomainStartDateChange(e.target.value)}
                  error={errors["amcDomainHistoryInfo.domainStartDate"]}
                  className="text-sm"
                  required
                />

                <GlobalInputField
                  label="Domain Renewal Date *"
                  name="domainRenewalDate"
                  type="date"
                  value={formData.amcDomainHistoryInfo.domainRenewalDate}
                  onChange={(e) => handleChange("amcDomainHistoryInfo", "domainRenewalDate", e.target.value)}
                  error={errors["amcDomainHistoryInfo.domainRenewalDate"]}
                  className="text-sm"
                  required
                  readOnly
                  style={{ backgroundColor: '#f9f9f9' }}
                />

                <GlobalInputField
                  label="Domain Amount (₹) *"
                  name="domainAmount"
                  type="number"
                  value={formData.amcDomainHistoryInfo.domainAmount}
                  onChange={(e) => handleChange("amcDomainHistoryInfo", "domainAmount", e.target.value)}
                  error={errors["amcDomainHistoryInfo.domainAmount"]}
                  placeholder="1200"
                  min="0"
                  step="0.01"
                  className="text-sm"
                  required
                />

                <GlobalSelectField
                  label="Domain Renewal Cycle *"
                  name="domainRenewalCycle"
                  value={formData.amcDomainHistoryInfo.domainRenewalCycle}
                  onChange={(e) => handleDomainRenewalCycleChange(e.target.value)}
                  options={recycleTypeOptions}
                  className="text-sm"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <p>* Required fields</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-xs font-medium"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Create AMC
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAmcModal;