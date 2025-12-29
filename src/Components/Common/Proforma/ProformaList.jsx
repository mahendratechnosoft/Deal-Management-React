import React, { useEffect, useState } from "react";
import { useLayout } from "../../Layout/useLayout";
import Pagination from "../pagination";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ProformaPDF from "./ProformaPDF";
import ProformaInfoModal from "./ProformaInfoModal";
import { hasPermission } from "../../BaseComponet/permissions";
import {
  AlertCard,
  DashboardWrapper,
  MoneyCard,
  ProgressCard,
} from "../../BaseComponet/FinancialDashboardComponents";

// --- Utilities ---

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
    return formatter.format(value);
  } catch (e) {
    return `${code} ${value.toFixed(2)}`;
  }
};

const formatProformaNumber = (number) => {
  const numberString = String(number || 0);
  return `P_INV-${numberString.padStart(6, "0")}`;
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

function ProformaList() {
  const { LayoutComponent, role } = useLayout();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [selectedProformaData, setSelectedProformaData] = useState(null);
  const [adminInformation, setAdminInformation] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedProformaForInfo, setSelectedProformaForInfo] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [proformaTypeFilter, setProformaTypeFilter] = useState("all");

  const [dashboardDateRange, setDashboardDateRange] = useState(
    getIndianFinancialYear()
  );

  useEffect(() => {
    fetchProformaList(0, searchTerm, proformaTypeFilter);
  }, [pageSize, searchTerm, proformaTypeFilter]);

  useEffect(() => {
    if (showDashboard) {
      fetchDashboardSummary();
    }
  }, [showDashboard, dashboardDateRange]);

  const fetchDashboardSummary = async () => {
    setDashboardLoading(true);
    try {
      const response = await axiosInstance.get(
        `getProformaInvoiceSummary?startDate=${dashboardDateRange.startDate}&endDate=${dashboardDateRange.endDate}`
      );
      if (response.data && response.data.body) {
        setDashboardData(response.data.body);
      }
    } catch (error) {
      console.error("Dashboard error", error);
      toast.error("Failed to load statistics");
    } finally {
      setDashboardLoading(false);
    }
  };

  async function fetchProformaList(
    page = 0,
    search = "",
    proformaType = proformaTypeFilter
  ) {
    setListLoading(true);
    try {
      let url = `getAllProformaInvoice/${page}/${pageSize}`;
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search);
      }

      if (proformaType && proformaType !== "all") {
        params.append("proformaType", proformaType);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await axiosInstance.get(url);
      const data = response.data;
      setProformaInvoices(data.ProformaInvoiceList || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);
      setTotalItems(data.totalElements);
    } catch (err) {
      console.error("Error fetching proforma invoices:", err);
      toast.error("Failed to fetch proforma invoices.");
    } finally {
      setListLoading(false);
    }
  }

  const handleCreateProforma = () => {
    if (role === "ROLE_ADMIN") {
      navigate("/Admin/Proforma/Create");
    } else if (role === "ROLE_EMPLOYEE") {
      navigate("/Employee/Proforma/Create");
    } else {
      navigate("/login");
    }
  };
  const handleEdit = (proformaId) => {
    if (role === "ROLE_ADMIN") {
      navigate(`/Admin/Proforma/Edit/${proformaId}`);
    } else if (role === "ROLE_EMPLOYEE") {
      navigate(`/Employee/Proforma/Edit/${proformaId}`);
    } else {
      navigate("/login");
    }
  };

  const handlePageSizeChange = (newSize) => setPageSize(newSize);
  const handlePageChange = (newPage) =>
    fetchProformaList(newPage, searchTerm, proformaTypeFilter);

  const handleOpenPdfPreview = async (proformaInvoiceId) => {
    setIsPdfLoading(true);
    setIsPdfModalOpen(true);
    setSelectedProformaData(null);
    try {
      let adminInformation = null;
      if (role === "ROLE_ADMIN") {
        const adminReponce = await axiosInstance.get(`/admin/getAdminInfo`);
        adminInformation = adminReponce.data;
      } else if (role === "ROLE_EMPLOYEE") {
        const employeeReponce = await axiosInstance.get(
          `/employee/getEmployeeInfo`
        );
        adminInformation = employeeReponce.data.admin;
      }
      setAdminInformation(adminInformation);
      const response = await axiosInstance.get(
        `getProformaInvoiceById/${proformaInvoiceId}`
      );
      if (response.data) setSelectedProformaData(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load proforma data."
      );
      setIsPdfModalOpen(false);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleOpenInfoModal = async (proforma) => {
    setSelectedProformaForInfo(proforma);
    setIsInfoModalOpen(true);
  };

  const handleInfoModalClose = () => {
    setIsInfoModalOpen(false);
    setSelectedProformaForInfo(null);
    fetchProformaList(currentPage, searchTerm);
    fetchDashboardSummary();
  };

  const totalDashboardDocs = dashboardData
    ? dashboardData.paidCount +
      dashboardData.unpaidCount +
      dashboardData.partiallyPaidCount +
      dashboardData.overdueCount
    : 0;

  const renderFilterDropdown = () => (
    <div className="relative">
      <select
        value={proformaTypeFilter}
        onChange={(e) => setProformaTypeFilter(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none pr-10"
      >
        <option value="all">All</option>
        <option value="REIMBURSEMENT">Reimbursement</option>

        {/* Add other proforma types as needed */}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <DashboardWrapper
          isOpen={showDashboard}
          dateRange={dashboardDateRange}
          setDateRange={setDashboardDateRange}
          isLoading={dashboardLoading}
          title="Proforma Financial Overview"
        >
          {dashboardData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <MoneyCard
                  title="Total Invoice Amount"
                  amount={dashboardData.totalInvoiceAmount}
                  iconColorClass="border-indigo-100 text-indigo-600"
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
                <MoneyCard
                  title="Total Paid Amount"
                  amount={dashboardData.totalPaidAmount}
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
                <MoneyCard
                  title="Unpaid Amount Before Due"
                  amount={dashboardData.unpaidAmountBeforeDueDate}
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                />
                <MoneyCard
                  title="Unpaid Amount After Due"
                  amount={dashboardData.unpaidAmountAfterDueDate}
                  iconColorClass="border-red-100 text-red-600"
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <ProgressCard
                  label="Paid"
                  count={dashboardData.paidCount}
                  total={totalDashboardDocs}
                  barColorClass="bg-emerald-500"
                />
                <ProgressCard
                  label="Unpaid"
                  count={dashboardData.unpaidCount}
                  total={totalDashboardDocs}
                  barColorClass="bg-blue-500"
                />
                <ProgressCard
                  label="Partial"
                  count={dashboardData.partiallyPaidCount}
                  total={totalDashboardDocs}
                  barColorClass="bg-yellow-500"
                />
                <AlertCard label="Overdue" count={dashboardData.overdueCount} />
              </div>
            </>
          )}
        </DashboardWrapper>

        {/* --- 2. Title & Search Header --- */}
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Proforma Invoices
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Manage and track all your proforma invoices in one place
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
              {/* Search */}

              <div className="w-full sm:w-48">{renderFilterDropdown()}</div>

              <div className="relative flex-1 sm:max-w-64 w-full">
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
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
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

              {/* Create Button */}
              {hasPermission("proformaInvoice", "Create") && (
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
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
                  Create Proforma
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- 3. Table Section --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 table-fixed w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proforma #
                </th>
                <th className="w-[31%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
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
                : proformaInvoices.map((proforma) => (
                    <tr
                      key={proforma.proformaInvoiceId}
                      className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                      onClick={() => handleOpenInfoModal(proforma)}
                    >
                      <td className="px-4 py-1 truncate text-sm text-gray-900 font-bold relative">
                        {proforma.formatedProformaInvoiceNumber}
                        <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(proforma.proformaInvoiceId);
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
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
                      <td className="px-4 py-4 truncate text-sm text-gray-900">
                        {formatCurrency(
                          proforma.totalAmount,
                          proforma.currencyType
                        )}
                      </td>
                      <td className="px-4 py-4 truncate text-sm text-gray-900">
                        {formatCurrency(
                          proforma.paidAmount,
                          proforma.currencyType
                        )}
                      </td>
                      <td className="px-4 py-4 truncate text-sm text-gray-900">
                        {proforma.proformaInvoiceDate}
                      </td>
                      <td className="px-4 py-4 truncate text-sm text-gray-900">
                        {proforma.dueDate}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <span
                          className={`inline-block w-24 truncate px-3 py-1 rounded text-xs text-center font-semibold uppercase tracking-wide ${
                            proforma.status === "Paid"
                              ? "bg-green-100 text-green-600"
                              : proforma.status === "Partially Paid"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {proforma.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* Empty State */}
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
          itemsName="proforma invoices"
        />
      </div>

      {/* PDF Modal */}
      {isPdfModalOpen && (
        <div className="proposal-pdf-modal-backdrop">
          <div className="proposal-pdf-modal-content">
            <div className="proposal-pdf-modal-header">
              <h3>
                {selectedProformaData
                  ? selectedProformaData.proformaInvoiceInfo
                      .formatedProformaInvoiceNumber
                  : "Loading..."}
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                {!isPdfLoading && selectedProformaData && (
                  <PDFDownloadLink
                    document={
                      <ProformaPDF
                        invoiceData={selectedProformaData}
                        adminInformation={adminInformation}
                      />
                    }
                    fileName={`${selectedProformaData.proformaInvoiceInfo.formatedProformaInvoiceNumber}.pdf`}
                    className="download-button-icon-wrapper"
                    style={{
                      padding: "0.25rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      background: "#f9f9f9",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {({ loading }) =>
                      loading ? (
                        "..."
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          style={{ width: "20px", height: "16px" }}
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
              {isPdfLoading || !selectedProformaData ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  Loading PDF...
                </div>
              ) : (
                <PDFViewer width="100%" height="100%">
                  <ProformaPDF
                    invoiceData={selectedProformaData}
                    adminInformation={adminInformation}
                  />
                </PDFViewer>
              )}
            </div>
          </div>
        </div>
      )}

      {isInfoModalOpen && (
        <ProformaInfoModal
          isOpen={isInfoModalOpen}
          onClose={handleInfoModalClose}
          proforma={selectedProformaForInfo}
          onOpenPdf={(proformaInvoiceId) => {
            handleInfoModalClose();
            handleOpenPdfPreview(proformaInvoiceId);
          }}
        />
      )}
    </LayoutComponent>
  );
}

export default ProformaList;
