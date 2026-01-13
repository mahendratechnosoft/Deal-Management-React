import React, { useMemo } from "react";
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

const TaxDisplayRows = ({ invoiceInfo, taxableAmount, currency }) => {
  const { taxType, taxPercentage, cgstPercentage, sgstPercentage } =
    invoiceInfo;

  // If it's CGST+SGST, split the tax
  if (taxType === "CGST+SGST") {
    const cgst = cgstPercentage || 0;
    const sgst = sgstPercentage || 0;

    const cgstAmount = taxableAmount * (cgst / 100);
    const sgstAmount = taxableAmount * (sgst / 100);

    return (
      <>
        <div className="flex justify-between text-sm text-gray-600">
          <span>CGST ({cgst.toFixed(2)}%)</span>
          <span className="font-medium">
            {formatCurrency(cgstAmount, currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>SGST ({sgst.toFixed(2)}%)</span>
          <span className="font-medium">
            {formatCurrency(sgstAmount, currency)}
          </span>
        </div>
      </>
    );
  }

  // For other tax types
  if (taxType !== "No Tax" && taxPercentage > 0) {
    const totalTax = taxableAmount * (taxPercentage / 100);
    return (
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          {taxType} ({taxPercentage}%)
        </span>
        <span className="font-medium">
          {formatCurrency(totalTax, currency)}
        </span>
      </div>
    );
  }

  return null;
};

const ProformaInvoiceDisplay = ({
  invoiceData,
  adminInformation,
  calculation,
  isInvoice = false,

  hideActionButtons = false,
  isPublicView = false,
}) => {
  if (!invoiceData || !adminInformation || !calculation) {
    return null;
  }

  const info = invoiceData.proformaInvoiceInfo;
  const items = invoiceData.proformaInvoiceContents;
  const currency = info.currencyType || "INR";
  const paymentProfiles = invoiceData.paymentProfiles || [];

  // Add this calculation block - it's the same logic as ProposalInvoiceDisplay
  const {
    subtotal,
    discountAmount,
    taxableAmount,
    total,
    taxAmount,
    cgstPercentage,
    sgstPercentage,
  } = useMemo(() => {
    const info = invoiceData.proformaInvoiceInfo;
    const items = invoiceData.proformaInvoiceContents;
    const cType = info.currencyType || "INR";

    const sub = items.reduce(
      (acc, item) =>
        acc + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );
    const discount = Number(info.discount) || 0;
    const dAmount = (sub * discount) / 100;
    const tAmount = sub - dAmount;

    // --- CGST+SGST Tax Logic ---
    const tType = info.taxType || "No Tax";
    let totalTax = 0;
    let cgst = 0;
    let sgst = 0;

    if (tType === "CGST+SGST") {
      cgst = Number(info.cgstPercentage) || 0;
      sgst = Number(info.sgstPercentage) || 0;
      const cgstAmount = tAmount * (cgst / 100);
      const sgstAmount = tAmount * (sgst / 100);
      totalTax = cgstAmount + sgstAmount;
    } else {
      const tPercentage = Number(info.taxPercentage) || 0;
      totalTax = tAmount * (tPercentage / 100);
    }

    const grandTotal = tAmount + totalTax;

    return {
      subtotal: sub,
      discountAmount: dAmount,
      taxableAmount: tAmount,
      total: grandTotal,
      taxAmount: totalTax,
      cgstPercentage: cgst,
      sgstPercentage: sgst,
    };
  }, [invoiceData]);

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
                ? info.formatedInvoiceNumber
                : info.formatedProformaInvoiceNumber}
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
              <p className="font-bold text-gray-900 break-words">
                {adminInformation?.companyName}
              </p>
              {adminInformation?.address && (
                <p className="break-words">{adminInformation.address}</p>
              )}
              {adminInformation?.gstNumber && (
                <p>
                  <span className="font-bold">GST Number: </span>
                  {adminInformation.gstNumber}
                </p>
              )}
              {adminInformation?.panNumber && (
                <p>
                  <span className="font-bold">PAN: </span>
                  {adminInformation.panNumber}
                </p>
              )}
              {adminInformation?.phone && (
                <p>
                  <span className="font-bold">Mobile No: </span>
                  {adminInformation.phone}
                </p>
              )}
              {adminInformation?.companyEmail && (
                <p className="break-all">
                  <span className="font-bold">Email: </span>
                  {adminInformation.companyEmail}
                </p>
              )}
              {adminInformation?.website && (
                <p className="break-all">
                  <span className="font-bold">Website: </span>
                  {adminInformation.website}
                </p>
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
              <p className="font-bold text-gray-900 break-words">
                {info.companyName}
              </p>
              <p className="break-words">{info.billingStreet}</p>
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
                <p className="break-words">{info.shippingStreet}</p>
                <p>
                  {info.shippingCity}, {info.shippingState}{" "}
                  {info.shippingZipCode}
                </p>
                <p>{info.shippingCountry}</p>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-700 leading-relaxed">
            {info?.gstin && (
              <p>
                <span className="font-bold">GST Number:</span> {info.gstin}
              </p>
            )}
            {info?.panNumber && (
              <p>
                <span className="font-bold">PAN:</span> {info.panNumber}
              </p>
            )}
            {info?.mobileNumber && (
              <p>
                <span className="font-bold">Mobile No:</span>{" "}
                {info.mobileNumber}
              </p>
            )}
            {info?.email && (
              <p className="break-all">
                <span className="font-bold">Email:</span> {info.email}
              </p>
            )}
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
        <div className="border rounded-lg">
          <table className="w-full text-sm text-left table-fixed">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="px-4 py-3 text-center w-1/12">#</th>
                <th className="px-4 py-3 w-5/12">Item</th>
                <th className="px-4 py-3 text-right w-2/12">SAC Code</th>
                <th className="px-4 py-3 text-right w-1/12">Qty</th>
                <th className="px-4 py-3 text-right w-3/12">Rate</th>
                <th className="px-4 py-3 text-right w-2/12">Amount</th>
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
                  <td className="px-4 py-3 break-words whitespace-normal">
                    <p className="font-medium text-gray-900">{item.item}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {item.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right align-top break-words">
                    {item.sacCode}
                  </td>
                  <td className="px-4 py-3 text-right align-top break-words">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right align-top break-words">
                    {formatCurrency(item.rate, currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 align-top break-all">
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
                {formatCurrency(subtotal, currency)}
              </span>
            </div>

            {/* Discount */}
            {info.discount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Discount ({info.discount}%)</span>
                <span className="font-medium">
                  - {formatCurrency(discountAmount, currency)}
                </span>
              </div>
            )}

            {/* Show CGST and SGST separately using TaxDisplayRows */}
            {info.taxType === "CGST+SGST" && (
              <>
                {info.cgstPercentage > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>CGST ({info.cgstPercentage.toFixed(2)}%)</span>
                    <span className="font-medium">
                      {formatCurrency(
                        taxableAmount * (info.cgstPercentage / 100),
                        currency
                      )}
                    </span>
                  </div>
                )}
                {info.sgstPercentage > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>SGST ({info.sgstPercentage.toFixed(2)}%)</span>
                    <span className="font-medium">
                      {formatCurrency(
                        taxableAmount * (info.sgstPercentage / 100),
                        currency
                      )}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* For other tax types */}
            {info.taxType !== "CGST+SGST" &&
              info.taxType !== "No Tax" &&
              info.taxPercentage > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {info.taxType} ({info.taxPercentage}%)
                  </span>
                  <span className="font-medium">
                    {formatCurrency(
                      taxableAmount * (info.taxPercentage / 100),
                      currency
                    )}
                  </span>
                </div>
              )}

            {/* Taxable Amount - Only show if there's a discount */}
            {info.discount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxable Amount</span>
                <span className="font-medium">
                  {formatCurrency(taxableAmount, currency)}
                </span>
              </div>
            )}

            <div className="h-px bg-gray-200 my-2"></div>

            {/* Grand Total */}
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Grand Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>

            {/* Amount Paid - Use calculation.amountPaid from props */}
            {calculation.amountPaid > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-medium pt-2">
                <span>Amount Paid</span>
                <span>{formatCurrency(calculation.amountPaid, currency)}</span>
              </div>
            )}

            {/* Amount Due - Use calculation.amountDue from props */}
            <div className="flex justify-between text-sm text-red-600 font-medium pt-2">
              <span>Amount Due</span>
              <span>{formatCurrency(calculation.amountDue, currency)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-8">
        {/* Terms */}

        {/* Simple Payment Details Section - Text Only */}
        {/* Simple Payment Details Section - Text Only */}
        <div className="mb-8">
          <h3 className="font-bold text-black-800 text-lg mb-2">
            Payment Details
          </h3>

          {paymentProfiles && paymentProfiles.length > 0 ? (
            <div className="space-y-4">
              <div className="border-l-2 border-black-200 ">
                {/* First show all BANK profiles with serial numbers */}
                {paymentProfiles
                  .filter((profile) => profile.type === "BANK")
                  .map((profile, index) => (
                    <div
                      key={profile.paymentProfileId || index}
                      className="text-black-700"
                    >
                      <div className="text-sm space-y-1 ml-2">
                        <div className="space-y-1 ml-3 leading-relaxed flex">
                          <span className="font-medium mr-1 mt-1">
                            {index + 1}.
                          </span>
                          <div>
                            <p className="flex">
                              <span className="font-medium w-40">
                                Bank Name:
                              </span>
                              <span>{profile.bankName || "N/A"}</span>
                            </p>
                            <p className="flex">
                              <span className="font-medium w-40">
                                Account Number:
                              </span>
                              <span>{profile.accountNumber || "N/A"}</span>
                            </p>
                            <p className="flex">
                              <span className="font-medium w-40">
                                Account Holder Name:
                              </span>
                              <span>{profile.accountHolderName || "N/A"}</span>
                            </p>
                            <p className="flex">
                              <span className="font-medium w-40">
                                IFSC Code:
                              </span>
                              <span>{profile.ifscCode || "N/A"}</span>
                            </p>
                            <p className="flex">
                              <span className="font-medium w-40">Branch:</span>
                              <span>{profile.branchName || "N/A"}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Then show all UPI profiles with serial numbers */}
                {paymentProfiles
                  .filter((profile) => profile.type === "UPI")
                  .map((profile, index) => (
                    <div
                      key={profile.paymentProfileId || index}
                      className="text-black-700"
                    >
                      <div className="text-sm space-y-2 ml-2">
                        <div className="flex items-center"></div>

                        <div className="space-y-1 ml-3 flex">
                          <span className="font-medium mr-1 mt-1">
                            {paymentProfiles.filter((p) => p.type === "BANK")
                              .length +
                              index +
                              1}
                            .
                          </span>
                          <div>
                            <p className="flex">
                              <span className="font-medium w-40">UPI ID:</span>
                              <span>{profile.upiId || "N/A"}</span>
                            </p>
                            {profile.qrCodeImage && (
                              <div className="w-36 h-36">
                                <p className="font-medium mb-1">
                                  Scan QR Code:
                                </p>
                                <img
                                  src={`data:;base64,${profile.qrCodeImage}`}
                                  alt="QR Code"
                                  className="w-36 h-36"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Finally show CASH profiles with serial numbers */}
                {paymentProfiles
                  .filter((profile) => profile.type === "CASH")
                  .map((profile, index) => (
                    <div
                      key={profile.paymentProfileId || index}
                      className="text-black-700"
                    >
                      <div className="text-sm ml-2">
                        <div className="flex items-center">
                          <span className="font-medium mr-3">
                            {paymentProfiles.filter(
                              (p) => p.type === "BANK" || p.type === "UPI"
                            ).length +
                              index +
                              1}
                            .
                          </span>
                          <span className="font-medium">Cash Payment:</span>
                        </div>
                        <p className="ml-6">
                          Pay in cash to company representative
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-black-500">
              No payment details provided
            </p>
          )}
        </div>

        <div className="mb-6">
          <p className="font-bold text-black-900 uppercase mb-2">
            Terms & Conditions
          </p>
          <p className="text-xs text-black-500 whitespace-pre-line leading-relaxed border-l-2 border-gray-200 pl-3 break-all">
            {info.termsAndConditions || "NA"}
          </p>
        </div>

        {/* Notes */}

        <div>
          <p className="font-bold text-black-900 uppercase mb-2">Notes</p>
          <p className="text-xs text-black-500 whitespace-pre-line break-all">
            {info.notes || "NA"}
          </p>
        </div>
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
