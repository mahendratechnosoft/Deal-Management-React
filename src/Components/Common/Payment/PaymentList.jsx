import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import Pagination from "../pagination";
import CreatePaymentModal from "./CreatePaymentModal";
import { hasPermission } from "../../BaseComponet/permissions";
function PaymentList() {
  const navigate = useNavigate();
  const { LayoutComponent, role } = useLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Predefined status list
  const allStatuses = [
    "Completed",
    "Pending",
    "Failed",
    "Refunded",
    "Processing"
  ];

  const InlineSpinner = ({ label = "Loading..." }) => (
    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );

  const TableSkeleton = ({ rows = 5, cols = 8 }) => {
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

  // Fetch payments with search functionality
  const fetchPayments = useCallback(
    async (page = 0, search = "") => {
      try {
        setLoading(true);
        let url = `getAllPayments/${page}/${pageSize}`;
        if (search.trim()) {
          url += `?search=${encodeURIComponent(search)}`;
        }
        const response = await axiosInstance.get(url);
        const data = response.data;
        setPayments(data.paymentList || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
        setTotalPayments(data.totalPayments || data.paymentList?.length || 0);
        setError(null);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError(err.message);
        toast.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Single useEffect for data fetching with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPayments(0, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchPayments]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchPayments(newPage, searchTerm);
    }
  };

  // Modal handlers
  const handleCreatePayment = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    toast.success("Payment created successfully!");
    fetchPayments(currentPage, searchTerm);
  };

  const handleView = (paymentId) => {
    if (role === "ROLE_ADMIN") {
      navigate(`/Admin/EditPayment/${paymentId}`);
    } else if (role === "ROLE_EMPLOYEE") {
      navigate(`/Employee/EditPayment/${paymentId}`);
    }
  };

  const handleRefresh = () => {
    fetchPayments(currentPage, searchTerm);
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await axiosInstance.delete(`deletePayment/${paymentId}`);
        toast.success("Payment deleted successfully!");
        fetchPayments(currentPage, searchTerm);
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error("Failed to delete payment");
      }
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (companyName) => {
    if (!companyName) return "??";
    return companyName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleEdit = (paymentId) => {
    if (role === "ROLE_ADMIN") {
      navigate(`/Admin/EditPayment/${paymentId}`);
    } else if (role === "ROLE_EMPLOYEE") {
      navigate(`/Employee/EditPayment/${paymentId}`);
    }
  };


  // Filter payments based on status
  const filteredPayments = payments.filter((payment) => {
    const matchesStatus =
      statusFilter === "all" ||
      payment.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesStatus;
  });

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
          <h3 className="text-lg font-semibold mb-2">
            Error Loading Payments
          </h3>
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
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Payments
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search and Filters */}
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
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Create Button */}
              {hasPermission("payment", "create") && (
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                  onClick={handleCreatePayment}
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
                  Create Payment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto crm-Leadlist-kanbadn-col-list">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TRANSACTION
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CUSTOMER
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    INVOICE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AMOUNT
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PAYMENT DATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED BY
                  </th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={6} cols={7} />
              ) : (
                <tbody className="bg-white divide-y divide-gray-200 overflow-x-auto">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.paymentId}
                      className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                      onClick={() => handleView(payment.paymentId)}
                    >
                      {/* Transaction ID with Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center justify-between min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {getInitials(payment.companyName)}
                            </div>

                            <div>
                              <div
                                className="font-semibold truncate max-w-[120px]"
                                title={payment.transactionId}
                              >
                                {payment.transactionId || "N/A"}
                              </div>
                              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {/* Edit Button (same as leads / employee table) */}
                               
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(payment.paymentId);
                                  }}
                                  className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 text-xs"
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 
                002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 
                15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit
                                </button>

                                {/* Delete Button (same as leads / employee table) */}
                                {/* <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(payment.paymentId);
                                    }}
                                    className="text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-1 text-xs"
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
                                        d="M19 7l-.867 12.142A2 2 0 
                0116.138 21H7.862a2 2 0 01-1.995-1.858L5 
                7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 
                0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                    Delete
                                  </button> */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company Name */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-medium text-gray-900 truncate max-w-[120px]"
                            title={payment.companyName}
                          >
                            {payment.companyName || "N/A"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.customerId || ""}
                        </div>
                      </td>

                      {/* Invoice */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className="text-gray-900 truncate max-w-[100px] block"
                          title={payment.proformaInvoiceNo}
                        >
                          {payment.proformaInvoiceNo || "N/A"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {formatCurrency(payment.amount)}
                      </td>

                      {/* Payment Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.paymentDate)}
                      </td>

                      {/* Employee ID */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {payment.createdBy || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {!loading && filteredPayments.length === 0 && (
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No payments found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first payment."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={handleCreatePayment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Your First Payment
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalPayments}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            fetchPayments(0, searchTerm);
          }}
          itemsName="payments"
          showPageSize={true}
          sticky={true}
        />
      </div>

      {/* CREATE PAYMENT MODAL */}
      {showCreateModal && (
        <CreatePaymentModal
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateSuccess}
        />
      )}
    </LayoutComponent>
  );
}

export default PaymentList;