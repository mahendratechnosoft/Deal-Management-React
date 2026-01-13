import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import axiosInstance from "../../BaseComponet/axiosInstance";
import ProformaPDF from "./ProformaPDF";
import ProformaInvoiceDisplay from "./ProformaInvoiceDisplay";

// Format function for proforma
const formatProformaNumber = (number) => {
  const numberString = String(number || 0);
  return `P_INV-${numberString.padStart(6, "0")}`;
};

// Format function for tax invoice
const formatInvoiceNumber = (number) => {
  const numberString = String(number || 0);
  return `INV-${numberString.padStart(6, "0")}`;
};

function PublicProformaPreview() {
  const { proformaInvoiceId } = useParams();

  // Check the current URL path to determine if it's invoice or proforma
  const currentPath = window.location.pathname;
  const isInvoicePath = currentPath.includes("/Invoice/Preview/");

  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [adminInformation, setAdminInformation] = useState(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!proformaInvoiceId) {
        setError("Invalid document ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Use public API endpoint
        const response = await axiosInstance.get(
          `/public/getProformaInvoiceById/${proformaInvoiceId}`
        );

        const data = response.data;

        console.log("API Response structure:", data);

        if (!data || data.success === false) {
          throw new Error(data?.message || "Document not found");
        }

        // Extract proforma data from the nested structure
        const proformaData = data.proforma;
        const adminData = data.admin;

        if (!proformaData) {
          throw new Error("Document data not found in response");
        }

        // Determine document type based on URL path
        // If URL is /Invoice/Preview/..., show as INVOICE
        // If URL is /Proforma/Preview/..., check proformaType to decide
        let isInvoice = isInvoicePath;

        if (!isInvoicePath) {
          // For Proforma path, check if it's converted to tax invoice
          const proformaType = proformaData.proformaInvoiceInfo?.proformaType;
          isInvoice = proformaType === "CONVERTED_TAX_INVOICE";
        }

        // Get appropriate formatted number
        let formattedNumber;
        if (isInvoice) {
          formattedNumber =
            proformaData.proformaInvoiceInfo?.formatedInvoiceNumber ||
            formatInvoiceNumber(
              proformaData.proformaInvoiceInfo?.proformaInvoiceNumber
            ) ||
            formatInvoiceNumber("000000");
        } else {
          formattedNumber =
            proformaData.proformaInvoiceInfo?.formatedProformaInvoiceNumber ||
            formatProformaNumber(
              proformaData.proformaInvoiceInfo?.proformaInvoiceNumber
            ) ||
            formatProformaNumber("000000");
        }

        // Reconstruct the invoiceData to match what ProformaInvoiceDisplay expects
        const formattedInvoiceData = {
          proformaInvoiceInfo: {
            ...proformaData.proformaInvoiceInfo,
            // Set based on URL path
            isInvoice: isInvoice,
            // Store the formatted number for display
            formatedDisplayNumber: formattedNumber,
            // Ensure we have both number formats
            formatedInvoiceNumber: isInvoice ? formattedNumber : "",
            formatedProformaInvoiceNumber: !isInvoice ? formattedNumber : "",
            // Original number for reference
            proformaInvoiceNumber:
              proformaData.proformaInvoiceInfo?.proformaInvoiceNumber ||
              "000000",
          },
          proformaInvoiceContents: proformaData.proformaInvoiceContents || [],
          paymentProfiles: proformaData.paymentProfiles || [],
        };

        console.log("Formatted invoice data:", formattedInvoiceData);
        console.log("Document type:", isInvoice ? "INVOICE" : "PROFORMA");

        setInvoiceData(formattedInvoiceData);
        setAdminInformation(adminData || {});
      } catch (error) {
        console.error("Error fetching document data:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load document"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proformaInvoiceId, isInvoicePath]);

  // Calculate totals
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

    const info = invoiceData.proformaInvoiceInfo || {};
    const items = invoiceData.proformaInvoiceContents || [];

    const subTotal = items.reduce((acc, item) => {
      return acc + Number(item.quantity || 0) * Number(item.rate || 0);
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

  // Get display values
  const getInvoiceInfo = () => {
    return invoiceData?.proformaInvoiceInfo || {};
  };

  const getDocumentType = () => {
    return isInvoicePath ? "Invoice" : "Proforma Invoice";
  };

  const getDocumentNumber = () => {
    const info = getInvoiceInfo();
    return (
      info.formatedDisplayNumber ||
      (isInvoicePath
        ? formatInvoiceNumber(info.proformaInvoiceNumber)
        : formatProformaNumber(info.proformaInvoiceNumber))
    );
  };

  const getDocumentTitle = () => {
    return isInvoicePath ? "INVOICE" : "PROFORMA INVOICE";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading document...</p>
      </div>
    );
  }

  if (error && !invoiceData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Unable to Load Document
        </h2>
        <p className="text-gray-600 text-center max-w-md mb-4">{error}</p>
        <p className="text-gray-500 text-sm text-center max-w-md">
          This link may be invalid or the document may have been removed.
        </p>
        <div className="mt-6 text-sm text-gray-500">
          <p className="font-mono bg-gray-100 p-2 rounded">
            Document ID: {proformaInvoiceId}
          </p>
          <p className="mt-2">URL Path: {currentPath}</p>
        </div>
      </div>
    );
  }

  const documentNumber = getDocumentNumber();
  const documentType = getDocumentType();
  const documentTitle = getDocumentTitle();

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      {/* Public View Banner */}
      <div className="max-w-5xl mx-auto mb-4 flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div>
          {/* <p className="text-sm text-blue-800 font-medium">
            🔗 Public View - Anyone with this link can view
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-blue-600">Document Type:</span>
            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {documentTitle}
            </span>
            <span className="text-xs text-blue-600 ml-2">
              Number: {documentNumber}
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
            disabled={!invoiceData || !adminInformation}
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

      {/* Main Document Card */}
      <div className="max-w-5xl mx-auto">
        {invoiceData ? (
          <ProformaInvoiceDisplay
            invoiceData={invoiceData}
            adminInformation={adminInformation}
            calculation={calculation}
            isInvoice={isInvoicePath}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            Document not found.
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
                  {documentNumber}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{documentType}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    Public View
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!loading && invoiceData && adminInformation && (
                  <PDFDownloadLink
                    document={
                      <ProformaPDF
                        invoiceData={invoiceData}
                        adminInformation={adminInformation}
                        isInvoice={isInvoicePath}
                      />
                    }
                    fileName={`${documentNumber}.pdf`}
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
                )}
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
              ) : invoiceData && adminInformation ? (
                <PDFViewer width="100%" height="100%" className="rounded-b-xl">
                  <ProformaPDF
                    invoiceData={invoiceData}
                    adminInformation={adminInformation}
                    isInvoice={isInvoicePath}
                  />
                </PDFViewer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  No data available for PDF generation
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicProformaPreview;
