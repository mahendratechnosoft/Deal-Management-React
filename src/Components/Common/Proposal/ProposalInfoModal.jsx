import React, { useState, useEffect } from "react";
import "../Proforma/ProformaInfoModal.css";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import ProposalInvoiceDisplay from "./ProposalInvoiceDisplay";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import SendProposalEmailModal from "../Email/SendProposalEmailModal";
import SalesReminderList from "../Reminder/SalesReminderList";

const ProposalTabContent = ({ loading, proposalData, adminInformation }) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading Proposal Preview...
      </div>
    );
  }

  if (!proposalData) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load proposal.
      </div>
    );
  }

  return (
    <div
      className="p-4 md:p-10 bg-gray-100 overflow-y-auto"
      style={{ maxHeight: "calc(80vh - 120px)" }}
    >
      <ProposalInvoiceDisplay
        proposal={proposalData}
        adminInformation={adminInformation}
      />
    </div>
  );
};

// Create a separate tab component for Reminders
const RemindersTabContent = ({ proposalId }) => {
  return (
    <div
      className="p-4 bg-gray-100 overflow-y-auto"
      style={{ maxHeight: "calc(80vh - 120px)" }}
    >
      <SalesReminderList
        module="PROPOSAL"
        referenceId={proposalId}
      />
    </div>
  );
};


const ProposalInfoModal = ({ isOpen, onClose, proposal, onOpenPdf }) => {
  const [activeTab, setActiveTab] = useState("proposal");
  const [proposalData, setProposalData] = useState(null);
  const [adminInformation, setAdminInformation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useLayout();
  const navigate = useNavigate();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!isOpen || !proposal) {
    return null;
  }

  useEffect(() => {
    // Guard clause if ID is missing
    if (!proposal.proposalId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Admin/Company Info
        let adminInfo = null;
        if (role === "ROLE_ADMIN") {
          const adminRes = await axiosInstance.get(`/admin/getAdminInfo`);
          adminInfo = adminRes.data;
        } else if (role === "ROLE_EMPLOYEE") {
          const empRes = await axiosInstance.get(`/employee/getEmployeeInfo`);
          adminInfo = empRes.data.admin;
        }
        setAdminInformation(adminInfo);

        // 2. Fetch Proposal Data
        const response = await axiosInstance.get(
          `getProposalById/${proposal.proposalId}`
        );

        if (response.data) {
          // Legacy check for tax fields if necessary
          if (
            response.data.proposalInfo.taxPercentage === undefined &&
            response.data.proposalInfo.taxRate === undefined
          ) {
            response.data.proposalInfo.taxPercentage = 0;
          }
          setProposalData(response.data);
        }
      } catch (error) {
        console.error("Error fetching data in modal:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [proposal.proposalId, role]);

  const handleConvertToProforma = async (proposalId) => {
    const swalCustomClasses = {
      popup: "rounded-lg",
      confirmButton:
        "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium ml-2", // Your "Create" button style
      cancelButton:
        "px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium mr-2 ml-2", // Your "Cancel" button style
    };

    // 1. First Popup: Confirmation
    const result = await Swal.fire({
      title: "Convert to Proforma?",
      text: "Do you want to convert this Proposal to a Proforma Invoice?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, convert it!",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: swalCustomClasses,
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Converting...",
      text: "Please wait while we generate the Proforma Invoice.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axiosInstance.post(
        `convertProposalToProforma/${proposalId}`
      );

      Swal.close();

      const { proformaId, message } = response.data;

      // 2. Handle Success (200 OK)
      if (response.status === 200) {
        Swal.fire({
          title: "Success!",
          text: `${message}. Do you want to view it?`,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Yes, view it",
          cancelButtonText: "No, stay here",
          buttonsStyling: false,
          customClass: swalCustomClasses,
        }).then((viewResult) => {
          if (viewResult.isConfirmed) {
            if (role === "ROLE_ADMIN") {
              navigate(`/Admin/Proforma/Edit/${proformaId}`);
            } else if (role === "ROLE_EMPLOYEE") {
              navigate(`/Employee/Proforma/Edit/${proformaId}`);
            } else {
              navigate("/login");
            }
          }
        });
      }

      // 3. Handle Already Exists (208 ALREADY_REPORTED)
      else if (response.status === 208) {
        Swal.fire({
          title: "Already Exists",
          text: `${message}. Do you want to view the existing Proforma?`,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Yes, view it",
          cancelButtonText: "No, close",
          buttonsStyling: false,
          customClass: swalCustomClasses,
        }).then((viewResult) => {
          if (viewResult.isConfirmed) {
            if (role === "ROLE_ADMIN") {
              navigate(`/Admin/Proforma/Edit/${proformaId}`);
            } else if (role === "ROLE_EMPLOYEE") {
              navigate(`/Employee/Proforma/Edit/${proformaId}`);
            } else {
              navigate("/login");
            }
          }
        });
      }
    } catch (error) {
      Swal.close();
      console.error("Failed to convert:", error);

      let errorMessage = "Failed to convert proposal to proforma.";
      if (error.response && error.response.data) {
        errorMessage =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || errorMessage;
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Ok",
        buttonsStyling: false,
        customClass: swalCustomClasses,
      });
    }
  };

  // Function to open email modal
  const handleOpenEmailModal = () => {
    setIsEmailModalOpen(true);
  };

  // Function to close email modal
  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
  };
  return (
    <>
      <div className="info-modal-backdrop " onClick={onClose}>
        <div
          className="info-modal-content rounded-t-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* --- Modal Header --- */}
          {/* --- Modal Header --- */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Proposal Details
                  </h2>
                  <p className="text-blue-100 text-xs">
                    {proposal.formatedProposalNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEmailModal();
                  }}
                  className="flex items-center gap-2 px-2 py-2 border border-white/30 rounded bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  title="Send via Email"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const publicUrl = `${window.location.origin}/Proposal/Preview/${proposal.proposalId}`;
                    window.open(publicUrl, "_blank", "noopener,noreferrer");
                  }}
                  className="flex items-center gap-2 px-2 py-2 border border-white/30 rounded bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  title="Open Public View"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenPdf && proposal?.proposalId) {
                      onOpenPdf(proposal.proposalId);
                    }
                  }}
                  className="flex items-center gap-2 px-2 py-2 border border-white/30 rounded bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  title="Generate PDF"
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
                {/* Convert to Proforma */}
                <button
                  title="Convert to Proforma"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConvertToProforma(proposal.proposalId);
                  }}
                  className="px-2 py-2 bg-white/20 text-white border border-white/30 rounded hover:bg-white/30 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 5.15V8.85C22 11.1 21.1 12 18.85 12H16.15C13.9 12 13 11.1 13 8.85V5.15C13 2.9 13.9 2 16.15 2H18.85C21.1 2 22 2.9 22 5.15Z"
                      strokeWidth="2.0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11 15.15V18.85C11 21.1 10.1 22 7.85 22H5.15C2.9 22 2 21.1 2 18.85V15.15C2 12.9 2.9 12 5.15 12H7.85C10.1 12 11 12.9 11 15.15Z"
                      strokeWidth="2.0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 15C22 18.87 18.87 22 15 22L16.05 20.25"
                      strokeWidth="2.0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 9C2 5.13 5.13 2 9 2L7.95 3.75"
                      strokeWidth="2.0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Convert-To-Proforma
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-white/20 rounded transition"
                  onClick={onClose}
                >
                  <svg
                    className="w-4 h-4 text-white"
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
            </div>
          </div>

          {/* --- Modal Tabs --- */}
          <div className="info-modal-tabs">
            <button
              className={`info-modal-tab ${
                activeTab === "proposal" ? "active" : ""
              }`}
              onClick={() => setActiveTab("proposal")}
            >
              Proposal
            </button>
            <button
              className={`info-modal-tab ${
                activeTab === "reminders" ? "active" : ""
              }`}
              onClick={() => setActiveTab("reminders")}
            >
              Reminders
            </button>
          </div>

          <div className="info-modal-body p-0">
            {activeTab === "proposal" && (
              <ProposalTabContent
                loading={isLoading}
                proposalData={proposalData}
                adminInformation={adminInformation}
              />
            )}
            {activeTab === "reminders" && (
              <RemindersTabContent proposalId={proposal.proposalId} />
            )}
          </div>

          <SendProposalEmailModal
            isOpen={isEmailModalOpen}
            onClose={handleCloseEmailModal}
            proposalId={proposal?.proposalId}
            proposalNumber={proposal?.formatedProposalNumber}
            customerEmail={
              proposalData?.proposalInfo?.customerInfo?.customerEmail
            }
          />
        </div>
      </div>
    </>
  );
};

export default ProposalInfoModal;
