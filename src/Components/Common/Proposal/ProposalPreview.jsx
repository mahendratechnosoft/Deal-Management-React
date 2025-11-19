import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ProposalPDF from "./ProposalPDF";
import ProposalInvoiceDisplay from "./ProposalInvoiceDisplay";
import { formatProposalNumber } from "../../BaseComponet/UtilFunctions"; // Importing helper for the PDF filename
import "./ProposalList.css";

const IconChevronLeft = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const IconAlertCircle = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const SkeletonBlock = ({ className }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

function PreviewBodySkeleton() {
  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start p-6 border-b border-gray-200">
        <div>
          <SkeletonBlock className="h-12 w-32 mb-4" />
          <SkeletonBlock className="h-7 w-48 mb-2" />
          <SkeletonBlock className="h-4 w-64" />
        </div>
      </div>
      <div className="p-6 md:p-8">
        <SkeletonBlock className="h-64 w-full" />
      </div>
    </div>
  );
}

function ProposalPreview() {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const { role } = useLayout();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [adminInformation, setAdminInformation] = useState(null);

  useEffect(() => {
    fetchProposalData();
    fetchAdminInformation();
  }, [proposalId]);

  const fetchProposalData = async () => {
    if (!proposalId) {
      toast.error("No proposal ID found.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.get(`getProposalById/${proposalId}`);
      if (
        response.data.proposalInfo.taxPercentage === undefined &&
        response.data.proposalInfo.taxRate === undefined
      ) {
        response.data.proposalInfo.taxPercentage = 0;
      }
      setProposal(response.data);
    } catch (error) {
      console.error("Failed to fetch proposal:", error);
      toast.error(
        error.response?.data?.message || "Failed to load proposal data."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminInformation = async () => {
    try {
      let adminInfo = null;
      if (role === "ROLE_ADMIN") {
        const adminResponse = await axiosInstance.get(`/admin/getAdminInfo`);
        adminInfo = adminResponse.data;
      } else if (role === "ROLE_EMPLOYEE") {
        const employeeResponse = await axiosInstance.get(
          `/employee/getEmployeeInfo`
        );
        adminInfo = employeeResponse.data.admin;
      }
      setAdminInformation(adminInfo);
    } catch (error) {
      console.error("Failed to fetch admin information:", error);
    }
  };

  // Prepare Data for PDF Document
  const pdfData = useMemo(() => {
    if (!proposal || !adminInformation) return null;
    return {
      ...proposal,
      adminInformation: adminInformation,
    };
  }, [proposal, adminInformation]);

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-gray-600"
          >
            <IconChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <PreviewBodySkeleton />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex flex-col justify-center items-center h-[90vh]">
        <IconAlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <span className="text-lg text-red-700">
          Failed to load proposal data.
        </span>
        <button
          onClick={() =>
            navigate(role === "ROLE_ADMIN" ? "/Proposal" : "/Employee/Proposal")
          }
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Proposals
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-4">
        <button
          onClick={() =>
            navigate(role === "ROLE_ADMIN" ? "/Proposal" : "/Employee/Proposal")
          }
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <IconChevronLeft className="w-4 h-4" />
          Back to Proposals
        </button>
      </div>

      {/* Reusable Invoice Display Component */}
      <div className="max-w-7xl mx-auto">
        <ProposalInvoiceDisplay
          proposal={proposal}
          adminInformation={adminInformation}
          headerActions={
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded bg-white text-sm font-medium text-red-600 hover:text-red-900"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              PDF
            </button>
          }
        />
      </div>

      {/* PDF Modal Logic */}
      {isPdfModalOpen && proposal && (
        <div className="proposal-pdf-modal-backdrop">
          <div className="proposal-pdf-modal-content">
            <div className="proposal-pdf-modal-header">
              <h3>
                {formatProposalNumber(proposal.proposalInfo.proposalNumber)}
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <PDFDownloadLink
                  document={<ProposalPDF data={pdfData} />}
                  fileName={`Proposal-${proposal.proposalInfo.proposalNumber}-${proposal.proposalInfo.companyName}.pdf`}
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
              <PDFViewer width="100%" height="100%">
                <ProposalPDF data={pdfData} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProposalPreview;
