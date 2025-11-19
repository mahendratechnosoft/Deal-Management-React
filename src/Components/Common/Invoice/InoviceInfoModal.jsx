import React, { useState, useEffect, useMemo } from "react";
import "../Proforma/ProformaInfoModal.css";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import ProformaInvoiceDisplay from "../Proforma/ProformaInvoiceDisplay";
import { formatInvoiceNumber } from "../../BaseComponet/UtilFunctions";

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
        isInvoice={true}
      />
    </div>
  );
};

const InvoiceInfoModal = ({ isOpen, onClose, proforma }) => {
  const [activeTab, setActiveTab] = useState("invoice");
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
  }, [proforma.proformaInvoiceId, role]);

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

  return (
    <>
      <div className="info-modal-backdrop" onClick={onClose}>
        <div
          className="info-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="info-modal-header">
            <h3 className="info-modal-title">
              {formatInvoiceNumber(proforma.invoiceNumber)}
            </h3>
            <div className="info-modal-actions">
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
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceInfoModal;
