import React, { useEffect, useState } from "react";
import { useLayout } from "../../Layout/useLayout";
import Pagination from "../pagination";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import {
  formatCurrency,
  formatInvoiceNumber,
} from "../../BaseComponet/UtilFunctions";
import InvoiceInfoModal from "./InoviceInfoModal";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ProformaPDF from "../Proforma/ProformaPDF";
import {
  DashboardWrapper,
  MoneyCard,
} from "../../BaseComponet/FinancialDashboardComponents";

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
        <div className="h-5 w-5 bg-gray-200 rounded"></div>
      </td>
    </tr>
  );
};

const getIndianFinancialYear = () => {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  let startYear = year;
  let endYear = year + 1;

  if (month < 3) {
    startYear = year - 1;
    endYear = year;
  }

  return {
    startDate: `${startYear}-04-01`,
    endDate: `${endYear}-03-31`,
  };
};

function InvoiceList() {
  const { LayoutComponent, role } = useLayout();

  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInvoiceForInfo, setSelectedInvoiceForInfo] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [adminInformation, setAdminInformation] = useState(null);
  const navigate = useNavigate();
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardDateRange, setDashboardDateRange] = useState(
    getIndianFinancialYear()
  );

  useEffect(() => {
    fetchInvoiceList(0, searchTerm);
  }, [pageSize, searchTerm]);

  useEffect(() => {
    if (showDashboard) {
      fetchDashboardSummary();
    }
  }, [showDashboard, dashboardDateRange]);

  const fetchDashboardSummary = async () => {
    setDashboardLoading(true);
    try {
      const response = await axiosInstance.get(
        `getInvoiceTaxSummary?startDate=${dashboardDateRange.startDate}&endDate=${dashboardDateRange.endDate}`
      );
      if (response.data && response.data.body) {
        setDashboardData(response.data.body);
      }
    } catch (error) {
      console.error("Dashboard error", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  async function fetchInvoiceList(page = 0, search = "") {
    setListLoading(true);

    try {
      let url = `getAllInvoice/${page}/${pageSize}`;
      if (search.trim()) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await axiosInstance.get(url);
      const data = response.data;

      setInvoices(data.invoiceList || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);
      setTotalItems(data.totalElements);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      toast.error("Failed to fetch invoices. Please try again.");
    } finally {
      setListLoading(false);
    }
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
  };

  const handlePageChange = (newPage) => {
    fetchInvoiceList(newPage, searchTerm);
  };

  const handleOpenInfoModal = async (proforma) => {
    setSelectedInvoiceForInfo(proforma);
    setIsInfoModalOpen(true);
  };

  const handleCreateProforma = () => {
    // Assuming you have a create route for invoices or re-using proforma logic
    navigate("/Invoice/Create");
  };

  const handleOpenPdfPreview = async (proformaInvoiceId) => {
    setIsPdfLoading(true);
    setIsPdfModalOpen(true);
    setInvoiceData(null);

    try {
      let adminInformation = null;
      if (role === "ROLE_ADMIN") {
        const adminReponce = await axiosInstance.get(`/admin/getAdminInfo`);
        adminInformation = adminReponce.data;
      } else if (role === "ROLE_EMPLOYEE") {
        const employeeReponce = await axiosInstance.get(
          `/employee/getEmployeeInfo`
        );

        const employeeReponceData = employeeReponce.data;
        adminInformation = employeeReponceData.admin;
      }
      setAdminInformation(adminInformation);
      const response = await axiosInstance.get(
        `getProformaInvoiceById/${proformaInvoiceId}`
      );

      if (response.data) {
        setInvoiceData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch proforma data for PDF:", error);
      toast.error(
        error.response?.data?.message || "Failed to load proforma data."
      );
      setIsPdfModalOpen(false);
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* --- 1. Dashboard Section --- */}
        <DashboardWrapper
          isOpen={showDashboard}
          dateRange={dashboardDateRange}
          setDateRange={setDashboardDateRange}
          isLoading={dashboardLoading}
          title="Tax Invoice Summary"
        >
          {dashboardData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Total Invoice Value (Green/Emerald - The big number) */}
              <MoneyCard
                title="Total With Tax"
                amount={dashboardData.total_with_tax}
                iconColorClass="border-emerald-100 text-emerald-600"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />

              {/* 2. Taxable Amount (Blue - The base) */}
              <MoneyCard
                title="Total Without Tax"
                amount={dashboardData.total_without_tax}
                iconColorClass="border-blue-100 text-blue-600"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                }
              />

              {/* 3. Total Tax (Red/Rose - The Tax Component) */}
              <MoneyCard
                title="Total Tax"
                amount={dashboardData.total_tax_amount}
                iconColorClass="border-red-100 text-red-600"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                    />
                  </svg>
                }
              />
            </div>
          )}
        </DashboardWrapper>

        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Tax Invoices
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Manage and track all your Tax invoices in one place
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
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                />
              </div>

              {/* Toggle Statistics Button */}
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  showDashboard
                    ? "bg-gray-100 text-gray-700 border-gray-300"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {/* {showDashboard ? "Hide Stats" : "Statistics"} */}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 table-fixed w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="w-[30%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="w-[18%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {listLoading
                ? Array.from({ length: pageSize }).map((_, index) => (
                    <ProformaListSkeleton key={index} />
                  ))
                : invoices.map((proforma) => (
                    <tr
                      key={proforma.proformaInvoiceId}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
                      onClick={() => handleOpenInfoModal(proforma)}
                    >
                      <td
                        className="px-4 py-1 truncate text-sm text-gray-900 font-bold relative"
                        title={formatInvoiceNumber(proforma.invoiceNumber)}
                      >
                        {formatInvoiceNumber(proforma.invoiceNumber)}
                        <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Preview Button */}
                          <button
                            title="Preview"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenInfoModal(proforma);
                            }}
                            className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 text-xs font-normal"
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
                            Preview
                          </button>

                          {/* PDF Button */}
                          <button
                            title="View PDF"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPdfPreview(proforma.proformaInvoiceId);
                            }}
                            className="text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-1 text-xs font-normal"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              ></path>
                            </svg>
                            PDF
                          </button>
                        </div>
                      </td>
                      <td
                        className="px-4 py-4 truncate text-sm text-gray-900"
                        title={proforma.companyName}
                      >
                        {proforma.companyName}
                      </td>
                      <td
                        className="px-4 py-4 truncate text-sm text-gray-900"
                        title={proforma.email}
                      >
                        {proforma.email}
                      </td>
                      <td
                        className="px-4 py-4 truncate text-sm text-gray-900"
                        title={formatCurrency(
                          proforma.totalAmount,
                          proforma.currencyType
                        )}
                      >
                        {formatCurrency(
                          proforma.totalAmount,
                          proforma.currencyType
                        )}
                      </td>
                      <td
                        className="px-4 py-4 truncate text-sm text-gray-900"
                        title={proforma.proformaInvoiceDate}
                      >
                        {proforma.invoiceDate}
                      </td>

                      <td
                        className="px-4 py-4 text-sm text-gray-900"
                        title={proforma.status}
                      >
                        <span
                          className={`inline-block w-24 truncate px-3 py-1 rounded text-xs text-center font-semibold uppercase tracking-wide ${
                            proforma.status === "Paid"
                              ? "bg-green-100 text-green-600"
                              : proforma.status === "Partially Paid"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                          }`}
                          title={proforma.status?.toUpperCase()}
                        >
                          {proforma.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* Updated empty state */}
          {invoices.length === 0 && !listLoading && (
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
                No invoices found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "At Least one invoice need to be paid."}
              </p>
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
          itemsName=" Invoices"
        />
      </div>

      {isInfoModalOpen && (
        <InvoiceInfoModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          proforma={selectedInvoiceForInfo}
          onOpenPdf={(proformaInvoiceId) => {
            setIsInfoModalOpen(false);
            handleOpenPdfPreview(proformaInvoiceId);
          }}
        />
      )}

      {isPdfModalOpen && (
        <div className="proposal-pdf-modal-backdrop">
          <div className="proposal-pdf-modal-content">
            <div className="proposal-pdf-modal-header">
              <h3>
                {invoiceData
                  ? formatInvoiceNumber(
                      invoiceData.proformaInvoiceInfo.proformaInvoiceNumber
                    )
                  : "Loading..."}
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                {/* --- Download Button --- */}
                {!isPdfLoading && invoiceData && (
                  <PDFDownloadLink
                    document={
                      <ProformaPDF
                        invoiceData={invoiceData}
                        adminInformation={adminInformation}
                        isInvoice={true}
                      />
                    }
                    fileName={
                      `${formatInvoiceNumber(
                        invoiceData.proformaInvoiceInfo.proformaInvoiceNumber
                      )}-${invoiceData.proformaInvoiceInfo.companyName}.pdf` ||
                      "proforma.pdf"
                    }
                    title="Download PDF"
                    className="download-button-icon-wrapper"
                    style={{
                      padding: "0.25rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      background: "#f9f9f9",
                      cursor: "pointer",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >
                    {({ loading }) =>
                      loading ? (
                        <span style={{ padding: "0 4px", color: "#333" }}>
                          ...
                        </span>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          style={{ width: "20px", height: "16px" }}
                          className="proposal-download-button-icon"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      )
                    }
                  </PDFDownloadLink>
                )}

                {/* --- Close Button --- */}
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    background: "#f9f9f9",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="proposal-pdf-viewer-container">
              {isPdfLoading || !invoiceData ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  Loading PDF...
                </div>
              ) : (
                <PDFViewer width="100%" height="100%">
                  <ProformaPDF
                    invoiceData={invoiceData}
                    adminInformation={adminInformation}
                    isInvoice={true}
                  />
                </PDFViewer>
              )}
            </div>
          </div>
        </div>
      )}
    </LayoutComponent>
  );
}

export default InvoiceList;
