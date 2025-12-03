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
const PUBLIC_MODULES = [];

export const hasPermission = (module, action) => {
  const role = localStorage.getItem("role");

  // ADMIN has full access
  // if (role === "ROLE_ADMIN") return true;
  if (role === "ROLE_SUPERADMIN") return true;
  // Public modules - always accessible regardless of permission settings
  if (PUBLIC_MODULES.includes(module)) {
    return true;
  }

  // For employees → moduleAccess is stored in localStorage
  const moduleAccess = JSON.parse(localStorage.getItem("moduleAccess") || "{}");

  const key = module + action;
  // Example key → "timeSheetCreate"
  // → "proformaInvoice" + "Access"

  return moduleAccess[key] === true;
};
