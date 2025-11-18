import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";

const customReactSelectStyles = (hasError) => ({
  control: (provided, state) => ({
    ...provided,
    minHeight: "40px",
    borderColor: state.isFocused ? "#3b82f6" : hasError ? "#ef4444" : "#e5e7eb",
    borderWidth: "1px",
    borderRadius: "6px",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
    },
    backgroundColor: "white",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
    borderRadius: "6px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "#f3f4f6"
      : "white",
    color: state.isSelected ? "white" : "#1f2937",
    "&:active": {
      backgroundColor: "#3b82f6",
      color: "white",
    },
  }),
});

export const formatProformaNumber = (number) => {
  const numberString = String(number || 0);
  return `P_INV-${numberString.padStart(6, "0")}`;
};

function CreatePaymentModal({ onClose, onSuccess, proformaId }) {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const invoiceRef = useRef(null);
  const transactionRef = useRef(null);
  const amountRef = useRef(null);
  const dateRef = useRef(null);
  const modeRef = useRef(null);

  const [formData, setFormData] = useState({
    proformaInvoiceNo: "",
    proformaInvoiceId: "",
    transactionId: "",
    companyName: "",
    amount: "",
    paymentDate: "",
    paymentMode: "",
    totalAmount: "",
    paidAmount: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch invoices from API
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Set current date as default payment date
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      paymentDate: today,
    }));
  }, []);

  const fetchInvoices = async () => {
    try {
      setFetchLoading(true);
      const response = await axiosInstance.get("getAllPerforma");

      if (response.data.statusCode === "OK" && response.data.body) {
        const validInvoices = response.data.body
          .filter(
            (invoice) =>
              invoice.proformaInvoiceNumber !== null &&
              invoice.proformaInvoiceNumber !== undefined &&
              String(invoice.proformaInvoiceNumber).trim() !== ""
          )
          .map((invoice) => ({
            proformaInvoiceId: invoice.proformaInvoiceId,
            proformaInvoiceNo: String(invoice.proformaInvoiceNumber), // convert to string
            companyName: invoice.companyName || "N/A",
            relatedId: invoice.relatedId,
            totalAmount: invoice.totalAmount || 0,
            paidAmount: invoice.paidAmount || 0,
          }));

        if (proformaId) {
          const invoice = validInvoices.find(
            (inv) => inv.proformaInvoiceId === proformaId
          );
          if (invoice) {
            setInvoiceDetails(invoice);
          }
        }
        setInvoices(validInvoices);
      } else {
        toast.error("Failed to fetch invoices");
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Error fetching invoices");
      setInvoices([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const setInvoiceDetails = (invoice) => {
    if (invoice) {
      const total = parseFloat(invoice.totalAmount) || 0;
      const paid = parseFloat(invoice.paidAmount) || 0;
      const remaining = parseFloat((total - paid).toFixed(2));

      setSelectedInvoice(invoice);
      setRemainingAmount(remaining);

      setFormData((prev) => ({
        ...prev,
        proformaInvoiceId: invoice.proformaInvoiceId,
        proformaInvoiceNo: formatProformaNumber(invoice.proformaInvoiceNo),
        companyName: invoice.companyName,
        totalAmount: total.toFixed(2),
        paidAmount: paid.toFixed(2),
        amount: "",
      }));

      if (errors.proformaInvoiceId) {
        setErrors((prev) => ({
          ...prev,
          proformaInvoiceId: "",
        }));
      }
    } else {
      setSelectedInvoice(null);
      setRemainingAmount(0);
      setFormData((prev) => ({
        ...prev,
        proformaInvoiceId: "",
        proformaInvoiceNo: "",
        companyName: "",
        totalAmount: "",
        paidAmount: "",
        amount: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Validate amount when it changes
    if (name === "amount" && remainingAmount > 0) {
      validateAmount(value);
    }
  };

  // Handle invoice selection - auto-fill other fields and calculate remaining amount
  const handleInvoiceChange = (selectedOption) => {
    if (selectedOption) {
      const invoice = invoices.find(
        (i) => i.proformaInvoiceId === selectedOption.value
      );
      setInvoiceDetails(invoice);
    } else {
      setInvoiceDetails(null);
    }
  };

  const validateAmount = (amount) => {
    const amountValue = parseFloat(amount);
    console.log("Remaining amount:", remainingAmount);
    console.log("Amount value:", amountValue);
    if (amountValue > remainingAmount) {
      return `Amount cannot exceed remaining amount of ₹${remainingAmount.toLocaleString()}`;
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.proformaInvoiceId?.trim()) {
      newErrors.proformaInvoiceId = "Proforma Invoice is required";
    }

    if (!formData.transactionId?.trim()) {
      newErrors.transactionId = "Transaction ID is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    } else {
      const amountError = validateAmount(formData.amount);
      if (amountError) {
        newErrors.amount = amountError;
      }
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
    }

    if (!formData.paymentMode) {
      newErrors.paymentMode = "Payment mode is required";
    }

    setErrors(newErrors);

    // 🔥 Focus the first error field
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.proformaInvoiceId) invoiceRef.current.focus();
      else if (newErrors.transactionId) transactionRef.current?.focus();
      else if (newErrors.amount) amountRef.current?.focus();
      else if (newErrors.paymentDate) dateRef.current?.focus();
      else if (newErrors.paymentMode) modeRef.current?.focus();

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      // Prepare payload
      const submitData = {
        proformaInvoiceNo: formData.proformaInvoiceNo,
        proformaInvoiceId: formData.proformaInvoiceId,
        transactionId: formData.transactionId,
        companyName: formData.companyName,
        amount: Number(formData.amount || 0),

        paymentDate: formData.paymentDate,
        paymentMode: formData.paymentMode,
      };

      // console.log("Submitting payment:", submitData);
      await axiosInstance.post("createPayment", submitData);

      // toast.success("Payment created successfully!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      if (error.response?.data?.message) {
        toast.error(`Failed to create payment: ${error.response.data.message}`);
      } else {
        toast.error("Failed to create payment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  // Invoice options for dropdown
  const invoiceOptions = invoices.map((invoice) => ({
    value: invoice.proformaInvoiceId,
    label: `${invoice.proformaInvoiceNo} - ${invoice.companyName} - Total: ₹${(
      invoice.totalAmount || 0
    ).toLocaleString()}`,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Payment</h2>
                <p className="text-blue-100 text-sm">
                  Record a new payment transaction
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 transform hover:scale-110"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[calc(80vh-180px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Invoice Selection and Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Proforma Invoice Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Proforma Invoice</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="proformaInvoiceId"
                    value={invoiceOptions.find(
                      (option) => option.value === formData.proformaInvoiceId
                    )}
                    onChange={handleInvoiceChange}
                    options={invoiceOptions}
                    placeholder={
                      fetchLoading
                        ? "Loading invoices..."
                        : "Select proforma invoice"
                    }
                    isSearchable
                    isDisabled={fetchLoading}
                    styles={customReactSelectStyles(!!errors.proformaInvoiceId)}
                    inputRef={invoiceRef}
                  />
                  {errors.proformaInvoiceId && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.proformaInvoiceId}
                    </p>
                  )}
                  {fetchLoading && (
                    <p className="text-blue-500 text-xs flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading invoices...
                    </p>
                  )}
                  {!fetchLoading && invoiceOptions.length === 0 && (
                    <p className="text-yellow-600 text-xs flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      No valid invoices found. Please check if invoices have
                      invoice numbers.
                    </p>
                  )}
                </div>

                {/* Company Name (auto-filled) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Auto-filled from invoice selection"
                  />
                </div>

                {/* Transaction ID */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Transaction ID</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.transactionId
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter transaction ID"
                    ref={transactionRef}
                  />
                  {errors.transactionId && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.transactionId}
                    </p>
                  )}
                </div>

                {/* Proforma Invoice No (auto-filled) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Proforma Invoice No
                  </label>
                  <input
                    type="text"
                    name="proformaInvoiceNo"
                    value={formData.proformaInvoiceNo}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Auto-filled from invoice selection"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Amount (₹)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    ref={amountRef}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.amount ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter payment amount"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.amount}
                    </p>
                  )}
                  {selectedInvoice && (
                    <div className="text-xs text-gray-700 space-y-1 mt-1">
                      <p>
                        Total Amount:{" "}
                        <span className="font-semibold text-gray-900">
                          ₹
                          {parseFloat(
                            formData.totalAmount || 0
                          ).toLocaleString()}
                        </span>
                      </p>
                      <p>
                        Paid Amount:{" "}
                        <span className="font-semibold text-gray-900">
                          ₹
                          {parseFloat(
                            formData.paidAmount || 0
                          ).toLocaleString()}
                        </span>
                      </p>
                      <p>
                        Remaining Amount:{" "}
                        <span className="font-semibold text-gray-900">
                          ₹{remainingAmount.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Payment Date</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    ref={dateRef}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.paymentDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.paymentDate && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.paymentDate}
                    </p>
                  )}
                </div>

                {/* Payment Mode */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Payment Mode</span>
                    <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="paymentMode"
                    value={formData.paymentMode || ""}
                    onChange={handleChange}
                    ref={modeRef}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
            ${errors.paymentMode ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Details</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>

                  {errors.paymentMode && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.paymentMode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 font-medium flex items-center gap-2 hover:shadow-sm text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Create Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePaymentModal;
