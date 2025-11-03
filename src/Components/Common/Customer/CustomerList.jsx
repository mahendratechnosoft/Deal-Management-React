import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";

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

  // Fetch customers with search functionality
  const fetchCustomers = async (page = 0, search = "") => {
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
      setTotalCustomers(data.totalCustomers || data.customerList?.length || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when pageSize changes
  useEffect(() => {
    fetchCustomers(0, searchTerm);
  }, [pageSize]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCustomers(0, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load data on component mount
  useEffect(() => {
    fetchCustomers(0);
  }, [navigate]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchCustomers(newPage, searchTerm);
    }
  };

  const handleCreateCustomer = () => {
    // For Admin users - navigate to Admin create customer
    if (role === "ROLE_ADMIN") {
      navigate("/Admin/CreateCustomer");
    }
    // For Employee users - navigate to common create customer
    else if (role === "ROLE_EMPLOYEE") {
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

  const handleRefresh = () => {
    fetchCustomers(currentPage, searchTerm);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await axiosInstance.delete(`deleteCustomer/${customerId}`);
        toast.success("Customer deleted successfully!");
        fetchCustomers(currentPage, searchTerm); // Refresh the list
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

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Get unique industries for filter
  const industries = [
    ...new Set(customers.map((customer) => customer.industry).filter(Boolean)),
  ];

  // Filter customers based on industry
  const filteredCustomers = customers.filter((customer) => {
    const matchesIndustry =
      industryFilter === "all" ||
      customer.industry?.toLowerCase() === industryFilter.toLowerCase();

    return matchesIndustry;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
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
                    {industries.map((industry) => (
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
        <div className="mb-4">
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
                  {totalCustomers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table header */}
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
                    BILLING CITY
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BILLING STATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BILLING COUNTRY
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DESCRIPTION
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              {/* Table body with horizontal overflow */}
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
                        {customer.industry || "Unknown"}
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
                          href={customer.website}
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

                    {/* Billing City */}
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 truncate max-w-[100px]"
                      title={customer.billingCity}
                    >
                      {customer.billingCity || "N/A"}
                    </td>

                    {/* Billing State */}
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 truncate max-w-[100px]"
                      title={customer.billingState}
                    >
                      {customer.billingState || "N/A"}
                    </td>

                    {/* Billing Country */}
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 truncate max-w-[100px]"
                      title={customer.billingCountry}
                    >
                      {customer.billingCountry || "N/A"}
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

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(customer.customerId)}
                          className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
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
                        <button
                          onClick={() => handleDelete(customer.customerId)}
                          className="text-red-600 hover:text-red-900 font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
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
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
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
        <div
          className="bg-white rounded-lg border border-gray-200 shadow-xs p-3 mt-4 sticky bottom-0"
          style={{ zIndex: "39" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4 text-xs">
              <div className="text-gray-600">
                {totalPages > 1
                  ? `Page ${currentPage + 1} of ${totalPages}`
                  : `${totalCustomers} customers`}
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
      </div>
    </LayoutComponent>
  );
}

export default CustomerList;
