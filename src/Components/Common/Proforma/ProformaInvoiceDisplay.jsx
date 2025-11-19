import React from "react";
import { ToWords } from "to-words";
import { formatInvoiceNumber } from "../../BaseComponet/UtilFunctions";

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

const renderBase64Image = (base64String, altText) => {
  if (!base64String) return null;
  const src = base64String.startsWith("data:image")
    ? base64String
    : `data:;base64,${base64String}`;
  return (
    <img
      src={src}
      alt={altText}
      className="h-20 object-contain"
      style={{ maxHeight: "80px" }}
    />
  );
};

const numberToWords = (num, currency = "INR") => {
  if (num === null || num === undefined || isNaN(num)) return "Zero";

  let options = { currency: true };
  if (currency === "USD") options = { ...options, localeCode: "en-US" };
  else if (currency === "EUR") options = { ...options, localeCode: "en-GB" };
  else options = { ...options, localeCode: "en-IN" };

  try {
    const toWords = new ToWords(options);
    return toWords.convert(num);
  } catch (e) {
    return num;
  }
};

export const formatProformaNumber = (number) => {
  const numberString = String(number || 0);
  return `P_INV-${numberString.padStart(6, "0")}`;
};

const ProformaInvoiceDisplay = ({
  invoiceData,
  adminInformation,
  calculation,
  isInvoice = false,
}) => {
  if (!invoiceData || !adminInformation || !calculation) {
    return null;
  }

  const info = invoiceData.proformaInvoiceInfo;
  const items = invoiceData.proformaInvoiceContents;
  const currency = info.currencyType || "INR";

  return (
    // Note: We remove max-w-5xl and mx-auto so it fills the modal body
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
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
            <h1 className="text-3xl font-bold text-gray-900">
              {isInvoice ? "INVOICE" : "PROFORMA"}
            </h1>
            <div className="font-semibold text-gray-700">
              {isInvoice
                ? formatInvoiceNumber(info.proformaInvoiceNumber)
                : formatProformaNumber(info.proformaInvoiceNumber)}
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
                <span>{formatCurrency(calculation.amountPaid, currency)}</span>
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
  );
};

export default ProformaInvoiceDisplay;
