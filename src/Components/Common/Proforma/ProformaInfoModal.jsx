import React, { useState, useEffect, useMemo } from "react";
import "./ProformaInfoModal.css";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import ProformaInvoiceDisplay from "./ProformaInvoiceDisplay";
import CreatePaymentModal from "../Payment/CreatePaymentModal";
import { useNavigate } from "react-router-dom";
import SendProformaEmailModal from "../Email/SendProformaEmailModal"; // Import the new component
import toast from "react-hot-toast";
import SalesReminderList from "../Reminder/SalesReminderList";

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

const RemindersTabContent = ({ proformaId }) => {
  return (
    <div
      className="p-4 bg-gray-100 overflow-y-auto"
      style={{ maxHeight: "calc(80vh - 120px)" }}
    >
      <SalesReminderList module="PROFORMA" referenceId={proformaId} />
    </div>
  );
};


const ProformaInfoModal = ({ isOpen, onClose, proforma, onOpenPdf }) => {
  const [activeTab, setActiveTab] = useState("invoice");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false); // Add email modal state
  const [paymentRefreshKey, setPaymentRefreshKey] = useState(Date.now());
  const [invoiceData, setInvoiceData] = useState(null);
  const [adminInformation, setAdminInformation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [convertInvoiceLoading, setConvertInvoiceLoading] = useState(false);
  const { role } = useLayout();
  const [currentProformaType, setCurrentProformaType] = useState(
    proforma.proformaType
  );

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

  // Email modal handlers
  const handleOpenEmailModal = (e) => {
    e?.stopPropagation();
    setIsEmailModalOpen(true);
  };

  const handleConvertToTaxInvoice = async (proformaInvoiceId) => {
    setConvertInvoiceLoading(true);
    try {
      const result = await axiosInstance.get(
        `convertProformaToTaxInvoice/${proformaInvoiceId}`
      );
      // 3. Update local state on success manually
      if (result.status === 200) {
        toast.success("Converted to Tax Invoice successfully");
        setCurrentProformaType("CONVERTED_TAX_INVOICE");
      } else {
        toast.error("Failed to convert to tax invoice");
      }
    } catch (error) {
      console.error("Error converting to tax invoice:", error);
      toast.error(error.response?.data?.message || "Error converting invoice");
    } finally {
      setConvertInvoiceLoading(false);
    }
  };

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
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
          className="info-modal-content rounded-t-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* --- Modal Header --- */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Proforma Invoice Details
                  </h2>
                  <p className="text-blue-100 text-xs">
                    {proforma.formatedProformaInvoiceNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentProformaType !== "REIMBURSEMENT" &&
                  (currentProformaType === "CONVERTED_TAX_INVOICE" ? (
                    <span
                      className="
              inline-flex items-center
              px-3 py-1.5
              rounded-md
              bg-white/20
              text-sm font-semibold text-white
              border border-white/30
              cursor-not-allowed
            "
                      title="Already converted to Tax Invoice"
                    >
                      Converted Tax Invoice
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConvertToTaxInvoice(proforma.proformaInvoiceId);
                      }}
                      disabled={convertInvoiceLoading}
                      title="Convert to Tax Invoice"
                      className="
              inline-flex items-center gap-2
              px-3 py-1.5
              rounded-md
              bg-white/20
              text-sm font-semibold text-white
              border border-white/30
              transition-all duration-200
              hover:bg-white/30
              active:scale-95
              disabled:bg-white/10
              disabled:cursor-not-allowed
            "
                    >
                      {convertInvoiceLoading ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Converting...
                        </>
                      ) : (
                        "Convert To Tax Invoice"
                      )}
                    </button>
                  ))}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEmailModal(e);
                  }}
                  className="flex items-center gap-2 px-2 py-2 border border-white/30 rounded bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  title="Send via Email"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const publicUrl = `${window.location.origin}/Proforma/Preview/${proforma.proformaInvoiceId}`;
                    window.open(publicUrl, "_blank", "noopener,noreferrer");
                  }}
                  className="flex items-center gap-2 px-2 py-2 border border-white/30 rounded bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  title="Open Public View"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenPdf && proforma?.proformaInvoiceId) {
                      onOpenPdf(proforma.proformaInvoiceId);
                    }
                  }}
                  className="flex items-center gap-2 px-2 py-2 border border-white/30 rounded bg-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  title="Generate PDF"
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
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  PDF
                </button>

                <button
                  type="button"
                  className="px-2 py-2 bg-white/20 text-white border border-white/30 rounded hover:bg-white/30 transition-colors duration-200 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="p-1.5 hover:bg-white/20 rounded transition"
                  onClick={onClose}
                >
                  <svg
                    className="w-4 h-4 text-white"
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

            <button
              className={`info-modal-tab ${
                activeTab === "reminders" ? "active" : ""
              }`}
              onClick={() => setActiveTab("reminders")}
            >
              Reminders
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
            {activeTab === "reminders" && (
              <RemindersTabContent proformaId={proforma.proformaInvoiceId} />
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <SendProformaEmailModal
        isOpen={isEmailModalOpen}
        onClose={handleCloseEmailModal}
        proformaId={proforma?.proformaInvoiceId}
        proformaNumber={proforma?.formatedProformaInvoiceNumber}
        customerEmail={
          invoiceData?.proformaInvoiceInfo?.customerInfo?.customerEmail
        }
      />

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
