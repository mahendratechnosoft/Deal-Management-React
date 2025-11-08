import React, { useEffect, useState } from "react";
import { useLayout } from "../../Layout/useLayout";
import Pagination from "../pagination";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ProposalPDF from "./ProposalPDF";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import "./ProposalList.css";
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

const formatProposalNumber = (number) => {
  const numberString = String(number || 0);
  return `PROP-${numberString.padStart(6, "0")}`;
};

function ProposalList() {
  const { LayoutComponent, role } = useLayout();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [proposals, setProposals] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [selectedProposalData, setSelectedProposalData] = useState(null);

  useEffect(() => {
    fetchProposalList(0, searchTerm);
  }, [pageSize, searchTerm]);

  async function fetchProposalList(page = 0, search = "") {
    setListLoading(true);

    try {
      let url = `getAllProposal/${page}/${pageSize}`;
      if (search.trim()) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await axiosInstance.get(url);
      const data = response.data;
      setProposals(data.proposalList || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
      setTotalItems(100 || 0);

      // console.log("Fetched proposals:", data);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      toast.error("Failed to fetch proposals. Please try again.");
    } finally {
      setListLoading(false);
    }
  }

  const handleCreateProposal = () => {
    navigate("/Proposal/Create");
  };

  const handleEdit = (proposalId) => {
    navigate(`/Proposal/Edit/${proposalId}`);
  };

  const handlePreview = (proposalId) => {
    navigate(`/Proposal/Preview/${proposalId}`);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
  };

  const handlePageChange = (newPage) => {
    fetchProposalList(newPage, searchTerm);
  };

  const handleOpenPdfPreview = async (proposalId) => {
    setIsPdfLoading(true);
    setIsPdfModalOpen(true);
    setSelectedProposalData(null);

    try {
      let adminInformation = null;
      const response = await axiosInstance.get(`getProposalById/${proposalId}`);
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
      const proposalData = response.data;
      const proposalDataToSend = {
        ...proposalData,
        adminInformation: adminInformation || null,
      };
      setSelectedProposalData(proposalDataToSend);
    } catch (error) {
      console.error("Failed to fetch proposal data for PDF:", error);
      toast.error(
        error.response?.data?.message || "Failed to load proposal data."
      );
      setIsPdfModalOpen(false);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Proposal</h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Manage and track all your proposals in one place
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
                  placeholder="Search proposals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                />
              </div>

              {/* Create Button */}
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                onClick={handleCreateProposal}
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
                Create Proposal
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <div className="relative">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proposal #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
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
                      Valid Till
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
                    ? [...Array(pageSize)].map((_, index) => (
                        <SkeletonRow key={index} />
                      ))
                    : proposals.map((proposal) => (
                        <tr key={proposal.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                            {formatProposalNumber(proposal.proposalNumber)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {proposal.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {proposal.companyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(
                              proposal.totalAmmount,
                              proposal.currencyType
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {proposal.proposalDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {proposal.dueDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {proposal.status}
                          </td>
                          <td className="px-6 py-1 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              <button
                                title="Edit"
                                onClick={() => handleEdit(proposal.proposalId)}
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
                                onClick={() =>
                                  handlePreview(proposal.proposalId)
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
                              <button
                                title="View PDF"
                                onClick={() =>
                                  handleOpenPdfPreview(proposal.proposalId)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                <svg
                                  className="w-4 h-4"
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
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
          {proposals.length === 0 && !listLoading && (
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
                No proposals found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first employee."}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateProposal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Your First Proposal
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
          itemsName="proposals"
        />
      </div>

      {isPdfModalOpen && (
        <div className="proposal-pdf-modal-backdrop">
          <div className="proposal-pdf-modal-content">
            <div className="proposal-pdf-modal-header">
              <h3>
                {selectedProposalData
                  ? formatProposalNumber(
                      selectedProposalData.proposalInfo.proposalNumber
                    )
                  : "Loading..."}
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                {/* --- Download Button --- */}
                {!isPdfLoading && selectedProposalData && (
                  <PDFDownloadLink
                    document={<ProposalPDF data={selectedProposalData} />}
                    fileName={
                      `Proposal-${selectedProposalData.proposalInfo.proposalNumber}-${selectedProposalData.proposalInfo.companyName}.pdf` ||
                      "proposal.pdf"
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
              {isPdfLoading || !selectedProposalData ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  Loading PDF...
                </div>
              ) : (
                <PDFViewer width="100%" height="100%">
                  <ProposalPDF data={selectedProposalData} />
                </PDFViewer>
              )}
            </div>
          </div>
        </div>
      )}
    </LayoutComponent>
  );
}

export default ProposalList;
