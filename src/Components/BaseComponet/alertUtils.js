import Swal from 'sweetalert2';

// Common configuration for all alerts with Tailwind-inspired styling
const getCommonConfig = (iconType) => ({
  customClass: {
    popup: 'rounded-xl shadow-xl border border-gray-200 bg-white',
    title: 'text-lg font-semibold text-gray-900 mb-2',
    htmlContainer: 'text-sm text-gray-600 leading-relaxed',
    actions: 'flex gap-3 mt-6',
    confirmButton: 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    cancelButton: 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  },
  buttonsStyling: false,
  backdrop: 'rgba(0, 0, 0, 0.5)',
  allowOutsideClick: false,
  allowEscapeKey: true,
  allowEnterKey: true,
  width: '420px',
  padding: '1.5rem',
  showClass: {
    popup: 'swal2-show-transform',
    backdrop: 'swal2-backdrop-show'
  },
  hideClass: {
    popup: 'swal2-hide-transform',
    backdrop: 'swal2-backdrop-hide'
  }
});

// Success alert
export const showSuccessAlert = (message, title = 'Success') => {
  return Swal.fire({
    ...getCommonConfig('success'),
    title,
    text: message,
    icon: 'success',
    iconColor: '#10b981',
    confirmButtonText: 'OK',
    confirmButtonColor: '#10b981',
    customClass: {
      ...getCommonConfig().customClass,
      confirmButton: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200'
    }
  });
};

// Error alert
export const showErrorAlert = (message, title = 'Error') => {
  return Swal.fire({
    ...getCommonConfig('error'),
    title,
    text: message,
    icon: 'error',
    iconColor: '#ef4444',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
    customClass: {
      ...getCommonConfig().customClass,
      confirmButton: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200'
    }
  });
};

// Confirmation dialog (replacement for window.confirm)
export const showConfirmDialog = (message, title = 'Are you sure?') => {
  return Swal.fire({
    ...getCommonConfig('question'),
    title,
    text: message,
    icon: 'warning',
    iconColor: '#f59e0b',
    showCancelButton: true,
    confirmButtonText: 'Yes, proceed',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusConfirm: true,
    customClass: {
      ...getCommonConfig().customClass,
      confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
      cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700 focus:ring-gray-500 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200'
    }
  });
};

// Info alert
export const showInfoAlert = (message, title = 'Information') => {
  return Swal.fire({
    ...getCommonConfig('info'),
    title,
    text: message,
    icon: 'info',
    iconColor: '#3b82f6',
    confirmButtonText: 'OK',
    confirmButtonColor: '#3b82f6',
    customClass: {
      ...getCommonConfig().customClass,
      confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200'
    }
  });
};

// Warning alert
export const showWarningAlert = (message, title = 'Warning') => {
  return Swal.fire({
    ...getCommonConfig('warning'),
    title,
    text: message,
    icon: 'warning',
    iconColor: '#f59e0b',
    confirmButtonText: 'OK',
    confirmButtonColor: '#f59e0b',
    customClass: {
      ...getCommonConfig().customClass,
      confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200'
    }
  });
};

// Delete confirmation with red theme
export const showDeleteConfirmation = (itemName) => {
  return Swal.fire({
    ...getCommonConfig('warning'),
    title: 'Delete Confirmation',
    text: `You are about to delete "${itemName}". This action cannot be undone.`,
    icon: 'error',
    iconColor: '#ef4444',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    customClass: {
      ...getCommonConfig().customClass,
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
      cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700 focus:ring-gray-500 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200'
    }
  });
};

// Auto-close success message
export const showAutoCloseSuccess = (message, timer = 2000) => {
  return Swal.fire({
    ...getCommonConfig('success'),
    title: 'Success!',
    text: message,
    icon: 'success',
    iconColor: '#10b981',
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    customClass: {
      ...getCommonConfig().customClass,
      popup: 'rounded-xl shadow-xl border border-gray-200 bg-white swal-timer'
    }
  });
};

// Custom alert with HTML content
export const showCustomAlert = (html, title = '', config = {}) => {
  return Swal.fire({
    ...getCommonConfig(config.icon || 'info'),
    title,
    html,
    ...config,
    customClass: {
      ...getCommonConfig().customClass,
      ...config.customClass
    }
  });
};

