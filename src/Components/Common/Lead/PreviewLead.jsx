import React, { useState, useEffect } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import ActivityLog from "./ActivityLog";
import PreeviewProposalLead from "./PreeviewProposalLead";
import SalesReminderList from "../Reminder/SalesReminderList";

function PreviewLead({ leadId, onClose, onEdit, onConvert }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`getLeadById/${leadId}`);
      const data = response.data;

      if (data && data.lead) {
        setLeadData(data.lead);
      } else {
        setLeadData(data || null);
      }
    } catch (err) {
      console.error("Error fetching lead details:", err);
      setError(err.message || "Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToCustomer = async () => {
    if (!leadData) return;

    setConverting(true);
    try {
      // Prepare customer data from lead data
      const customerData = {
        companyName: leadData.companyName || leadData.clientName,
        phone: leadData.phoneNumber || "",
        mobile: leadData.mobileNumber || "",
        website: leadData.website || "",
        industry: leadData.industry || "",
        revenue: leadData.revenue || 0,
        gstin: "", // Not available in lead data
        panNumber: "", // Not available in lead data
        billingStreet: leadData.street || "",
        billingCity: leadData.city || "",
        billingState: leadData.state || "",
        billingCountry: leadData.country || "",
        billingZipCode: leadData.zipCode || "",
        shippingStreet: leadData.street || "", // Same as billing if not specified
        shippingCity: leadData.city || "",
        shippingState: leadData.state || "",
        shippingCountry: leadData.country || "",
        shippingZipCode: leadData.zipCode || "",
        description:
          leadData.description || `Converted from lead: ${leadData.clientName}`,
        // Add lead reference if needed
        leadId: leadData.id,
      };

      // Call create customer API
      const response = await axiosInstance.post("createCustomer", customerData);

      if (response.data) {
        // Optionally update lead status to mark as converted
        try {
          await axiosInstance.put("updateLeadStatus", {
            leadId: leadData.id,
            status: "Converted",
            converted: true,
            customerId: response.data.id, // If API returns customer ID
          });
        } catch (updateError) {
          console.error("Error updating lead status:", updateError);
          // Continue even if status update fails
        }

        toast.success("Lead successfully converted to customer!");
        // Call the onConvert callback to refresh parent data
        if (onConvert) {
          onConvert();
        }

        // Close the preview modal
        onClose();

        // You might want to refresh the parent component or navigate
        // For example: navigate to customer list or refresh leads
      }
    } catch (error) {
      console.error("Error converting lead to customer:", error);
      if (error.response?.data?.message) {
        toast.error(`Failed to convert lead: ${error.response.data.message}`);
      } else {
        toast.error("Failed to convert lead to customer. Please try again.");
      }
    } finally {
      setConverting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Lead Preview
            </h3>
            <button
              className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors duration-200"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <div className="p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading lead details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 rounded-t-xl ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Lead Details</h2>
                <p className="text-blue-100 text-xs">
                  View and manage lead information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded transition"
            >
              <svg
                className="w-4 h-4 text-white"
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex -mb-px">
            <button
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "proposal"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("proposal")}
            >
              Proposal
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "activity"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("activity")}
            >
              Activity Log
            </button>

            {/* --- Reminders Tab Button Added --- */}
            <button
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "reminders"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("reminders")}
            >
              Reminders
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 crm-Leadlist-kanbadn-col-list">
          {activeTab === "profile" && (
            <div className="space-y-6">
              {error ? (
                <div className="text-center text-red-600 py-8">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-lg font-semibold mb-2">
                    Error Loading Lead
                  </p>
                  <p className="mb-4">{error}</p>
                  <button
                    onClick={fetchLeadDetails}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : leadData ? (
                <>
                  {/* Header with Client Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(leadData.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors duration-200 font-medium flex items-center gap-1.5 text-xs"
                        >
                          <svg
                            className="w-3.5 h-3.5"
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
                          Edit Lead
                        </button>
                        <button
                          onClick={handleConvertToCustomer}
                          disabled={
                            converting || leadData.status === "Converted"
                          }
                          className={`px-3 py-1.5 rounded-md transition-colors duration-200 font-medium flex items-center gap-1.5 text-xs ${
                            leadData.status === "Converted"
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : converting
                              ? "bg-green-500 text-white cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          {converting ? (
                            <>
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                              Converting...
                            </>
                          ) : leadData.status === "Converted" ? (
                            <>
                              <svg
                                className="w-3.5 h-3.5"
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
                              Already Converted
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Convert to Customer
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          leadData.status === "New Lead"
                            ? "bg-blue-100 text-blue-800"
                            : leadData.status === "Contacted"
                            ? "bg-purple-100 text-purple-800"
                            : leadData.status === "Qualified"
                            ? "bg-green-100 text-green-800"
                            : leadData.status === "Proposal"
                            ? "bg-yellow-100 text-yellow-800"
                            : leadData.status === "Negotiation"
                            ? "bg-orange-100 text-orange-800"
                            : leadData.status === "Won"
                            ? "bg-green-500 text-white"
                            : leadData.status === "Lost"
                            ? "bg-red-500 text-white"
                            : leadData.converted
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {leadData.converted
                          ? "Converted"
                          : leadData.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Lead Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Basic Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Client Name
                          </label>
                          <p className="text-gray-900">
                            {leadData.clientName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Company Name
                          </label>
                          <p className="text-gray-900">
                            {leadData.companyName || "N/A"}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Source
                          </label>
                          <p className="text-gray-900">
                            {leadData.source || "N/A"}
                          </p>
                        </div>
                        {/* <div>
                          <label className="text-sm font-medium text-gray-500">
                            Priority
                          </label>
                          <p className="text-gray-900">
                            {leadData.priority || "N/A"}
                          </p>
                        </div> */}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Email
                          </label>
                          <p className="text-gray-900">
                            {leadData.email || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Primary Number
                          </label>
                          <p className="text-gray-900">
                            {leadData.mobileNumber || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Secondary Number
                          </label>
                          <p className="text-gray-900">
                            {leadData.phoneNumber || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Website
                          </label>
                          <p className="text-gray-900">
                            {leadData.website || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Industry
                          </label>
                          <p className="text-gray-900">
                            {leadData.industry || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Address Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Street
                          </label>
                          <p className="text-gray-900">
                            {leadData.street || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            City
                          </label>
                          <p className="text-gray-900">
                            {leadData.city || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            State
                          </label>
                          <p className="text-gray-900">
                            {leadData.state || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Country
                          </label>
                          <p className="text-gray-900">
                            {leadData.country || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Zip Code
                          </label>
                          <p className="text-gray-900">
                            {leadData.zipCode || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* System Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        System Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Created Date
                          </label>
                          <p className="text-gray-900">
                            {formatDate(leadData.createdDate)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Updated Date
                          </label>
                          <p className="text-gray-900">
                            {formatDate(leadData.updatedDate)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Follow-Up Date
                          </label>
                          <p className="text-gray-900">
                            {leadData.followUp
                              ? formatDate(leadData.followUp)
                              : "N/A"}
                          </p>
                        </div>

                        {/* <div>
                          <label className="text-sm font-medium text-gray-500">
                            Assigned To
                          </label>
                          <p className="text-gray-900">
                            {leadData.assignTo || "Unassigned"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Converted
                          </label>
                          <p className="text-gray-900">
                            {leadData.converted ? "Yes" : "No"}
                          </p>
                        </div> */}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Description
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {leadData.description || "N/A"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No lead data available
                </div>
              )}
            </div>
          )}

          {activeTab === "proposal" && (
            <div className="h-full">
              <PreeviewProposalLead moduleId={leadId} moduleType="lead" />
            </div>
          )}
          {activeTab === "activity" && (
            <div className="h-full">
              <ActivityLog moduleId={leadId} moduleType="lead" />
            </div>
          )}
          {activeTab === "reminders" && (
            <div
              className="bg-gray-100 overflow-y-auto"
              style={{ maxHeight: "calc(80vh - 120px)" }}
            >
              <SalesReminderList module="LEAD" referenceId={leadId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewLead;
