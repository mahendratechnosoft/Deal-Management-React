import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import axiosInstance from "../../BaseComponet/axiosInstance";
import ProposalPDF from "./ProposalPDF";
import ProposalInvoiceDisplay from "./ProposalInvoiceDisplay";

// Format function for proposal
const formatProposalNumber = (number) => {
  const numberString = String(number || 0);
  return `PROP-${numberString.padStart(6, "0")}`;
};

function PublicProposalPreview() {
  const { proposalId } = useParams();

  const [loading, setLoading] = useState(true);
  const [proposalData, setProposalData] = useState(null);
  const [adminInformation, setAdminInformation] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!proposalId) {
        setError("Invalid proposal ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Use public API endpoint
        const response = await axiosInstance.get(
          `/public/getProposalById/${proposalId}`
        );

        const data = response.data;

        console.log("API Response structure:", data);

        if (!data || data.success === false) {
          throw new Error(data?.message || "Proposal not found");
        }

        // Check the API response structure
        // It might be direct data or nested
        let proposalData = data;
        let adminData = null;

        if (data.proposal && data.admin) {
          // Nested structure
          proposalData = data.proposal;
          adminData = data.admin;
        } else if (data.proposalInfo) {
          // Direct structure with admin info possibly inside
          proposalData = data;
          adminData = data.adminInfo || null;
        }

        if (!proposalData) {
          throw new Error("Proposal data not found in response");
        }

        // Ensure tax fields are present
        if (
          proposalData.proposalInfo &&
          proposalData.proposalInfo.taxPercentage === undefined &&
          proposalData.proposalInfo.taxRate === undefined
        ) {
          proposalData.proposalInfo.taxPercentage = 0;
        }

        // Get formatted proposal number
        const formattedNumber =
          proposalData.proposalInfo?.formatedProposalNumber ||
          formatProposalNumber(proposalData.proposalInfo?.proposalNumber) ||
          formatProposalNumber("000000");

        // Reconstruct proposal data for display
        const formattedProposalData = {
          ...proposalData,
          proposalInfo: {
            ...proposalData.proposalInfo,
            formatedDisplayNumber: formattedNumber,
            formatedProposalNumber: formattedNumber,
            proposalNumber:
              proposalData.proposalInfo?.proposalNumber || "000000",
          },
        };

        console.log("Formatted proposal data:", formattedProposalData);

        setProposalData(formattedProposalData);

        // Set admin information
        if (adminData) {
          setAdminInformation(adminData);
        } else if (proposalData.proposalInfo?.admin) {
          setAdminInformation(proposalData.proposalInfo.admin);
        } else {
          // Fallback admin info
          setAdminInformation({
            companyName: proposalData.proposalInfo?.companyName || "Company",
            address:
              proposalData.proposalInfo?.address || "Address not available",
            phone: proposalData.proposalInfo?.phone || "",
            email: proposalData.proposalInfo?.email || "",
            logo: proposalData.proposalInfo?.logo || null,
            gstNumber: proposalData.proposalInfo?.gstNumber || "",
            panNumber: proposalData.proposalInfo?.panNumber || "",
          });
        }
      } catch (error) {
        console.error("Error fetching proposal data:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load proposal"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proposalId]);

  // Prepare Data for PDF Document
  const pdfData = useMemo(() => {
    if (!proposalData || !adminInformation) return null;
    return {
      ...proposalData,
      adminInformation: adminInformation,
    };
  }, [proposalData, adminInformation]);

  // Get display values
  const getProposalInfo = () => {
    return proposalData?.proposalInfo || {};
  };

  const getProposalNumber = () => {
    const info = getProposalInfo();
    return (
      info.formatedDisplayNumber ||
      info.formatedProposalNumber ||
      formatProposalNumber(info.proposalNumber)
    );
  };

  const getDocumentType = () => {
    return "Proposal";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading proposal...</p>
      </div>
    );
  }

  if (error && !proposalData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Unable to Load Proposal
        </h2>
        <p className="text-gray-600 text-center max-w-md mb-4">{error}</p>
        <p className="text-gray-500 text-sm text-center max-w-md">
          This link may be invalid or the proposal may have been removed.
        </p>
        <div className="mt-6 text-sm text-gray-500">
          <p className="font-mono bg-gray-100 p-2 rounded">
            Proposal ID: {proposalId}
          </p>
        </div>
      </div>
    );
  }

  const proposalNumber = getProposalNumber();
  const documentType = getDocumentType();

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      {/* Public View Banner */}
      <div className="max-w-7xl mx-auto mb-4 flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div>
          {/* <p className="text-sm text-blue-800 font-medium">
            🔗 Public View - Anyone with this link can view
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-blue-600">Document Type:</span>
            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
              PROPOSAL
            </span>
            <span className="text-xs text-blue-600 ml-2">
              Number: {proposalNumber}
            </span>
          </div> */}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const currentUrl = window.location.href;
              navigator.clipboard.writeText(currentUrl);
              alert("Link copied to clipboard!");
            }}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
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
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Link
          </button>

          <button
            title="View PDF"
            disabled={!proposalData || !adminInformation}
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded bg-white text-sm font-medium text-red-600 hover:text-red-900"
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
            View PDF
          </button>
        </div>
      </div>

      {/* Main Proposal Card */}
      <div className="max-w-7xl mx-auto">
        {proposalData ? (
          <ProposalInvoiceDisplay
            proposal={proposalData}
            adminInformation={adminInformation}
            headerActions={null} // No actions needed in public view
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            Proposal not found.
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {isPdfModalOpen && proposalData && adminInformation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
                  {proposalNumber}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{documentType}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    Public View
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PDFDownloadLink
                  document={<ProposalPDF data={pdfData} />}
                  fileName={`${proposalNumber}.pdf`}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors no-underline text-sm"
                >
                  {({ loading }) =>
                    loading ? (
                      <span>Preparing...</span>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                        Download
                      </>
                    )
                  }
                </PDFDownloadLink>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading PDF...</span>
                </div>
              ) : (
                <PDFViewer width="100%" height="100%" className="rounded-b-xl">
                  <ProposalPDF data={pdfData} />
                </PDFViewer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicProposalPreview;
