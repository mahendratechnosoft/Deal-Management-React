import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance.js";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import Pagination from "../pagination";
import { hasPermission } from "../../BaseComponet/permissions";
import { showDeleteConfirmation } from "../../BaseComponet/alertUtils";
import CreateVendorModal from "./CreateVendorModal.jsx";
import EditVendorModal from "./EditVendorModal.jsx";

function VendorList() {
  const navigate = useNavigate();
  const { LayoutComponent, role } = useLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewVendorId, setPreviewVendorId] = useState(null);

  // Filters - Removed country and state filters
  const [msmeFilter, setMsmeFilter] = useState("all");

  const initialMount = useRef(true);

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

  // Fetch vendors with search and filters
  const fetchVendors = useCallback(
    async (page = 0, search = "", msme = "all") => {
      try {
        setLoading(true);

        // Build API URL with parameters
        let url = `getAllVendors?page=${page}&size=${pageSize}`;
        const params = new URLSearchParams();

        if (search.trim()) params.append("search", search);
        if (msme !== "all")
          params.append("isMSMERegister", msme === "yes" ? "true" : "false");

        // Add sort parameter
        params.append("sort", "createdAt,desc");

        if (params.toString()) url += `&${params.toString()}`;

        const response = await axiosInstance.get(url);
        const data = response.data;

        if (data && data.content) {
          setVendors(data.content);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.number || 0);
          setTotalItems(data.totalElements || 0);
        } else {
          setVendors([]);
          setTotalPages(1);
          setCurrentPage(0);
          setTotalItems(0);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load vendors"
        );
        toast.error("Failed to load vendors");
        setVendors([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Single useEffect for data fetching with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVendors(0, searchTerm, msmeFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, msmeFilter, fetchVendors]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchVendors(newPage, searchTerm, msmeFilter);
    }
  };

  // Preview Modal handlers
  const handlePreview = (vendorId) => {
    setPreviewVendorId(vendorId);
    setShowPreviewModal(true);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewVendorId(null);
  };

  // Create Modal handlers
  const handleCreateVendor = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchVendors(currentPage, searchTerm, msmeFilter);
  };

  // Edit Modal handlers
  const handleEdit = (vendorId) => {
    setSelectedVendorId(vendorId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedVendorId(null);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedVendorId(null);
    toast.success("Vendor updated successfully!");
    fetchVendors(currentPage, searchTerm, msmeFilter);
  };

  const handleRefresh = () => {
    fetchVendors(currentPage, searchTerm, msmeFilter);
  };

  const handleDelete = async (vendorId, vendorName) => {
    try {
      const result = await showDeleteConfirmation(vendorName || "this vendor");
      if (!result.isConfirmed) return;

      await axiosInstance.delete(`deleteVendor/${vendorId}`);
      setVendors((prev) => prev.filter((v) => v.vendorId !== vendorId));
      setTotalItems((prev) => prev - 1);

      toast.success("Vendor deleted successfully!");
    } catch (error) {
      const message =
        error?.response?.data || "You are not allowed to delete this vendor.";
      toast.error(message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBalanceColor = (balance) => {
    if (balance === 0) return "text-gray-600";
    if (balance > 0) return "text-green-600";
    return "text-red-600";
  };

  const getMSMEBadge = (isMSME, type) => {
    if (!isMSME) return null;

    let bgColor = "bg-gray-100 text-gray-800";
    if (type === "Micro") bgColor = "bg-green-100 text-green-800";
    if (type === "Small") bgColor = "bg-blue-100 text-blue-800";
    if (type === "Medium") bgColor = "bg-yellow-100 text-yellow-800";

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bgColor}`}
      >
        MSME - {type}
      </span>
    );
  };

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
          <h3 className="text-lg font-semibold mb-2">Error Loading Vendors</h3>
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
    );
  }

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Left Section: Title and Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 truncate">
                    Vendors
                  </h1>
                  <p className="text-xs text-gray-600 truncate">
                    Manage and track all your vendors in one place
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section: Add Vendor Button */}
            <div className="flex-shrink-0 flex">
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
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
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=" pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs bg-white transition-colors duration-200"
                />
              </div>
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-1.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-1.5 text-xs shadow-sm hover:shadow-md whitespace-nowrap"
                onClick={handleCreateVendor}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Vendor
              </button>
            </div>
          </div>
        </div>

        {/* Vendor Table with proper row height and layout */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VENDOR DETAILS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CODE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CONTACT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BALANCE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MSME STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LOCATION
                  </th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={6} cols={6} />
              ) : (
                <tbody className="bg-white">
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor.vendorId}
                      className="hover:bg-gray-50 transition-colors duration-150 group border-b border-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(vendor.vendorId);
                      }}
                    >
                      {/* Vendor Details */}
                      <td className="px-2 py-2">
                        <div className="flex items-start gap-3">
                          {/* Profile Image - Made smaller */}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {vendor.vendorName?.charAt(0).toUpperCase() || "V"}
                          </div>
                          <div className="min-w-0 flex-1">
                            {/* Vendor Name and Company */}
                            <div className="font-semibold text-gray-900 text-sm truncate max-w-[180px] mb-0.5">
                              {vendor.vendorName}
                            </div>
                            {vendor.companyName && (
                              <div className="text-xs text-gray-600 truncate max-w-[180px] mb-1">
                                {vendor.companyName}
                              </div>
                            )}

                            {/* Action Buttons - Only visible on row hover */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(vendor.vendorId);
                                }}
                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                                title="Edit Vendor"
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
                              </button>

                              {/* <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(
                                    vendor.vendorId,
                                    vendor.vendorName
                                  );
                                }}
                                className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                                title="Delete Vendor"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button> */}

                              {/* <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreview(vendor.vendorId);
                                }}
                                className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                                title="View Details"
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
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button> */}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        {" "}
                        <div className="text-xs text-gray-500 mb-2">
                          {vendor.vendorCode}
                        </div>
                      </td>
                      {/* Contact Info */}
                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          {vendor.emailAddress && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <svg
                                className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span
                                className="text-gray-700 truncate max-w-[140px]"
                                title={vendor.emailAddress}
                              >
                                {vendor.emailAddress}
                              </span>
                            </div>
                          )}
                          {vendor.phone && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <svg
                                className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <span className="text-gray-700">
                                {vendor.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Balance */}
                      <td className="px-2 py-2">
                        <div className="flex flex-col">
                          <div
                            className={`text-base font-semibold ${getBalanceColor(
                              vendor.balance
                            )}`}
                          >
                            {formatCurrency(vendor.balance)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {vendor.balance > 0
                              ? "You owe"
                              : vendor.balance < 0
                              ? "Owes you"
                              : "Settled"}
                          </div>
                        </div>
                      </td>

                      {/* MSME Status */}
                      <td className="px-2 py-2">
                        <div className="space-y-1.5">
                          {getMSMEBadge(
                            vendor.isMSMERegister,
                            vendor.udyamRegistrationType
                          )}
                          {vendor.udyamRegistrationNumber && (
                            <div className="text-xs text-gray-600">
                              UDYAM: {vendor.udyamRegistrationNumber}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            {vendor.city || "N/A"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {vendor.state && <span>{vendor.state}, </span>}
                            {vendor.country}
                          </div>
                          {vendor.zipCode && (
                            <div className="text-xs text-gray-500">
                              ZIP: {vendor.zipCode}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {!loading && vendors.length === 0 && (
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No vendors found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || msmeFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first vendor."}
              </p>
              {!searchTerm && msmeFilter === "all" && (
                <button
                  onClick={handleCreateVendor}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Add Your First Vendor
                </button>
              )}
            </div>
          )}
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
            fetchVendors(0, searchTerm, msmeFilter);
          }}
          itemsName="vendors"
          showPageSize={true}
          sticky={true}
        />
      </div>

      {/* Create Vendor Modal */}
      {showCreateModal && (
        <CreateVendorModal
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && selectedVendorId && (
        <EditVendorModal
          vendorId={selectedVendorId}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </LayoutComponent>
  );
}

export default VendorList;
