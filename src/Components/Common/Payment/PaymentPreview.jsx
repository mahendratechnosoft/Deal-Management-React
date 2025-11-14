import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLayout } from "../../Layout/useLayout";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from 'react-hot-toast';

function PaymentPreview() {
    const { LayoutComponent } = useLayout();
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`getPaymentById/${paymentId}`);
                console.log("Payment API Response:", response.data); // Debug log
                setPaymentData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching payment details:', err);
                setError('Failed to load payment details');
                toast.error('Failed to load payment details');
            } finally {
                setLoading(false);
            }
        };

        if (paymentId) {
            fetchPaymentDetails();
        }
    }, [paymentId]);

    const handleBack = () => {
        navigate(-1);
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (!amount) return "0.00";
        return parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString('en-IN');
        } catch (error) {
            return "Invalid Date";
        }
    };

    if (loading) {
        return (
            <LayoutComponent>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </LayoutComponent>
        );
    }

    if (error) {
        return (
            <LayoutComponent>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-600 text-lg mb-4">{error}</div>
                        <button
                            onClick={handleBack}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </LayoutComponent>
        );
    }

    if (!paymentData) {
        return (
            <LayoutComponent>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-gray-600 text-lg mb-4">Payment not found</div>
                        <button
                            onClick={handleBack}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </LayoutComponent>
        );
    }

    // Use actual data from API response - no fake fallbacks
    const displayData = {
        // Payment details
        amountReceived: paymentData.amount ? formatCurrency(paymentData.amount) : "N/A",
        tdsAmount: paymentData.tdsAmount ? formatCurrency(paymentData.tdsAmount) : "-",
        paymentDate: formatDate(paymentData.paymentDate),
        paymentMode: paymentData.paymentMode || "N/A",
        paymentMethod: paymentData.paymentMethod || "N/A",
        transactionId: paymentData.transactionId || "N/A",
        note: paymentData.note || "N/A",
        
        // Company details - use actual data from API
        companyName: paymentData.companyName || "N/A",
        companyAddress: paymentData.companyAddress || "N/A",
        gstNumber: paymentData.gstNumber || "N/A",
        panNumber: paymentData.panNumber || "N/A",
        mobileNo: paymentData.mobileNo || "N/A",
        email: paymentData.email || "N/A",
        
        // Client details
        clientName: paymentData.clientName || paymentData.companyName || "N/A",
        
        // Invoice details
        proformaInvoiceNo: paymentData.proformaInvoiceNo || "N/A",
        invoiceDate: formatDate(paymentData.invoiceDate || paymentData.paymentDate),
        invoiceAmount: paymentData.invoiceAmount ? formatCurrency(paymentData.invoiceAmount) : paymentData.amount ? formatCurrency(paymentData.amount) : "N/A"
    };

    return (
        <LayoutComponent>
             <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Back Button */}
                    <div className="mb-4 print:hidden">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Payments
                        </button>
                    </div>

                    {/* Print-friendly container */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 print:shadow-none print:border-0">

                        {/* Company Header */}
                        <div className="mb-6">
                            <div className="text-center mb-4">
                                <h1 className="text-2xl font-bold text-gray-800">{displayData.companyName}</h1>
                            </div>
                            <div className="text-center text-sm text-gray-600 mb-6">
                                <p className="leading-tight">{displayData.companyAddress}</p>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                                    <p><span className="font-semibold">GST Number:</span> {displayData.gstNumber}</p>
                                    <p><span className="font-semibold">PAN:</span> {displayData.panNumber}</p>
                                    <p><span className="font-semibold">Mobile No:</span> {displayData.mobileNo}</p>
                                    <p><span className="font-semibold">Email:</span> {displayData.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Client Name */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">{displayData.clientName}</h2>
                        </div>

                        {/* Payment Receipt Title */}
                        <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
                            <h1 className="text-3xl font-bold text-gray-800">PAYMENT RECEIPT</h1>
                        </div>

                        {/* Payment Details - Simple Layout */}
                        <div className="mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <div className="mb-4">
                                        <span className="font-semibold text-gray-700 block mb-1">Payment Date:</span>
                                        <span className="text-gray-900 text-lg">{displayData.paymentDate}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 block mb-1">Payment Mode:</span>
                                        <span className="text-gray-900 text-lg">{displayData.paymentMode}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="mb-4">
                                        <span className="font-semibold text-gray-700 block mb-1">Total Amount</span>
                                        <span className="text-3xl font-bold text-green-600">₹{displayData.amountReceived}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment For Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Payment For</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-300">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                                                Invoice Number
                                            </th>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                                                Invoice Date
                                            </th>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                                                TDS
                                            </th>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                                                Invoice Amount
                                            </th>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                                                Payment Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                                {displayData.proformaInvoiceNo}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                                {displayData.invoiceDate}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                                {displayData.tdsAmount === "-" ? "₹ -" : `₹${displayData.tdsAmount}`}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-900">
                                                ₹{displayData.invoiceAmount}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">
                                                ₹{displayData.amountReceived}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Additional Payment Details */}
                        {(displayData.paymentMethod !== "N/A" || displayData.transactionId !== "N/A" || displayData.note !== "N/A") && (
                            <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
                                <h3 className="font-semibold text-gray-700 mb-3">Additional Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {displayData.paymentMethod !== "N/A" && (
                                        <div>
                                            <span className="font-semibold">Payment Method:</span> {displayData.paymentMethod}
                                        </div>
                                    )}
                                    {displayData.transactionId !== "N/A" && (
                                        <div>
                                            <span className="font-semibold">Transaction ID:</span> {displayData.transactionId}
                                        </div>
                                    )}
                                    {displayData.note !== "N/A" && (
                                        <div className="md:col-span-2">
                                            <span className="font-semibold">Note:</span> {displayData.note}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer Signature Section */}
                        <div className="mt-12 pt-8 border-t border-gray-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Payment Receipt Generated On</p>
                                    <p className="font-semibold">{new Date().toLocaleDateString('en-IN')}</p>
                                </div>
                                <div className="text-center">
                                    <div className="inline-block p-4">
                                        <p className="text-sm text-gray-600 mb-8">Authorized Signature</p>
                                        <div className="border-t border-gray-400 w-48 mx-auto"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex justify-center gap-4 print:hidden">
                            <button
                                onClick={() => window.print()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Receipt
                            </button>

                            <button
                                onClick={handleBack}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutComponent>
    );
}

export default PaymentPreview;