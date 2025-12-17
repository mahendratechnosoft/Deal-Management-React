import React, { useState, useEffect, useCallback } from "react";
import { useLayout } from "../../Layout/useLayout";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Pagination from "../pagination";
import CreateAmcModal from "./CreateAmcModal";
import EditAmcModal from "./EditAmcModal";
import {
  AlertCard,
  DashboardWrapper,
  ProgressCard,
} from "../../BaseComponet/FinancialDashboardComponents";
import { hasPermission } from "../../BaseComponet/permissions";

function AmcList() {
  const { LayoutComponent } = useLayout();
  const [amcList, setAmcList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Search and Filter States - renamed to match API
  const [searchTerm, setSearchTerm] = useState("");
  const [expiryFromDate, setExpiryFromDate] = useState("");
  const [expiryToDate, setExpiryToDate] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAmc, setSelectedAmc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [dashboardCounts, setDashboardCounts] = useState({
    amc: { total: 0, renewed: 0, overdue: 0 },
    domain: { total: 0, renewed: 0, overdue: 0 },
    gsuite: { total: 0, renewed: 0, overdue: 0 },
  });

  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Helper function to calculate days remaining and status for any date
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

  // Function to check if domain is overdue
  const isDomainOverdue = (domainRenewalDate) => {
    if (!domainRenewalDate) return false;
    const status = getDueDateStatus(domainRenewalDate);
    return status.isPastDue;
  };

  // Function to check if G Suite is overdue
  const isGSuiteOverdue = (gsuitRenewalDate) => {
    if (!gsuitRenewalDate) return false;
    const status = getDueDateStatus(gsuitRenewalDate);
    return status.isPastDue;
  };

  // Function to get days overdue for domain
  const getDomainOverdueDays = (domainRenewalDate) => {
    if (!domainRenewalDate) return null;
    const status = getDueDateStatus(domainRenewalDate);
    return status.isPastDue ? status.daysRemaining : null;
  };

  // Function to get days overdue for G Suite
  const getGSuiteOverdueDays = (gsuitRenewalDate) => {
    if (!gsuitRenewalDate) return null;
    const status = getDueDateStatus(gsuitRenewalDate);
    return status.isPastDue ? status.daysRemaining : null;
  };

  // Skeleton Loader
  const TableSkeleton = ({ rows = 5, cols = 6 }) => {
    const r = Array.from({ length: rows });
    const c = Array.from({ length: cols });
    return (
      <tbody>
        {r.map((_, i) => (
          <tr key={i} className="animate-pulse">
            {c.map((_, j) => (
              <td key={j} className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  // Fetch AMC List - UPDATED with correct parameter names
  const fetchAMCList = useCallback(
    async (page = 0) => {
      try {
        setLoading(true);

        // Build URL with parameters - UPDATED parameter names
        let url = `getAllAMC/${page}/${pageSize}`;
        const params = new URLSearchParams();

        if (searchTerm.trim()) params.append("search", searchTerm);
        if (expiryFromDate) params.append("expiryFromDate", expiryFromDate);
        if (expiryToDate) params.append("expiryToDate", expiryToDate);

        if (params.toString()) url += `?${params.toString()}`;

        console.log("Fetching URL:", url); // Debug log

        const response = await axiosInstance.get(url);
        const data = response.data;

        if (data && Array.isArray(data.amcList)) {
          setAmcList(data.amcList);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.currentPage || 0);
          setTotalItems(data.totalElements || 0);
        } else {
          setAmcList([]);
          setTotalPages(1);
          setCurrentPage(0);
          setTotalItems(0);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching AMC list:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load AMC list"
        );
        toast.error("Failed to load AMC list");
        setAmcList([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, searchTerm, expiryFromDate, expiryToDate]
  );

  // Delete AMC
  const handleDeleteAmc = async (amcId) => {
    if (!window.confirm("Are you sure you want to delete this AMC?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await axiosInstance.delete(`deleteAMC/${amcId}`);
      toast.success("AMC deleted successfully!");
      // Refresh the list
      fetchAMCList(currentPage);
    } catch (error) {
      console.error("Error deleting AMC:", error);
      toast.error("Failed to delete AMC");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit modal
  const handleEditAmc = (amc) => {
    setSelectedAmc(amc);
    setShowEditModal(true);
  };

  // Handle row click to open edit modal
  const handleRowClick = (amc) => {
    handleEditAmc(amc);
  };

  // Fetch AMC list with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAMCList(0);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchAMCList]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchAMCList(newPage);
      setCurrentPage(newPage);
    }
  };

  // Reset filters - UPDATED
  const handleResetFilters = () => {
    setSearchTerm("");
    setExpiryFromDate("");
    setExpiryToDate("");
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Add this fetch function after fetchAMCList function
  const fetchDashboardCounts = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const { data } = await axiosInstance.get("getAmcDashboardCounts");

      setDashboardCounts({
        amc: {
          total: data.totalAMC || 0,
          renewed: data.renewedAMC || 0,
          overdue: data.overdueAMC || 0,
        },
        domain: {
          total: data.totalDomain || 0,
          renewed: data.renewedDomain || 0,
          overdue: data.overdueDomain || 0,
        },
        gsuite: {
          total: data.totalGsuit || 0,
          renewed: data.renewedGsuit || 0,
          overdue: data.overdueGsuit || 0,
        },
      });
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardCounts();
  }, [fetchDashboardCounts]);

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
          <h3 className="text-lg font-semibold mb-2">Error Loading AMC List</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => fetchAMCList(0)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Header Section - All in one row */}
        <div className="mb-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left side title */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    AMC Management
                  </h1>
                  <p className="text-xs text-gray-600">
                    Manage Annual Maintenance Contracts
                  </p>
                </div>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg
                    className="w-3 h-3 text-gray-400"
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
                  placeholder="Search AMC / Company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-52 pl-7 pr-2 py-1 h-7 border border-gray-300
                     rounded-md focus:ring-1 focus:ring-blue-500
                     focus:border-blue-500 text-xs bg-white"
                />
              </div>

              {/* Expiry From */}
              <input
                type="date"
                value={expiryFromDate}
                onChange={(e) => setExpiryFromDate(e.target.value)}
                className="px-2 py-1 h-7 border border-gray-300 rounded-md
                   focus:ring-1 focus:ring-blue-500 text-xs"
                title="Expiry From"
              />

              {/* Expiry To */}
              <input
                type="date"
                value={expiryToDate}
                onChange={(e) => setExpiryToDate(e.target.value)}
                className="px-2 py-1 h-7 border border-gray-300 rounded-md
                   focus:ring-1 focus:ring-blue-500 text-xs"
                title="Expiry To"
              />

              {/* Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetFilters}
                  className="px-2 py-1 h-7 border border-gray-300 text-gray-700
                     rounded-md hover:bg-gray-50 transition text-xs"
                >
                  Reset
                </button>
                {hasPermission("amc", "Create") && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-2 py-1 h-7 bg-blue-600 hover:bg-blue-700
                     text-white rounded-md transition
                     flex items-center gap-1 text-xs shadow-sm"
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
                    Create
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Counts Row */}
        <div className="flex gap-4 mb-2">
          {/* AMC */}
          <div className="flex-1 rounded-lg border border-blue-100 p-3 min-w-0 bg-gradient-to-br from-blue-50 to-blue-25 shadow-sm">
            <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">
              AMC
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ProgressCard
                label="Renewed"
                count={dashboardCounts.amc.renewed}
                total={dashboardCounts.amc.total}
                barColorClass="bg-green-500"
              />
              <ProgressCard
                label="Overdue"
                count={dashboardCounts.amc.overdue}
                total={dashboardCounts.amc.total}
                barColorClass="bg-red-500"
              />
            </div>
          </div>

          {/* DOMAIN */}
          <div className="flex-1 rounded-lg border border-purple-100 p-3 min-w-0 bg-gradient-to-br from-purple-50 to-purple-25 shadow-sm">
            <h3 className="text-xs font-bold text-purple-800 uppercase mb-2">
              Domain
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ProgressCard
                label="Renewed"
                count={dashboardCounts.domain.renewed}
                total={dashboardCounts.domain.total}
                barColorClass="bg-green-500"
              />
              <ProgressCard
                label="Overdue"
                count={dashboardCounts.domain.overdue}
                total={dashboardCounts.domain.total}
                barColorClass="bg-red-500"
              />
            </div>
          </div>

          {/* G-SUITE */}
          <div className="flex-1 rounded-lg border border-emerald-100 p-3 min-w-0 bg-gradient-to-br from-emerald-50 to-emerald-25 shadow-sm">
            <h3 className="text-xs font-bold text-emerald-800 uppercase mb-2">
              G-Suite
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ProgressCard
                label="Renewed"
                count={dashboardCounts.gsuite.renewed}
                total={dashboardCounts.gsuite.total}
                barColorClass="bg-green-500"
              />
              <ProgressCard
                label="Overdue"
                count={dashboardCounts.gsuite.overdue}
                total={dashboardCounts.gsuite.total}
                barColorClass="bg-red-500"
              />
            </div>
          </div>
        </div>

        {/* AMC List Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AMC Due
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain Due
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    G Suite Due
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              {loading ? (
                <TableSkeleton rows={6} cols={5} />
              ) : (
                <tbody className="bg-white divide-y divide-gray-200">
                  {amcList.map((amc) => {
                    const amcDueStatus = getDueDateStatus(amc.amcEndDate);
                    const isAmcOverdue = amcDueStatus.isPastDue;

                    const domainDueStatus = getDueDateStatus(
                      amc.domainRenewalDate
                    );
                    const isDomainOverdueFlag = domainDueStatus.isPastDue;

                    const gsuiteDueStatus = getDueDateStatus(
                      amc.gsuitRenewalDate
                    );
                    const isGSuiteOverdueFlag = gsuiteDueStatus.isPastDue;
                    return (
                      <tr
                        key={amc.amcId}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(amc)}
                      >
                        <td
                          className="px-4 py-3 truncate max-w-[260px]"
                          title={amc.companyName}
                        >
                          {amc.companyName || "N/A"}
                        </td>

                        {/* AMC Due Date */}
                        <td className="px-4 py-3">
                          <div
                            className={`${
                              isAmcOverdue
                                ? "text-red-600 font-semibold"
                                : amcDueStatus.status === "near-due"
                                ? "text-yellow-600 font-semibold"
                                : ""
                            }`}
                          >
                            {formatDate(amc.amcEndDate)}
                            {amcDueStatus.message && (
                              <span
                                className={`block text-xs mt-1 ${
                                  isAmcOverdue
                                    ? "text-red-500"
                                    : amcDueStatus.status === "near-due"
                                    ? "text-yellow-500"
                                    : ""
                                }`}
                              >
                                {amcDueStatus.message}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Domain Due Date */}
                        <td className="px-4 py-3">
                          <div
                            className={`${
                              isDomainOverdueFlag
                                ? "text-red-600 font-semibold"
                                : domainDueStatus.status === "near-due"
                                ? "text-yellow-600 font-semibold"
                                : ""
                            }`}
                          >
                            {formatDate(amc.domainRenewalDate)}
                            {domainDueStatus.message && (
                              <span
                                className={`block text-xs mt-1 ${
                                  isDomainOverdueFlag
                                    ? "text-red-500"
                                    : domainDueStatus.status === "near-due"
                                    ? "text-yellow-500"
                                    : ""
                                }`}
                              >
                                {domainDueStatus.message}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* G Suite Due Date */}
                        <td className="px-4 py-3">
                          <div
                            className={`${
                              isGSuiteOverdueFlag
                                ? "text-red-600 font-semibold"
                                : gsuiteDueStatus.status === "near-due"
                                ? "text-yellow-600 font-semibold"
                                : ""
                            }`}
                          >
                            {formatDate(amc.gsuitRenewalDate)}
                            {gsuiteDueStatus.message && (
                              <span
                                className={`block text-xs mt-1 ${
                                  isGSuiteOverdueFlag
                                    ? "text-red-500"
                                    : gsuiteDueStatus.status === "near-due"
                                    ? "text-yellow-500"
                                    : ""
                                }`}
                              >
                                {gsuiteDueStatus.message}
                              </span>
                            )}
                          </div>
                        </td>

                        <td
                          className="px-4 py-3 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAmc(amc);
                              }}
                              className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Edit AMC"
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
                            </button>
                            {hasPermission("amc", "Delete") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAmc(amc.amcId);
                                }}
                                disabled={isDeleting}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete AMC"
                              >
                                {isDeleting ? (
                                  <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                ) : (
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>

            {/* Empty State */}
            {!loading && amcList.length === 0 && (
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
                  No AMC records found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || expiryFromDate || expiryToDate
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first AMC."}
                </p>
                {!searchTerm && !expiryFromDate && !expiryToDate && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Create Your First AMC
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            fetchAMCList(0);
          }}
          itemsName="AMC records"
          showPageSize={true}
          sticky={true}
        />
      </div>

      {/* Create AMC Modal */}
      {showCreateModal && (
        <CreateAmcModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newAmc) => {
            // Refresh the AMC list after successful creation
            fetchAMCList(currentPage);
            toast.success("AMC created successfully!");
          }}
        />
      )}

      {/* Edit AMC Modal */}
      {showEditModal && selectedAmc && (
        <EditAmcModal
          amc={selectedAmc}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAmc(null);
          }}
          onSuccess={(updatedAmc) => {
            // Refresh the AMC list after successful update
            fetchAMCList(currentPage);
            toast.success("AMC updated successfully!");
          }}
        />
      )}
    </LayoutComponent>
  );
}

export default AmcList;
