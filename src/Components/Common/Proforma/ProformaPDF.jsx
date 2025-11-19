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
import { formatInvoiceNumber } from "../../BaseComponet/UtilFunctions";
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
  colItem: { width: "42%" },
  colSac: { width: "15%", textAlign: "right" },
  colQty: { width: "10%", textAlign: "right" },
  colRate: { width: "15%", textAlign: "right" },
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
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.4,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 6,
  },
  notesText: {
    fontSize: 8,
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

const formatCurrency = (amount, currencyType) => {
  const symbol = getCurrencySymbol(currencyType);
  const formattedAmount = (Number(amount) || 0).toFixed(2);
  return `${symbol}${formattedAmount}`;
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
  return `data:image/png;base64,${base64String}`;
};

const ProformaPDF = ({ invoiceData, adminInformation, isInvoice = false }) => {
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
              {adminInformation?.companyName}
            </Text>
            <Text style={styles.addressText}>
              {adminInformation?.address}
              {adminInformation?.gstNumber &&
                `\nGST Number: ${adminInformation.gstNumber}`}
              {adminInformation?.panNumber &&
                `\nPAN: ${adminInformation.panNumber}`}
              {adminInformation?.phone &&
                `\nMobile No: ${adminInformation.phone}`}
              {adminInformation?.companyEmail &&
                `\nEmail: ${adminInformation.companyEmail}`}
            </Text>
          </View>
          <View style={styles.addressBlockRight}>
            <Text style={styles.addressHeader}>Bill To</Text>
            <Text style={styles.companyName}>{info.companyName}</Text>
            <Text style={styles.addressText}>
              {info.billingStreet}
              {"\n"}
              {info.billingCity}, {info.billingState} {info.billingZipCode}
              {"\n"}
              {info.billingCountry}
            </Text>

            {info?.shippingStreet && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.addressHeader}>Ship To</Text>
                <Text style={styles.addressText}>
                  {info.shippingStreet}
                  {"\n"}
                  {info.shippingCity}, {info.shippingState}{" "}
                  {info.shippingZipCode}
                  {"\n"}
                  {info.shippingCountry}
                </Text>
              </View>
            )}

            <Text style={{ ...styles.addressText, marginTop: 8 }}>
              {info?.gstin && `GST Number: ${info.gstin}`}
              {info?.panNumber && `\nPAN: ${info.panNumber}`}
              {info?.mobileNumber && `\nMobile No: ${info.mobileNumber}`}
              {info?.email && `\nEmail: ${info.email}`}
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
                <Text style={{ fontWeight: "bold" }}>{item.item}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              <Text style={[styles.td, styles.colSac]}>{item.sacCode}</Text>
              <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.colRate]}>
                {formatCurrency(item.rate, currency)}
              </Text>
              <Text style={[styles.td, styles.colAmount]}>
                {formatCurrency(item.quantity * item.rate, currency)}
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
            <View style={styles.totalRow}>
              <Text>
                {info.taxType} ({info.taxPercentage}%)
              </Text>
              <Text>{formatCurrency(calculation.taxAmount, currency)}</Text>
            </View>
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
          {info.termsAndConditions && (
            <View>
              <Text style={[styles.sectionTitle, { color: "#111827" }]}>
                Terms & Conditions
              </Text>
              <Text style={styles.termsText}>{info.termsAndConditions}</Text>
            </View>
          )}
          {info.notes && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.sectionTitle, { color: "#111827" }]}>
                Notes
              </Text>
              <Text style={styles.notesText}>{info.notes}</Text>
            </View>
          )}
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
            {adminInformation?.companyName}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProformaPDF;
