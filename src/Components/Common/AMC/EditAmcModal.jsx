import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalSelectField,
} from "../../BaseComponet/CustomerFormInputs";
import AmcHistoryModal from "./AmcHistoryModal";
import DomainHistoryModal from "./DomainHistoryModal";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { showDeleteConfirmation } from "../../BaseComponet/alertUtils"; // Import the alert utility
import GsuiteHistoryModal from "./GsuiteHistoryModal";
import { hasPermission } from "../../BaseComponet/permissions";
// Add this import at the top
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useNavigate } from "react-router-dom";
import ProformaInfoModal from "../Proforma/ProformaInfoModal";
import ProformaPDF from "../Proforma/ProformaPDF";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { useLayout } from "../../Layout/useLayout";

function EditAmcModal({ amc, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const navigate = useNavigate();
    const { LayoutComponent,role } = useLayout();
  // Modal states
  const [showAmcHistoryModal, setShowAmcHistoryModal] = useState(false);
  const [showDomainHistoryModal, setShowDomainHistoryModal] = useState(false);
  const [editingHistory, setEditingHistory] = useState(null);
  const [editingDomain, setEditingDomain] = useState(null);

  const [gsuiteHistory, setGsuiteHistory] = useState([]);
  const [showGsuiteHistoryModal, setShowGsuiteHistoryModal] = useState(false);
  const [editingGsuite, setEditingGsuite] = useState(null);

  // Add to your existing state declarations
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");

  // Add to your existing state declarations
  const [showProformaInfoModal, setShowProformaInfoModal] = useState(false);
  const [selectedProforma, setSelectedProforma] = useState(null);

  const [selectedProformaData, setSelectedProformaData] = useState(null);
  const [adminInformation, setAdminInformation] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [selectedProformaForInfo, setSelectedProformaForInfo] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const canEdit = hasPermission("amc", "Edit");
  // Tab 1: Basic AMC Info - Match API field names exactly
  const [basicInfo, setBasicInfo] = useState({
    companyName: "",
    contactPersonName: "",
    email: "",
    phoneNumber: "",
    websiteURL: "",
    technology: "",
    hostingProvider: "Wix",
    domainProvider: "",
    assingedTo: "", // Note: double 's' to match API
    clientName: "",
  });

  // Tab 2: AMC History
  const [amcHistory, setAmcHistory] = useState([]);

  // Tab 3: Domain History
  const [domainHistory, setDomainHistory] = useState([]);

  // Options arrays
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

  // Tabs configuration
  const tabs = [
    { id: "basic", label: "Basic Information" },
    { id: "amc", label: "AMC History" },
    { id: "domain", label: "Domain History" },
    { id: "gsuite", label: "GSuite History" },
  ];

  // Helper function to calculate days remaining and status
  // Enhanced helper function to calculate days remaining and status for any date
  const getDueDateStatus = (dueDate) => {
    if (!dueDate)
      return {
        status: "unknown",
        daysRemaining: null,
        isPastDue: false,
        message: null,
      };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0); // Normalize to start of day

    const timeDiff = due.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysRemaining < 0) {
      return {
        status: "past-due",
        daysRemaining: Math.abs(daysRemaining),
        isPastDue: true,
        message: `Overdue by ${Math.abs(daysRemaining)} day${
          Math.abs(daysRemaining) !== 1 ? "s" : ""
        }`,
      };
    } else if (daysRemaining <= 30) {
      return {
        status: "near-due",
        daysRemaining,
        isPastDue: false,
        message: `${daysRemaining} day${
          daysRemaining !== 1 ? "s" : ""
        } remaining`,
      };
    } else {
      return {
        status: "normal",
        daysRemaining,
        isPastDue: false,
        message: null,
      };
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Fetch data
  useEffect(() => {
    if (amc?.amcId) {
      fetchClients();
      fetchBasicInfo();
    }
  }, [amc]);

  useEffect(() => {
    if (amc?.amcId) {
      if (activeTab === "amc") {
        fetchAmcHistory();
      } else if (activeTab === "domain") {
        fetchDomainHistory();
      } else if (activeTab === "gsuite") {
        // NEW
        fetchGsuiteHistory();
      }
    }
  }, [activeTab, amc]);

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

  const fetchGsuiteHistory = async () => {
    try {
      setLoadingData(true);
      const response = await axiosInstance.get(
        `getAllAMCGsuitHistory/${amc.amcId}`
      );
      if (response.data && Array.isArray(response.data)) {
        setGsuiteHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching GSuite history:", error);
      toast.error("Failed to load GSuite history");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchBasicInfo = async () => {
    try {
      setLoadingData(true);
      const response = await axiosInstance.get(`getAmcById/${amc.amcId}`);
      if (response.data) {
        setBasicInfo({
          companyName: response.data.companyName || "",
          contactPersonName: response.data.contactPersonName || "",
          email: response.data.email || "",
          phoneNumber: response.data.phoneNumber || "",
          websiteURL: response.data.websiteURL || "",
          technology: response.data.technology || "",
          hostingProvider: response.data.hostingProvider || "Wix",
          domainProvider: response.data.domainProvider || "",
          assingedTo: response.data.assingedTo || "",
          clientName: response.data.clientName || "",
        });
        if (response.data.customerId) {
          setSelectedClientId(response.data.customerId);
        }
      }
    } catch (error) {
      console.error("Error fetching AMC info:", error);
      toast.error("Failed to load AMC information");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAmcHistory = async () => {
    try {
      setLoadingData(true);
      const response = await axiosInstance.get(`getAllAMCHistoy/${amc.amcId}`);
      if (response.data && Array.isArray(response.data)) {
        setAmcHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching AMC history:", error);
      toast.error("Failed to load AMC history");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchDomainHistory = async () => {
    try {
      setLoadingData(true);
      const response = await axiosInstance.get(
        `getAllAMCDomainHistoy/${amc.amcId}`
      );
      if (response.data && Array.isArray(response.data)) {
        setDomainHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching domain history:", error);
      toast.error("Failed to load domain history");
    } finally {
      setLoadingData(false);
    }
  };

  // Add this function to fetch detailed customer info
  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axiosInstance.get(`getCustomerById/${customerId}`);
      if (response.data) {
        const customer = response.data;
        return {
          contactPersonName: customer.contactPersonName || "",
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

  const handleClientChange = async (clientId) => {
    setSelectedClientId(clientId);

    if (!clientId) {
      // Clear client-specific fields if no client selected
      setBasicInfo((prev) => ({
        ...prev,
        companyName: "",
        contactPersonName: "",
        email: "",
        phoneNumber: "",
        websiteURL: "",
        clientName: "",
      }));
      return;
    }

    try {
      // OPTION 2: Fetch detailed customer info from API
      // Uncomment this if you need complete customer details

      const customerDetails = await fetchCustomerDetails(clientId);
      if (customerDetails) {
        setBasicInfo((prev) => ({
          ...prev,
          companyName: customerDetails.companyName || "",
          contactPersonName: customerDetails.contactPersonName || "",
          email: customerDetails.email || "",
          phoneNumber: customerDetails.phoneNumber || "",
          websiteURL: customerDetails.websiteURL || "",
          clientName: customerDetails.companyName || "",
        }));
      }
    } catch (error) {
      console.error("Error handling client change:", error);
      toast.error("Failed to load client details");
    }
  };

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // GSuite History Functions
  const handleCreateGsuiteHistory = () => {
    setEditingGsuite(null);
    setShowGsuiteHistoryModal(true);
  };

  const handleEditGsuiteHistory = (gsuite) => {
    setEditingGsuite(gsuite);
    setShowGsuiteHistoryModal(true);
  };

  // In EditAmcModal.jsx - update this function
  const handleGsuiteHistorySuccess = (responseData) => {
    fetchGsuiteHistory(); // Refresh GSuite history list

    // NEW: Check if we need to refresh parent AMC list
    if (responseData?.refreshParentList) {
      // Trigger parent component refresh
      onSuccess(); // This will trigger AmcList to refresh
    }

    setShowGsuiteHistoryModal(false);
  };

  const handleDeleteGsuite = async (amcGsuitHistoryId, domainName) => {
    const result = await showDeleteConfirmation(
      `GSuite History for ${domainName}`
    );

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(
          `deleteAMCGsuitHistory/${amcGsuitHistoryId}`
        );
        toast.success("GSuite history record deleted successfully");
        fetchGsuiteHistory();
      } catch (error) {
        console.error("Error deleting GSuite history:", error);
        toast.error("Failed to delete GSuite history record");
      }
    }
  };

  // AMC History Functions
  const handleCreateAmcHistory = () => {
    setEditingHistory(null);
    setShowAmcHistoryModal(true);
  };

  const handleEditAmcHistory = (history) => {
    setEditingHistory(history);
    setShowAmcHistoryModal(true);
  };

  // Update handleAmcHistorySuccess function
  const handleAmcHistorySuccess = (responseData) => {
    fetchAmcHistory(); // Refresh AMC history list

    // NEW: Check if we need to refresh parent AMC list
    if (responseData?.refreshParentList) {
      // Trigger parent component refresh
      onSuccess(); // This will trigger AmcList to refresh
    }

    setShowAmcHistoryModal(false);
  };

  const handleDeleteHistory = async (amcHistoryId, sequence) => {
    const result = await showDeleteConfirmation(
      `AMC History Record #${sequence}`
    );

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`deleteAMCHistory/${amcHistoryId}`);
        toast.success("History record deleted successfully");
        fetchAmcHistory();
      } catch (error) {
        console.error("Error deleting history:", error);
        toast.error("Failed to delete history record");
      }
    }
  };

  // Domain History Functions
  const handleCreateDomainHistory = () => {
    setEditingDomain(null);
    setShowDomainHistoryModal(true);
  };

  const handleEditDomainHistory = (domain) => {
    setEditingDomain(domain);
    setShowDomainHistoryModal(true);
  };

  const handleDomainHistorySuccess = (responseData) => {
    fetchDomainHistory(); // Refresh domain history list

    // NEW: Check if we need to refresh parent AMC list
    if (responseData?.refreshParentList) {
      // Trigger parent component refresh
      onSuccess(); // This will trigger AmcList to refresh
    }

    setShowDomainHistoryModal(false);
  };

  const handleDeleteDomain = async (acmDomainHistoryId, sequence) => {
    const result = await showDeleteConfirmation(
      `Domain History Record #${sequence}`
    );

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(
          `deleteAMCDomainHistory/${acmDomainHistoryId}`
        );
        toast.success("Domain history record deleted successfully");
        fetchDomainHistory();
      } catch (error) {
        console.error("Error deleting domain history:", error);
        toast.error("Failed to delete domain history record");
      }
    }
  };

  const handleSubmitBasicInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare payload matching API exactly
      const updatePayload = {
        amcId: amc.amcId,
        adminId: amc.adminId || "", // Get from amc prop or context
        employeeId: "", // If you have this field
        ...basicInfo,
        // Ensure all fields are included even if empty
        clientName: basicInfo.clientName || null,
        domainProvider: basicInfo.domainProvider || "",
        employeeId: "", // Set to empty string instead of null
        customerId: selectedClientId || null,
      };

      console.log("Update payload:", updatePayload);

      const response = await axiosInstance.put(`updateAMC`, updatePayload);

      if (response.data) {
        toast.success("AMC information updated successfully");
        onSuccess();
      } else {
        throw new Error("No response data");
      }
    } catch (error) {
      console.error("Error updating AMC:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Failed to update AMC information"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPdfPreview = async (proformaInvoiceId) => {
    setIsPdfLoading(true);
    setIsPdfModalOpen(true);
    setSelectedProformaData(null);

    try {
      // You need to get the role from somewhere - adjust this based on your auth system


      let adminInformation = null;
      if (role === "ROLE_ADMIN") {
        const adminResponse = await axiosInstance.get(`/admin/getAdminInfo`);
        adminInformation = adminResponse.data;
      } else if (role === "ROLE_EMPLOYEE") {
        const employeeResponse = await axiosInstance.get(
          `/employee/getEmployeeInfo`
          `/employee/getEmployeeInfo`
        );
        adminInformation = employeeResponse.data.admin;
      }

      setAdminInformation(adminInformation);
      const response = await axiosInstance.get(
        `getProformaInvoiceById/${proformaInvoiceId}`
      );
      if (response.data) {
        setSelectedProformaData(response.data);
      }
    } catch (error) {
      console.error("Error loading proforma PDF:", error);
      toast.error(
        error.response?.data?.message || "Failed to load proforma PDF"
      );
      setIsPdfModalOpen(false);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleOpenInfoModal = async (proforma) => {
    setSelectedProformaForInfo(proforma);
    setIsInfoModalOpen(true);
  };

  const handleInfoModalClose = () => {
    setIsInfoModalOpen(false);
    setSelectedProformaForInfo(null);
    // If you need to fetch anything after closing, add it here
  };
  // Add this function before your component or inside it
  const formatProformaNumber = (number) => {
    if (!number) return "PROFORMA-000000";
    return `PROFORMA-${String(number).padStart(6, "0")}`;
  };

  return (
    <>
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold">Edit AMC</h2>
                  <p className="text-blue-100 text-xs">
                    {amc?.companyName || "AMC Details"}
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
                  }`}
                >
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingData ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Tab 1: Basic Information */}
                {activeTab === "basic" && (
                  <form onSubmit={handleSubmitBasicInfo} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Add this as the first field in your grid */}
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
                              label: `${
                                client.companyName || client.name || "Client"
                              } - ${client.email || ""}`,
                            })),
                          ]}
                          loading={loadingClients}
                          className="text-sm"
                        />
                      </div>
                      <GlobalInputField
                        label="Company Name"
                        name="companyName"
                        value={basicInfo.companyName}
                        onChange={(e) =>
                          handleBasicInfoChange("companyName", e.target.value)
                        }
                        placeholder="Enter company name"
                        className="text-sm"
                      />

                      <GlobalInputField
                        label="Contact Person Name"
                        name="contactPersonName"
                        value={basicInfo.contactPersonName}
                        onChange={(e) =>
                          handleBasicInfoChange(
                            "contactPersonName",
                            e.target.value
                          )
                        }
                        placeholder="Enter contact person name"
                        className="text-sm"
                      />

                      <GlobalInputField
                        label="Email"
                        name="email"
                        type="email"
                        value={basicInfo.email}
                        onChange={(e) =>
                          handleBasicInfoChange("email", e.target.value)
                        }
                        placeholder="client@company.com"
                        className="text-sm"
                      />

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <span>Phone Number</span>
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="phone-input-wrapper">
                          <PhoneInput
                            country={"in"}
                            value={basicInfo.phoneNumber || ""}
                            onChange={(value) =>
                              handleBasicInfoChange("phoneNumber", value)
                            }
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
                      </div>

                      <GlobalInputField
                        label="Website URL"
                        name="websiteURL"
                        value={basicInfo.websiteURL}
                        onChange={(e) =>
                          handleBasicInfoChange("websiteURL", e.target.value)
                        }
                        placeholder="https://www.example.com"
                        className="text-sm"
                      />

                      <GlobalSelectField
                        label="Technology"
                        name="technology"
                        value={basicInfo.technology}
                        onChange={(e) =>
                          handleBasicInfoChange("technology", e.target.value)
                        }
                        options={[
                          { value: "", label: "Select technology" },
                          ...technologyOptions,
                        ]}
                        className="text-sm"
                      />

                      <GlobalSelectField
                        label="Hosting Provider"
                        name="hostingProvider"
                        value={basicInfo.hostingProvider}
                        onChange={(e) =>
                          handleBasicInfoChange(
                            "hostingProvider",
                            e.target.value
                          )
                        }
                        options={[
                          { value: "", label: "Select hosting provider" },
                          ...hostingProviderOptions,
                        ]}
                        className="text-sm"
                      />

                      <GlobalSelectField
                        label="Domain Provider"
                        name="domainProvider"
                        value={basicInfo.domainProvider}
                        onChange={(e) =>
                          handleBasicInfoChange(
                            "domainProvider",
                            e.target.value
                          )
                        }
                        options={[
                          { value: "", label: "Select domain provider" },
                          ...domainProviderOptions,
                        ]}
                        className="text-sm"
                      />

                      {/* <GlobalInputField
                        label="Assigned To"
                        name="assingedTo"
                        value={basicInfo.assingedTo}
                        onChange={(e) => handleBasicInfoChange('assingedTo', e.target.value)}
                        placeholder="Assign to employee (UUID)"
                        className="text-sm"
                      /> */}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                      >
                        Cancel
                      </button>

                      {/* Only show Update button if user has Edit permission */}
                      {canEdit ? (
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </>
                          ) : (
                            "Update AMC"
                          )}
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium flex items-center gap-2">
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
                              d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          No Edit Permission
                        </div>
                      )}
                    </div>
                  </form>
                )}

                {/* Tab 2: AMC History */}
                {activeTab === "amc" && (
                  <div className="space-y-4">
                    {/* Create Button - Smaller size */}
                    <div className="flex justify-end">
                      {hasPermission("amc", "Create") && (
                        <button
                          onClick={handleCreateAmcHistory}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium flex items-center gap-1"
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Create AMC History
                        </button>
                      )}
                    </div>

                    {/* List Section */}
                    <div>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {amcHistory.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            No AMC history found. Click "Create AMC History" to
                            add a new record.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Sequence
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Start Date
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    End Date
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Amount
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Payment Status
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {amcHistory.map((history) => {
                                  const dueDateStatus = getDueDateStatus(
                                    history.amcEndDate
                                  );
                                  const isPastDue = dueDateStatus.isPastDue;
                                  const isNearDue =
                                    dueDateStatus.status === "near-due";
                                  const isDeleted = history.deleted; // Check if record is deleted

                                  return (
                                    <tr
                                      key={history.acmHistoryId}
                                      className={`
            ${isDeleted ? "bg-gray-50 border-l-4 border-l-gray-400" : ""}
            ${!isDeleted && isPastDue ? "border-l-4 border-l-red-500" : ""}
            ${!isDeleted && isNearDue ? "border-l-4 border-l-yellow-500" : ""}
            hover:bg-gray-50
            ${isDeleted ? "opacity-80" : ""}
          `}
                                      onClick={() =>
                                        handleEditAmcHistory(history)
                                      }
                                    >
                                      <td className="px-4 py-2 text-sm">
                                        {history.sequence}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={
                                            isDeleted ? "text-gray-600" : ""
                                          }
                                        >
                                          {formatDate(history.amcStartDate)}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={`
                ${isDeleted ? "text-gray-600" : ""}
                ${!isDeleted && isPastDue ? "text-red-600 font-semibold" : ""}
                ${
                  !isDeleted && isNearDue ? "text-yellow-600 font-semibold" : ""
                }
              `}
                                        >
                                          {formatDate(history.amcEndDate)}
                                          {!isDeleted &&
                                            dueDateStatus.message && (
                                              <span
                                                className={`block text-xs mt-1 ${
                                                  isPastDue
                                                    ? "text-red-500"
                                                    : isNearDue
                                                    ? "text-yellow-500"
                                                    : ""
                                                }`}
                                              >
                                                {dueDateStatus.message}
                                              </span>
                                            )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={
                                            isDeleted ? "text-gray-600" : ""
                                          }
                                        >
                                          {history.amcAmount?.toLocaleString()}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <span
                                          className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${isDeleted ? "bg-gray-200 text-gray-700" : ""}
                ${
                  !isDeleted && history.paid
                    ? "bg-green-100 text-green-800"
                    : ""
                }
                ${!isDeleted && !history.paid ? "bg-red-100 text-red-800" : ""}
              `}
                                        >
                                          {isDeleted ? (
                                            <>
                                              <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                              {history.paid ? "Paid" : "Unpaid"}
                                            </>
                                          ) : history.paid ? (
                                            "Paid"
                                          ) : (
                                            "Unpaid"
                                          )}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div className="flex gap-1">
                                          {history.proformaInvoiceId ? (
                                            // Preview button for existing proforma
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isDeleted) {
                                                  setSelectedProforma({
                                                    proformaInvoiceId:
                                                      history.proformaInvoiceId,
                                                    proformaInvoiceNumber:
                                                      history.sequence,
                                                    currencyType: "INR",
                                                  });
                                                  setShowProformaInfoModal(
                                                    true
                                                  );
                                                }
                                              }}
                                              className={`
                    flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors
                    ${
                      isDeleted
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
                    }
                  `}
                                              disabled={isDeleted}
                                              title={
                                                isDeleted
                                                  ? "Preview (Record is deleted)"
                                                  : "Preview Proforma"
                                              }
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
                                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                              </svg>
                                              Preview
                                            </button>
                                          ) : (
                                            // Create Proforma button for new records
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isDeleted) {
                                                  navigate("/Proforma/Create", {
                                                    state: {
                                                      source: "AMC",
                                                      amcId: amc.amcId,
                                                      customerId:
                                                        selectedClientId,
                                                      amcHistoryId:
                                                        history.acmHistoryId,
                                                      domainHistoryId: null,
                                                      gsuiteHistoryId: null,
                                                      dueDate:
                                                        history.amcStartDate,
                                                    },
                                                  });
                                                }
                                              }}
                                              className={`
                    flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors 
                    ${
                      isDeleted
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                    }
                  `}
                                              disabled={isDeleted}
                                              title={
                                                isDeleted
                                                  ? "Create Proforma (Record is deleted)"
                                                  : "Create Proforma"
                                              }
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
                                                  d="M12 4v16m8-8H4"
                                                />
                                              </svg>
                                              Proforma
                                            </button>
                                          )}

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditAmcHistory(history);
                                            }}
                                            className={`p-1 rounded ${
                                              isDeleted
                                                ? "text-gray-500 hover:bg-gray-100"
                                                : "text-blue-600 hover:bg-blue-50"
                                            }`}
                                            title={
                                              isDeleted
                                                ? "Edit (Deleted Record)"
                                                : "Edit"
                                            }
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
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                              />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteHistory(
                                                history.acmHistoryId,
                                                history.sequence
                                              );
                                            }}
                                            className={`p-1 rounded ${
                                              isDeleted
                                                ? "text-gray-500 hover:bg-gray-100"
                                                : "text-red-600 hover:bg-red-50"
                                            }`}
                                            title={
                                              isDeleted
                                                ? "Delete (Already Deleted)"
                                                : "Delete"
                                            }
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
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Domain History */}
                {/* Tab 3: Domain History */}
                {activeTab === "domain" && (
                  <div className="space-y-4">
                    {/* Create Button - Smaller size */}
                    <div className="flex justify-end">
                      {hasPermission("amc", "Create") && (
                        <button
                          onClick={handleCreateDomainHistory}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium flex items-center gap-1"
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Create Domain History
                        </button>
                      )}
                    </div>

                    {/* List Section */}
                    <div>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {domainHistory.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            No domain history found. Click "Create Domain
                            History" to add a new record.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Sequence
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Start Date
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Renewal Date
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Amount
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Payment Status
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {domainHistory.map((domain) => {
                                  const dueDateStatus = getDueDateStatus(
                                    domain.domainRenewalDate
                                  );
                                  const isPastDue = dueDateStatus.isPastDue;
                                  const isNearDue =
                                    dueDateStatus.status === "near-due";
                                  const isDeleted = domain.deleted; // Assuming API has 'deleted' field

                                  return (
                                    <tr
                                      key={domain.acmDomainHistoryId}
                                      className={`
            ${isDeleted ? "bg-gray-50 border-l-4 border-l-gray-400" : ""}
            ${!isDeleted && isPastDue ? "border-l-4 border-l-red-500" : ""}
            ${!isDeleted && isNearDue ? "border-l-4 border-l-yellow-500" : ""}
            hover:bg-gray-50
            ${isDeleted ? "opacity-80" : ""}
          `}
                                      onClick={() =>
                                        handleEditDomainHistory(domain)
                                      }
                                    >
                                      <td className="px-4 py-2 text-sm">
                                        {domain.sequence}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={
                                            isDeleted ? "text-gray-600" : ""
                                          }
                                        >
                                          {formatDate(domain.domainStartDate)}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={`
                ${isDeleted ? "text-gray-600" : ""}
                ${!isDeleted && isPastDue ? "text-red-600 font-semibold" : ""}
                ${
                  !isDeleted && isNearDue ? "text-yellow-600 font-semibold" : ""
                }
              `}
                                        >
                                          {formatDate(domain.domainRenewalDate)}
                                          {!isDeleted &&
                                            dueDateStatus.message && (
                                              <span
                                                className={`block text-xs mt-1 ${
                                                  isPastDue
                                                    ? "text-red-500"
                                                    : isNearDue
                                                    ? "text-yellow-500"
                                                    : ""
                                                }`}
                                              >
                                                {dueDateStatus.message}
                                              </span>
                                            )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={
                                            isDeleted ? "text-gray-600" : ""
                                          }
                                        >
                                          {domain.domainAmount}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <span
                                          className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${isDeleted ? "bg-gray-200 text-gray-700" : ""}
                ${
                  !isDeleted && domain.paid ? "bg-green-100 text-green-800" : ""
                }
                ${!isDeleted && !domain.paid ? "bg-red-100 text-red-800" : ""}
              `}
                                        >
                                          {isDeleted ? (
                                            <>
                                              <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                              {domain.paid ? "Paid" : "Unpaid"}
                                            </>
                                          ) : domain.paid ? (
                                            "Paid"
                                          ) : (
                                            "Unpaid"
                                          )}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div className="flex gap-1">
                                          {domain.proformaInvoiceId ? (
                                            // Preview button for existing proforma
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isDeleted) {
                                                  setSelectedProforma({
                                                    proformaInvoiceId:
                                                      domain.proformaInvoiceId,
                                                    proformaInvoiceNumber:
                                                      domain.sequence,
                                                    currencyType: "INR",
                                                  });
                                                  setShowProformaInfoModal(
                                                    true
                                                  );
                                                }
                                              }}
                                              className={`
                    flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors
                    ${
                      isDeleted
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
                    }
                  `}
                                              disabled={isDeleted}
                                              title={
                                                isDeleted
                                                  ? "Preview (Record is deleted)"
                                                  : "Preview Proforma"
                                              }
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
                                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                              </svg>
                                              Preview
                                            </button>
                                          ) : (
                                            // Create Proforma button for new records
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isDeleted) {
                                                  navigate("/Proforma/Create", {
                                                    state: {
                                                      source: "DOMAIN",
                                                      amcId: amc.amcId,
                                                      customerId:
                                                        selectedClientId,
                                                      amcHistoryId: null,
                                                      domainHistoryId:
                                                        domain.acmDomainHistoryId,
                                                      gsuiteHistoryId: null,
                                                      dueDate:
                                                        domain.domainStartDate,
                                                    },
                                                  });
                                                }
                                              }}
                                              className={`
                    flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors 
                    ${
                      isDeleted
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800"
                    }
                  `}
                                              disabled={isDeleted}
                                              title={
                                                isDeleted
                                                  ? "Create Proforma (Record is deleted)"
                                                  : "Create Proforma"
                                              }
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
                                                  d="M12 4v16m8-8H4"
                                                />
                                              </svg>
                                              Proforma
                                            </button>
                                          )}

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditDomainHistory(domain);
                                            }}
                                            className={`p-1 rounded ${
                                              isDeleted
                                                ? "text-gray-500 hover:bg-gray-100"
                                                : "text-blue-600 hover:bg-blue-50"
                                            }`}
                                            title={
                                              isDeleted
                                                ? "Edit (Deleted Record)"
                                                : "Edit"
                                            }
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
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                              />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteDomain(
                                                domain.acmDomainHistoryId,
                                                domain.sequence
                                              );
                                            }}
                                            className={`p-1 rounded ${
                                              isDeleted
                                                ? "text-gray-500 hover:bg-gray-100"
                                                : "text-red-600 hover:bg-red-50"
                                            }`}
                                            title={
                                              isDeleted
                                                ? "Delete (Already Deleted)"
                                                : "Delete"
                                            }
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
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: GSuite History */}
                {activeTab === "gsuite" && (
                  <div className="space-y-4">
                    {/* Create Button */}
                    <div className="flex justify-end">
                      {hasPermission("amc", "Create") && (
                        <button
                          onClick={handleCreateGsuiteHistory}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium flex items-center gap-1"
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Create GSuite History
                        </button>
                      )}
                    </div>

                    {/* List Section */}
                    <div>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {gsuiteHistory.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            No GSuite history found. Click "Create GSuite
                            History" to add a new record.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Sequence
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Domain
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Platform
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Start Date
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Renewal Date
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Licenses
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Amount
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Paid By
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Payment Status
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {gsuiteHistory.map((gsuite) => {
                                  const dueDateStatus = getDueDateStatus(
                                    gsuite.gsuitRenewalDate
                                  );
                                  const isPastDue = dueDateStatus.isPastDue;
                                  const isNearDue =
                                    dueDateStatus.status === "near-due";
                                        const isDeleted = gsuite.deleted;
                                  const isPaidByCustomer =
                                    gsuite.paidBy !== "ADMIN"; // Check if paid by customer
                                  const showProformaBtn =
                                    !isDeleted && !isPaidByCustomer; 
                                  return (
                                    <tr
                                      key={gsuite.acmGsuitHistoryId}
                                      className={`
            ${isDeleted ? "bg-gray-50 border-l-4 border-l-gray-400" : ""}
            ${!isDeleted && isPastDue ? "border-l-4 border-l-red-500" : ""}
            ${!isDeleted && isNearDue ? "border-l-4 border-l-yellow-500" : ""}
            hover:bg-gray-50
            ${isDeleted ? "opacity-80" : ""}
          `}
                                      onClick={() =>
                                        handleEditGsuiteHistory(gsuite)
                                      }
                                    >
                                      <td className="px-4 py-2 text-sm">
                                        {gsuite.sequence}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={`font-medium truncate max-w-[100px] ${
                                            isDeleted ? "text-gray-600" : ""
                                          }`}
                                          title={gsuite.domainName}
                                        >
                                          {gsuite.domainName}
                                        </div>
                                        {gsuite.adminEmail && (
                                          <div
                                            className={`text-xs truncate max-w-[100px] ${
                                              isDeleted
                                                ? "text-gray-500"
                                                : "text-gray-500"
                                            }`}
                                            title={gsuite.adminEmail}
                                          >
                                            {gsuite.adminEmail}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={
                                            isDeleted ? "text-gray-600" : ""
                                          }
                                        >
                                          {gsuite.platform}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={
                                            isDeleted ? "text-gray-600" : ""
                                          }
                                        >
                                          {formatDate(gsuite.gsuitStartDate)}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={`
                ${isDeleted ? "text-gray-600" : ""}
                ${!isDeleted && isPastDue ? "text-red-600 font-semibold" : ""}
                ${
                  !isDeleted && isNearDue ? "text-yellow-600 font-semibold" : ""
                }
              `}
                                        >
                                          {formatDate(gsuite.gsuitRenewalDate)}
                                          {!isDeleted &&
                                            dueDateStatus.message && (
                                              <span
                                                className={`block text-xs mt-1 ${
                                                  isPastDue
                                                    ? "text-red-500"
                                                    : isNearDue
                                                    ? "text-yellow-500"
                                                    : ""
                                                }`}
                                              >
                                                {dueDateStatus.message}
                                              </span>
                                            )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={
                                            isDeleted ? "text-gray-600" : ""
                                          }
                                        >
                                          {gsuite.totalLicenses}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={
                                            isDeleted ? "text-gray-600" : ""
                                          }
                                        >
                                          {gsuite.gsuitAmount}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <span
                                          className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${isDeleted ? "bg-gray-200 text-gray-700" : ""}
                ${
                  !isDeleted && gsuite.paidBy === "ADMIN"
                    ? "bg-purple-100 text-purple-800"
                    : ""
                }
                ${
                  !isDeleted && gsuite.paidBy !== "ADMIN"
                    ? "bg-blue-100 text-blue-800"
                    : ""
                }
              `}
                                        >
                                          {isDeleted ? (
                                            <>
                                              <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                              {gsuite.paidBy === "ADMIN"
                                                ? "Admin"
                                                : "Client"}
                                            </>
                                          ) : gsuite.paidBy === "ADMIN" ? (
                                            "Admin"
                                          ) : (
                                            "Client"
                                          )}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <span
                                          className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${isDeleted ? "bg-gray-200 text-gray-700" : ""}
                ${
                  !isDeleted && gsuite.paid ? "bg-green-100 text-green-800" : ""
                }
                ${!isDeleted && !gsuite.paid ? "bg-red-100 text-red-800" : ""}
              `}
                                        >
                                          {isDeleted ? (
                                            <>
                                              <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                              {gsuite.paid ? "Paid" : "Unpaid"}
                                            </>
                                          ) : gsuite.paid ? (
                                            "Paid"
                                          ) : (
                                            "Unpaid"
                                          )}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div className="flex gap-1">
                                          {showProformaBtn &&
                                            (gsuite.proformaInvoiceId ? (
                                              // Preview button for existing proforma
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedProforma({
                                                    proformaInvoiceId:
                                                      gsuite.proformaInvoiceId,
                                                    proformaInvoiceNumber:
                                                      gsuite.sequence,
                                                    currencyType: "INR",
                                                  });
                                                  setShowProformaInfoModal(
                                                    true
                                                  );
                                                }}
                                                className={`
                    flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors
                    bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800
                  `}
                                                title="Preview Proforma"
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
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                  />
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                  />
                                                </svg>
                                                Preview
                                              </button>
                                            ) : (
                                              // Create Proforma button for new records
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  navigate("/Proforma/Create", {
                                                    state: {
                                                      source: "GSUITE",
                                                      amcId: amc.amcId,
                                                      customerId:
                                                        selectedClientId,
                                                      amcHistoryId: null,
                                                      domainHistoryId: null,
                                                      gsuiteHistoryId:
                                                        gsuite.acmGsuitHistoryId,
                                                      dueDate:
                                                        gsuite.gsuitStartDate,
                                                    },
                                                  });
                                                }}
                                                className={`
                    flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors 
                    bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800
                  `}
                                                title="Create Proforma"
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
                                                    d="M12 4v16m8-8H4"
                                                  />
                                                </svg>
                                                Proforma
                                              </button>
                                            ))}

                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditGsuiteHistory(gsuite);
                                            }}
                                            className={`p-1 rounded ${
                                              isDeleted
                                                ? "text-gray-500 hover:bg-gray-100"
                                                : "text-blue-600 hover:bg-blue-50"
                                            }`}
                                            title={
                                              isDeleted
                                                ? "Edit (Deleted Record)"
                                                : "Edit"
                                            }
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
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                              />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteGsuite(
                                                gsuite.acmGsuitHistoryId,
                                                gsuite.domainName
                                              );
                                            }}
                                            className={`p-1 rounded ${
                                              isDeleted
                                                ? "text-gray-500 hover:bg-gray-100"
                                                : "text-red-600 hover:bg-red-50"
                                            }`}
                                            title={
                                              isDeleted
                                                ? "Delete (Already Deleted)"
                                                : "Delete"
                                            }
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
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* AMC History Modal */}
      <AmcHistoryModal
        isOpen={showAmcHistoryModal}
        onClose={() => {
          setShowAmcHistoryModal(false);
          setEditingHistory(null);
        }}
        onSuccess={handleAmcHistorySuccess}
        amcId={amc?.amcId}
        isEditMode={!!editingHistory}
        initialData={editingHistory}
      />

      {/* Domain History Modal */}
      <DomainHistoryModal
        isOpen={showDomainHistoryModal}
        onClose={() => {
          setShowDomainHistoryModal(false);
          setEditingDomain(null);
        }}
        onSuccess={handleDomainHistorySuccess}
        amcId={amc?.amcId}
        isEditMode={!!editingDomain}
        initialData={editingDomain}
      />

      {/* GSuite History Modal */}
      <GsuiteHistoryModal
        isOpen={showGsuiteHistoryModal}
        onClose={() => {
          setShowGsuiteHistoryModal(false);
          setEditingGsuite(null);
        }}
        onSuccess={handleGsuiteHistorySuccess}
        amcId={amc?.amcId}
        isEditMode={!!editingGsuite}
        initialData={editingGsuite}
      />

      {/* Proforma Info Modal */}
      {showProformaInfoModal && selectedProforma && (
        <ProformaInfoModal
          isOpen={showProformaInfoModal}
          onClose={() => {
            setShowProformaInfoModal(false);
            setSelectedProforma(null);
          }}
          proforma={selectedProforma}
          onOpenPdf={(proformaInvoiceId) => {
            handleInfoModalClose();
            handleOpenPdfPreview(proformaInvoiceId);
          }}
        />
      )}

      {/* PDF Modal */}
      {isPdfModalOpen && (
        <div className="proposal-pdf-modal-backdrop">
          <div className="proposal-pdf-modal-content">
            <div className="proposal-pdf-modal-header">
              <h3>
                {selectedProformaData
                  ? formatProformaNumber(
                      selectedProformaData.proformaInvoiceInfo
                        .proformaInvoiceNumber
                    )
                  : "Loading..."}
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                {!isPdfLoading && selectedProformaData && (
                  <PDFDownloadLink
                    document={
                      <ProformaPDF
                        invoiceData={selectedProformaData}
                        adminInformation={adminInformation}
                      />
                    }
                    fileName={`${formatProformaNumber(
                      selectedProformaData.proformaInvoiceInfo
                        .proformaInvoiceNumber
                    )}.pdf`}
                    className="download-button-icon-wrapper"
                    style={{
                      padding: "0.25rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      background: "#f9f9f9",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {({ loading }) =>
                      loading ? (
                        "..."
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          style={{ width: "20px", height: "16px" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      )
                    }
                  </PDFDownloadLink>
                )}
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    background: "#f9f9f9",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="proposal-pdf-viewer-container">
              {isPdfLoading || !selectedProformaData ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  Loading PDF...
                </div>
              ) : (
                <PDFViewer width="100%" height="100%">
                  <ProformaPDF
                    invoiceData={selectedProformaData}
                    adminInformation={adminInformation}
                  />
                </PDFViewer>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditAmcModal;
