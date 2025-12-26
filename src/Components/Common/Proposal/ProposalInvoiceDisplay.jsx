import React, { useMemo, useState } from "react";
import { ToWords } from "to-words";
import {
  formatCurrency,
  formatDate,
  formatProposalNumber,
  numberToWords,
} from "../../BaseComponet/UtilFunctions";
import { getFileIcon } from "../../BaseComponet/CustomeFormComponents";

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

const TaxRows = ({
  taxType,
  taxPercentage,
  cgstPercentage, // New Prop
  sgstPercentage, // New Prop
  taxableAmount,
  currencyType,
}) => {
  // 1. Handle Split Tax (CGST + SGST)
  if (taxType === "CGST+SGST") {
    const cgstAmount = taxableAmount * (cgstPercentage / 100);
    const sgstAmount = taxableAmount * (sgstPercentage / 100);

    return (
      <>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            CGST ({cgstPercentage.toFixed(2)}%)
          </span>
          <span className="font-medium text-gray-800">
            {formatCurrency(cgstAmount, currencyType)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            SGST ({sgstPercentage.toFixed(2)}%)
          </span>
          <span className="font-medium text-gray-800">
            {formatCurrency(sgstAmount, currencyType)}
          </span>
        </div>
      </>
    );
  }

  // 2. Handle Single Tax (Existing Logic)
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

  // 3. Handle No Tax
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Tax</span>
      <span className="font-medium text-gray-800">
        {formatCurrency(0, currencyType)}
      </span>
    </div>
  );
};

const IconDownload = ({ className }) => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const ProposalInvoiceDisplay = ({
  proposal,
  adminInformation,
  headerActions,
}) => {
  const { proposalInfo, proposalContent, paymentProfiles = [] } = proposal;

  const [activeTab, setActiveTab] = useState("Summary");

  const handleDownload = () => {
    if (!proposalInfo.attachmentFile) return;

    const link = document.createElement("a");
    link.href = `data:${proposalInfo.attachmentFileType};base64,${proposalInfo.attachmentFile}`;
    link.download = proposalInfo.attachmentFileName || "Attachment";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const {
    subtotal,
    discountAmount,
    taxableAmount,
    total,
    currencyType,
    taxPercentage,
    taxType,
    cgstPercentage, // New return value
    sgstPercentage, // New return value
  } = useMemo(() => {
    if (!proposal)
      return {
        subtotal: 0,
        discountAmount: 0,
        taxableAmount: 0,
        total: 0,
        currencyType: "INR",
        taxPercentage: 0,
        taxType: "No Tax",
        cgstPercentage: 0,
        sgstPercentage: 0,
      };

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

    // --- New Tax Logic Start ---
    const tType = info.taxType || "No Tax";
    let totalTax = 0;
    let tPercentage = 0;
    let cgst = 0;
    let sgst = 0;

    if (tType === "CGST+SGST") {
      cgst = Number(info.cgstPercentage) || 0;
      sgst = Number(info.sgstPercentage) || 0;
      const cgstAmount = tAmount * (cgst / 100);
      const sgstAmount = tAmount * (sgst / 100);
      totalTax = cgstAmount + sgstAmount;
    } else {
      tPercentage = Number(info.taxPercentage ?? info.taxRate) || 0;
      totalTax = tAmount * (tPercentage / 100);
    }
    // --- New Tax Logic End ---

    const grandTotal = tAmount + totalTax;

    return {
      subtotal: sub,
      discountAmount: dAmount,
      taxableAmount: tAmount,
      total: grandTotal,
      currencyType: cType,
      taxPercentage: tPercentage,
      taxType: tType,
      cgstPercentage: cgst,
      sgstPercentage: sgst,
    };
  }, [proposal]);

  if (!adminInformation) return <div>Loading Company Info...</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start p-6 border-b border-gray-200">
        <div>
          {adminInformation.logo ? (
            <img
              src={`data:;base64,${adminInformation.logo}`}
              alt="Company Logo"
              className="h-12 mb-4"
            />
          ) : (
            <div className="h-12 mb-4 flex items-center justify-center rounded-md bg-gray-100 text-gray-500 text-xs px-4">
              Company logo not provided
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {proposalInfo.formatedProposalNumber}
            </h1>
            <p className="text-gray-600">{proposalInfo.subject}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto justify-start md:justify-end">
          {headerActions}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 p-6 md:p-8">
          {/* Items Table */}

          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Widths must sum up to 12/12 (approx 100%) for table-fixed to work well */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/12">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-5/12">
                  Particular
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-2/12">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-2/12">
                  Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-4/12">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proposalContent.map((item, index) => (
                <tr key={item.proposalContentId || index}>
                  <td className="px-4 py-4 text-sm text-gray-500 align-top">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 break-words whitespace-normal align-top">
                    <div className="text-sm font-medium text-gray-900">
                      {item.item}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm break-words text-gray-700 align-top">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-4 text-sm break-words text-gray-700 align-top">
                    {formatCurrency(item.rate, currencyType)}
                  </td>
                  <td className="px-4 py-4 text-sm break-words text-gray-900 font-medium align-top">
                    {formatCurrency(item.quantity * item.rate, currencyType)}
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

          {/* Totals Section */}
          <div className="flex justify-end mt-6">
            <div className="w-full md:w-auto lg:min-w-[35%] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(subtotal, currencyType)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Discount ({(Number(proposalInfo.discount) || 0).toFixed(2)}%)
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
                  cgstPercentage={cgstPercentage}
                  sgstPercentage={sgstPercentage}
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
              {numberToWords(total, currencyType)} only
            </span>
          </div>
        </div>

        {/* Sidebar (Right) */}
        {/* Sidebar (Right) */}
        <div className="lg:col-span-1 bg-gray-50 p-6 border-t lg:border-t-0 lg:border-l border-gray-200 min-h-[500px]">
          {/* Tabs Header */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("Summary")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "Summary"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab("Attachment")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "Attachment"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Attachment
            </button>
          </div>

          {/* TAB 1: SUMMARY CONTENT */}
          {activeTab === "Summary" && (
            <div className="animate-fadeIn">
              {/* Company Info */}
              <div>
                <h3 className="text-sm font-semibold break-words text-gray-800 mb-3">
                  {adminInformation.companyName}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-start gap-2 ">
                    <IconMapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="break-words min-w-0">
                      {adminInformation.address}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <IconFileText className="w-4 h-4 shrink-0" />
                    <span>GST: {adminInformation.gstNumber}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <IconPhone className="w-4 h-4 shrink-0" />
                    <span>Mobile: {adminInformation.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <IconMail className="w-4 h-4 shrink-0" />
                    <span className="break-words min-w-0">
                      Email: {adminInformation.companyEmail}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <IconMail className="w-4 h-4 shrink-0" />
                    <span className="break-words min-w-0">
                      Website: {adminInformation.website}
                    </span>
                  </p>
                </div>
              </div>

              {/* Bank Details */}
              {/* Payment Details - Replaces Bank Details */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Payment Details
                </h3>

                {paymentProfiles && paymentProfiles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="border-l-2 border-grey-100 pl-3">
                      {/* BANK profiles */}
                      {paymentProfiles
                        .filter((profile) => profile.type === "BANK")
                        .map((profile, index) => (
                          <div
                            key={profile.paymentProfileId || index}
                            className="text-gray-700 mb-4 last:mb-0"
                          >
                            <div className="text-sm space-y-1 ml-1">
                              <div className="space-y-1 ml-2 leading-relaxed flex">
                                <span className="font-medium mr-2 mt-1 text-gray-600">
                                  {index + 1}.
                                </span>
                                <div className="space-y-1">
                                  <p className="flex">
                                    <span className="font-medium w-32 text-gray-600">
                                      Bank Name:
                                    </span>
                                    <span className="text-gray-800">
                                      {profile.bankName || "N/A"}
                                    </span>
                                  </p>
                                  <p className="flex">
                                    <span className="font-medium w-32 text-gray-600">
                                      Account Number:
                                    </span>
                                    <span className="text-gray-800">
                                      {profile.accountNumber || "N/A"}
                                    </span>
                                  </p>
                                  <p className="flex">
                                    <span className="font-medium w-32 text-gray-600">
                                      Account Holder:
                                    </span>
                                    <span className="text-gray-800">
                                      {profile.accountHolderName || "N/A"}
                                    </span>
                                  </p>
                                  <p className="flex">
                                    <span className="font-medium w-32 text-gray-600">
                                      IFSC Code:
                                    </span>
                                    <span className="text-gray-800">
                                      {profile.ifscCode || "N/A"}
                                    </span>
                                  </p>
                                  <p className="flex">
                                    <span className="font-medium w-32 text-gray-600">
                                      Branch:
                                    </span>
                                    <span className="text-gray-800">
                                      {profile.branchName || "N/A"}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* UPI profiles */}
                      {paymentProfiles
                        .filter((profile) => profile.type === "UPI")
                        .map((profile, index) => (
                          <div
                            key={profile.paymentProfileId || index}
                            className="text-gray-700 mb-4 last:mb-0"
                          >
                            <div className="text-sm space-y-2 ml-1">
                              <div className="space-y-1 ml-2 flex">
                                <span className="font-medium mr-2 mt-1 text-black-600">
                                  {paymentProfiles.filter(
                                    (p) => p.type === "BANK"
                                  ).length +
                                    index +
                                    1}
                                  .
                                </span>
                                <div className="space-y-2">
                                  <p className="flex">
                                    <span className="font-medium w-32 text-gray-600">
                                      UPI ID:
                                    </span>
                                    <span className="text-gray-800">
                                      {profile.upiId || "N/A"}
                                    </span>
                                  </p>
                                  {profile.qrCodeImage && (
                                    <div>
                                      <p className="font-medium text-sm text-gray-600 mb-1">
                                        Scan QR Code:
                                      </p>
                                      <div className="flex justify-center">
                                        <img
                                          src={`data:image/png;base64,${profile.qrCodeImage}`}
                                          alt="QR Code"
                                          className="w-32 h-32 border border-gray-200 rounded"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* CASH profiles */}
                      {paymentProfiles
                        .filter((profile) => profile.type === "CASH")
                        .map((profile, index) => (
                          <div
                            key={profile.paymentProfileId || index}
                            className="text-gray-700 mb-4 last:mb-0"
                          >
                            <div className="text-sm ml-1">
                              <div className="flex items-center ml-2">
                                <span className="font-medium mr-2 text-black-600">
                                  {paymentProfiles.filter(
                                    (p) => p.type === "BANK" || p.type === "UPI"
                                  ).length +
                                    index +
                                    1}
                                  .
                                </span>
                                <span className="font-medium text-gray-700">
                                  Cash Payment
                                </span>
                              </div>
                              <p className="ml-8 text-gray-600 italic">
                                Pay in cash to company representative
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No payment details provided
                  </p>
                )}
              </div>

              {/* Proposal Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Proposal Information
                </h3>
                <div className="mb-4">
                  <p className="font-semibold text-gray-800 break-words">
                    {proposalInfo.companyName}
                  </p>
                  <p className="text-sm text-gray-600 break-words">
                    {proposalInfo.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {proposalInfo.city}, {proposalInfo.state} -{" "}
                    {proposalInfo.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">
                    {proposalInfo.country}
                  </p>
                </div>

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
          )}

          {/* TAB 2: ATTACHMENT CONTENT */}
          {activeTab === "Attachment" && (
            <div className="animate-fadeIn space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Attached Files
              </h3>

              {proposalInfo.attachmentFile ? (
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center min-w-0 gap-3">
                    {/* File Icon */}
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      {getFileIcon(proposalInfo.attachmentFileName)}
                    </div>

                    {/* File Name with Truncate & Tooltip */}
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium text-gray-900 truncate max-w-[150px]"
                        title={proposalInfo.attachmentFileName}
                      >
                        {proposalInfo.attachmentFileName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {proposalInfo.attachmentFileType || "Document"}
                      </p>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Download Attachment"
                  >
                    <IconDownload className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 bg-white border border-dashed border-gray-300 rounded-lg">
                  <IconFileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No attachments found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalInvoiceDisplay;
