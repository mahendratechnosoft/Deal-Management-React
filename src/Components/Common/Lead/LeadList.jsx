import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import PreviewLead from "./PreviewLead";
import Select from "react-select";
import { components } from "react-select";
import CreateLeadModal from "./CreateLeadModal";
import ImportLeadModal from "./ImportLeadModal";
// Table Body Skeleton Component (for search operations)
const TableBodySkeleton = ({ rows = 5, columns = 7 }) => {
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

// Pagination Skeleton Component (for search operations)
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

// Full Page Skeleton Component (for initial load)
const LeadListSkeleton = () => {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="h-8 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <div className="px-2.5 py-1.5 rounded bg-gray-300 w-16 animate-pulse"></div>
              <div className="px-2.5 py-1.5 rounded bg-gray-200 w-16 animate-pulse ml-1"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 sm:max-w-64">
                <div className="w-full h-10 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
              <div className="flex-1 sm:flex-none hidden">
                <div className="w-full sm:w-40 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="bg-gray-300 rounded-lg w-32 h-10 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Count Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-2 mb-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-2 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-300 animate-pulse"></div>
              <div className="min-w-0 flex-1">
                <div className="h-3 bg-gray-300 rounded w-12 mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-400 rounded w-8 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="relative overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(7)].map((_, index) => (
                  <th key={index} className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <TableBodySkeleton rows={5} columns={7} />
          </table>
        </div>
      </div>

      <PaginationSkeleton />
    </div>
  );
};

function LeadList() {
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const { LayoutComponent, role } = useLayout();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [showColumnPopup, setShowColumnPopup] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [statusAndCount, setStatusAndCount] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [activeStatusDropdown, setActiveStatusDropdown] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [previewLeadId, setPreviewLeadId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Add these to your existing state
  const [kanbanData, setKanbanData] = useState({});
  const [kanbanLoading, setKanbanLoading] = useState({});
  const [kanbanPage, setKanbanPage] = useState({});
  const [kanbanHasMore, setKanbanHasMore] = useState({});
  const [kanbanTotal, setKanbanTotal] = useState({});
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);

  // Default columns
  const [columns, setColumns] = useState([
    { id: "clientName", name: "CLIENT NAME", visible: true, order: 0 },
    { id: "companyName", name: "COMPANY NAME", visible: true, order: 1 },
    { id: "email", name: "EMAIL", visible: true, order: 2 },
    { id: "mobileNumber", name: "PHONE", visible: true, order: 3 },
    { id: "status", name: "STATUS", visible: true, order: 4 },
    { id: "createdDate", name: "CREATED DATE", visible: true, order: 5 },
  ]);

  const [tempColumns, setTempColumns] = useState(columns);
  const dragItem = useRef();
  const dragOverItem = useRef();

  // Status options and kanban columns
  // Status options for React Select
  const statusOptions = [
    { value: "New Lead", label: "New Lead", color: "#3b82f6" },
    { value: "Contacted", label: "Contacted", color: "#8b5cf6" },
    { value: "Qualified", label: "Qualified", color: "#10b981" },
    { value: "Proposal", label: "Proposal", color: "#f59e0b" },
    { value: "Negotiation", label: "Negotiation", color: "#f97316" },
    { value: "Won", label: "Won", color: "#059669" },
    { value: "Lost", label: "Lost", color: "#ef4444" },
    { value: "Converted", label: "Converted", color: "#6366f1" },
  ];

  // Updated custom styles for React Select v5
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "24px",
      height: "24px",
      border: "none",
      boxShadow: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      "&:hover": {
        border: "none",
      },
      minWidth: "120px",
    }),

    valueContainer: (base) => ({
      ...base,
      height: "24px",
      padding: "0 6px",
      display: "flex",
      alignItems: "center",
    }),

    singleValue: (base, state) => ({
      color: "#374151", // keep text normal (no change)
      fontWeight: "600",
      fontSize: "12px",
      margin: 0,
      lineHeight: "1",
    }),

    indicatorsContainer: (base) => ({
      ...base,
      height: "24px",
    }),

    dropdownIndicator: (base) => ({
      ...base,
      padding: "4px",
      svg: {
        width: "14px",
        height: "14px",
      },
    }),

    menu: (base) => ({
      ...base,
      width: "160px",
      fontSize: "12px",
      zIndex: 9999,
      position: "absolute",
      backgroundColor: "#fff", // dropdown background visible clearly
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    }),

    option: (base, state) => ({
      ...base,
      fontSize: "12px",
      padding: "6px 8px",
      backgroundColor: state.isSelected
        ? "#d4e3f6" // bright blue for selected
        : state.isFocused
        ? "#f3f4f6" // light gray hover
        : "#fff", // normal
      color: state.isSelected ? "#2563eb" : "#111827",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  // Format option label with color dot
  const formatOptionLabel = ({ value, label, color }) => (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="truncate">{label}</span>
    </div>
  );

  const kanbanColumns = [
    {
      id: "new lead",
      title: "New Lead",
      color: "bg-blue-500",
      apiStatus: "New Lead", // Try with proper case
      page: 0,
      hasMore: true,
      loading: false,
    },
    {
      id: "contacted",
      title: "Contacted",
      color: "bg-purple-500",
      apiStatus: "Contacted", // Try with proper case
      page: 0,
      hasMore: true,
      loading: false,
    },
    {
      id: "qualified",
      title: "Qualified",
      color: "bg-green-500",
      apiStatus: "Qualified", // Try with proper case
      page: 0,
      hasMore: true,
      loading: false,
    },
    {
      id: "proposal",
      title: "Proposal",
      color: "bg-yellow-500",
      apiStatus: "Proposal", // Try with proper case
      page: 0,
      hasMore: true,
      loading: false,
    },
    {
      id: "negotiation",
      title: "Negotiation",
      color: "bg-orange-500",
      apiStatus: "Negotiation", // Try with proper case
      page: 0,
      hasMore: true,
      loading: false,
    },
    {
      id: "won",
      title: "Won",
      color: "bg-green-600",
      apiStatus: "Won", // Try with proper case
      page: 0,
      hasMore: true,
      loading: false,
    },
    {
      id: "lost",
      title: "Lost",
      color: "bg-red-500",
      apiStatus: "Lost", // Try with proper case
      page: 0,
      hasMore: true,
      loading: false,
    },
    {
      id: "converted",
      title: "Converted",
      color: "bg-indigo-500",
      apiStatus: "Converted", // Try with proper case
      page: 0,
      hasMore: true,
      loading: false,
    },
  ];

  const refreshLeadsData = () => {
    fetchLeads(currentPage, searchTerm, statusFilter);
  };

  // Fetch status counts function
  const fetchStatusCounts = async () => {
    try {
      const response = await axiosInstance.get("getLeadStatusAndCount");
      setStatusAndCount(response.data || []);
    } catch (err) {
      console.error("Error fetching status counts:", err);
    }
  };

  // Optimized fetch function for both initial load and search
  const fetchLeads = async (
    page = 0,
    search = "",
    status = "all",
    isSearch = false
  ) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      // Set appropriate loading state
      if (isSearch) {
        setSearchLoading(true);
      } else if (page === 0 && search === "" && status === "all") {
        setLoading(true);
      } else {
        setSearchLoading(true);
      }

      let url = `getAllLeads/${page}/${pageSize}`;
      const params = [];

      if (search.trim()) {
        params.push(`search=${encodeURIComponent(search)}`);
      }

      if (status !== "all") {
        params.push(`leadStatus=${encodeURIComponent(status)}`);
      }

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await axiosInstance.get(url, {
        signal: abortControllerRef.current.signal,
      });

      const data = response.data;

      setLeads(data.leadList || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
      setTotalLeads(data.totalLeads || 0);

      // Only update status counts on initial load or first page search
      if (page === 0) {
        setStatusAndCount(data.statusAndCount || []);
      }

      setError(null);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Request was cancelled");
        return;
      }
      console.error("Error fetching leads:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Separate function for kanban search
  const handleKanbanSearch = async (search = "", status = "all") => {
    if (viewMode === "kanban") {
      // Reset all kanban columns and refetch with search
      kanbanColumns.forEach((column) => {
        fetchKanbanLeads(column.apiStatus, 0, false);
      });
    }
  };

  // Optimized useEffect for search and initial load
  useEffect(() => {
    if (viewMode === "table") {
      const timeoutId = setTimeout(() => {
        const isSearch =
          searchTerm !== "" || statusFilter !== "all" || currentPage !== 0;
        fetchLeads(0, searchTerm, statusFilter, isSearch);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, statusFilter, viewMode, pageSize]);

  // Separate useEffect for initial data loading
  useEffect(() => {
    fetchStatusCounts();
  }, []);

  // Separate useEffect for kanban data
  useEffect(() => {
    if (viewMode === "kanban") {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const timeoutId = setTimeout(() => {
        fetchAllKanbanColumns();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [viewMode]); // Removed searchTerm and pageSize from dependencies

  // Event handlers
  // Your existing handlers remain the same...
  const handlePreview = (leadId) => {
    setPreviewLeadId(leadId);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewLeadId(null);
  };

  const handleEditFromPreview = (leadId) => {
    setShowPreviewModal(false);
    handleEdit(leadId);
  };

  const handleLeadConverted = () => {
    refreshLeadsData();
    // toast.success("Lead converted to customer successfully!");
  };

  const handleCardFilter = (status) => {
    setStatusFilter(status);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchLeads(newPage, searchTerm, statusFilter, true);
    }
  };

  // Update lead status function
  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const response = await axiosInstance.put("updateLeadStatus", {
        leadId: leadId,
        status: newStatus.value, // React Select uses object with value property
      });

      toast.success("Status updated successfully!");

      if (response.data) {
        // Find the lead to get old status BEFORE updating state
        const oldLead = leads.find((lead) => lead.id === leadId);

        // Update table view leads
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === leadId ? { ...lead, status: newStatus.value } : lead
          )
        );

        // Refresh status counts from API to ensure accuracy
        await fetchStatusCounts();

        // If in kanban view, refresh kanban data to ensure consistency
        if (viewMode === "kanban") {
          const sourceColumn = kanbanColumns.find(
            (col) => col.apiStatus === oldLead?.status
          );
          const targetColumn = kanbanColumns.find(
            (col) => col.apiStatus === newStatus.value
          );

          if (sourceColumn) {
            fetchKanbanLeads(sourceColumn.apiStatus, 0, false);
          }
          if (targetColumn) {
            fetchKanbanLeads(targetColumn.apiStatus, 0, false);
          }
        }
      }
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  // Get current status value for React Select
  const getCurrentStatus = (leadStatus) => {
    return (
      statusOptions.find((option) => option.value === leadStatus) ||
      statusOptions.find((option) => option.value === "New Lead")
    );
  };

  // Get background color for the select container
  const getStatusBackgroundColor = (status) => {
    if (!status) return "bg-gray-100";
    switch (status.toLowerCase()) {
      case "new lead":
        return "bg-blue-100";
      case "contacted":
        return "bg-purple-100";
      case "qualified":
        return "bg-green-100";
      case "proposal":
        return "bg-yellow-100";
      case "negotiation":
        return "bg-orange-100";
      case "won":
        return "bg-green-200";
      case "lost":
        return "bg-red-100";
      case "converted":
        return "bg-indigo-100";
      default:
        return "bg-gray-100";
    }
  };

  // Get text color for the select container
  const getStatusTextColor = (status) => {
    if (!status) return "text-gray-800";
    switch (status.toLowerCase()) {
      case "new lead":
        return "text-blue-800";
      case "contacted":
        return "text-purple-800";
      case "qualified":
        return "text-green-800";
      case "proposal":
        return "text-yellow-800";
      case "negotiation":
        return "text-orange-800";
      case "won":
        return "text-white";
      case "lost":
        return "text-white";
      case "converted":
        return "text-indigo-800";
      default:
        return "text-gray-800";
    }
  };

  const StatusSelect = ({ value, onChange, options, styles }) => {
    return (
      <Select
        value={value}
        options={options}
        onChange={onChange}
        styles={styles}
        isSearchable={false}
        menuPlacement="auto"
        classNamePrefix="react-select"
        onMenuOpen={() => {}}
        onMenuClose={() => {}}
        onInputChange={() => {}}
        menuPortalTarget={document.body} // This renders dropdown in body
        menuPosition="fixed" // Use fixed positioning
        components={{
          IndicatorSeparator: null,
        }}
      />
    );
  };

  const toggleStatusDropdown = (leadId) => {
    setActiveStatusDropdown(activeStatusDropdown === leadId ? null : leadId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".status-dropdown")) {
        setActiveStatusDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // // Other handlers
  // const handleCreateLead = () => {
  //   navigate("/CreateLead");
  // };

  // Handle successful lead creation
  const handleLeadCreated = () => {
    setShowCreateLeadModal(false);
 
    refreshLeadsData(); // Refresh the leads list
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowCreateLeadModal(false);
  };

 const handleCreateLead = () => {
   console.log("Create Lead button clicked");
   console.log("showCreateLeadModal before:", showCreateLeadModal);
   setShowCreateLeadModal(true);
   console.log("showCreateLeadModal after:", showCreateLeadModal);
 };

 // Add this useEffect to monitor state changes
 useEffect(() => {
   console.log("showCreateLeadModal state changed:", showCreateLeadModal);
 }, [showCreateLeadModal]);
  // const handleCreateLead = () => {
  //   console.log("Current role:", role);

  //   if (role === "ROLE_ADMIN") {
  //     navigate("/Admin/CreateLead");
  //   } else if (role === "ROLE_EMPLOYEE") {
  //     navigate("/Employee/CreateLead");
  //   }
  // };

  const handleEdit = (leadId) => {
    if (role === "ROLE_ADMIN") {
      navigate(`/Admin/EditLead/${leadId}`);
    } else if (role === "ROLE_EMPLOYEE") {
      navigate(`/Employee/EditLead/${leadId}`);
    }
  };

  const handleRefresh = () => {
    fetchLeads(currentPage, searchTerm, statusFilter);
  };

  const handleOpenPopup = () => {
    setTempColumns([...columns]);
    setShowColumnPopup(true);
  };

  const handleClosePopup = () => {
    setShowColumnPopup(false);
  };

  const handleApplyChanges = () => {
    setColumns([...tempColumns]);
    setShowColumnPopup(false);
  };

  const handleColumnToggle = (columnId) => {
    setTempColumns(
      tempColumns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dragItemIndex = dragItem.current;
    const dragOverItemIndex = dragOverItem.current;

    if (dragItemIndex !== dragOverItemIndex) {
      const newTempColumns = [...tempColumns];
      const draggedColumn = newTempColumns[dragItemIndex];

      newTempColumns.splice(dragItemIndex, 1);
      newTempColumns.splice(dragOverItemIndex, 0, draggedColumn);

      const updatedColumns = newTempColumns.map((col, index) => ({
        ...col,
        order: index,
      }));

      setTempColumns(updatedColumns);
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleKanbanDragEnd = (e) => {
    // Reset opacity for dragged element
    e.target.style.opacity = "1";

    // Reset drag states
    setDraggedLead(null);
    setDragOverColumn(null);
  };
  // Utility function to truncate text with ellipsis
  const truncateText = (text, maxLength = 10) => {
    if (!text || text === "N/A") return text || "N/A";

    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength) + "...";
  };
  // Kanban handlers

  // Fetch leads for specific status column
  const fetchKanbanLeads = async (status, page = 0, append = false) => {
    // Create new AbortController for this specific request
    const controller = new AbortController();

    try {
      setKanbanLoading((prev) => ({ ...prev, [status]: true }));

      console.log(`Fetching leads for status: "${status}", page: ${page}`);

      const encodedStatus = encodeURIComponent(status);
      let url = `getAllLeads/${page}/${pageSize}?leadStatus=${encodedStatus}`;

      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await axiosInstance.get(url, {
        signal: controller.signal,
      });

      const data = response.data;
      const leads = data.leadList || [];

      setKanbanData((prev) => ({
        ...prev,
        [status]: append ? [...(prev[status] || []), ...leads] : leads,
      }));

      setKanbanPage((prev) => ({ ...prev, [status]: page }));
      setKanbanHasMore((prev) => ({
        ...prev,
        [status]: leads.length === pageSize,
      }));
      setKanbanTotal((prev) => ({
        ...prev,
        [status]: (prev[status] || 0) + leads.length,
      }));
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(`Error fetching ${status} leads:`, err);
        // Don't show toast for every failed request to avoid spam
        if (!append) {
          // Only show error for initial load, not infinite scroll
          toast.error(`Failed to load ${status} leads`);
        }
      }
    } finally {
      setKanbanLoading((prev) => ({ ...prev, [status]: false }));
    }
  };
  // Fetch initial data for all kanban columns
  const fetchAllKanbanColumns = () => {
    console.log("Fetching all kanban columns...");
    kanbanColumns.forEach((column) => {
      fetchKanbanLeads(column.apiStatus, 0, false);
    });
  };

  // Infinite scroll handler for each column
  const handleColumnScroll = (event, status) => {
    const element = event.target;
    const { scrollTop, scrollHeight, clientHeight } = element;

    // Load more when 80% scrolled
    if (
      scrollHeight - scrollTop <= clientHeight * 1.2 &&
      kanbanHasMore[status] &&
      !kanbanLoading[status]
    ) {
      const nextPage = (kanbanPage[status] || 0) + 1;
      fetchKanbanLeads(status, nextPage, true);
    }
  };

  //  ====================================

  const handleKanbanDragStart = (e, lead, columnId) => {
    setDraggedLead({ ...lead, fromColumn: columnId });
    e.dataTransfer.effectAllowed = "move";

    // Add visual feedback
    e.target.style.opacity = "0.4";

    // Add event listener for drag end cleanup
    e.target.addEventListener("dragend", handleKanbanDragEnd, { once: true });
  };

  const handleKanbanDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);

    // Add visual feedback for drop target
    e.currentTarget.style.backgroundColor = "#f0f9ff";
    e.currentTarget.style.borderColor = "#3b82f6";
  };

  const handleKanbanDragLeave = (e) => {
    setDragOverColumn(null);

    // Remove visual feedback
    e.currentTarget.style.backgroundColor = "";
    e.currentTarget.style.borderColor = "";
  };

  const handleKanbanDrop = async (e, targetColumnId) => {
    e.preventDefault();

    if (draggedLead && draggedLead.fromColumn !== targetColumnId) {
      const targetColumn = kanbanColumns.find(
        (col) => col.id === targetColumnId
      );
      const sourceColumn = kanbanColumns.find(
        (col) => col.id === draggedLead.fromColumn
      );

      if (!targetColumn || !sourceColumn) return;

      // Use the exact status from the target column's apiStatus
      const newStatus = targetColumn.apiStatus;

      try {
        // Fix: Create the proper object format for React Select
        const statusObject = { value: newStatus, label: newStatus };

        // Update the lead status via API - this will handle count updates
        await updateLeadStatus(draggedLead.id, statusObject);

        // Update local kanban data immediately for better UX
        // Remove from source column
        setKanbanData((prev) => ({
          ...prev,
          [sourceColumn.apiStatus]: (prev[sourceColumn.apiStatus] || []).filter(
            (lead) => lead.id !== draggedLead.id
          ),
        }));

        // Add to target column
        setKanbanData((prev) => ({
          ...prev,
          [targetColumn.apiStatus]: [
            ...(prev[targetColumn.apiStatus] || []),
            { ...draggedLead, status: newStatus },
          ],
        }));

        // CRITICAL: Refresh status counts from API to get accurate numbers
        await fetchStatusCounts();
      } catch (error) {
        console.error("Error updating lead status via drag and drop:", error);
        toast.error("Failed to move lead");
      }
    }

    // Reset drag states
    setDraggedLead(null);
    setDragOverColumn(null);

    // Remove visual feedback
    e.currentTarget.style.backgroundColor = "";
    e.currentTarget.style.borderColor = "";
  };
  // Helper functions
  const visibleColumns = columns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toLowerCase()) {
      case "new lead":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-purple-100 text-purple-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      case "proposal":
        return "bg-yellow-100 text-yellow-800";
      case "negotiation":
        return "bg-orange-100 text-orange-800";
      case "won":
        return "bg-green-500 text-white";
      case "lost":
        return "bg-red-500 text-white";
      case "converted": // Add this case
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceColor = (source) => {
    if (!source) return "bg-gray-100 text-gray-800";
    switch (source.toLowerCase()) {
      case "website":
        return "bg-blue-100 text-blue-800";
      case "social media":
        return "bg-purple-100 text-purple-800";
      case "email campaign":
        return "bg-green-100 text-green-800";
      case "referral":
        return "bg-orange-100 text-orange-800";
      case "instagram":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Calculate total leads from all status counts
  const calculateTotalLeads = () => {
    if (!statusAndCount || statusAndCount.length === 0) return 0;
    return statusAndCount.reduce((total, statusCount) => {
      return total + (statusCount.count || 0);
    }, 0);
  };

  // Helper function to get count for a specific status
  // Helper function to get count for a specific status
  const getStatusCount = (statusName) => {
    const statusCount = statusAndCount.find((sc) => sc.status === statusName);
    return statusCount ? statusCount.count : 0;
  };

  // Use this in your JSX instead of totalLeads from API
  const displayTotalLeads = calculateTotalLeads();

  // Organize leads for kanban view
  const organizedKanbanColumns = kanbanColumns.map((column) => ({
    ...column,
    leads: leads.filter((lead) => lead.status?.toLowerCase() === column.id),
  }));

  // Use TableSkeleton instead of loading spinner
  if (loading) {
    return (
      <LayoutComponent>
        <LeadListSkeleton />
      </LayoutComponent>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600 max-w-md">
          <svg
            className="w-16 h-16 mx-auto mb-4"
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
          <h3 className="text-lg font-semibold mb-2">Error Loading Leads</h3>
          <p className="mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* First Row - Header with Create Button */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors duration-200 ${
                    viewMode === "table"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
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
                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Table
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors duration-200 ${
                    viewMode === "kanban"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
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
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                      />
                    </svg>
                    Kanban
                  </div>
                </button>
              </div>
              {/* Search and Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
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
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex-1 sm:flex-none" hidden>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-40 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                  >
                    <option value="all">All Status</option>
                    <option value="new lead">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              {/* Create Button */}
              {/* <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                onClick={handleCreateLead}
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
                Create Lead
              </button> */}

              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                onClick={handleCreateLead}
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
                Create Lead
              </button>
                  <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                onClick={() => setIsImportOpen(true)}
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
                Import Lead
              </button>
            </div>
          </div>
        </div>

        {/* Second Row - Better Responsive Grid */}

        {viewMode === "table" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-2 mb-4">
            {/* Total Leads Card */}
            <div
              className={`bg-white rounded-lg p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer ${
                statusFilter === "all" ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => handleCardFilter("all")}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                    statusFilter === "all" ? "bg-gray-200" : "bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-3 h-3 text-gray-600"
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
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 text-[12px] font-medium truncate">
                    Total
                  </p>
                  <p className="text-gray-900 text-sm font-bold truncate">
                    {calculateTotalLeads().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Cards from API Data */}
            {statusAndCount.map((statusCount) => {
              const statusConfig = {
                "New Lead": {
                  bgColor: "bg-blue-100",
                  activeBgColor: "bg-blue-200",
                  iconColor: "text-blue-600",
                  borderColor: "border-blue-200",
                  activeBorderColor: "border-blue-400",
                  ringColor: "ring-blue-500",
                  icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.0 015 0z",
                },
                Contacted: {
                  bgColor: "bg-purple-100",
                  activeBgColor: "bg-purple-200",
                  iconColor: "text-purple-600",
                  borderColor: "border-purple-200",
                  activeBorderColor: "border-purple-400",
                  ringColor: "ring-purple-500",
                  icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                },
                Qualified: {
                  bgColor: "bg-green-100",
                  activeBgColor: "bg-green-200",
                  iconColor: "text-green-600",
                  borderColor: "border-green-200",
                  activeBorderColor: "border-green-400",
                  ringColor: "ring-green-500",
                  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                },
                Proposal: {
                  bgColor: "bg-yellow-100",
                  activeBgColor: "bg-yellow-200",
                  iconColor: "text-yellow-600",
                  borderColor: "border-yellow-200",
                  activeBorderColor: "border-yellow-400",
                  ringColor: "ring-yellow-500",
                  icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                },
                Negotiation: {
                  bgColor: "bg-orange-100",
                  activeBgColor: "bg-orange-200",
                  iconColor: "text-orange-600",
                  borderColor: "border-orange-200",
                  activeBorderColor: "border-orange-400",
                  ringColor: "ring-orange-500",
                  icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
                },
                Won: {
                  bgColor: "bg-emerald-100",
                  activeBgColor: "bg-emerald-200",
                  iconColor: "text-emerald-600",
                  borderColor: "border-emerald-200",
                  activeBorderColor: "border-emerald-400",
                  ringColor: "ring-emerald-500",
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                },
                Lost: {
                  bgColor: "bg-red-100",
                  activeBgColor: "bg-red-200",
                  iconColor: "text-red-600",
                  borderColor: "border-red-200",
                  activeBorderColor: "border-red-400",
                  ringColor: "ring-red-500",
                  icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
                },
                Converted: {
                  bgColor: "bg-indigo-100",
                  activeBgColor: "bg-indigo-200",
                  iconColor: "text-indigo-600",
                  borderColor: "border-indigo-200",
                  activeBorderColor: "border-indigo-400",
                  ringColor: "ring-indigo-500",
                  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                },
              };

              const config =
                statusConfig[statusCount.status] || statusConfig["New Lead"];
              const isActive =
                statusFilter === statusCount.status.toLowerCase();

              return (
                <div
                  key={statusCount.status}
                  className={`bg-white rounded-lg p-2 shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer ${
                    isActive ? config.activeBorderColor : config.borderColor
                  } ${isActive ? `ring-2 ${config.ringColor}` : ""}`}
                  onClick={() =>
                    handleCardFilter(statusCount.status.toLowerCase())
                  }
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                        isActive ? config.activeBgColor : config.bgColor
                      }`}
                    >
                      <svg
                        className={`w-3 h-3 ${config.iconColor}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={config.icon}
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-[11px] font-medium truncate">
                        {statusCount.status.split(" ")[0]}
                      </p>
                      <p className="text-gray-900 text-sm font-bold">
                        {statusCount.count}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Content Area */}
        {viewMode === "table" ? (
          <>
            {/* Table View */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="">
                {searchLoading && <></>}

                {/* Single table container */}
                <div className="relative overflow-x-auto crm-Leadlist-kanbadn-col-list">
                  <table className="min-w-full divide-y divide-gray-200">
                    {/* Colgroup for consistent column widths */}
                    <colgroup>
                      {visibleColumns.map((column) => (
                        <col
                          key={column.id}
                          style={{
                            width: `${100 / visibleColumns.length}%`,
                          }}
                        />
                      ))}
                    </colgroup>

                    {/* Table header */}
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {visibleColumns.map((column) => (
                          <th
                            key={column.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate"
                            title={column.name}
                          >
                            {column.name}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Table body */}
                    {searchLoading ? (
                      <TableBodySkeleton
                        rows={pageSize}
                        columns={visibleColumns.length}
                      />
                    ) : (
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leads.map((lead) => (
                          <tr
                            key={lead.id}
                            className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer group" // Added group class here
                            onClick={(e) => {
                              // Don't trigger preview if clicking on status dropdown or action buttons
                              if (
                                !e.target.closest(".status-select-container") &&
                                !e.target.closest(".action-buttons")
                              ) {
                                handlePreview(lead.id);
                              }
                            }}
                          >
                            {visibleColumns.map((column) => (
                              <td
                                key={column.id}
                                className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 relative"
                              >
                                {column.id === "clientName" ? (
                                  <div className="flex flex-col min-w-0">
                                    {/* Client Name and Avatar Row */}
                                    <div className="flex items-center gap-3">
                                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {getInitials(lead.clientName)}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <span
                                          className="font-semibold block"
                                          title={lead[column.id] || "N/A"}
                                        >
                                          {truncateText(
                                            lead[column.id] || "N/A",
                                            30
                                          )}
                                        </span>

                                        {/* Action Buttons - Show below on row hover */}
                                        <div className="action-buttons flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          {/* Preview Button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePreview(lead.id);
                                            }}
                                            className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 text-xs"
                                            title="Preview Lead"
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
                                            View
                                          </button>

                                          {/* Edit Button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEdit(lead.id);
                                            }}
                                            className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 text-xs"
                                            title="Edit Lead"
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
                                            Edit
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : column.id === "status" ? (
                                  <div
                                    className="status-select-container p-0"
                                    onClick={(e) => e.stopPropagation()} // Prevent row click for status column
                                  >
                                    <div
                                      className={`inline-flex rounded-full ${getStatusBackgroundColor(
                                        lead.status
                                      )} ${getStatusTextColor(
                                        lead.status
                                      )} px-2 py-0.5`}
                                    >
                                      <StatusSelect
                                        value={getCurrentStatus(lead.status)}
                                        options={statusOptions}
                                        onChange={(newValue) =>
                                          updateLeadStatus(lead.id, newValue)
                                        }
                                        styles={customStyles}
                                      />
                                    </div>
                                  </div>
                                ) : column.id === "source" ? (
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(
                                      lead[column.id]
                                    )} max-w-full truncate`}
                                    title={lead[column.id] || "N/A"}
                                  >
                                    {truncateText(lead[column.id] || "N/A", 10)}
                                  </span>
                                ) : column.id === "revenue" ? (
                                  <span
                                    className="font-semibold truncate block"
                                    title={formatCurrency(lead[column.id])}
                                  >
                                    {truncateText(
                                      formatCurrency(lead[column.id]),
                                      10
                                    )}
                                  </span>
                                ) : column.id === "createdDate" ? (
                                  <span
                                    className="truncate block"
                                    title={formatDate(lead[column.id])}
                                  >
                                    {truncateText(
                                      formatDate(lead[column.id]),
                                      10
                                    )}
                                  </span>
                                ) : (
                                  <div className="relative">
                                    <span
                                      className="truncate block max-w-xs"
                                      title={lead[column.id] || "N/A"}
                                    >
                                      {truncateText(
                                        lead[column.id] || "N/A",
                                        10
                                      )}
                                    </span>
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>

              {leads.length === 0 && !searchLoading && (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No leads found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by creating your first lead."}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <button
                      onClick={handleCreateLead}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Create Your First Lead
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* Pagination - Outside table card, above the table */}

            {searchLoading ? (
              <PaginationSkeleton />
            ) : (
              <div
                className="bg-white rounded-lg border border-gray-200 shadow-xs p-3 mt-4 sticky bottom-0 "
                style={{ zIndex: "1" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-gray-600">
                      {totalPages > 1
                        ? `Page ${currentPage + 1} of ${totalPages}`
                        : `${totalLeads} leads`}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Rows:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value);
                          setPageSize(newSize);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  {/* Show pagination only if there are multiple pages */}
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePageChange(0)}
                        disabled={currentPage === 0}
                        className="px-2 py-1 rounded border border-gray-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-w-8"
                      >
                        First
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="px-2 py-1 rounded border border-gray-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-w-8"
                      >
                        ‹
                      </button>

                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-2 py-1 rounded text-xs font-medium min-w-8 ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="px-2 py-1 rounded border border-gray-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-w-8"
                      >
                        ›
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages - 1)}
                        disabled={currentPage === totalPages - 1}
                        className="px-2 py-1 rounded border border-gray-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-w-8"
                      >
                        Last
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Kanban View */

          <div className="space-y-4">
            <div className="overflow-x-auto pb-4 crm-Leadlist-kanbadn-col-list">
              <div className="flex gap-4 min-w-max">
                {kanbanColumns.map((column) => {
                  // Get the correct count from statusAndCount - updated to use exact status match
                  const statusCount = statusAndCount.find(
                    (sc) => sc.status === column.apiStatus // Use exact API status match
                  );
                  const columnTotal = statusCount?.count || 0;

                  // Get leads from kanbanData
                  const columnLeads = kanbanData[column.apiStatus] || [];
                  const isLoading = kanbanLoading[column.apiStatus];
                  const hasMore = kanbanHasMore[column.apiStatus];

                  return (
                    <div key={column.id} className="w-80 flex-shrink-0">
                      <div
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 h-full transition-all duration-200 ${
                          dragOverColumn === column.id
                            ? "ring-2 ring-blue-400 bg-blue-50"
                            : ""
                        }`}
                        onDragOver={(e) => handleKanbanDragOver(e, column.id)}
                        onDragLeave={handleKanbanDragLeave}
                        onDrop={(e) => handleKanbanDrop(e, column.id)}
                      >
                        {/* Column Header */}

                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${column.color}`}
                              ></div>
                              <h3 className="font-semibold text-gray-900">
                                {column.title}
                              </h3>
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                {columnTotal}{" "}
                                {/* Use the real count from API */}
                              </span>
                            </div>
                            {isLoading && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                          </div>
                        </div>

                        {/* Column Content with Infinite Scroll */}
                        <div
                          className="p-4 space-y-3 min-h-[200px] h-[60vh] overflow-y-auto crm-Leadlist-kanbadn-col-list"
                          onScroll={(e) =>
                            handleColumnScroll(e, column.apiStatus)
                          }
                        >
                          {/* Leads List */}
                          {columnLeads.map((lead) => (
                            <div
                              key={lead.id}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors duration-200 cursor-grab"
                              draggable
                              onDragStart={(e) =>
                                handleKanbanDragStart(e, lead, column.id)
                              }
                              onDragEnd={() => {
                                setDraggedLead(null);
                                setDragOverColumn(null);
                              }}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {getInitials(lead.clientName)}
                                  </div>
                                  <span className="font-medium text-sm text-gray-900">
                                    {lead.clientName}
                                  </span>
                                </div>
                                <span
                                  className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(
                                    lead.status
                                  )}`}
                                >
                                  {lead.status}
                                </span>
                              </div>
{/* 
                              <p className="text-xs text-gray-600 mb-2">
                                {formatCurrency(lead.revenue)}
                              </p> */}

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatDate(lead.createdDate)}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handlePreview(lead.id)}
                                    className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                                    title="Preview Lead"
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
                                  </button>
                                  <button
                                    onClick={() => handleEdit(lead.id)}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Loading More Indicator */}
                          {isLoading && columnLeads.length > 0 && (
                            <div className="flex justify-center py-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                          )}

                          {/* No Leads Message */}
                          {columnLeads.length === 0 && !isLoading && (
                            <div className="text-center py-8 text-gray-400">
                              <svg
                                className="w-8 h-8 mx-auto mb-2"
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
                              <p className="text-sm">No leads</p>
                            </div>
                          )}

                          {/* End of List Message */}
                          {!hasMore && columnLeads.length > 0 && (
                            <div className="text-center py-2 text-xs text-gray-500">
                              No more leads to load
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Column Customization Popup */}
        {showColumnPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Customize Columns
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors duration-200"
                  onClick={handleClosePopup}
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <p className="text-gray-600 text-sm mb-4">
                  Drag and drop to rearrange columns. Check/uncheck to show/hide
                  columns.
                </p>

                <div className="space-y-2">
                  {tempColumns
                    .sort((a, b) => a.order - b.order)
                    .map((column, index) => (
                      <div
                        key={column.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-grab"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={handleDrop}
                        onDragEnd={() => {
                          dragItem.current = null;
                          dragOverItem.current = null;
                        }}
                      >
                        <div className="text-gray-400 mr-3 cursor-grab">⋮⋮</div>
                        <label className="flex items-center space-x-3 cursor-pointer flex-1 m-0">
                          <input
                            type="checkbox"
                            checked={column.visible}
                            onChange={() => handleColumnToggle(column.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700 font-medium">
                            {column.name}
                          </span>
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
                  onClick={handleApplyChanges}
                >
                  Apply Changes
                </button>
                <button
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
                  onClick={handleClosePopup}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Lead Modal */}
      {showCreateLeadModal && (
        <CreateLeadModal
          onClose={handleCloseModal}
          onSuccess={handleLeadCreated}
          role={role}
        />
      )}
      {/* Preview Modal */}
      {showPreviewModal && (
        <PreviewLead
          leadId={previewLeadId}
          onClose={handleClosePreview}
          onEdit={handleEditFromPreview}
          onConvert={handleLeadConverted}
        />
      )}

     {/* Modal Component */}
      <ImportLeadModal
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

    </LayoutComponent>
  );
}

export default LeadList;
