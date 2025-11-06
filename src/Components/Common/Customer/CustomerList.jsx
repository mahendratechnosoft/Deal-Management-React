import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import ContactByCustomer from "./ContactByCustomer";
import Pagination from "../pagination";

function CustomerList() {
  const navigate = useNavigate();
  const { LayoutComponent, role } = useLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Contact Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Predefined industries list
  const allIndustries = [
    "Software Development",
    "Manufacturing",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Real Estate",
    "Other",
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

  // Fetch customers with search functionality - using useCallback to prevent unnecessary recreations
  const fetchCustomers = useCallback(
    async (page = 0, search = "") => {
      try {
        setLoading(true);
        let url = `getAllCustomer/${page}/${pageSize}`;
        if (search.trim()) {
          url += `?search=${encodeURIComponent(search)}`;
        }
        const response = await axiosInstance.get(url);
        const data = response.data;
        setCustomers(data.customerList || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
        setTotalCustomers(
          data.totalCustomers || data.customerList?.length || 0
        );
        setError(null);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Single useEffect for data fetching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCustomers(0, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchCustomers]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchCustomers(newPage, searchTerm);
    }
  };

  const handleCreateCustomer = () => {
    console.log("Current role:", role);

    if (role === "ROLE_ADMIN") {
      navigate("/Admin/CreateCustomer");
    } else if (role === "ROLE_EMPLOYEE") {
      navigate("/Employee/CreateCustomer");
    }
  };
  const handleEdit = (customerId) => {
    if (role === "ROLE_ADMIN") {
      navigate(`/Admin/EditCustomer/${customerId}`);
    } else if (role === "ROLE_EMPLOYEE") {
      navigate(`/Employee/EditCustomer/${customerId}`);
    }
  };

  // Contact Management Functions
  const handleContact = (customer) => {
    setSelectedCustomer(customer);
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
    setSelectedCustomer(null);
  };

  const handleRefresh = () => {
    fetchCustomers(currentPage, searchTerm);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await axiosInstance.delete(`deleteCustomer/${customerId}`);
        toast.success("Customer deleted successfully!");
        fetchCustomers(currentPage, searchTerm);
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast.error("Failed to delete customer");
      }
    }
  };

  const getIndustryColor = (industry) => {
    if (!industry) return "bg-gray-100 text-gray-800";
    switch (industry.toLowerCase()) {
      case "software development":
        return "bg-blue-100 text-blue-800";
      case "manufacturing":
        return "bg-green-100 text-green-800";
      case "healthcare":
        return "bg-purple-100 text-purple-800";
      case "finance":
        return "bg-yellow-100 text-yellow-800";
      case "retail":
        return "bg-orange-100 text-orange-800";
      case "education":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Filter customers based on industry
  const filteredCustomers = customers.filter((customer) => {
    const matchesIndustry =
      industryFilter === "all" ||
      customer.industry?.toLowerCase() === industryFilter.toLowerCase();
    return matchesIndustry;
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
            Error Loading Customers
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
                    Customers
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
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                  />
                </div>

                {/* Industry Filter */}
                <div className="flex-1 sm:flex-none">
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    className="w-full sm:w-40 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                  >
                    <option value="all">All Industries</option>
                    {allIndustries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Create Button */}
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                onClick={handleCreateCustomer}
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
                Create Customer
              </button>
            </div>
          </div>
        </div>

        {/* Total Customers Card - Smaller Size */}
        {/* <div className="mb-4">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium">
                  Total Customers
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {loading ? (
                    <InlineSpinner label="Loading..." />
                  ) : (
                    totalCustomers.toLocaleString()
                  )}
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Table View */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto crm-Leadlist-kanbadn-col-list">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    COMPANY NAME
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    INDUSTRY
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PHONE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MOBILE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WEBSITE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REVENUE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DESCRIPTION
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={6} cols={8} />
              ) : (
                <tbody className="bg-white divide-y divide-gray-200 overflow-x-auto">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.customerId}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {/* Company Name */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2 min-w-[150px]">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(customer.companyName)}
                          </div>
                          <span
                            className="font-semibold truncate max-w-[120px]"
                            title={customer.companyName}
                          >
                            {customer.companyName || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full truncate max-w-[100px] ${getIndustryColor(
                            customer.industry
                          )}`}
                          title={customer.industry}
                        >
                          {customer.industry || "N/A"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 truncate max-w-[100px]"
                        title={customer.phone}
                      >
                        {customer.phone || "N/A"}
                      </td>

                      {/* Mobile */}
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 truncate max-w-[100px]"
                        title={customer.mobile}
                      >
                        {customer.mobile || "N/A"}
                      </td>

                      {/* Website */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {customer.website ? (
                          <a
                            href={
                              customer.website.startsWith("http://") ||
                              customer.website.startsWith("https://")
                                ? customer.website
                                : `https://${customer.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm truncate max-w-[80px] block"
                            title={customer.website}
                          >
                            Visit
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>

                      {/* Revenue */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                        {formatCurrency(customer.revenue)}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[150px]">
                        <span
                          className="truncate block"
                          title={customer.description}
                        >
                          {customer.description || "No description"}
                        </span>
                      </td>

                      {/* Actions - Icons Only with Hover Tooltips */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          {/* Contact Button */}
                          <button
                            onClick={() => handleContact(customer)}
                            className="group relative p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="Manage Contacts"
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
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(customer.customerId)}
                            className="group relative p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Edit Customer"
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {!loading && filteredCustomers.length === 0 && (
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
                No customers found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || industryFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first customer."}
              </p>
              {!searchTerm && industryFilter === "all" && (
                <button
                  onClick={handleCreateCustomer}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Your First Customer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCustomers}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={(newSize) => {
            // update pageSize and reset to page 0
            setPageSize(newSize);
            fetchCustomers(0, searchTerm);
          }}
          itemsName="customers"
          showPageSize={true}
          sticky={true}
        />
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pr-2  border-gray-200">
              <div></div>
              <button
                onClick={handleCloseContactModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
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

            <div className="p-5 pt-0 max-h-[calc(90vh-140px)] overflow-y-auto">
              <ContactByCustomer
                customerId={selectedCustomer.customerId}
                customerName={selectedCustomer.companyName}
                onClose={handleCloseContactModal}
              />
            </div>
          </div>
        </div>
      )}
    </LayoutComponent>
  );
}

export default CustomerList;
