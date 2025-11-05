import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";
import Mtech_logo from "../../../../public/Images/Mtech_Logo.jpg";
import { ToWords } from "to-words";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ProposalPDF from "./ProposalPDF";
import "./ProposalList.css";

// --- SVG Icon Components (No Changes) ---
const IconXCircle = ({ className }) => (
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
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);
const IconCheckCircle = ({ className }) => (
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const IconMail = ({ className }) => (
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
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const IconPhone = ({ className }) => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const IconMapPin = ({ className }) => (
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
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const IconFileText = ({ className }) => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconHash = ({ className }) => (
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
    <line x1="4" y1="9" x2="20" y2="9"></line>
    <line x1="4" y1="15" x2="20" y2="15"></line>
    <line x1="10" y1="3" x2="8" y2="21"></line>
    <line x1="16" y1="3" x2="14" y2="21"></line>
  </svg>
);

const IconCalendar = ({ className }) => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
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
    case "INR":
      return "₹";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    default:
      return currencyType;
  }
};

const formatCurrency = (amount, currencyType) => {
  const symbol = getCurrencySymbol(currencyType);
  const formattedAmount = (Number(amount) || 0).toFixed(2);
  return `${symbol}${formattedAmount}`;
};

const numberToWords = (num, currency = "INR") => {
  if (num === null || num === undefined || isNaN(num)) return "Zero";

  let options = {
    currency: true,
  };

  switch (currency) {
    case "INR":
      options.localeCode = "en-IN";
      options.currencyOptions = {
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paisa",
          plural: "Paise",
          symbol: "",
        },
      };
      break;
    case "USD":
      options.localeCode = "en-US";
      options.currencyOptions = {
        name: "Dollar",
        plural: "Dollars",
        symbol: "$",
        fractionalUnit: {
          name: "Cent",
          plural: "Cents",
          symbol: "",
        },
      };
      break;
    case "EUR":
      options.localeCode = "en-GB";
      options.currencyOptions = {
        name: "Euro",
        plural: "Euros",
        symbol: "€",
        fractionalUnit: {
          name: "Cent",
          plural: "Cents",
          symbol: "",
        },
      };
      break;
    default:
      // Fallback for non-currency or unknown
      options.currency = false;
      options.localeCode = "en-US"; // Default locale
  }

  try {
    const toWords = new ToWords(options);
    return toWords.convert(num);
  } catch (e) {
    console.error("Failed to convert number to words:", e);
    // Fallback to a simple format if library fails
    const numStr = Number(num).toFixed(2);
    return `[${numStr}]`;
  }
};

const TaxRows = ({ taxType, taxPercentage, taxableAmount, currencyType }) => {
  const totalTaxAmount = taxableAmount * (taxPercentage / 100);

  if (taxType !== "No Tax" && taxPercentage > 0) {
    return (
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          {taxType} ({taxPercentage.toFixed(2)}%)
        </span>
        <span className="font-medium text-gray-800">
          {formatCurrency(totalTaxAmount, currencyType)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Tax</span>
      <span className="font-medium text-gray-800">
        {formatCurrency(0, currencyType)}
      </span>
    </div>
  );
};

function ProposalPreview() {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const { role } = useLayout();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    const fetchProposalData = async () => {
      if (!proposalId) {
        toast.error("No proposal ID found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `getProposalById/${proposalId}`
        );
        if (
          response.data.proposalInfo.taxPercentage === undefined &&
          response.data.proposalInfo.taxRate === undefined
        ) {
          console.warn(
            "API response is missing 'taxPercentage' and 'taxRate'. Tax will be 0."
          );
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

    fetchProposalData();
  }, [proposalId]);

  const {
    subtotal,
    discountAmount,
    taxableAmount,
    total,
    currencyType,
    taxPercentage,
    taxType,
  } = useMemo(() => {
    if (!proposal) {
      return {
        subtotal: 0,
        discountAmount: 0,
        taxableAmount: 0,
        total: 0,
        currencyType: "INR",
        taxPercentage: 0,
        taxType: "No Tax",
      };
    }

    const info = proposal.proposalInfo;
    const content = proposal.proposalContent;
    const cType = info.currencyType || "INR";

    const sub = content.reduce(
      (acc, item) =>
        acc + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );

    const discount = Number(info.discount) || 0;
    const dAmount = (sub * discount) / 100;
    const tAmount = sub - dAmount;

    const tPercentage = Number(info.taxPercentage ?? info.taxRate) || 0;
    const tType = info.taxType || "No Tax";
    const totalTax = tAmount * (tPercentage / 100);
    const grandTotal = tAmount + totalTax;

    return {
      subtotal: sub,
      discountAmount: dAmount,
      taxableAmount: tAmount,
      total: grandTotal,
      currencyType: cType,
      taxPercentage: tPercentage,
      taxType: tType,
    };
  }, [proposal]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[90vh]">
        <span className="text-lg text-gray-700">Loading Proposal...</span>
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

  const { proposalInfo, proposalContent } = proposal;

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

      {/* Main Proposal Wrapper */}
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start p-6 border-b border-gray-200">
          {/* Logo and Proposal Info */}
          <div>
            <img
              src={Mtech_logo}
              alt="Mahendra Technosoft"
              className="h-12 mb-4"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {proposalInfo.proposalNumber}
              </h1>
              <p className="text-gray-600">{proposalInfo.subject}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto justify-start md:justify-end">
            <button
              title="View PDF"
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

            {/* <button className="flex items-center gap-2 px-4 py-2 border border-red-500 rounded text-red-500 hover:bg-red-50 text-sm font-medium">
              <IconXCircle className="w-4 h-4" />
              Decline
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border-0 rounded text-white bg-green-600 hover:bg-green-700 text-sm font-medium">
              <IconCheckCircle className="w-4 h-4" />
              Accept
            </button>*/}
          </div>
        </div>

        {/* Body (2-Column) */}
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 p-6 md:p-8">
            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-5/12">
                      Particular
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proposalContent.map((item, index) => (
                    <tr key={item.proposalContentId || index}>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.item}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.description}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {formatCurrency(item.rate, currencyType)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                        {formatCurrency(
                          item.quantity * item.rate,
                          currencyType
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Empty rows filler */}
                  {Array.from({
                    length: Math.max(0, 6 - proposalContent.length),
                  }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td className="px-4 py-4 h-14" colSpan={5}></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mt-6">
              <div className="w-full md:w-1/2 lg:w-2/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(subtotal, currencyType)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Discount ({(Number(proposalInfo.discount) || 0).toFixed(2)}
                    %)
                  </span>
                  <span className="font-medium text-gray-800">
                    -{formatCurrency(discountAmount, currencyType)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-medium border-t border-gray-100 pt-2 mt-2">
                  <span className="text-gray-700">Taxable Amount</span>
                  <span className="text-gray-900">
                    {formatCurrency(taxableAmount, currencyType)}
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <TaxRows
                    taxType={taxType}
                    taxPercentage={taxPercentage}
                    taxableAmount={taxableAmount}
                    currencyType={currencyType}
                  />
                </div>

                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">
                      {formatCurrency(total, currencyType)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* In Words */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">With words:</span>
              <span className="text-sm font-medium text-gray-800 ml-2">
                {numberToWords(total, currencyType)}
              </span>
            </div>
          </div>

          {/* Sidebar (Right) (No Changes) */}
          <div className="lg:col-span-1 bg-gray-50 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                Summary
              </button>
              {/* <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Discussion
              </button> */}
            </div>

            {/* Static Company Info */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Mahendra Technosoft Pvt. Ltd.
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <IconMapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Mirajgan, S.No.202/5 Baner Road A Wing, Office No. 201/3rd
                    Floor Landmark, near KAPIL MALHAR, Baner,, Pune,
                    Maharashtra, 411045, IND,
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <IconFileText className="w-4 h-4 shrink-0" />
                  <span>GST Number: 27AANCM4515G1ZD</span>
                </p>
                <p className="flex items-center gap-2">
                  <IconFileText className="w-4 h-4 shrink-0" />
                  <span>PAN: AANCM4515G,</span>
                </p>
                <p className="flex items-center gap-2">
                  <IconPhone className="w-4 h-4 shrink-0" />
                  <span>Mobile No: 8485888313,</span>
                </p>
                <p className="flex items-center gap-2">
                  <IconMail className="w-4 h-4 shrink-0" />
                  <span>Email: finance@mahendratechnosoft.com,</span>
                </p>
              </div>
            </div>

            {/* Dynamic Proposal Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Proposal Information
              </h3>

              {/* Client Info */}
              <div className="mb-4">
                <p className="font-semibold text-gray-800">
                  {proposalInfo.companyName}
                </p>
                <p className="text-sm text-gray-600">{proposalInfo.street}</p>
                <p className="text-sm text-gray-600">
                  {proposalInfo.city}, {proposalInfo.state} -{" "}
                  {proposalInfo.zipCode}
                </p>
                <p className="text-sm text-gray-600">{proposalInfo.country}</p>

                <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                  <IconMail className="w-4 h-4 shrink-0" /> {proposalInfo.email}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <IconPhone className="w-4 h-4 shrink-0" />{" "}
                  {proposalInfo.mobileNumber}
                </p>
              </div>

              {/* Proposal Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <IconHash className="w-4 h-4" />
                    Status
                  </span>
                  <span className="font-medium text-xs text-gray-800 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {proposalInfo.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <IconCalendar className="w-4 h-4" />
                    Date
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatDate(proposalInfo.proposalDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <IconCalendar className="w-4 h-4" />
                    Open Till
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatDate(proposalInfo.dueDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isPdfModalOpen && proposal && (
        <div className="proposal-pdf-modal-backdrop">
          <div className="proposal-pdf-modal-content">
            <div className="proposal-pdf-modal-header">
              <h3>{proposal.proposalInfo.proposalNumber}</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                {/* --- Download Button --- */}
                {/* No loading state needed, data is already here */}
                <PDFDownloadLink
                  document={<ProposalPDF data={proposal} />}
                  fileName={
                    `Proposal-${proposal.proposalInfo.proposalNumber}-${proposal.proposalInfo.companyName}.pdf` ||
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
              {/* No loader, just render the PDF */}
              <PDFViewer width="100%" height="100%">
                <ProposalPDF data={proposal} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProposalPreview;
