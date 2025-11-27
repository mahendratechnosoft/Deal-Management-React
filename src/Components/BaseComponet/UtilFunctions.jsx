import { ToWords } from "to-words";

export const formatInvoiceNumber = (number) => {
  const numberString = String(number || 0);
  return `INV-${numberString.padStart(6, "0")}`;
};

export const formatCurrency = (amount, currencyCode) => {
  const value = Number(amount) || 0;
  const code = currencyCode || "INR";

  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const parts = formatter.formatToParts(value);
    const symbol = parts.find((part) => part.type === "currency")?.value || "";
    const number = parts
      .filter((part) => part.type !== "currency")
      .map((part) => part.value)
      .join("");

    return `${symbol} ${number}`;
  } catch (e) {
    return `${code} ${value.toFixed(2)}`;
  }
};

export const formatProposalNumber = (number) =>
  `PROP-${String(number || 0).padStart(6, "0")}`;

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateString;
  }
};

export const getCurrencySymbol = (currencyType = "INR") => {
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

export const numberToWords = (num, currency = "INR") => {
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

export const breakLongText = (text, limit = 10) => {
  if (!text) return "";

  const lines = String(text).split("\n");

  const processedLines = lines.map((line) => {
    if (!line) return "";

    const regex = new RegExp(`.{1,${limit}}`, "g");
    const chunks = line.match(regex) || [];
    return chunks.join(" ");
  });

  return processedLines.join("\n");
};
