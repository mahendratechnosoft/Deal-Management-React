import React, { useMemo } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { ToWords } from "to-words";

import RobotoRegular from "../../../../public/fonts/Roboto-Regular.ttf";
import RobotoBold from "../../../../public/fonts/Roboto-Bold.ttf";
import RobotoItalic from "../../../../public/fonts/Roboto-Italic.ttf";
import RobotoBoldItalic from "../../../../public/fonts/Roboto-BoldItalic.ttf";
import {
  breakLongText,
  formatInvoiceNumber,
} from "../../BaseComponet/UtilFunctions";
Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoRegular, fontWeight: "normal" },
    { src: RobotoBold, fontWeight: "bold" },
    { src: RobotoItalic, fontWeight: "italic" },
    { src: RobotoBoldItalic, fontWeight: "bold", fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 9,
    paddingTop: 40,
    paddingHorizontal: 40,
    paddingBottom: 65,
    backgroundColor: "#ffffff",
    color: "#374151",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  companyLogo: {
    height: 48,
    objectFit: "contain",
  },
  logoPlaceholder: {
    height: 40,
    width: 120,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    fontSize: 8,
    color: "#6b7280",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  proformaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  proformaNumber: {
    fontSize: 10,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 4,
  },

  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 24,
    gap: 40,
  },
  addressBlock: {
    flex: 1,
  },
  addressBlockRight: {
    flex: 1,
    textAlign: "right",
  },
  addressText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  companyName: {
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
    fontSize: 10,
  },
  addressHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  dateBox: {
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginTop: 10,
    width: 200,
    marginLeft: "auto",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
  },
  dateLabel: {
    color: "#6b7280",
  },
  dateValue: {
    fontWeight: "bold",
  },

  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  th: {
    padding: 6,
    fontSize: 8,
    fontWeight: "bold",
    color: "#4b5563",
    textTransform: "uppercase",
  },
  td: {
    padding: 6,
    fontSize: 9,
  },
  colSno: { width: "8%", textAlign: "center" },
  colItem: { width: "35%" },
  colSac: { width: "15%", textAlign: "right" },
  colQty: { width: "10%", textAlign: "right" },
  colRate: { width: "20%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right", fontWeight: "bold" },
  itemDescription: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 1,
  },

  calculationSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 20,
  },
  wordsSection: {
    flex: 3,
  },
  totalsSection: {
    flex: 2,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  wordsText: {
    fontSize: 9,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#374151",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    marginBottom: 3,
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    marginBottom: 3,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 4,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 4,
  },
  amountPaid: {
    color: "#16a34a",
    fontWeight: "bold",
  },
  amountDue: {
    color: "#dc2626",
    fontWeight: "bold",
  },

  footerSection: {
    marginTop: 20,
  },
  termsText: {
    fontSize: 10,
    lineHeight: 1.4,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 6,
  },
  notesText: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 1.4,
    marginTop: 8,
  },
  authorizationSection: {
    flexDirection: "row",
    gap: 1,
    marginTop: 10,
  },
  authBox: {
    height: "60",
    width: "130",
    // textAlign: "center",
  },
  signatureImage: {
    objectFit: "contain",
    alignSelf: "flex-start",
  },
  signaturePlaceholder: {
    height: 40,
    width: 100,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 8,
    color: "#a1a1aa",
    textTransform: "uppercase",
    marginTop: 2,
  },

  pageFooter: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#888",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    paddingTop: 8,
  },

  paymentDetails: {
    marginBottom: 10,
  },
  paymentProfile: {
    marginBottom: 8,
  },
  paymentProfileTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
  },
  paymentProfileContent: {
    marginLeft: 12,
    fontSize: 9,
    lineHeight: 1.4,
  },
  paymentField: {
    flexDirection: "row",
    marginBottom: 2,
  },
  paymentLabel: {
    fontWeight: "bold",
    width: 80,
  },
  qrCode: {
    width: 80,
    height: 80,
    marginTop: 4,
    marginBottom: 4,
  },
  ftw: {
    fontWeight: "bold",
  },
});

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

const formatProformaNumber = (number) => {
  const numberString = String(number || 0);
  return `P_INV-${numberString.padStart(6, "0")}`;
};

const getSafeImageSrc = (base64String) => {
  if (!base64String) return null;
  if (base64String.startsWith("data:image")) return base64String;
  return `data:;base64,${base64String}`;
};


const ProformaPDF = ({ invoiceData, adminInformation, isInvoice = false }) => {
  // In the calculation useMemo function, replace with this:


const calculation = useMemo(() => {
  if (!invoiceData || !invoiceData.proformaInvoiceContents) {
    return {
      subTotal: 0,
      discount: 0,
      discountPercentage: 0,
      taxableAmount: 0,
      taxAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      grandTotal: 0,
      amountPaid: 0,
      amountDue: 0,
    };
  }

  const info = invoiceData.proformaInvoiceInfo;
  const items = invoiceData.proformaInvoiceContents;

  // Calculate subtotal
  const subTotal = items.reduce((acc, item) => {
    return acc + Number(item.quantity) * Number(item.rate);
  }, 0);

  // Calculate discount
  const discountPercentage = Number(info.discount) || 0;
  const discountAmount = Number(
    (subTotal * (discountPercentage / 100)).toFixed(2)
  );
  const taxableAmount = Math.max(0, subTotal - discountAmount);

  // Initialize tax amounts
  let taxAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  // Handle different tax types
  const taxType = info.taxType || "No Tax";

  if (taxType === "CGST+SGST") {
    // For CGST+SGST (intra-state)
    const cgstPercentage = Number(info.cgstPercentage) || 0;
    const sgstPercentage = Number(info.sgstPercentage) || 0;

    cgstAmount = Number((taxableAmount * (cgstPercentage / 100)).toFixed(2));
    sgstAmount = Number((taxableAmount * (sgstPercentage / 100)).toFixed(2));
    taxAmount = cgstAmount + sgstAmount;
  } else if (taxType === "IGST") {
    // For IGST (inter-state)
    const igstPercentage = Number(info.taxPercentage) || 0;
    igstAmount = Number((taxableAmount * (igstPercentage / 100)).toFixed(2));
    taxAmount = igstAmount;
  } else if (taxType !== "No Tax") {
    // For other tax types (GST, VAT, etc.)
    const taxRate = Number(info.taxPercentage) || 0;
    taxAmount = Number((taxableAmount * (taxRate / 100)).toFixed(2));
  }

  // Calculate final totals
  const grandTotal = taxableAmount + taxAmount;
  const amountPaid = Number(info.paidAmount) || 0;
  const amountDue = Math.max(0, grandTotal - amountPaid);

  return {
    subTotal,
    discount: discountAmount,
    discountPercentage,
    taxableAmount,
    taxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    grandTotal,
    amountPaid,
    amountDue,
  };
}, [invoiceData]);
  // Create a new TaxRows component to handle tax display:
 const TaxRows = () => {
   const info = invoiceData.proformaInvoiceInfo;
   const taxType = info.taxType || "No Tax";

   if (taxType === "CGST+SGST") {
     return (
       <>
         <View style={styles.totalRow}>
           <Text>CGST ({info.cgstPercentage || 0}%)</Text>
           <Text>{formatCurrency(calculation.cgstAmount, currency)}</Text>
         </View>
         <View style={styles.totalRow}>
           <Text>SGST ({info.sgstPercentage || 0}%)</Text>
           <Text>{formatCurrency(calculation.sgstAmount, currency)}</Text>
         </View>
       </>
     );
   }

   if (taxType === "IGST") {
     return (
       <View style={styles.totalRow}>
         <Text>IGST ({info.taxPercentage || 0}%)</Text>
         <Text>{formatCurrency(calculation.igstAmount, currency)}</Text>
       </View>
     );
   }

   if (taxType !== "No Tax") {
     return (
       <View style={styles.totalRow}>
         <Text>
           {taxType} ({info.taxPercentage || 0}%)
         </Text>
         <Text>{formatCurrency(calculation.taxAmount, currency)}</Text>
       </View>
     );
   }

   return (
     <View style={styles.totalRow}>
       <Text>Tax</Text>
       <Text>{formatCurrency(0, currency)}</Text>
     </View>
   );
 };



  // Also update the formatCurrency function to handle different currencies properly:
const formatCurrency = (amount, currencyType) => {
  const symbol = getCurrencySymbol(currencyType);
  const numAmount = Number(amount) || 0;
  const formattedAmount = numAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formattedAmount}`;
};


  // Optional: Add this if you want to format amounts in Indian numbering system for INR:
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

  if (!invoiceData || !adminInformation) {
    return (
      <Document>
        <Page style={styles.page}>
          <Text>Error: Data not provided.</Text>
        </Page>
      </Document>
    );
  }

  const info = invoiceData.proformaInvoiceInfo;
  const items = invoiceData.proformaInvoiceContents;
  const currency = info.currencyType || "INR";

  let s = { ...styles.statusBadge };
  const getStatusStyles = (status) => {
    switch (status) {
      case "Paid":
        s.backgroundColor = "#dcfce7";
        s.color = "#16a34a";
        break;
      case "Partially Paid":
        s.backgroundColor = "#fef9c3";
        s.color = "#ca8a04";
        break;
      default:
        s.backgroundColor = "#fee2e2";
        s.color = "#dc2626";
        break;
    }
    return s;
  };

  return (
    <Document
      title={
        isInvoice
          ? formatInvoiceNumber(info.invoiceNumber)
          : formatProformaNumber(info.proformaInvoiceNumber)
      }
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {adminInformation && adminInformation.logo ? (
              <Image
                src={getSafeImageSrc(adminInformation.logo)}
                style={styles.companyLogo}
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>
                  Logo not provided
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.proformaTitle}>
              {isInvoice ? "INVOICE" : "PROFORMA"}
            </Text>
            <Text style={styles.proformaNumber}>
              {isInvoice
                ? formatInvoiceNumber(info.invoiceNumber)
                : formatProformaNumber(info.proformaInvoiceNumber)}
            </Text>
            <Text style={getStatusStyles(info.status)}>
              {info.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.companyName}>
              {breakLongText(adminInformation?.companyName, 50)}
            </Text>
            <Text style={styles.addressText}>
              {breakLongText(adminInformation?.address, 50)}
              {adminInformation?.gstNumber && (
                <>
                  {"\n"}
                  <Text style={{ fontWeight: "bold" }}>GST Number:</Text>{" "}
                  {adminInformation.gstNumber}
                </>
              )}
              {adminInformation?.panNumber && (
                <>
                  {"\n"}
                  <Text style={{ fontWeight: "bold" }}>PAN:</Text>{" "}
                  {adminInformation.panNumber}
                </>
              )}
              {adminInformation?.phone && (
                <>
                  {"\n"}
                  <Text style={{ fontWeight: "bold" }}>Mobile No:</Text>{" "}
                  {adminInformation.phone}
                </>
              )}
              {adminInformation?.companyEmail && (
                <>
                  {"\n"}
                  <Text style={{ fontWeight: "bold" }}>Email:</Text>{" "}
                  {breakLongText(adminInformation.companyEmail, 30)}
                </>
              )}
              {adminInformation?.website && (
                <>
                  {"\n"}
                  <Text style={{ fontWeight: "bold" }}>Website:</Text>{" "}
                  {breakLongText(adminInformation.website, 30)}
                </>
              )}
            </Text>
          </View>
          <View style={styles.addressBlockRight}>
            <Text style={styles.addressHeader}>Bill To</Text>
            <Text style={styles.companyName}>
              {breakLongText(info.companyName, 47)}
            </Text>
            <Text style={styles.addressText}>
              {breakLongText(info.billingStreet, 50)}
              {"\n"}
              {info.billingCity}, {info.billingState} {info.billingZipCode}
              {"\n"}
              {info.billingCountry}
            </Text>

            {info?.shippingStreet && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.addressHeader}>Ship To</Text>
                <Text style={styles.addressText}>
                  {breakLongText(info.shippingStreet, 50)}
                  {"\n"}
                  {info.shippingCity}, {info.shippingState}{" "}
                  {info.shippingZipCode}
                  {"\n"}
                  {info.shippingCountry}
                </Text>
              </View>
            )}

            <Text style={{ ...styles.addressText, marginTop: 8 }}>
              {info?.gstin && (
                <>
                  <Text style={{ fontWeight: "bold" }}>GST Number:</Text>{" "}
                  {info.gstin}
                </>
              )}
              {info?.panNumber && (
                <>
                  {"\n"}
                  <Text style={{ fontWeight: "bold" }}>PAN:</Text>{" "}
                  {info.panNumber}
                </>
              )}
              {info?.mobileNumber && (
                <>
                  {"\n"}
                  <Text style={{ fontWeight: "bold" }}>Mobile No:</Text>{" "}
                  {info.mobileNumber}
                </>
              )}
              {info?.email && (
                <>
                  {"\n"}
                  <Text style={{ fontWeight: "bold" }}>Email:</Text>{" "}
                  {breakLongText(info.email, 30)}
                </>
              )}
            </Text>

            <View style={styles.dateBox}>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Invoice Date:</Text>
                <Text style={styles.dateValue}>
                  {formatDate(info.proformaInvoiceDate)}
                </Text>
              </View>
              {info.dueDate && (
                <View style={{ ...styles.dateRow, marginTop: 4 }}>
                  <Text style={styles.dateLabel}>Due Date:</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(info.dueDate)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colSno]}>#</Text>
            <Text style={[styles.th, styles.colItem]}>Item</Text>
            <Text style={[styles.th, styles.colSac]}>SAC Code</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colAmount]}>Amount</Text>
          </View>
          {/* Table Body */}
          {items.map((item, index) => (
            <View
              key={item.proformaInvoiceContentId || index}
              style={styles.tableRow}
              wrap={false}
            >
              <Text style={[styles.td, styles.colSno]}>{index + 1}</Text>
              <View style={[styles.td, styles.colItem]}>
                <Text style={{ fontWeight: "bold" }}>
                  {breakLongText(item.item, 40)}
                </Text>
                <Text style={styles.itemDescription}>
                  {breakLongText(item.description, 45)}
                </Text>
              </View>
              <Text style={[styles.td, styles.colSac]}>
                {breakLongText(item.sacCode, 20)}
              </Text>
              <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.colRate]}>
                {breakLongText(formatCurrency(item.rate, currency), 16)}
              </Text>
              <Text style={[styles.td, styles.colAmount]}>
                {breakLongText(
                  formatCurrency(item.quantity * item.rate, currency),
                  16
                )}
              </Text>
            </View>
          ))}
        </View>

        {/* Calculation Section */}
        <View style={styles.calculationSection} wrap={false}>
          <View style={styles.wordsSection}>
            <Text style={styles.sectionTitle}>Amount in Words</Text>
            <Text style={styles.wordsText}>
              {/* Using info.totalAmount as in your original component */}
              {numberToWords(info.totalAmount, currency)} Only
            </Text>
          </View>
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text>Sub Total</Text>
              <Text>{formatCurrency(calculation.subTotal, currency)}</Text>
            </View>
            {calculation.discount > 0 && (
              <>
                <View style={styles.totalRow}>
                  <Text>Discount ({calculation.discountPercentage}%)</Text>
                  <Text>
                    - {formatCurrency(calculation.discount, currency)}
                  </Text>
                </View>
                <View style={styles.totalRowBold}>
                  <Text>Taxable Amount</Text>
                  <Text>
                    {formatCurrency(calculation.taxableAmount, currency)}
                  </Text>
                </View>
              </>
            )}
            <TaxRows />
            <View style={styles.divider} />
            <View style={styles.grandTotalRow}>
              <Text>Grand Total</Text>
              <Text>{formatCurrency(calculation.grandTotal, currency)}</Text>
            </View>
            {calculation.amountPaid > 0 && (
              <View style={[styles.totalRow, { marginTop: 4 }]}>
                <Text style={styles.amountPaid}>Amount Paid</Text>
                <Text style={styles.amountPaid}>
                  {formatCurrency(calculation.amountPaid, currency)}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, { marginTop: 2 }]}>
              <Text style={styles.amountDue}>Amount Due</Text>
              <Text style={styles.amountDue}>
                {formatCurrency(calculation.amountDue, currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer (Terms, Notes, Auth) */}
        <View style={styles.footerSection}>
          <View style={styles.paymentDetails} wrap={false}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: "#111827",
                  fontSize: 10,
                  fontWeight: "bold",
                  marginBottom: 6,
                },
              ]}
            >
              Payment Details
            </Text>

            {invoiceData.paymentProfiles &&
            invoiceData.paymentProfiles.length > 0 ? (
              <View style={[styles.termsText, { color: "black" }]}>
                {/* BANK Profiles */}
                {invoiceData.paymentProfiles
                  .filter((profile) => profile.type === "BANK")
                  .map((profile, index) => (
                    <View
                      key={profile.paymentProfileId || index}
                      style={styles.paymentProfile}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <View>
                          <Text style={styles.ftw}>{index + 1}.</Text>
                        </View>
                        <View>
                          <View style={styles.paymentField}>
                            <Text style={styles.paymentLabel}>Bank Name:</Text>
                            <Text>{profile.bankName || "N/A"}</Text>
                          </View>
                          <View style={styles.paymentField}>
                            <Text style={styles.paymentLabel}>
                              Account Number:
                            </Text>
                            <Text>{profile.accountNumber || "N/A"}</Text>
                          </View>
                          <View style={styles.paymentField}>
                            <Text style={styles.paymentLabel}>
                              Account Holder Name:
                            </Text>
                            <Text>{profile.accountHolderName || "N/A"}</Text>
                          </View>
                          <View style={styles.paymentField}>
                            <Text style={styles.paymentLabel}>IFSC Code:</Text>
                            <Text>{profile.ifscCode || "N/A"}</Text>
                          </View>
                          <View style={styles.paymentField}>
                            <Text style={styles.paymentLabel}>Branch:</Text>
                            <Text>{profile.branchName || "N/A"}</Text>
                          </View>
                          <View style={{ height: 8 }}></View>{" "}
                        </View>
                      </View>

                      {/* Spacing between profiles */}
                    </View>
                  ))}

                {/* UPI Profiles */}
                {invoiceData.paymentProfiles
                  .filter((profile) => profile.type === "UPI")
                  .map((profile, index) => {
                    const bankCount = invoiceData.paymentProfiles.filter(
                      (p) => p.type === "BANK"
                    ).length;
                    return (
                      <View
                        key={profile.paymentProfileId || index}
                        style={styles.paymentProfile}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                          }}
                        >
                          <View>
                            <Text style={styles.ftw}>
                              {" "}
                              {bankCount + index + 1}.
                            </Text>
                          </View>
                          <View>
                            <View style={styles.paymentField}>
                              <Text style={styles.paymentLabel}>UPI ID:</Text>
                              <Text>{profile.upiId || "N/A"}</Text>
                            </View>
                            {profile.qrCodeImage && (
                              <>
                                <View style={styles.paymentField}>
                                  <Text style={styles.paymentLabel}>
                                    Scan QR Code:
                                  </Text>
                                  <Text></Text>
                                </View>
                                <View
                                  style={{
                                    alignItems: "flex-start",
                                    marginTop: 2,
                                  }}
                                >
                                  <Image
                                    src={getSafeImageSrc(profile.qrCodeImage)}
                                    style={styles.qrCode}
                                  />
                                </View>
                              </>
                            )}
                          </View>
                        </View>
                        <View style={{ height: 8 }}></View>{" "}
                        {/* Spacing between profiles */}
                      </View>
                    );
                  })}
              </View>
            ) : (
              <Text
                style={{ fontSize: 9, color: "#6b7280", fontStyle: "italic" }}
              >
                No payment details provided
              </Text>
            )}
          </View>

          <View>
            <Text
              style={[
                styles.sectionTitle,
                { color: "#111827", fontSize: 10, fontWeight: "bold" },
              ]}
            >
              Terms & Conditions
            </Text>
            <Text style={[styles.termsText, { color: "#6b7280" }]}>
              {breakLongText(info.termsAndConditions || "NA", 128)}
            </Text>
          </View>

          <View style={{ marginTop: 8 }}>
            <Text
              style={[
                styles.sectionTitle,
                { color: "#111827", fontSize: 10, fontWeight: "bold" },
              ]}
            >
              Notes
            </Text>
            <Text style={styles.notesText}>
              {breakLongText(info.notes || "NA", 128)}
            </Text>
          </View>
          <View wrap={false}>
            <Text
              style={[styles.sectionTitle, { color: "#111827", marginTop: 16 }]}
            >
              Authorization
            </Text>
            <View style={styles.authorizationSection}>
              <View style={styles.authBox}>
                {info.companySignature ? (
                  <Image
                    src={getSafeImageSrc(info.companySignature)}
                    style={styles.signatureImage}
                  />
                ) : (
                  <View style={styles.signaturePlaceholder}>
                    <Text style={styles.logoPlaceholderText}>No Signature</Text>
                  </View>
                )}
              </View>
              {info.companyStamp && (
                <View style={styles.authBox}>
                  <Image
                    src={getSafeImageSrc(info.companyStamp)}
                    style={styles.signatureImage}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* --- THIS IS THE FIXED FOOTER --- */}
        <View style={styles.pageFooter} fixed>
          <Text>Thank you for your business!</Text>
          <Text style={{ fontWeight: "bold" }}>
            {breakLongText(adminInformation?.companyName, 90)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProformaPDF;
