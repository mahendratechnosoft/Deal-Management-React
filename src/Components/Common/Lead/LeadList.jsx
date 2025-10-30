import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";

function LeadList() {
  const navigate = useNavigate();

  // Get user role from localStorage
  const getUserRole = () => {
    return localStorage.getItem("role");
  };

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
  const [pageSize] = useState(10);

  // Default columns based on API response structure
  const [columns, setColumns] = useState([
    { id: "clientName", name: "CLIENT NAME", visible: true, order: 0 },
    { id: "employeeId", name: "EMPLOYEE ID", visible: true, order: 1 },
    { id: "assignTo", name: "ASSIGNED TO", visible: true, order: 2 },
    { id: "status", name: "STATUS", visible: true, order: 3 },
    { id: "source", name: "SOURCE", visible: true, order: 4 },
    { id: "revenue", name: "REVENUE", visible: true, order: 5 },
    { id: "city", name: "CITY", visible: true, order: 6 },
    { id: "state", name: "STATE", visible: true, order: 7 },
    { id: "country", name: "COUNTRY", visible: true, order: 8 },
    { id: "createdDate", name: "CREATED DATE", visible: true, order: 9 },
  ]);

  const [tempColumns, setTempColumns] = useState(columns);
  const dragItem = useRef();
  const dragOverItem = useRef();

  const kanbanColumns = [
    { id: "new lead", title: "New Lead", color: "bg-blue-500", leads: [] },
    { id: "contacted", title: "Contacted", color: "bg-purple-500", leads: [] },
    { id: "qualified", title: "Qualified", color: "bg-green-500", leads: [] },
    { id: "proposal", title: "Proposal", color: "bg-yellow-500", leads: [] },
    {
      id: "negotiation",
      title: "Negotiation",
      color: "bg-orange-500",
      leads: [],
    },
    { id: "won", title: "Won", color: "bg-green-600", leads: [] },
    { id: "lost", title: "Lost", color: "bg-red-500", leads: [] },
  ];

  // Fetch leads with search functionality
  const fetchLeads = async (page = 0, search = "") => {
    try {
      setLoading(true);

      let url = `getAllLeads/${page}/${pageSize}`;
      if (search.trim()) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await axiosInstance.get(url);
      const data = response.data;

      setLeads(data.leadList || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 0);
      setTotalLeads(data.totalLeads || 0);
      setStatusAndCount(data.statusAndCount || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLeads(0, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load data on component mount
  useEffect(() => {
    fetchLeads(0);
  }, [navigate]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchLeads(newPage, searchTerm);
    }
  };

  // Filter leads based on status (for current page only)
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus =
      statusFilter === "all" ||
      lead.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesStatus;
  });

  // Organize leads for kanban view (current page only)
  const organizedKanbanColumns = kanbanColumns.map((column) => ({
    ...column,
    leads: filteredLeads.filter(
      (lead) => lead.status?.toLowerCase() === column.id
    ),
  }));

  const handleCreateLead = () => {
    navigate("/Admin/CreateLead");
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

  const handleEdit = (leadId) => {
    navigate(`/Admin/EditLead/${leadId}`);
  };

  const handleRefresh = () => {
    fetchLeads(currentPage, searchTerm);
  };

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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
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
    <div className="p-6 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
      {/* First Row - Header with Create Button */}
      <div className="mb-6">
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
              <div className="flex-1 sm:flex-none">
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
          </div>
        </div>
      </div>

      {/* Second Row - Better Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-2 mb-4">
        {/* Total Leads Card */}
        <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
              <svg
                className="w-3 h-3 text-blue-600"
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
                {totalLeads.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
              <svg
                className="w-3 h-3 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 text-[12px] font-medium truncate">
                Revenue
              </p>
              <p className="text-gray-900 text-sm font-bold truncate">
                {formatCurrency(
                  leads.reduce((sum, lead) => sum + (lead.revenue || 0), 0)
                ).replace("₹", "₹")}
              </p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        {statusAndCount.map((statusCount, index) => {
          const statusConfig = {
            "New Lead": {
              bgColor: "bg-blue-100",
              iconColor: "text-blue-600",
              borderColor: "border-blue-200",
              icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.0 015 0z",
            },
            Contacted: {
              bgColor: "bg-purple-100",
              iconColor: "text-purple-600",
              borderColor: "border-purple-200",
              icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
            },
            Qualified: {
              bgColor: "bg-green-100",
              iconColor: "text-green-600",
              borderColor: "border-green-200",
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            },
            Proposal: {
              bgColor: "bg-yellow-100",
              iconColor: "text-yellow-600",
              borderColor: "border-yellow-200",
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
            },
            Negotiation: {
              bgColor: "bg-orange-100",
              iconColor: "text-orange-600",
              borderColor: "border-orange-200",
              icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
            },
            Won: {
              bgColor: "bg-emerald-100",
              iconColor: "text-emerald-600",
              borderColor: "border-emerald-200",
              icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
            },
            Lost: {
              bgColor: "bg-red-100",
              iconColor: "text-red-600",
              borderColor: "border-red-200",
              icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
            },
          };

          const config =
            statusConfig[statusCount.status] || statusConfig["New Lead"];

          return (
            <div
              key={statusCount.status}
              className={`bg-white rounded-lg p-2 shadow-sm border hover:shadow-md transition-all duration-200 ${config.borderColor}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 ${config.bgColor} rounded flex items-center justify-center flex-shrink-0`}
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
      {/* Controls Bar */}
      <div
        className="bg-white rounded-lg shadow-sm p-3 mb-4 border border-gray-200"
        hidden
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
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

            <button
              className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 font-medium border border-gray-300 flex items-center gap-1.5 text-sm"
              onClick={handleOpenPopup}
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                />
              </svg>
              Customize Columns
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "table" ? (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.name}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {visibleColumns.map((column) => (
                      <td
                        key={column.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.id === "clientName" ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(lead.clientName)}
                            </div>
                            <span className="font-semibold">
                              {lead[column.id] || "N/A"}
                            </span>
                          </div>
                        ) : column.id === "status" ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              lead[column.id]
                            )}`}
                          >
                            {lead[column.id] || "Unknown"}
                          </span>
                        ) : column.id === "source" ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(
                              lead[column.id]
                            )}`}
                          >
                            {lead[column.id] || "Unknown"}
                          </span>
                        ) : column.id === "revenue" ? (
                          <span className="font-semibold">
                            {formatCurrency(lead[column.id])}
                          </span>
                        ) : column.id === "createdDate" ? (
                          formatDate(lead[column.id])
                        ) : (
                          lead[column.id] || "N/A"
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(lead.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200 flex items-center gap-1"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage + 1} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                    className="px-3 py-1 rounded border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-1 rounded border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
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
                    className="px-3 py-1 rounded border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-1 rounded border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="overflow-x-auto pb-4">
          <div
            className="flex gap-4 min-w-max"
            style={{ minWidth: "max-content" }}
          >
            {organizedKanbanColumns.map((column) => (
              <div key={column.id} className="w-80 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                          {column.leads.length}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
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
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 min-h-[200px]">
                    {column.leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
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

                        <p className="text-xs text-gray-600 mb-2">
                          {lead.employeeId} • {formatCurrency(lead.revenue)}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDate(lead.createdDate)}</span>
                          <button
                            onClick={() => handleEdit(lead.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}

                    {column.leads.length === 0 && (
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
                  </div>
                </div>
              </div>
            ))}
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
  );
}

export default LeadList;
