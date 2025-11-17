import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";
import { ToWords } from "to-words";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ProformaPDF from "./ProformaPDF";

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

const IconDownload = ({ className }) => (
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
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const IconPrinter = ({ className }) => (
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
      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
    />
  </svg>
);

// --- Helpers ---
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateString;
  }
};

const getCurrencySymbol = (currencyType = "INR") => {
  switch (currencyType) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    default:
      return "₹";
  }
};

const formatCurrency = (amount, currencyType) => {
  const symbol = getCurrencySymbol(currencyType);
  const formattedAmount = (Number(amount) || 0).toFixed(2);
  return `${symbol}${formattedAmount}`;
};

// Helper to render Base64 images safely
const renderBase64Image = (base64String, altText) => {
  if (!base64String) return null;
  const src = base64String.startsWith("data:image")
    ? base64String
    : `data:;base64,${base64String}`;
  return <img src={src} alt={altText} className="h-20 object-contain" />;
};

const numberToWords = (num, currency = "INR") => {
  if (num === null || num === undefined || isNaN(num)) return "Zero";

  // Config based on currency type
  let options = { currency: true };
  if (currency === "USD") options = { ...options, localeCode: "en-US" };
  else if (currency === "EUR") options = { ...options, localeCode: "en-GB" };
  else options = { ...options, localeCode: "en-IN" }; // Default INR

  try {
    const toWords = new ToWords(options);
    return toWords.convert(num);
  } catch (e) {
    return num;
  }
};
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
    }, 0); // --- THIS IS THE FIX ---

    const discountPercentage = Number(info.discount) || 0;
    const discountAmount = Number(
      (subTotal * (discountPercentage / 100)).toFixed(2)
    ); // --- END FIX ---
    const taxableAmount = Math.max(0, subTotal - discountAmount);

    const taxRate = Number(info.taxPercentage) || 0;
    const taxAmount = Number((taxableAmount * (taxRate / 100)).toFixed(2));

    const grandTotal = taxableAmount + taxAmount;

    const amountPaid = Number(info.paidAmount) || 0;

    const amountDue = Math.max(0, grandTotal - amountPaid);

    return {
      subTotal,
      discount: discountAmount, // The calculated amount
      discountPercentage: discountPercentage, // The percentage for display
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
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header / Status */}
        <div className="p-8 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              {adminInformation && adminInformation.logo ? (
                <img
                  src={`data:;base64,${adminInformation.logo}`}
                  alt="Company Logo"
                  className="h-16 object-contain mb-4"
                />
              ) : (
                <div className="h-12 mb-4 flex items-center justify-center rounded-md bg-gray-100 text-gray-500 text-xs px-4">
                  Company logo is not provided
                </div>
              )}
            </div>

            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">PROFORMA</h1>
              <div className="font-semibold text-gray-700">
                {formatProformaNumber(info.proformaInvoiceNumber)}
              </div>
              <span
                className={`inline-block px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                  info.status === "Paid"
                    ? "bg-green-100 text-green-600"
                    : info.status === "Partially Paid"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {info.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Address & Details Section */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left Column: From & Dates */}
          <div>
            <div className="mb-1 pl-4">
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-bold text-gray-900">
                  {adminInformation?.companyName}
                </p>
                {adminInformation?.address && <p>{adminInformation.address}</p>}

                {adminInformation?.gstNumber && (
                  <p>GST Number: {adminInformation.gstNumber}</p>
                )}

                {adminInformation?.panNumber && (
                  <p>PAN: {adminInformation.panNumber}</p>
                )}

                {adminInformation?.phone && (
                  <p>Mobile No: {adminInformation.phone}</p>
                )}

                {adminInformation?.companyEmail && (
                  <p>Email: {adminInformation.companyEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Bill To & Dates */}
          <div className="text-right md:text-right">
            <div className="pl-4">
              <h3 className="text-gray-700 text-sm font-bold uppercase tracking-wider mb-2">
                Bill To
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-bold text-gray-900">{info.companyName}</p>
                <p>{info.billingStreet}</p>
                <p>
                  {info.billingCity}, {info.billingState} {info.billingZipCode}
                </p>
                <p>{info.billingCountry}</p>
              </div>
            </div>
            {info?.shippingStreet && (
              <div className="pl-4 mt-2">
                <h3 className="text-gray-700 text-sm font-bold uppercase tracking-wider">
                  Ship To
                </h3>
                <div className="text-sm text-gray-700 leading-relaxed ">
                  <p>{info.shippingStreet}</p>
                  <p>
                    {info.shippingCity}, {info.shippingState}{" "}
                    {info.shippingZipCode}
                  </p>
                  <p>{info.shippingCountry}</p>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-700 leading-relaxed">
              {info?.gstin && <p>GST Number: {info.gstin}</p>}

              {info?.panNumber && <p>PAN: {info.panNumber}</p>}

              {info?.mobileNumber && <p>Mobile No: {info.mobileNumber}</p>}

              {info?.email && <p>Email: {info.email}</p>}
            </div>

            <div className="inline-block text-left bg-gray-50 p-4 rounded-lg border border-gray-100 w-full md:w-auto">
              <div className="flex justify-between gap-8 mb-1">
                <span className="text-xs text-gray-500">Invoice Date:</span>
                <span className="text-sm font-medium">
                  {formatDate(info.proformaInvoiceDate)}
                </span>
              </div>
              {info.dueDate && (
                <div className="flex justify-between gap-8">
                  <span className="text-xs text-gray-500">Due Date:</span>
                  <span className="text-sm font-medium">
                    {formatDate(info.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-8">
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-right">SAC Code</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr
                    key={item.proformaInvoiceContentId || index}
                    className="hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 text-center text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.item}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">{item.sacCode}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(item.rate, currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.quantity * item.rate, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Section */}
        <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="w-full md:w-3/5">
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Amount in Words
              </p>
              <p className="text-sm font-medium italic text-gray-700">
                {numberToWords(info.totalAmount, currency)} Only
              </p>
            </div>
          </div>

          {/* Right Side: Totals */}
          <div className="w-full md:w-2/5 bg-gray-50 p-6 rounded-lg">
            <div className="space-y-1">
              {/* Sub Total */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sub Total</span>
                <span className="font-medium">
                  {formatCurrency(calculation.subTotal, currency)}
                </span>
              </div>

              {/* Discount */}
              {calculation.discount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Discount ({calculation.discountPercentage}%)</span>
                  <span className="font-medium">
                    - {formatCurrency(calculation.discount, currency)}
                  </span>
                </div>
              )}

              {/* Taxable Amount */}
              {calculation.discount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Taxable Amount</span>
                  <span className="font-medium">
                    {formatCurrency(calculation.taxableAmount, currency)}
                  </span>
                </div>
              )}

              {/* Tax */}
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {info.taxType} ({info.taxPercentage}%)
                </span>
                <span className="font-medium">
                  {formatCurrency(calculation.taxAmount, currency)}
                </span>
              </div>

              <div className="h-px bg-gray-200 my-2"></div>

              {/* Grand Total */}
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Grand Total</span>
                <span>{formatCurrency(calculation.grandTotal, currency)}</span>
              </div>

              {/* Amount Paid */}
              {calculation.amountPaid > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium pt-2">
                  <span>Amount Paid</span>
                  <span>
                    {formatCurrency(calculation.amountPaid, currency)}
                  </span>
                </div>
              )}

              {/* Amount Due */}
              <div className="flex justify-between text-sm text-red-600 font-medium pt-2">
                <span>Amount Due</span>
                <span>{formatCurrency(calculation.amountDue, currency)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">
          {/* Terms */}
          {info.termsAndConditions && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-900 uppercase mb-2">
                Terms & Conditions
              </p>
              <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed border-l-2 border-gray-200 pl-3">
                {info.termsAndConditions}
              </p>
            </div>
          )}

          {/* Notes */}
          {info.notes && (
            <div>
              <p className="text-xs font-bold text-gray-900 uppercase mb-2">
                Notes
              </p>
              <p className="text-xs text-gray-500 whitespace-pre-line">
                {info.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer: Signatures */}
        <div className="px-8 pb-12 mt-4 ">
          <p className="text-xs font-bold text-gray-900 uppercase mb-2">
            Authorization
          </p>
          <div className="flex gap-8">
            {/* Signature */}
            {info.companySignature ? (
              // If signature exists, show it
              <div className="text-center">
                <div className="mb-2">
                  {renderBase64Image(
                    info.companySignature,
                    "Authorized Signature"
                  )}
                </div>
                <p className="text-xs text-gray-400 uppercase">
                  Authorized Signature
                </p>
              </div>
            ) : (
              // If signature does NOT exist, show placeholder
              <div className="text-center">
                <div className="mb-2 h-20 flex items-center justify-center rounded-md bg-gray-100 text-gray-500 text-xs px-4">
                  Signature not provided
                </div>
                <p className="text-xs text-gray-400 uppercase">
                  Authorized Signature
                </p>
              </div>
            )}

            {info.companyStamp && (
              <div className="text-center">
                <div className="mb-2">
                  {renderBase64Image(info.companyStamp, "Company Stamp")}
                </div>
                <p className="text-xs text-gray-400 uppercase">Company Stamp</p>
              </div>
            )}
          </div>
        </div>
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
