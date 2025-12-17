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

function EditAmcModal({ amc, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Modal states
  const [showAmcHistoryModal, setShowAmcHistoryModal] = useState(false);
  const [showDomainHistoryModal, setShowDomainHistoryModal] = useState(false);
  const [editingHistory, setEditingHistory] = useState(null);
  const [editingDomain, setEditingDomain] = useState(null);

  const [gsuiteHistory, setGsuiteHistory] = useState([]);
  const [showGsuiteHistoryModal, setShowGsuiteHistoryModal] = useState(false);
  const [editingGsuite, setEditingGsuite] = useState(null);

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

                                  return (
                                    <tr
                                      key={history.acmHistoryId}
                                      className={`${
                                        isPastDue
                                          ? "border-l-4 border-l-red-500"
                                          : isNearDue
                                          ? "border-l-4 border-l-yellow-500"
                                          : ""
                                      } hover:bg-gray-50`}
                                      onClick={() =>
                                        handleEditAmcHistory(history)
                                      }
                                    >
                                      <td className="px-4 py-2 text-sm">
                                        {history.sequence}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {formatDate(history.amcStartDate)}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={`${
                                            isPastDue
                                              ? "text-red-600 font-semibold"
                                              : isNearDue
                                              ? "text-yellow-600 font-semibold"
                                              : ""
                                          }`}
                                        >
                                          {formatDate(history.amcEndDate)}
                                          {dueDateStatus.message && (
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
                                        {history.amcAmount?.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            history.paid
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {history.paid ? "Paid" : "Unpaid"}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() =>
                                              handleEditAmcHistory(history)
                                            }
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Edit"
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
                                            onClick={() =>
                                              handleDeleteHistory(
                                                history.acmHistoryId,
                                                history.sequence
                                              )
                                            }
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
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

                                  return (
                                    <tr
                                      key={domain.acmDomainHistoryId}
                                      className={`${
                                        isPastDue
                                          ? "border-l-4 border-l-red-500"
                                          : isNearDue
                                          ? "border-l-4 border-l-yellow-500"
                                          : ""
                                      } hover:bg-gray-50`}
                                      onClick={() =>
                                        handleEditDomainHistory(domain)
                                      }
                                    >
                                      <td className="px-4 py-2 text-sm">
                                        {domain.sequence}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {formatDate(domain.domainStartDate)}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={`${
                                            isPastDue
                                              ? "text-red-600 font-semibold"
                                              : isNearDue
                                              ? "text-yellow-600 font-semibold"
                                              : ""
                                          }`}
                                        >
                                          {formatDate(domain.domainRenewalDate)}
                                          {dueDateStatus.message && (
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
                                        {domain.domainAmount}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            domain.paid
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {domain.paid ? "Paid" : "Unpaid"}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() =>
                                              handleEditDomainHistory(domain)
                                            }
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Edit"
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
                                            onClick={() =>
                                              handleDeleteDomain(
                                                domain.acmDomainHistoryId,
                                                domain.sequence
                                              )
                                            }
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
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

                                  return (
                                    <tr
                                      key={gsuite.acmGsuitHistoryId}
                                      className={`${
                                        isPastDue
                                          ? "border-l-4 border-l-red-500"
                                          : isNearDue
                                          ? "border-l-4 border-l-yellow-500"
                                          : ""
                                      } hover:bg-gray-50`}
                                      onClick={() =>
                                        handleEditGsuiteHistory(gsuite)
                                      }
                                    >
                                      <td className="px-4 py-2 text-sm">
                                        {gsuite.sequence}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div className="font-medium">
                                          {gsuite.domainName}
                                        </div>
                                        {gsuite.adminEmail && (
                                          <div className="text-xs text-gray-500">
                                            {gsuite.adminEmail}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {gsuite.platform}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {formatDate(gsuite.gsuitStartDate)}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div
                                          className={`${
                                            isPastDue
                                              ? "text-red-600 font-semibold"
                                              : isNearDue
                                              ? "text-yellow-600 font-semibold"
                                              : ""
                                          }`}
                                        >
                                          {formatDate(gsuite.gsuitRenewalDate)}
                                          {dueDateStatus.message && (
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
                                        {gsuite.totalLicenses}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        {gsuite.gsuitAmount}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            gsuite.paidBy === "ADMIN"
                                              ? "bg-purple-100 text-purple-800"
                                              : "bg-blue-100 text-blue-800"
                                          }`}
                                        >
                                          {gsuite.paidBy === "ADMIN"
                                            ? "Admin"
                                            : "Client"}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            gsuite.paid
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {gsuite.paid ? "Paid" : "Unpaid"}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() =>
                                              handleEditGsuiteHistory(gsuite)
                                            }
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Edit"
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
                                            onClick={() =>
                                              handleDeleteGsuite(
                                                gsuite.acmGsuitHistoryId,
                                                gsuite.domainName
                                              )
                                            }
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
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
    </>
  );
}

export default EditAmcModal;
