import React, { useState, useEffect, useCallback } from "react";
import { useLayout } from "../../Layout/useLayout";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Pagination from "../pagination";
import CreateAdminModal from "./CreateAdminModal";
import { useNavigate } from "react-router-dom";

function AdminList() {
  const navigate = useNavigate();
  const { LayoutComponent } = useLayout();
  const [adminList, setAdminList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAdmin, setTotalAdmin] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // Add modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Add modal handler functions
  const handleCreateAdmin = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchAdmins(currentPage, searchTerm); // Refresh the list
  };

  // Inline Spinner Component
  const InlineSpinner = ({ label = "Loading..." }) => (
    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );

  // Table Skeleton Component - Updated to match CustomerList style
  const TableSkeleton = ({ rows = 5, cols = 7 }) => {
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

  // Fetch admins with search functionality - using useCallback
  const fetchAdmins = useCallback(
    async (page = 0, search = "") => {
      try {
        setLoading(true);
        let url = `getAllAdmin/${page}/${pageSize}`;

        if (search.trim()) {
          url += `?search=${encodeURIComponent(search)}`;
        }

        const response = await axiosInstance.get(url);
        const data = response.data;
        setAdminList(data.adminList || []);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(page);
        setTotalAdmin(data.totalAdmin || 0);
        setError(null);
      } catch (err) {
        console.error("Error fetching admins:", err);
        setError(err.message);
        toast.error("Failed to load admin list");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Single useEffect for data fetching with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAdmins(0, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchAdmins]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchAdmins(newPage, searchTerm);
    }
  };

  const handleRefresh = () => {
    fetchAdmins(currentPage, searchTerm);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const formatPhone = (phone) => {
    if (!phone) return "Not provided";
    return phone;
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusColor = (admin) => {
    if (admin.expiryDate && new Date(admin.expiryDate) < new Date()) {
      return "bg-red-100 text-red-800";
    }
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (admin) => {
    if (admin.expiryDate && new Date(admin.expiryDate) < new Date()) {
      return "Expired";
    }
    return "Active";
  };

  const navigateToEditAdmin = (adminId) => {
    navigate(`/SuperAdmin/EditAdmin/${adminId}`);
  };
  if (error) {
    return (
      <LayoutComponent>
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
            <h3 className="text-lg font-semibold mb-2">Error Loading Admins</h3>
            <p className="mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Header Section - Matching CustomerList style */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Admin Management
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
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
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                />
              </div>

              {/* Create Admin Button */}
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                onClick={handleCreateAdmin}
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
                Create Admin
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards Section - Matching CustomerList style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
          {/* Total Admins Card */}
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-gray-100">
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
                  Total Admins
                </p>
                <p className="text-gray-900 text-sm font-bold truncate">
                  {loading ? (
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  ) : (
                    totalAdmin.toLocaleString()
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Showing Count Card */}
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-blue-100">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-[12px] font-medium truncate">
                  Showing
                </p>
                <p className="text-gray-900 text-sm font-bold truncate">
                  {loading ? (
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  ) : (
                    `${adminList.length} of ${totalAdmin}`
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table View - Matching CustomerList style */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto crm-Leadlist-kanbadn-col-list">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ADMIN DETAILS
                  </th>
               
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CONTACT INFORMATION
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    COMPANY DETAILS
                  </th>
              
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={6} cols={5} />
              ) : (
                <tbody className="bg-white divide-y divide-gray-200 overflow-x-auto">
                  {adminList.map((admin) => (
                    <tr
                      key={admin.adminId}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={() => navigateToEditAdmin(admin.adminId)}
                    >
                      {/* Admin Details */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(admin.loginEmail)}
                          </div>
                          <div>
                            <div
                              className="font-semibold truncate max-w-[120px]"
                              title={admin.loginEmail}
                            >
                              {admin.loginEmail || "Not provided"}
                            </div>
                            <div className="text-xs text-gray-500">
                              <button
                                className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 opacity-0 group-hover:opacity-100"
                                title="Edit Admin"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToEditAdmin(admin.adminId);
                                }}
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
                      </td>
                   
                      {/* Contact Information */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="text-gray-900">
                          {formatPhone(admin.phone)}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-[150px]">
                          {admin.companyEmail || "No company email"}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-[150px]">
                          {admin.address || "No address provided"}
                        </div>
                      </td>

                      {/* Company Details */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="font-semibold text-gray-900 truncate max-w-[120px]">
                          {admin.companyName || "Not provided"}
                        </div>
                        <div className="text-sm text-gray-500">
                          GST: {admin.gstNumber || "Not provided"}
                        </div>
                        <div className="text-xs text-gray-400">
                          Expires: {formatDate(admin.expiryDate)}
                        </div>
                      </td>

                  
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {/* Empty State */}
          {!loading && adminList.length === 0 && (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No admins found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "No administrators are currently registered."}
              </p>
            </div>
          )}
        </div>

        {/* Global Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalAdmin}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            fetchAdmins(0, searchTerm);
          }}
          itemsName="admins"
          showPageSize={true}
          sticky={true}
        />

        {/* Create Admin Modal */}
        {showCreateModal && (
          <CreateAdminModal
            onClose={handleCloseCreateModal}
            onSuccess={handleCreateSuccess}
          />
        )}
      </div>
    </LayoutComponent>
  );
}

export default AdminList;
