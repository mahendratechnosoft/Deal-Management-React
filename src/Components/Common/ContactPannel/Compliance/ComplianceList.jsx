import React, { useState, useEffect } from "react";
import { useLayout } from "../../../Layout/useLayout";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { showDeleteConfirmation } from "../../../BaseComponet/alertUtils";
import CreatePFModal from "./CreatePF";
import EditPFModal from "./EditPF";
import PublicPFFormBasemodal from "./PublicPFFormBasemodal";
import CreateEsicModal from "./Esic/CreateEsicModal";
import EditEsicModal from "./Esic/EditEsicModal";
import Pagination from "../../../Common/pagination";
import PublicEsicFormBasemodal from "./Esic/PublicEsicFormBasemodal";
import { hasPermission } from "../../../BaseComponet/permissions";

// Table Skeleton Component
const TableSkeleton = ({ rows = 5, columns = 8 }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {[...Array(columns)].map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

// Pagination Skeleton Component
const PaginationSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mt-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-300 rounded w-20"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-300 rounded w-12"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-8 bg-gray-300 rounded w-8"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

function ComplianceList() {
  const { LayoutComponent, role } = useLayout();
  const canDelete =
    hasPermission("compliance", "Delete") ||
    hasPermission("customerCompliance", "Delete");
  const [activeTab, setActiveTab] = useState("pf");
  const [pfData, setPfData] = useState([]);
  const [esicData, setEsicData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // Dropdown states
  const [customers, setCustomers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedContact, setSelectedContact] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal states
  const [showCreatePFModal, setShowCreatePFModal] = useState(false);
  const [showCreateEsicModal, setShowCreateEsicModal] = useState(false);
  const [showEditPFModal, setShowEditPFModal] = useState(false);
  const [showEditEsicModal, setShowEditEsicModal] = useState(false);
  const [selectedPFId, setSelectedPFId] = useState(null);
  const [selectedEsicId, setSelectedEsicId] = useState(null);

  const [showPublicPFLinkModal, setShowPublicPFLinkModal] = useState(false);
  const [generatedPFLink, setGeneratedPFLink] = useState("");

  const [showPublicEsicLinkModal, setShowPublicEsicLinkModal] = useState(false);
  const [generatedEsicLink, setGeneratedEsicLink] = useState("");

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch customers dropdown data
  const fetchCustomers = async () => {
    try {
      // For ROLE_CUSTOMER, get customerId from localStorage
      if (role === "ROLE_CUSTOMER") {
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          const customerId = userData.customerId;

          if (customerId) {
            console.log(
              "ROLE_CUSTOMER: Setting customer ID from localStorage:",
              customerId
            );

            // Set the customerId from localStorage
            setSelectedCustomer(customerId);

            // We don't need to fetch customer list for ROLE_CUSTOMER
            // Set customers to empty array since we won't show the dropdown
            setCustomers([]);

            // IMPORTANT: Fetch contacts for this customer immediately
            // Pass the customerId directly
            await fetchContacts(customerId);
            return;
          }
        }
      }

      // For other roles, fetch customers normally
      setLoadingCustomers(true);
      const response = await axiosInstance.get("getCustomerListWithNameAndId");

      if (response.status >= 200 && response.status < 300) {
        const customersData = response.data || [];

        // Add "All Customers" option at the beginning
        const customersWithAllOption = [
          { id: "", companyName: "All Customers" },
          ...customersData,
        ];

        setCustomers(customersWithAllOption);

        // Default to "All Customers" (empty string)
        if (!selectedCustomer) {
          setSelectedCustomer("");
        }
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Fetch contacts for selected customer
  const fetchContacts = async (customerId) => {
    // Use the provided customerId parameter
    const customerIdToUse = customerId || selectedCustomer;

    if (!customerIdToUse) {
      setContacts([]);
      return;
    }

    try {
      setLoadingContacts(true);

      // Log for debugging
      console.log("Fetching contacts for customer ID:", customerIdToUse);

      // Use the correct API endpoint
      const endpoint = `getContacts/${customerIdToUse}`;
      const response = await axiosInstance.get(endpoint);

      if (response.status >= 200 && response.status < 300) {
        const contactsData = response.data || [];
        console.log("Contacts fetched:", contactsData);
        setContacts(contactsData);

        // Reset contact selection when customer changes
        setSelectedContact("");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);

      // Handle different error cases
      if (error.response?.status === 404) {
        console.log("No contacts found for this customer");
        setContacts([]);
      } else {
        toast.error("Failed to load contacts");
        setContacts([]);
      }
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchPfData = async (page = 0, search = "", isSearch = false) => {
    try {
      // Set appropriate loading state
      if (isSearch) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }

      let url = `getAllPf?page=${page}&size=${pageSize}`;

      // Add customer filter only if selected (not for "All Customers")
      if (selectedCustomer) {
        url += `&customerId=${selectedCustomer}`;
      }

      // Add contact filter if selected
      if (selectedContact) {
        url += `&contactId=${selectedContact}`;
      }

      // Add search term if provided
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axiosInstance.get(url);

      // Rest of the function remains exactly as before...
      // Check if response is successful
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;

        // Handle various response structures
        const pfList =
          data.content || data.data || data.pfList || data.items || [];
        const totalPagesValue = data.totalPages || 1;
        const totalElementsValue =
          data.totalElements || data.totalItems || data.count || pfList.length;

        setPfData(pfList);
        setTotalPages(totalPagesValue);
        setTotalElements(totalElementsValue);
        setCurrentPage(page);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching PF data:", error);

      // Don't show toast for empty results, only for actual errors
      if (error.response?.status === 404) {
        setPfData([]);
      } else if (error.response?.status === 204) {
        setPfData([]);
      } else if (!error.response && error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to load PF data");
      }

      // Reset to empty state
      setPfData([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const fetchEsicData = async (page = 0, search = "", isSearch = false) => {
    try {
      // Set appropriate loading state
      if (isSearch) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }

      let url = `getAllEsics?page=${page}&size=${pageSize}`;

      // Add customer filter only if selected (not for "All Customers")
      if (selectedCustomer) {
        url += `&customerId=${selectedCustomer}`;
      }

      // Add contact filter if selected
      if (selectedContact) {
        url += `&contactId=${selectedContact}`;
      }

      // Add search term if provided
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axiosInstance.get(url);

      // Rest of the function remains exactly as before...
      // Check if response is successful
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;

        // Handle various response structures for ESIC
        const esicList =
          data.content ||
          data.data ||
          data.esicList ||
          data.items ||
          data.esics ||
          [];
        const totalPagesValue = data.totalPages || 1;
        const totalElementsValue =
          data.totalElements ||
          data.totalItems ||
          data.count ||
          esicList.length;

        setEsicData(esicList);
        setTotalPages(totalPagesValue);
        setTotalElements(totalElementsValue);
        setCurrentPage(page);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching ESIC data:", error);

      // Handle different error cases
      if (error.response?.status === 404) {
        setEsicData([]);
      } else if (error.response?.status === 204) {
        setEsicData([]);
      } else if (!error.response && error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to load ESIC data");
      }

      // Reset to empty state
      setEsicData([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Handle customer change
  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    setSelectedContact(""); // Reset contact when customer changes

    // Fetch contacts for the selected customer (only if not "All Customers")
    if (customerId) {
      fetchContacts(customerId);
    } else {
      setContacts([]);
    }
  };

  // Handle contact change
  const handleContactChange = (contactId) => {
    setSelectedContact(contactId);
  };

  // Handle Create PF
  const handleCreatePF = () => {
    setShowCreatePFModal(true);
  };

  const handlePFCreated = (pfData) => {
    setShowCreatePFModal(false);
    fetchPfData(currentPage, searchTerm);
    toast.success("PF record created successfully!");
  };

  // Handle Create ESIC
  const handleCreateEsic = () => {
    setShowCreateEsicModal(true);
  };

  const handleEsicCreated = (esicData) => {
    setShowCreateEsicModal(false);
    fetchEsicData(currentPage, searchTerm);
    toast.success("ESIC record created successfully!");
  };

  // Handle Edit PF
  const handleEditPF = (pfId) => {
    setSelectedPFId(pfId);
    setShowEditPFModal(true);
  };

  const handlePFUpdated = (updatedPfData) => {
    setShowEditPFModal(false);
    fetchPfData(currentPage, searchTerm);
    toast.success("PF record updated successfully!");
  };

  // Handle Edit ESIC
  const handleEditEsic = (esicId) => {
    setSelectedEsicId(esicId);
    setShowEditEsicModal(true);
  };

  const handleEsicUpdated = (updatedEsicData) => {
    setShowEditEsicModal(false);
    setSelectedEsicId(null);
    fetchEsicData(currentPage, searchTerm);
    toast.success("ESIC record updated successfully!");
  };

  // Handle Delete PF with global popup
  const handleDeletePF = async (pfId, employeeName) => {
    const result = await showDeleteConfirmation(employeeName);

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await axiosInstance.delete(`deletePfById/${pfId}`);

        if (response.status === 200 || response.status === 204) {
          toast.success(`PF record for ${employeeName} deleted successfully!`);
          fetchPfData(currentPage, searchTerm);
        }
      } catch (error) {
        console.error("Error deleting PF record:", error);
        toast.error("Failed to delete PF record");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle Delete ESIC with global popup
  const handleDeleteEsic = async (esicId, employeeName) => {
    const result = await showDeleteConfirmation(employeeName);

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await axiosInstance.delete(`deleteEsicById/${esicId}`);

        if (response.status === 200 || response.status === 204) {
          toast.success(
            `ESIC record for ${employeeName} deleted successfully!`
          );
          fetchEsicData(currentPage, searchTerm);
        }
      } catch (error) {
        console.error("Error deleting ESIC record:", error);
        toast.error("Failed to delete ESIC record");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle row click to open edit modal
  const handleRowClick = (item, type) => {
    if (type === "pf") {
      handleEditPF(item.pfId || item.id);
    } else if (type === "esic") {
      handleEditEsic(item.esicId || item.id);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (activeTab === "pf") {
      fetchPfData(newPage, searchTerm);
    } else {
      fetchEsicData(newPage, searchTerm);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  // Search handler with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === "pf") {
        fetchPfData(0, searchTerm, true);
      } else {
        fetchEsicData(0, searchTerm, true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch data when filters change
  useEffect(() => {
    // Skip fetching for ROLE_CONTACT until they select something
    if (role === "ROLE_CONTACT") {
      return;
    }

    // For ROLE_CUSTOMER, only fetch data if we have a customerId
    if (role === "ROLE_CUSTOMER" && !selectedCustomer) {
      return;
    }

    if (activeTab === "pf") {
      fetchPfData(0, searchTerm);
    } else {
      fetchEsicData(0, searchTerm);
    }
  }, [selectedCustomer, selectedContact, activeTab, pageSize, role]);

  // Initial data fetch - load data based on role
  useEffect(() => {
    const initializeData = async () => {
      if (role === "ROLE_CUSTOMER") {
        // For ROLE_CUSTOMER, get customerId from localStorage
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          const customerId = userData.customerId;

          if (customerId) {
            console.log(
              "Initializing ROLE_CUSTOMER with customerId:",
              customerId
            );

            // Set the customer ID
            setSelectedCustomer(customerId);

            // IMPORTANT: Wait for contacts to be fetched before fetching PF/ESIC data
            await fetchContacts(customerId);

            // Then fetch compliance data
            if (activeTab === "pf") {
              await fetchPfData(0, searchTerm);
            } else {
              await fetchEsicData(0, searchTerm);
            }
          }
        }
      } else if (role === "ROLE_CONTACT") {
        // For ROLE_CONTACT, don't fetch anything initially
        return;
      } else {
        // For other roles (admin, etc.), fetch customers normally
        await fetchCustomers();

        // Fetch initial data for "All Customers"
        if (activeTab === "pf") {
          await fetchPfData(0, searchTerm);
        } else {
          await fetchEsicData(0, searchTerm);
        }
      }
    };

    initializeData();
  }, [role, activeTab]); // Added activeTab to dependencies

  // When customer is selected, fetch contacts
  useEffect(() => {
    if (selectedCustomer) {
      console.log("Customer changed, fetching contacts for:", selectedCustomer);
      fetchContacts(selectedCustomer);
    } else {
      // If customer is cleared, clear contacts too
      setContacts([]);
      setSelectedContact("");
    }
  }, [selectedCustomer]);

  // When customer is selected, fetch contacts
  useEffect(() => {
    if (selectedCustomer) {
      fetchContacts(selectedCustomer);
    }
  }, [selectedCustomer]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
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

  const getGenderBadgeColor = (gender) => {
    switch (gender?.toUpperCase()) {
      case "MALE":
        return "bg-blue-100 text-blue-800";
      case "FEMALE":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMaritalStatusColor = (isMarried) => {
    return isMarried
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCurrentData = () => {
    return activeTab === "pf" ? pfData : esicData;
  };

  // Get total count based on active tab
  const getTotalCount = () => {
    return totalElements;
  };

  const handleGeneratePFLink = () => {
    try {
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        toast.error("data not found, please Relogin Your Account");
        return;
      }

      const userData = JSON.parse(userDataStr);
      const contactId = userData.contactId;

      if (!contactId) {
        toast.error("Contact ID not found in user data");
        return;
      }

      const baseUrl = window.location.origin;
      const formId = `pf_form_${Date.now()}`;
      const link = `${baseUrl}/public-pf-form/${contactId}/${formId}`;

      setGeneratedPFLink(link);
      setShowPublicPFLinkModal(true);
      toast.success("PF form link generated successfully!");
    } catch (error) {
      console.error("Error generating PF link:", error);
      toast.error("Failed to generate PF link");
    }
  };

  const handleGenerateEsicLink = () => {
    try {
      const userDataStr = localStorage.getItem("userData");
      if (!userDataStr) {
        toast.error("User data not found in localStorage");
        return;
      }

      const userData = JSON.parse(userDataStr);
      const contactId = userData.contactId;

      if (!contactId) {
        toast.error("Contact ID not found in user data");
        return;
      }

      const baseUrl = window.location.origin;
      const formId = `esic_form_${Date.now()}`;
      const link = `${baseUrl}/public-esic-form/${contactId}/${formId}`;

      setGeneratedEsicLink(link);
      setShowPublicEsicLinkModal(true);
      toast.success("ESIC form link generated successfully!");
    } catch (error) {
      console.error("Error generating ESIC link:", error);
      toast.error("Failed to generate ESIC link");
    }
  };

  const copyEsicLinkToClipboard = async () => {
    if (!generatedEsicLink) {
      toast.error("No link to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedEsicLink);
      toast.success("ESIC form link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

  // Function to copy PF link to clipboard
  const copyPFLinkToClipboard = async () => {
    if (!generatedPFLink) {
      toast.error("No link to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedPFLink);
      toast.success("PF form link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

  // Add this function after the other handler functions
  const handleStatusToggle = async (id, currentStatus, type) => {
    try {
      const newStatus = !currentStatus;
      const endpoint =
        type === "pf"
          ? `updatePFVerificationStatus/${id}?status=${newStatus}`
          : `updateEsicVerificationStatus/${id}?status=${newStatus}`;

      const response = await axiosInstance.put(endpoint);

      if (response.status >= 200 && response.status < 300) {
        toast.success(`${type.toUpperCase()} status updated successfully!`);

        // Update local state
        if (type === "pf") {
          setPfData((prevData) =>
            prevData.map((item) =>
              (item.pfId || item.id) === id
                ? { ...item, verificationStatus: newStatus }
                : item
            )
          );
        } else {
          setEsicData((prevData) =>
            prevData.map((item) =>
              (item.esicId || item.id) === id
                ? { ...item, verificationStatus: newStatus }
                : item
            )
          );
        }
      }
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
      toast.error(`Failed to update ${type} status`);
    }
  };

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side - Title */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <h1 className="text-2xl font-bold text-gray-900">Compliance</h1>
            </div>

            {/* Right side - Tabs, Search, and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Middle - Filter Dropdowns */}
              {role !== "ROLE_CONTACT" && (
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
                  {/* Customer Dropdown - Hidden for ROLE_CUSTOMER */}
                  {/* Customer Dropdown - Hidden for ROLE_CUSTOMER */}
                  {role !== "ROLE_CUSTOMER" && (
                    <div className="flex-1">
                      <div className="relative">
                        <select
                          value={selectedCustomer}
                          onChange={(e) => handleCustomerChange(e.target.value)}
                          disabled={loadingCustomers}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200 appearance-none pr-10"
                        >
                          {loadingCustomers ? (
                            <option>Loading customers...</option>
                          ) : (
                            customers.map((customer) => (
                              <option key={customer.id} value={customer.id}>
                                {customer.companyName}
                              </option>
                            ))
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Dropdown */}
                  {/* Contact Dropdown */}
                  <div className="flex-1">
                    <div className="relative">
                      <select
                        value={selectedContact}
                        onChange={(e) => handleContactChange(e.target.value)}
                        disabled={
                          !selectedCustomer || // Disable if no customer is selected
                          loadingContacts
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200 appearance-none pr-10"
                      >
                        {loadingContacts ? (
                          <option>Loading contacts...</option>
                        ) : contacts.length === 0 ? (
                          <option>No contacts available</option>
                        ) : (
                          <>
                            <option value="">All Contacts</option>
                            {contacts.map((contact) => (
                              <option key={contact.id} value={contact.id}>
                                {contact.name ||
                                  contact.fullName ||
                                  contact.firstName}
                                {contact.email ? ` (${contact.email})` : ""}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Tab switcher */}
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab("pf")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                    activeTab === "pf"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  PF
                </button>
                <button
                  onClick={() => setActiveTab("esic")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                    activeTab === "esic"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  ESIC
                </button>
              </div>

              {/* Search Input */}
              <div className="relative flex-1 sm:max-w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={`Search ${
                    activeTab === "pf" ? "PF" : "ESIC"
                  }...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                />
              </div>

              {/* Create Buttons */}
              {role === "ROLE_CONTACT" && (
                <div className="flex gap-2">
                  {activeTab === "pf" && (
                    <>
                      <button
                        onClick={handleCreatePF}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Create PF
                      </button>

                      <button
                        onClick={handleGeneratePFLink}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
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
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        Generate Public Link
                      </button>
                    </>
                  )}

                  {activeTab === "esic" && (
                    <>
                      <button
                        onClick={handleCreateEsic}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Create ESIC
                      </button>

                      <button
                        onClick={handleGenerateEsicLink}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
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
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        Generate Public Link
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Statistics Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mb-4 mt-4">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-blue-100">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 text-xs font-medium truncate">
                    Total {activeTab === "pf" ? "PF" : "ESIC"}
                  </p>
                  <p className="text-gray-900 text-sm font-bold truncate">
                    {getTotalCount().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === "pf" ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UAN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date of Joining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marital Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Details
                      </th>
                      {role === "ROLE_CONTACT" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ESIC Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date of Joining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aadhaar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      {role === "ROLE_CONTACT" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                    </>
                  )}
                </tr>
              </thead>

              {searchLoading ? (
                <TableSkeleton rows={pageSize} columns={7} />
              ) : (
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentData().length > 0 ? (
                    getCurrentData().map((item) => (
                      <tr
                        key={
                          activeTab === "pf"
                            ? item.pfId
                            : item.esicId || item.id
                        }
                        className="hover:bg-gray-50 transition-colors duration-150 group relative"
                        onClick={() => handleRowClick(item, activeTab)}
                      >
                        {activeTab === "pf" ? (
                          <>
                            <td className="px-6 py-1 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {getInitials(item.name)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.name || "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.email || "N/A"}
                                  </div>
                                  <div
                                    className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPF(item.pfId || item.id);
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-150"
                                      title="Edit PF Record"
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

                                    {canDelete && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeletePF(
                                            item.pfId || item.id,
                                            item.name
                                          );
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-150"
                                        title="Delete PF Record"
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
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.uan || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(item.dateOfJoining)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGenderBadgeColor(
                                  item.gender
                                )}`}
                              >
                                {item.gender || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMaritalStatusColor(
                                  item.married
                                )}`}
                              >
                                {item.married ? "Married" : "Single"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div className="font-medium">
                                  {item.bankName || "N/A"}
                                </div>
                                <div className="text-gray-500">
                                  {item.accountNumber || "N/A"}
                                </div>
                                <div className="text-xs text-gray-400">
                                  IFSC: {item.ifsc || "N/A"}
                                </div>
                              </div>
                            </td>
                            {role === "ROLE_CONTACT" && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusToggle(
                                      item.pfId || item.id,
                                      item.verificationStatus || false,
                                      "pf"
                                    );
                                  }}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    item.verificationStatus
                                      ? "bg-green-600"
                                      : "bg-gray-300"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      item.verificationStatus
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  />
                                </button>
                                {/* <span className="ml-2 text-xs text-gray-500">
                                {item.verificationStatus
                                  ? "Verified"
                                  : "Unverified"}
                              </span> */}
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(item.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              N/A
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              N/A
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {getInitials(item.name || item.employeeName)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.name || item.employeeName || "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.fatherName || "N/A"}
                                  </div>
                                  <div
                                    className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditEsic(item.esicId || item.id);
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-150"
                                      title="Edit ESIC Record"
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

                                    {canDelete && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteEsic(
                                            item.esicId || item.id,
                                            item.name || item.employeeName
                                          );
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-150"
                                        title="Delete ESIC Record"
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
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.esicNumber || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(item.dateOfJoining)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.aadhaarNumber || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.phone || "N/A"}
                            </td>
                            {role === "ROLE_CONTACT" && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusToggle(
                                      item.esicId || item.id,
                                      item.verificationStatus || false,
                                      "esic"
                                    );
                                  }}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    item.verificationStatus
                                      ? "bg-green-600"
                                      : "bg-gray-300"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      item.verificationStatus
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                  />
                                </button>
                                {/* <span className="ml-2 text-xs text-gray-500">
                                {item.verificationStatus
                                  ? "Verified"
                                  : "Unverified"}
                              </span> */}
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(item.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              N/A
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              N/A
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          {searchTerm
                            ? "No records found for your search"
                            : `No ${activeTab.toUpperCase()} records found`}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>
        </div>

        {/* Common Pagination Component */}
        {!searchLoading && getCurrentData().length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            itemsName={activeTab === "pf" ? "PF records" : "ESIC records"}
            showPageSize={true}
            sticky={true}
          />
        )}

        {/* Modals */}
        {showCreatePFModal && (
          <CreatePFModal
            onClose={() => setShowCreatePFModal(false)}
            onSuccess={handlePFCreated}
          />
        )}

        {showCreateEsicModal && (
          <CreateEsicModal
            onClose={() => setShowCreateEsicModal(false)}
            onSuccess={handleEsicCreated}
          />
        )}

        {showEditPFModal && selectedPFId && (
          <EditPFModal
            pfId={selectedPFId}
            onClose={() => {
              setShowEditPFModal(false);
              setSelectedPFId(null);
            }}
            onSuccess={handlePFUpdated}
          />
        )}

        {showEditEsicModal && selectedEsicId && (
          <EditEsicModal
            esicId={selectedEsicId}
            onClose={() => {
              setShowEditEsicModal(false);
              setSelectedEsicId(null);
            }}
            onSuccess={handleEsicUpdated}
          />
        )}

        {showPublicPFLinkModal && (
          <PublicPFFormBasemodal
            generatedLink={generatedPFLink}
            onClose={() => {
              setShowPublicPFLinkModal(false);
              setGeneratedPFLink("");
            }}
            onCopyLink={copyPFLinkToClipboard}
          />
        )}

        {showPublicEsicLinkModal && (
          <PublicEsicFormBasemodal
            generatedLink={generatedEsicLink}
            onClose={() => {
              setShowPublicEsicLinkModal(false);
              setGeneratedEsicLink("");
            }}
            onCopyLink={copyEsicLinkToClipboard}
          />
        )}
      </div>
    </LayoutComponent>
  );
}

export default ComplianceList;
