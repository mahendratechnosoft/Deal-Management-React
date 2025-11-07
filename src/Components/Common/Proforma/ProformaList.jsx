import React, { useEffect, useState } from "react";
import { useLayout } from "../../Layout/useLayout";
import Pagination from "../pagination";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// This currency formatter utility is reused
const formatCurrency = (amount, currencyCode) => {
  const value = Number(amount) || 0;
  const code = currencyCode || "INR";

  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const parts = formatter.formatToParts(value);
    const symbol = parts.find((part) => part.type === "currency")?.value || "";
    const number = parts
      .filter((part) => part.type !== "currency")
      .map((part) => part.value)
      .join("");

    return `${symbol} ${number}`;
  } catch (e) {
    return `${code} ${value.toFixed(2)}`;
  }
};

const ProformaListSkeleton = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );
};

function ProformaList() {
  const { LayoutComponent, role } = useLayout();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [proformaInvoices, setProformaInvoices] = useState([]); // Renamed from proposals
  const [listLoading, setListLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Kept your logic, though API sample didn't show totalItems
  const [pageSize, setPageSize] = useState(10);

  // Removed PDF-related state

  useEffect(() => {
    fetchProformaList(0, searchTerm); // Call the renamed fetch function
  }, [pageSize, searchTerm]);

  async function fetchProformaList(page = 0, search = "") {
    setListLoading(true);

    try {
      // Updated API endpoint
      let url = `getAllProformaInvoice/${page}/${pageSize}`;
      if (search.trim()) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await axiosInstance.get(url);
      const data = response.data;

      // Updated to match new API response structure
      setProformaInvoices(data.ProformaInvoiceList || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page); // Use API's current page if available
      setTotalItems(data.totalItems || 100); // Or use totalItems from API if it exists, else fallback to old logic

      // console.log("Fetched proforma invoices:", data);
    } catch (err) {
      console.error("Error fetching proforma invoices:", err);
      toast.error("Failed to fetch proforma invoices. Please try again.");
    } finally {
      setListLoading(false);
    }
  }

  // Renamed and updated navigation
  const handleCreateProforma = () => {
    navigate("/Proforma/Create");
  };

  const handleEdit = (proformaId) => {
    navigate(`/Proforma/Edit/${proformaId}`);
  };

  const handlePreview = (proformaId) => {
    navigate(`/Proforma/Preview/${proformaId}`);
  };

  // Removed handleOpenPdfPreview

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
  };

  const handlePageChange = (newPage) => {
    fetchProformaList(newPage, searchTerm); // Call the renamed fetch function
  };

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  {/* Updated Text */}
                  <h1 className="text-2xl font-bold text-gray-900">
                    Proforma Invoices
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Manage and track all your proforma invoices in one place
                  </p>
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
                  // Updated Text
                  placeholder="Search proforma invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                />
              </div>

              {/* Create Button */}
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                // Updated Handler
                onClick={handleCreateProforma}
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
                {/* Updated Text */}
                Create Proforma
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <div className="relative">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  {/* Updated Table Headers */}
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proforma #
                    </th>
                    {/* "Subject" column removed */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {listLoading
                    ? Array.from({ length: pageSize }).map((_, index) => (
                        <ProformaListSkeleton key={index} />
                      ))
                    : proformaInvoices.map((proforma) => (
                        // Updated key
                        <tr key={proforma.proformaInvoiceId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                            {/* Updated field, with fallback for null */}
                            {proforma.porformaInvoiceNumber || "N/A"}
                          </td>
                          {/* "Subject" <td> removed */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {proforma.companyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(
                              proforma.totalAmmount,
                              proforma.currencyType
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {/* Updated field */}
                            {proforma.invoiceDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {proforma.dueDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {proforma.status}
                          </td>
                          <td className="px-6 py-1 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              <button
                                title="Edit"
                                // Updated handler and ID
                                onClick={() =>
                                  handleEdit(proforma.proformaInvoiceId)
                                }
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
                              </button>

                              <button
                                title="Preview"
                                // Updated handler and ID
                                onClick={() =>
                                  handlePreview(proforma.proformaInvoiceId)
                                }
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
                              {/* PDF Button Removed */}
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Updated empty state */}
          {proformaInvoices.length === 0 && !listLoading && (
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
                No proforma invoices found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first proforma invoice."}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateProforma}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Your First Proforma
                </button>
              )}
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          // Updated itemsName
          itemsName="proforma invoices"
        />
      </div>

      {/* PDF Modal Removed */}
    </LayoutComponent>
  );
}

export default ProformaList;
