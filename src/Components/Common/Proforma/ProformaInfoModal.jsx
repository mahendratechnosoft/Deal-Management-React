import React, { useState, useEffect, useMemo } from "react";
import "./ProformaInfoModal.css";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import ProformaInvoiceDisplay from "./ProformaInvoiceDisplay";
import CreatePaymentModal from "../Payment/CreatePaymentModal";
import { useNavigate } from "react-router-dom";

const formatProformaNumber = (number) => {
  const numberString = String(number || 0);
  return `P_INV-${numberString.padStart(6, "0")}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateString;
  }
};

const formatCurrency = (amount, currencyType) => {
  const symbol = getCurrencySymbol(currencyType);
  const formattedAmount = (Number(amount) || 0).toFixed(2);
  return `${symbol}${formattedAmount}`;
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

// 🔥 simplified InvoiceTabContent
const InvoiceTabContent = ({
  loading,
  invoiceData,
  adminInformation,
  calculation,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading Invoice Preview...
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load invoice.
      </div>
    );
  }

  return (
    <div className="p-10">
      <ProformaInvoiceDisplay
        invoiceData={invoiceData}
        adminInformation={adminInformation}
        calculation={calculation}
      />
    </div>
  );
};

const PaymentTabContent = ({ proformaId, currencyType }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { role } = useLayout();

  useEffect(() => {
    if (!proformaId) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const paymentRes = await axiosInstance.get(
          `getPaymentsByProformaInvoice/${proformaId}`
        );

        if (paymentRes.data) {
          setPayments(paymentRes.data);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [proformaId]);

  const handleView = (paymentId) => {
    if (role === "ROLE_ADMIN") {
      navigate(`/Admin/EditPayment/${paymentId}`);
    } else if (role === "ROLE_EMPLOYEE") {
      navigate(`/Employee/EditPayment/${paymentId}`);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 table-fixed w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Mode
              </th>
              <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recorded By
              </th>
              <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading
              ? // --- Skeleton Loader ---
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              : // --- Actual Data ---
                payments.map((payment) => (
                  <tr
                    key={payment.paymentId}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={() => handleView(payment.paymentId)}
                  >
                    <td
                      className="px-4 py-4 truncate text-sm text-gray-900 font-medium"
                      title={formatDate(payment.paymentDate)}
                    >
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td
                      className="px-4 py-4 truncate text-sm text-gray-900"
                      title={payment.transactionId}
                    >
                      {payment.transactionId}
                    </td>
                    <td
                      className="px-4 py-4 truncate text-sm text-gray-500"
                      title={payment.paymentMode}
                    >
                      {payment.paymentMode}
                    </td>
                    <td
                      className="px-4 py-4 truncate text-sm text-blue-600 font-medium"
                      title={formatCurrency(payment.amount, currencyType)}
                    >
                      {formatCurrency(payment.amount, currencyType)}
                    </td>
                    <td
                      className="px-4 py-4 truncate text-sm text-gray-500"
                      title={payment.createdBy}
                    >
                      {payment.createdBy}
                    </td>
                    <td
                      className="px-4 py-4 truncate text-sm text-gray-500"
                      title={payment.note || ""}
                    >
                      {payment.note || "N/A"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* --- Empty State --- */}
        {payments.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No payments found
            </h3>
            <p className="text-gray-600">
              No payments have been recorded for this proforma invoice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProformaInfoModal = ({ isOpen, onClose, proforma }) => {
  const [activeTab, setActiveTab] = useState("invoice");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRefreshKey, setPaymentRefreshKey] = useState(Date.now());
  const [invoiceData, setInvoiceData] = useState(null);
  const [adminInformation, setAdminInformation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useLayout();

  if (!isOpen) {
    return null;
  }

  useEffect(() => {
    if (!proforma.proformaInvoiceId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        let adminInfo = null;
        if (role === "ROLE_ADMIN") {
          const adminRes = await axiosInstance.get(`/admin/getAdminInfo`);
          adminInfo = adminRes.data;
        } else if (role === "ROLE_EMPLOYEE") {
          const empRes = await axiosInstance.get(`/employee/getEmployeeInfo`);
          adminInfo = empRes.data.admin;
        }
        setAdminInformation(adminInfo);

        const response = await axiosInstance.get(
          `getProformaInvoiceById/${proforma.proformaInvoiceId}`
        );

        if (response.data) {
          setInvoiceData(response.data);
        }
      } catch (error) {
        console.error("Error fetching data in modal:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [proforma.proformaInvoiceId, role, paymentRefreshKey]);

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
    const amountDue = parseFloat((grandTotal - amountPaid).toFixed(2));

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

  const handleOpenPaymentModal = (e) => {
    e.stopPropagation();
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handlePaymentSuccess = () => {
    setPaymentRefreshKey(Date.now());
    setActiveTab("payment");
    handleClosePaymentModal();
  };

  const isFullyPaid = calculation.amountDue <= 0;

  return (
    <>
      <div className="info-modal-backdrop" onClick={onClose}>
        <div
          className="info-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="info-modal-header">
            <h3 className="info-modal-title">
              {formatProformaNumber(proforma.proformaInvoiceNumber)}
            </h3>
            <div className="info-modal-actions">
              <button
                type="button"
                className="px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isFullyPaid}
                onClick={handleOpenPaymentModal}
                title={
                  isFullyPaid
                    ? "Payment is already complete."
                    : "Add a new payment"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
                Payment
              </button>

              <button
                type="button"
                className="info-modal-close-btn"
                onClick={onClose}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div className="info-modal-tabs">
            <button
              className={`info-modal-tab ${
                activeTab === "invoice" ? "active" : ""
              }`}
              onClick={() => setActiveTab("invoice")}
            >
              Invoice
            </button>
            <button
              className={`info-modal-tab ${
                activeTab === "payment" ? "active" : ""
              }`}
              onClick={() => setActiveTab("payment")}
            >
              Payment
            </button>
          </div>

          <div className="info-modal-body">
            {activeTab === "invoice" && (
              <InvoiceTabContent
                loading={isLoading}
                invoiceData={invoiceData}
                adminInformation={adminInformation}
                calculation={calculation}
              />
            )}

            {activeTab === "payment" && (
              <PaymentTabContent
                key={paymentRefreshKey}
                proformaId={proforma.proformaInvoiceId}
                currencyType={proforma.currencyType}
              />
            )}
          </div>
        </div>
      </div>
      {isPaymentModalOpen && (
        <CreatePaymentModal
          onClose={handleClosePaymentModal}
          onSuccess={handlePaymentSuccess}
          proformaId={proforma.proformaInvoiceId}
        />
      )}
    </>
  );
};

export default ProformaInfoModal;
