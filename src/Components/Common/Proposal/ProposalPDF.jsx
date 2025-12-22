// ProposalPDF.js
import React, { useMemo } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { ToWords } from "to-words";
import RobotoRegular from "../../../../public/fonts/Roboto-Regular.ttf";
import RobotoBold from "../../../../public/fonts/Roboto-Bold.ttf";
import { breakLongText } from "../../BaseComponet/UtilFunctions";

Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoRegular, fontWeight: "normal" },
    { src: RobotoBold, fontWeight: "bold" },
  ],
});

// --- Helper Functions (No Changes) ---

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
  let options = { currency: true };
  switch (currency) {
    case "INR":
      options.localeCode = "en-IN";
      options.currencyOptions = {
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: { name: "Paisa", plural: "Paise", symbol: "" },
      };
      break;
    case "USD":
      options.localeCode = "en-US";
      options.currencyOptions = {
        name: "Dollar",
        plural: "Dollars",
        symbol: "$",
        fractionalUnit: { name: "Cent", plural: "Cents", symbol: "" },
      };
      break;
    case "EUR":
      options.localeCode = "en-GB";
      options.currencyOptions = {
        name: "Euro",
        plural: "Euros",
        symbol: "€",
        fractionalUnit: { name: "Cent", plural: "Cents", symbol: "" },
      };
      break;
    default:
      options.currency = false;
      options.localeCode = "en-US";
  }
  try {
    const toWords = new ToWords(options);
    return toWords.convert(num);
  } catch (e) {
    return `[${Number(num).toFixed(2)}]`;
  }
};

const formatProposalNumber = (number) => {
  const numberString = String(number || 0);
  return `PROP-${numberString.padStart(6, "0")}`;
};

// --- PDF Styles ---
const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 70,
    color: "#333", // Default text color
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    paddingBottom: 10,
  },
  logo: {
    height: 32,
    width: "auto",
  },
  headerInfo: {
    textAlign: "right",
  },
  proposalNumber: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  headerText: {
    fontSize: 10,
    color: "#555",
  },
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    lineHeight: 0.8, // Add some space between address lines
  },
  addressBlock: {
    width: "45%",
  },
  subHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000", // Black color
    marginBottom: 4,
  },
  // <-- NEW STYLE for request #3
  companyName: {
    fontWeight: "bold",
    color: "#000",
    marginBottom: 2,
    fontSize: 10,
  },
  // <-- NEW STYLE for request #3
  label: {
    fontWeight: "bold",
    color: "#000",
  },
  subjectSection: {
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    paddingVertical: 8,
    marginBottom: 20,
  },
  // Table Styles
  table: {
    width: "100%",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#999",
  },
  tableHeaderCol: {
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  tableCol: {
    padding: 8,
  },
  col_s: { width: "8%" },
  col_l: { width: "42%" },
  col_m: { width: "18%" },
  textRight: { textAlign: "right" },
  itemDesc: {
    fontSize: 9,
    color: "#555",
    width: "100%",
  },
  // Totals Section
  totalsSection: {
    width: "45%",
    alignSelf: "flex-end",
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontFamily: "Helvetica",
  },
  totalValue: {
    fontWeight: "bold",
  },
  taxableRow: {
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    marginTop: 4,
    paddingTop: 4,
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: "#333",
    marginTop: 5,
    paddingTop: 5,
  },
  grandTotalLabel: {
    fontWeight: "bold",
    fontSize: 12,
  },
  grandTotalValue: {
    fontWeight: "bold",
    fontSize: 12,
  },
  // Words
  wordsSection: {
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    marginTop: 15,
    paddingTop: 8,
  },
  wordsHeader: {
    fontWeight: "bold",
  },
  wordsValue: {
    fontSize: 10,
  },
  notesAndTermsSection: {
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    marginTop: 15,
    paddingTop: 8,
  },
  sectionContent: {
    fontSize: 10,
    color: "#333",
    width: "100%",
  },

  // NEW STYLES for Payment Details
  paymentDetailsSection: {
    marginBottom: 10,
  },
  paymentProfile: {
    marginBottom: 8,
  },
  paymentProfileTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  paymentProfileContent: {
    marginLeft: 12,
    fontSize: 10,
    lineHeight: 1.4,
  },
  paymentField: {
    flexDirection: "row",
    marginBottom: 2,
  },
  paymentLabel: {
    fontWeight: "bold",
    width: 100,
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

  leftBorder: {
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 6,
  },
  signatureStampSection: {
    pageBreakInside: "avoid",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    marginTop: 5,
    paddingTop: 8,
  },
  logoPlaceholder: {
    height: "60",
    width: "130",
    borderWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  logoPlaceholderText: {
    fontSize: 8,
    color: "#888",
    textAlign: "center",
  },
  imageBlock: {
    height: "60",
    width: "130",
  },
  image: {
    objectFit: "contain",
    alignSelf: "flex-start",
  },
  // Footer
  footer: {
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

const getSafeImageSrc = (base64String) => {
  if (!base64String) return null;
  if (base64String.startsWith("data:image")) return base64String;
  return `data:;base64,${base64String}`;
};

// --- Main PDF Component ---
const ProposalPDF = ({ data }) => {
  const { proposalInfo, proposalContent, adminInformation = {} } = data;

  const paymentProfiles = data.paymentProfiles || [];
  const {
    subtotal,
    discountAmount,
    taxableAmount,
    total,
    currencyType,
    taxPercentage,
    taxType,
    cgstPercentage,
    sgstPercentage,
  } = useMemo(() => {
    if (!data) {
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
    }

    const info = proposalInfo;
    const content = proposalContent;
    const cType = info.currencyType || "INR";

    const sub = content.reduce(
      (acc, item) =>
        acc + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );

    const discount = Number(info.discount) || 0;
    const dAmount = (sub * discount) / 100;
    const tAmount = sub - dAmount;

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
  }, [data]);

  const TaxRows = () => {
    if (taxType === "CGST+SGST") {
      const cgstAmount = taxableAmount * (cgstPercentage / 100);
      const sgstAmount = taxableAmount * (sgstPercentage / 100);

      return (
        <>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              CGST ({cgstPercentage.toFixed(2)}%)
            </Text>
            <Text style={styles.totalValue}>
              {formatCurrency(cgstAmount, currencyType)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              SGST ({sgstPercentage.toFixed(2)}%)
            </Text>
            <Text style={styles.totalValue}>
              {formatCurrency(sgstAmount, currencyType)}
            </Text>
          </View>
        </>
      );
    }

    const totalTaxAmount = taxableAmount * (taxPercentage / 100);

    if (taxType !== "No Tax" && taxPercentage > 0) {
      return (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {taxType} ({taxPercentage.toFixed(2)}%)
          </Text>
          <Text style={styles.totalValue}>
            {formatCurrency(totalTaxAmount, currencyType)}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tax</Text>
        <Text style={styles.totalValue}>{formatCurrency(0, currencyType)}</Text>
      </View>
    );
  };

  return (
    <Document title={formatProposalNumber(proposalInfo.proposalNumber)}>
      <Page size="A4" style={styles.page}>
        {/* 1. Header (No Changes) */}
        <View style={styles.header}>
          {adminInformation.logo ? (
            <View style={styles.imageBlock}>
              <Image
                style={styles.image}
                src={`data:;base64,${adminInformation.logo}`}
              />
            </View>
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>
                Company logo not provided
              </Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.title}>PROPOSAL</Text>
            <View style={styles.proposalNumber}>
              <Text style={styles.headerText}>
                # {formatProposalNumber(proposalInfo.proposalNumber)}
              </Text>
              <Text style={styles.headerText}>
                Date: {formatDate(proposalInfo.proposalDate)}
              </Text>
              <Text style={styles.headerText}>
                Valid Till: {formatDate(proposalInfo.dueDate)}
              </Text>
            </View>
          </View>
        </View>
        {/* 2. Address Section (CHANGED for request #3) */}
        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.subHeader}>From:</Text>
            <Text style={styles.companyName}>
              {breakLongText(adminInformation?.companyName, 50)}
            </Text>
            <Text>{breakLongText(adminInformation?.address, 50)}</Text>
            <Text>
              <Text style={styles.label}>Email: </Text>
              {breakLongText(adminInformation?.companyEmail, 50)}
            </Text>
            <Text>
              <Text style={styles.label}>Phone: </Text>
              {adminInformation?.phone}
            </Text>
            <Text>
              <Text style={styles.label}>GST: </Text>
              {adminInformation?.gstNumber || ""}
            </Text>
            <Text>
              <Text style={styles.label}>Website : </Text>
              {adminInformation?.website || ""}
            </Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.subHeader}>To:</Text>
            <Text style={styles.companyName}>
              {breakLongText(proposalInfo.companyName, 50)}
            </Text>
            <Text>{breakLongText(proposalInfo.street, 50)}</Text>
            <Text>
              {proposalInfo.city}, {proposalInfo.state} - {proposalInfo.zipCode}
            </Text>
            <Text>{proposalInfo.country}</Text>
            <Text>
              <Text style={styles.label}>Email: </Text>
              {breakLongText(proposalInfo.email, 50)}
            </Text>
            <Text>
              <Text style={styles.label}>Phone: </Text>
              {proposalInfo.mobileNumber}
            </Text>
          </View>
        </View>
        {/* 3. Subject (CHANGED for request #4) */}
        <View style={styles.subjectSection}>
          <Text>
            <Text style={styles.subHeader}>Subject: </Text>
            <Text>{proposalInfo.subject}</Text>
          </Text>
        </View>
        {/* 4. Items Table (No Changes) */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCol, styles.col_s]}>#</Text>
            <Text style={[styles.tableHeaderCol, styles.col_l]}>Item</Text>
            <Text style={[styles.tableHeaderCol, styles.col_m]}>Qty</Text>
            <Text style={[styles.tableHeaderCol, styles.col_m]}>Rate</Text>
            <Text
              style={[styles.tableHeaderCol, styles.col_m, styles.textRight]}
            >
              Amount
            </Text>
          </View>
          {/* Table Body */}
          {proposalContent.map((item, index) => (
            <View
              key={item.proposalContentId || index}
              style={styles.tableRow}
              wrap={false}
            >
              <Text style={[styles.tableCol, styles.col_s]}>{index + 1}</Text>
              <View style={[styles.tableCol, styles.col_l]}>
                <Text>{breakLongText(item.item, 40)}</Text>
                <Text style={styles.itemDesc}>
                  {breakLongText(item.description, 44)}
                </Text>
              </View>
              <Text style={[styles.tableCol, styles.col_m]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCol, styles.col_m]}>
                {breakLongText(formatCurrency(item.rate, currencyType), 15)}
              </Text>
              <Text style={[styles.tableCol, styles.col_m, styles.textRight]}>
                {breakLongText(
                  formatCurrency(item.quantity * item.rate, currencyType),
                  15
                )}
              </Text>
            </View>
          ))}
        </View>
        {/* 5. Totals Section (No Changes) */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(subtotal, currencyType)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Discount ({proposalInfo.discount || 0}%)
            </Text>
            <Text style={styles.totalValue}>
              -{formatCurrency(discountAmount, currencyType)}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.taxableRow]}>
            <Text style={styles.totalLabel}>Taxable Amount</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(taxableAmount, currencyType)}
            </Text>
          </View>
          {/* Simplified Tax Row */}
          <TaxRows />
          {/* Grand Total */}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(total, currencyType)}
            </Text>
          </View>
        </View>
        {/* 6. Amount in Words (No Changes) */}
        <View style={styles.wordsSection}>
          <Text>
            <Text style={styles.wordsHeader}>Amount in Words: </Text>
            <Text style={styles.wordsValue}>
              {numberToWords(Number(total.toFixed(2)), currencyType)} only
            </Text>
          </Text>
        </View>

        {/* 7. Notes & Terms (NEW) */}

        <View style={styles.notesAndTermsSection}>
          {/* Payment Details Section - REPLACED Bank Details */}
          {paymentProfiles && paymentProfiles.length > 0 ? (
            <View style={styles.paymentDetailsSection} wrap={false}>
              <Text style={styles.subHeader}>Payment Details:</Text>

              <View style={styles.leftBorder}>
                {/* BANK Profiles */}
                {paymentProfiles
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
                              Account Holder:
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
                          <View style={{ height: 8 }}></View>
                        </View>
                      </View>
                    </View>
                  ))}

                {/* UPI Profiles */}
                {paymentProfiles
                  .filter((profile) => profile.type === "UPI")
                  .map((profile, index) => {
                    const bankCount = paymentProfiles.filter(
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
                        <View style={{ height: 8 }}></View>
                      </View>
                    );
                  })}
              </View>
            </View>
          ) : (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.subHeader}>Payment Details:</Text>
              <Text style={styles.sectionContent}>
                No payment details provided
              </Text>
            </View>
          )}

          {/* Notes Section */}
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.subHeader}>Notes:</Text>
            <Text style={styles.sectionContent}>
              {breakLongText(proposalInfo.notes || "NA", 100)}
            </Text>
          </View>

          {/* Terms & Conditions Section */}
          <View>
            <Text style={styles.subHeader}>Terms & Conditions:</Text>
            <Text style={styles.sectionContent}>
              {breakLongText(proposalInfo.termsAndConditions || "NA", 100)}
            </Text>
          </View>
        </View>
        {/* 8. Signature & Stamp (NEW) */}
        {(proposalInfo.companySignature || proposalInfo.companyStamp) && (
          <View style={styles.signatureStampSection} wrap={false}>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.subHeader}>Authorization:</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 2 }}>
              {proposalInfo.companySignature && (
                <View style={styles.imageBlock}>
                  <Image
                    style={styles.image}
                    src={`data:;base64,${proposalInfo.companySignature}`}
                  />
                </View>
              )}
              {proposalInfo.companyStamp && (
                <View style={styles.imageBlock}>
                  <Image
                    style={styles.image}
                    src={`data:;base64,${proposalInfo.companyStamp}`}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        {/* 9. Footer (No Changes) */}
        <View style={styles.footer} fixed>
          <Text>Thank you for your business!</Text>
          <Text style={{ fontWeight: "bold" }}>
            {breakLongText(adminInformation?.companyName, 90)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProposalPDF;
