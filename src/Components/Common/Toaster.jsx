import { Toaster } from "react-hot-toast";

const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
          fontSize: "14px",
          padding: "12px 16px",
          borderRadius: "8px",
        },
        // Success toast styling
        success: {
          style: {
            background: "#10B981",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        },
        // Error toast styling
        error: {
          duration: 5000,
          style: {
            background: "#EF4444",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#EF4444",
          },
        },
        // Loading toast styling
        loading: {
          style: {
            background: "#6B7280",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#6B7280",
          },
        },
      }}
    />
  );
};

export default CustomToaster;
