import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ProformaPDF from "./ProformaPDF";
import ProformaInvoiceDisplay from "./ProformaInvoiceDisplay";

// --- Icons ---
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

const formatProformaNumber = (number) => {
  const numberString = String(number || 0);
  return `P_INV-${numberString.padStart(6, "0")}`;
};

function ProformaPreview() {
  const { proformaInvoiceId } = useParams();
  const navigate = useNavigate();
  const { role } = useLayout();

  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [adminInformation, setAdminInformation] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let adminInfo = null;
        if (role === "ROLE_ADMIN") {
          const adminRes = await axiosInstance.get(`/admin/getAdminInfo`);
          adminInfo = adminRes.data;
        } else if (role === "ROLE_EMPLOYEE") {
          const empRes = await axiosInstance.get(`/employee/getEmployeeInfo`);
          adminInfo = empRes.data.admin;
        }
        setAdminInformation(adminInfo);

        const response = await axiosInstance.get(
          `getProformaInvoiceById/${proformaInvoiceId}`
        );

        if (response.data) {
          setInvoiceData(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load proforma invoice details");
      } finally {
        setLoading(false);
      }
    };

    if (proformaInvoiceId) fetchData();
  }, [proformaInvoiceId, role]);

  const calculation = useMemo(() => {
    if (!invoiceData || !invoiceData.proformaInvoiceContents) {
      return {
        subTotal: 0,
        discount: 0,
        discountPercentage: 0,
        taxableAmount: 0,
        taxAmount: 0,
        grandTotal: 0,
        amountPaid: 0,
        amountDue: 0,
      };
    }

    const info = invoiceData.proformaInvoiceInfo;
    const items = invoiceData.proformaInvoiceContents;

    const subTotal = items.reduce((acc, item) => {
      return acc + Number(item.quantity) * Number(item.rate);
    }, 0);

    const discountPercentage = Number(info.discount) || 0;
    const discountAmount = Number(
      (subTotal * (discountPercentage / 100)).toFixed(2)
    );
    const taxableAmount = Math.max(0, subTotal - discountAmount);

    const taxRate = Number(info.taxPercentage) || 0;
    const taxAmount = Number((taxableAmount * (taxRate / 100)).toFixed(2));

    const grandTotal = taxableAmount + taxAmount;

    const amountPaid = Number(info.paidAmount) || 0;

    const amountDue = Math.max(0, grandTotal - amountPaid);

    return {
      subTotal,
      discount: discountAmount,
      discountPercentage: discountPercentage,
      taxableAmount,
      taxAmount,
      grandTotal,
      amountPaid,
      amountDue,
    };
  }, [invoiceData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="p-8 text-center text-gray-500">Invoice not found.</div>
    );
  }

  const info = invoiceData.proformaInvoiceInfo;
  const items = invoiceData.proformaInvoiceContents;
  const currency = info.currencyType || "INR";

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto mb-4 justify-between flex">
        <button
          onClick={() =>
            navigate(role === "ROLE_ADMIN" ? "/Proforma" : "/Employee/Proforma")
          }
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <IconChevronLeft className="w-4 h-4" />
          Back to Proforma
        </button>

        <button
          title="View PDF"
          disabled={!invoiceData || !adminInformation}
          onClick={() => setIsPdfModalOpen(true)}
          className="flex items-center gap-2 px-1 py-1 border border-gray-300 rounded bg-white text-sm font-medium text-red-600 hover:text-red-900"
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
          Pdf
        </button>
      </div>

      {/* Main Invoice Card */}
      <div className="max-w-5xl mx-auto">
        <ProformaInvoiceDisplay
          invoiceData={invoiceData}
          adminInformation={adminInformation}
          calculation={calculation}
        />
      </div>

      {isPdfModalOpen && (
        <div className="proposal-pdf-modal-backdrop">
          <div className="proposal-pdf-modal-content">
            <div className="proposal-pdf-modal-header">
              <h3>
                {invoiceData
                  ? formatProformaNumber(
                      invoiceData.proformaInvoiceInfo.proformaInvoiceNumber
                    )
                  : "Loading..."}
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                {/* --- Download Button --- */}
                {!loading && invoiceData && (
                  <PDFDownloadLink
                    document={
                      <ProformaPDF
                        invoiceData={invoiceData}
                        adminInformation={adminInformation}
                      />
                    }
                    fileName={
                      `${formatProformaNumber(
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
              {loading || !invoiceData ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  Loading PDF...
                </div>
              ) : (
                <PDFViewer width="100%" height="100%">
                  <ProformaPDF
                    invoiceData={invoiceData}
                    adminInformation={adminInformation}
                  />
                </PDFViewer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProformaPreview;
