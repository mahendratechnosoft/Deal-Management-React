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
