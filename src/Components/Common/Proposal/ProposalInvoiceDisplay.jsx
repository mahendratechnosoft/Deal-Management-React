import React, { useMemo } from "react";
import { ToWords } from "to-words";
import {
  formatCurrency,
  formatDate,
  formatProposalNumber,
  numberToWords,
} from "../../BaseComponet/UtilFunctions";

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

const ProposalInvoiceDisplay = ({
  proposal,
  adminInformation,
  headerActions,
}) => {
  const { proposalInfo, proposalContent } = proposal;

  const {
    subtotal,
    discountAmount,
    taxableAmount,
    total,
    currencyType,
    taxPercentage,
    taxType,
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
              {formatProposalNumber(proposalInfo.proposalNumber)}
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-2/12">
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
                      {formatCurrency(item.quantity * item.rate, currencyType)}
                    </td>
                  </tr>
                ))}
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
        <div className="lg:col-span-1 bg-gray-50 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
          <div className="flex border-b border-gray-200">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
              Summary
            </button>
          </div>

          {/* Company Info */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              {adminInformation.companyName}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <IconMapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{adminInformation.address}</span>
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
                <span>Email: {adminInformation.companyEmail}</span>
              </p>
            </div>
          </div>

          {/* Proposal Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Proposal Information
            </h3>
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
      </div>
    </div>
  );
};

export default ProposalInvoiceDisplay;
