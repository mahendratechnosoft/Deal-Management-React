// export const hasPermission = (module, action) => {
//   const role = localStorage.getItem("role");

//   // ADMIN has full access
//   if (role === "ROLE_ADMIN") return true;

//   // For employees → moduleAccess is stored in localStorage
//   const moduleAccess = JSON.parse(localStorage.getItem("moduleAccess") || "{}");

//   const key = module + action;
//   // Example key → "timeSheetCreate"
//   // → "proformaInvoice" + "Access"

//   return moduleAccess[key] === true;
// };

// BaseComponet/permissions.js

// List of modules that are always accessible (don't require permission setup)
const PUBLIC_MODULES = ["Item", "Employee", "Settings", "Donar"]; // Add any future modules that should always be accessible
//  Employee: "employee", // Added for employee management
//     Settings: "settings", // Added for settings
//     Donar: "donar", // Added for donor management
//     "Shortlisted Donar": "shortlistedDonar", // Added for shortlisted donors
//     "Family List": "family", // Added for family management
//     "Matching donor": "matchingDonor", // Added for matching donors
export const hasPermission = (module, action) => {
  const role = localStorage.getItem("role");

  // ADMIN has full access
  // if (role === "ROLE_ADMIN") return true;
  if (role === "ROLE_SUPERADMIN") {
    return true;
  } else if (role === "ROLE_ADMIN") {
  const moduleAccess = JSON.parse(localStorage.getItem("moduleAccess") || "{}");

  const key = module + action;
  // Example key → "timeSheetCreate"
  // → "proformaInvoice" + "Access"

  return moduleAccess[key] === true;
  } else  {
console.log("to employe");
    const moduleAccess = JSON.parse(
      localStorage.getItem("moduleAccess") || "{}"
    );

    const key = module + action;
    // Example key → "timeSheetCreate"
    // → "proformaInvoice" + "Access"

    return moduleAccess[key] === true;
  }

  // For employees → moduleAccess is stored in localStorage
};
