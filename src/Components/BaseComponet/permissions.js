export const hasPermission = (module, action) => {
  const role = localStorage.getItem("role");

  // ADMIN has full access
  if (role === "ROLE_ADMIN") return true;

  // For employees → moduleAccess is stored in localStorage
  const moduleAccess = JSON.parse(localStorage.getItem("moduleAccess") || "{}");

  const key = module + action; 
  // Example key → "timeSheetCreate"
  // → "proformaInvoice" + "Access"

  return moduleAccess[key] === true;
};
