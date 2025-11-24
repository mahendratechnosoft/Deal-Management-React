import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import { hasPermission } from "../../BaseComponet/permissions";

/**
 * EditPayment
 * - left: form for editing payment
 * - right: live preview (receipt) built from payment + proforma invoice
 *
 * Validation:
 * - amount must be > 0
 * - amount <= available
 *   where available = totalAmount - (proforma.paidAmount - originalPaymentAmount)
 *
 * Update: PUT updatePayment with the edited form data
 */

function EditPayment() {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const { LayoutComponent, role } = useLayout();

    const [loading, setLoading] = useState(false); // for submit
    const [fetchLoading, setFetchLoading] = useState(true); // for initial fetch
    const [paymentData, setPaymentData] = useState(null); // from getPaymentById
    const [proforma, setProforma] = useState(null); // from getProformaInvoiceById
    const [errors, setErrors] = useState({});
    const canEdit = hasPermission("payment", "Edit");
    const [form, setForm] = useState({
        paymentId: "",
        adminId: "",
        // employeeId: "",
        proformaInvoiceNo: "",
        proformaInvoiceId: "",
        transactionId: "",
        companyName: "",
        customerId: "",
        amount: "",
        paymentDate: "",
        paymentMode: "",

    });

    // Fetch payment and proforma sequentially
    useEffect(() => {
        let mounted = true;

        async function fetchAll() {
            try {
                setFetchLoading(true);

                const payRes = await axiosInstance.get(`getPaymentById/${paymentId}`);
                const pay = payRes.data;

                // set payment data
                if (!mounted) return;
                setPaymentData(pay);

                // fetch proforma by id (if exists)
                if (pay.proformaInvoiceId) {
                    try {
                        const profRes = await axiosInstance.get(
                            `getProformaInvoiceById/${pay.proformaInvoiceId}`
                        );
                        const prof = profRes.data?.proformaInvoiceInfo || null;
                        if (mounted) setProforma(prof);
                    } catch (err) {
                        console.error("Failed to fetch proforma invoice:", err);
                        if (mounted) setProforma(null);
                    }
                } else {
                    setProforma(null);
                }

                // initialize form using payment + proforma
                const initialForm = {
                    paymentId: pay.paymentId || "",
                    adminId: pay.adminId || "",
                    employeeId: pay.employeeId || "",
                    proformaInvoiceNo:
                        pay.proformaInvoiceNo !== undefined && pay.proformaInvoiceNo !== null
                            ? String(pay.proformaInvoiceNo)
                            : "",
                    proformaInvoiceId: pay.proformaInvoiceId || "",
                    transactionId: pay.transactionId || "",
                    companyName: pay.companyName || (pay.companyName ? pay.companyName : ""),
                    customerId: pay.customerId || "",
                    amount:
                        pay.amount !== undefined && pay.amount !== null
                            ? Number(pay.amount).toFixed(2)
                            : "",
                    paymentDate: pay.paymentDate || "",
                    paymentMode: pay.paymentMode || "",

                };

                if (mounted) {
                    setForm(initialForm);
                    setErrors({});
                }
            } catch (err) {
                console.error("Error fetching payment:", err);
                toast.error("Failed to load payment details");
                // fallback nav back
                navigate(-1);
            } finally {
                if (mounted) setFetchLoading(false);
            }
        }

        if (paymentId) fetchAll();

        return () => {
            mounted = false;
        };
    }, [paymentId, navigate]);

    const derived = useMemo(() => {
        const totalAmount = Number(proforma?.totalAmount || 0);
        const paidAmount = Number(proforma?.paidAmount || 0); // includes old payment
        const origPayment = Number(paymentData?.amount || 0); // old payment value

        // paid before this payment
        const previousPaid = paidAmount - origPayment;

        // remaining payable amount
        const allowedMax = totalAmount - previousPaid;

        const newAmount = Number(form.amount || 0);
        const amountDue = totalAmount - (previousPaid + newAmount);

        return {
            totalAmount,
            paidAmount,
            origPayment,
            previousPaid,
            allowedMax,
            amountDue
        };
    }, [proforma, paymentData, form.amount]);




    // helpers
    const formatCurrency = (v) => {
        const n = Number(v || 0);
        return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    const formatDate = (d) => {
        if (!d) return "N/A";
        try {
            return new Date(d).toLocaleDateString("en-IN");
        } catch {
            return d;
        }
    };

    // input handler
    const handleChange = (e) => {
        const { name, value } = e.target;

        // If amount, allow numeric and keep two decimals - but keep raw string until submit/validation
        if (name === "amount") {
            // replace multiple decimals or non-numeric except dot
            const cleaned = value;
            setForm((p) => ({ ...p, [name]: cleaned }));
            if (errors.amount) setErrors((p) => ({ ...p, amount: "" }));
            return;
        }

        setForm((p) => ({ ...p, [name]: value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    };

    // validation
    const validate = () => {
        const newErr = {};

        if (!form.transactionId || !String(form.transactionId).trim()) {
            newErr.transactionId = "Transaction ID is required";
        }

        const amountVal = Number(form.amount || 0);

        if (!form.amount || isNaN(amountVal) || amountVal <= 0) {
            newErr.amount = "Enter a valid amount > 0";
        }
        else if (amountVal > derived.allowedMax) {
            newErr.amount = `Amount cannot exceed ₹${formatCurrency(derived.allowedMax)} (Invoice Amount - Paid Amount)`;
        }

        if (!form.paymentDate) {
            newErr.paymentDate = "Payment date is required";
        }

        if (!form.paymentMode) {
            newErr.paymentMode = "Select payment mode";
        }

        setErrors(newErr);
        return Object.keys(newErr).length === 0;
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please fix the errors.");
            return;
        }

        setLoading(true);
        try {
            const paidAmountFromProforma = Number(proforma?.paidAmount || 0);
            const origPayment = Number(paymentData?.amount || 0);

            const previousPaid = paidAmountFromProforma - origPayment;

            const newPaymentAmount = Number(parseFloat(form.amount || 0).toFixed(2));

            const totalPaidAfter = previousPaid + newPaymentAmount;




            const payload = {
                paymentId: form.paymentId,
                adminId: form.adminId,
                employeeId: form.employeeId,
                proformaInvoiceId: form.proformaInvoiceId,
                proformaInvoiceNo: form.proformaInvoiceNo,
                transactionId: form.transactionId,
                companyName: form.companyName,
                customerId: form.customerId,
                amount: newPaymentAmount, // current payment record amount
                paymentDate: form.paymentDate,
                paymentMode: form.paymentMode,

                // SEND total paid on invoice after update (NOT just current payment)
                totalProformaInvoicePaidAmount: Number(totalPaidAfter.toFixed(2)),
            };

            await axiosInstance.put("updatePayment", payload);
            toast.success("Payment updated successfully");
            navigate(-1);
        } catch (err) {
            console.error("Update failed:", err);
            toast.error("Failed to update payment");
        } finally {
            setLoading(false);
        }
    };


    const handlePrintReceipt = () => {
        const element = document.getElementById("receiptPreview");

        if (!element) {
            toast.error("Receipt section not found!");
            return;
        }

        const opt = {
            margin: 5,
            filename: `Payment_Receipt_${form.transactionId || "receipt"}.pdf`,
            image: {
                type: "jpeg",
                quality: 1,
            },
            html2canvas: {
                scale: 4,
                useCORS: true,
                letterRendering: true,
                dpi: 300,
            },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait",
                precision: 16,
            }
        };

        html2pdf().set(opt).from(element).save();
    };


    const handleCancel = () => {
        if (window.confirm("Discard changes and go back?")) {
            navigate(-1);
        }
    };

    if (fetchLoading) {
        return (
            <LayoutComponent>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
                </div>
            </LayoutComponent>
        );
    }

    return (
        <LayoutComponent>
            <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
                <div className="max-w-full mx-auto px-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 gap-4">
                        <div>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit Payment</h1>

                        </div>

                        <div className="flex items-center gap-2">

                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePrintReceipt}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                                Print Receipt
                            </button>
                            {hasPermission("payment", "Edit") && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {loading ? "Updating..." : "Update Payment"}
                                </button>

                            )}
                        </div>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[72vh] overflow-y-auto CRM-scroll-width-none ">
                        {/* LEFT: form (col-span 5) */}
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
                                <div className={!canEdit ? "pointer-events-none opacity-60" : ""}>
                                    <form id="editPaymentForm" onSubmit={handleSubmit} className="space-y-6">
                                        {/* Amount Received */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">* Amount Received</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="amount"
                                                value={form.amount}
                                                onChange={handleChange}
                                                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.amount ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                                                    }`}
                                                placeholder="0.00"
                                            />
                                            {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}

                                            {/* show available & original/proforma numbers */}
                                            <div className="mt-2 text-xs text-gray-600">
                                                <div>Invoice Total: <strong>₹{formatCurrency(derived.totalAmount)}</strong></div>

                                                <div>Original Payment Amount: <strong>₹{formatCurrency(derived.origPayment)}</strong></div>
                                                <div>Available to set: <strong>₹{formatCurrency(derived.allowedMax)}</strong></div>


                                            </div>
                                        </div>




                                        {/* Payment Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">* Payment Date</label>
                                            <input
                                                type="date"
                                                name="paymentDate"
                                                value={form.paymentDate}
                                                onChange={handleChange}
                                                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.paymentDate ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                                                    }`}
                                            />
                                            {errors.paymentDate && <p className="text-xs text-red-600 mt-1">{errors.paymentDate}</p>}
                                        </div>

                                        {/* Payment Mode */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">* Payment Mode</label>
                                            <select
                                                name="paymentMode"
                                                value={form.paymentMode || ""}
                                                onChange={handleChange}
                                                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.paymentMode ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
                                                    }`}
                                            >
                                                <option value="">Select Mode</option>
                                                <option value="Cash">Cash</option>
                                                <option value="Bank">Bank Details</option>
                                                <option value="UPI">UPI</option>
                                                <option value="Cheque">Cheque</option>
                                            </select>
                                            {errors.paymentMode && <p className="text-xs text-red-600 mt-1">{errors.paymentMode}</p>}
                                        </div>


                                        {/* Transaction ID */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                                            <input
                                                type="text"
                                                name="transactionId"
                                                value={form.transactionId}
                                                onChange={handleChange}
                                                className={`mt-1 block w-full px-3 py-2 border rounded-md ${errors.transactionId ? "border-red-500" : "border-gray-300"
                                                    }`}
                                                placeholder="Enter transaction id"
                                            />
                                            {errors.transactionId && <p className="text-xs text-red-600 mt-1">{errors.transactionId}</p>}
                                        </div>


                                        {/* Buttons */}
                                        {/* <div className="flex justify-end gap-2">
                                  
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            {loading ? "Updating..." : "Update Payment"}
                                        </button>
                                    </div> */}
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: preview (col-span 7) */}
                        <div className="lg:col-span-7">
                            <div id="receiptPreview" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                {/* header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">{proforma?.companyName || form.companyName || "Company Name"}</h2>
                                        <div className="text-sm text-gray-600 mt-1">
                                            <div>{proforma?.billingStreet}</div>
                                            <div>
                                                {proforma?.billingCity}, {proforma?.billingState}
                                            </div>
                                            <div>
                                                {proforma?.billingCountry} - {proforma?.billingZipCode}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                            <div>GST Number: {proforma?.gstin || "N/A"}</div>
                                            <div>PAN: {proforma?.panNumber || "N/A"}</div>
                                            <div>Mobile: {proforma?.mobileNumber || "N/A"}</div>
                                            <div>Email: {proforma?.email || "N/A"}</div>
                                        </div>
                                    </div>

                                    {/* <div className="text-sm text-right">
                                        <div className="text-blue-600 font-medium">Payment</div>
                                        <div className="text-xs text-gray-600 mt-2"></div>
                                    </div> */}
                                </div>

                                {/* title */}
                                <div className="text-center border-b border-gray-200 pb-4 mb-6">
                                    <h3 className="text-2xl font-bold">PAYMENT RECEIPT</h3>
                                </div>

                                {/* Payment meta */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <div className="text-sm text-gray-600">Payment Date</div>
                                        <div className="text-gray-900">{formatDate(form.paymentDate)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Payment Mode</div>
                                        <div className="text-gray-900">{form.paymentMode || "N/A"}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">Total Amount</div>
                                        <div className="text-2xl font-bold text-green-600">₹{formatCurrency(form.amount)}</div>
                                    </div>
                                </div>

                                {/* table: payment for */}
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3">Payment For</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border border-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-1 py-2 w-24 border text-left text-xs font-medium text-gray-700">
                                                        Invoice No.
                                                    </th>

                                                    <th className="px-3 py-2 border text-left text-xs font-medium text-gray-700">Invoice Date</th>

                                                    <th className="px-3 py-2 border text-left text-xs font-medium text-gray-700">Invoice Amount</th>
                                                    <th className="px-3 py-2 border text-left text-xs font-medium text-gray-700">Payment Amount</th>
                                                    <th className="px-2 py-2 border text-left text-xs font-medium text-gray-700">
                                                        Paid Amount
                                                    </th>

                                                    <th className="px-3 py-2 border text-left text-xs font-medium text-red-600">Amount Due</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-1 py-2 w-24 border text-sm">
                                                        {proforma?.proformaInvoiceNumber ?? form.proformaInvoiceNo}
                                                    </td>

                                                    <td className="px-3 py-2 border text-sm">{formatDate(proforma?.proformaInvoiceDate || form.paymentDate)}</td>

                                                    <td className="px-3 py-2 border text-sm">₹ {formatCurrency(derived.totalAmount)}</td>
                                                    <td className="px-3 py-2 border text-sm">₹ {formatCurrency(form.amount)}</td>
                                                    <td className="px-2 py-2 border text-sm">
                                                        ₹ {formatCurrency(derived.paidAmount)}
                                                    </td>

                                                    <td className="px-3 py-2 border text-sm text-red-600">₹ {formatCurrency(derived.amountDue)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* additional details */}
                                <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">

                                        {form.transactionId && (
                                            <div>
                                                <div className="text-xs text-gray-600">Transaction ID</div>
                                                <div className="text-gray-900">{form.transactionId}</div>
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* footer signature + print/back */}
                                {/* <div className="flex items-center justify-between mt-6 border-t pt-4">
                                    <div>
                                        <div className="text-xs text-gray-600">Payment Receipt Generated On</div>
                                        <div className="font-semibold">{new Date().toLocaleDateString("en-IN")}</div>
                                    </div>

                                  
                                </div> */}
                            </div>
                        </div>
                    </div> {/* grid */}
                </div>
            </div>
        </LayoutComponent>
    );
}

export default EditPayment;
