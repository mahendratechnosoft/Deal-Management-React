import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import Pagination from "../pagination";
import CreateSampleReport from "./CreateSampleReport";

function SampleReport() {
    const navigate = useNavigate();
    const { donorId } = useParams();
    const { LayoutComponent, role } = useLayout();
    const [searchTerm, setSearchTerm] = useState("");
    const [sampleReports, setSampleReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [openModal, setOpenModal] = useState(false);

    const InlineSpinner = ({ label = "Loading..." }) => (
        <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            <span className="text-sm text-gray-600">{label}</span>
        </div>
    );

    const TableSkeleton = ({ rows = 5, cols = 9 }) => {
        const r = Array.from({ length: rows });
        const c = Array.from({ length: cols });
        return (
            <tbody>
                {r.map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        {c.map((_, j) => (
                            <td key={j} className="px-4 py-3">
                                <div className="h-4 bg-gray-200 rounded w-full" />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        );
    };

    // Fetch sample reports from API
    const fetchSampleReports = useCallback(
        async (page = 0, search = "") => {
            if (!donorId) {
                setError("Sample ID is required");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get(
                    `getAllSampleReportList/${page}/${pageSize}/${donorId}?search=${search}`
                );

                if (response.data && response.data.SampleReportList) {
                    setSampleReports(response.data.SampleReportList);
                    setCurrentPage(response.data.currentPage);
                    setTotalPages(response.data.totalPages);
                    setTotalReports(response.data.SampleReportList.length);
                } else {
                    setSampleReports([]);
                    setTotalReports(0);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Error fetching sample reports:", error);
                setError("Failed to load sample reports. Please try again.");
                toast.error("Failed to load sample reports");
            } finally {
                setLoading(false);
            }
        },
        [donorId, pageSize]
    );

    // Single useEffect for data fetching
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSampleReports(0, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchSampleReports]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchSampleReports(newPage, searchTerm);
        }
    };

    const handleEdit = (sampleReportId) => {
        if (role === "ROLE_ADMIN") {
         //   navigate(`/Admin/SampleReportEdit/${sampleReportId}`);
        } else if (role === "ROLE_EMPLOYEE") {
         //   navigate(`/Employee/SampleReportEdit/${sampleReportId}`);
        }
    };

     const handleOpenSample = (sampleReportId) => {
        if (role === "ROLE_ADMIN") {
            navigate(`/Admin/SampleList/${sampleReportId}`);
        } else if (role === "ROLE_EMPLOYEE") {
            navigate(`/Employee/SampleList/${sampleReportId}`);
        }
    };

    const handleRefresh = () => {
        fetchSampleReports(currentPage, searchTerm);
    };

    const handleDelete = async (sampleReportId) => {
        if (window.confirm("Are you sure you want to delete this sample report?")) {
            try {
                await axiosInstance.delete(`deleteSampleReport/${sampleReportId}`);
                toast.success("Sample report deleted successfully!");
                fetchSampleReports(currentPage, searchTerm);
            } catch (error) {
                console.error("Error deleting sample report:", error);
                toast.error("Failed to delete sample report");
            }
        }
    };

    const handleCreateSuccess = () => {
        setOpenModal(false);
        toast.success("Sample report created successfully!");
        fetchSampleReports(currentPage, searchTerm);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    if (error && !loading) {
        return (
            <LayoutComponent>
                <div className="p-6 flex items-center justify-center min-h-screen">
                    <div className="text-center text-red-600 max-w-md">
                        <svg
                            className="w-16 h-16 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        <h3 className="text-lg font-semibold mb-2">
                            Error Loading Sample Reports
                        </h3>
                        <p className="mb-4">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={handleRefresh}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </LayoutComponent>
        );
    }

    return (
        <LayoutComponent>
            <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
                {/* Header Section */}
                <div className="mb-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Sample Report List
                                    </h1>
                                    {donorId && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            DonorId ID: {donorId}
                                        </p>
                                    )}
                                    {!loading && (
                                        <p className="text-sm text-gray-600">
                                            {totalReports} report(s) found
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            {/* Search and Filters */}
                            <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                {/* Search Input */}
                                <div className="relative flex-1 sm:max-w-64">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg
                                            className="w-4 h-4 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search reports..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                                disabled={loading}
                            >
                                <svg
                                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Refresh
                            </button>

                            {/* Create Button */}
                            <button
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                                onClick={() => setOpenModal(true)}
                                disabled={loading}
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
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Create Sample Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto crm-Leadlist-kanbadn-col-list">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Media
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Volume
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sperm Concentration
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Million
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progressive Motility
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Morphology
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Abnormality
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            {loading ? (
                                <TableSkeleton rows={6} cols={9} />
                            ) : (
                                <tbody className="bg-white divide-y divide-gray-200 overflow-x-auto">
                                    {sampleReports.map((report) => (
                                        <tr
                                            key={report.sampleReportId}
                                            className="hover:bg-gray-50 transition-colors duration-150 group"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {formatDate(report.dateAndTime)}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {report.media || "N/A"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {report.volumne || "0"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {report.spermConcentration || "N/A"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {report.million || "0"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {report.progressiveMotility || "N/A"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {report.morphology || "N/A"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {report.abnormality || "N/A"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(report.sampleReportId)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(report.sampleReportId)}
                                                        className="text-red-600 hover:text-red-800 font-medium ml-4"
                                                    >
                                                        Delete
                                                    </button>
                                                      <button 
                                                        onClick={() => handleOpenSample(report.sampleReportId)}
                                                        className="text-blue-600 hover:text-red-800 font-medium ml-4"
                                                    >
                                                        Open samples
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            )}
                        </table>
                    </div>

                    {!loading && sampleReports.length === 0 && (
                        <div className="text-center py-12">
                            <svg
                                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No sample reports found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm
                                    ? "No reports match your search criteria."
                                    : "No sample reports have been created yet."}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setOpenModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Create First Report
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && sampleReports.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalReports}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            fetchSampleReports(0, searchTerm);
                        }}
                        itemsName="reports"
                        showPageSize={true}
                        sticky={true}
                    />
                )}

                {/* Create Sample Report Modal */}
                <CreateSampleReport
                    isOpen={openModal}
                    onClose={() => setOpenModal(false)}
                    onSuccess={handleCreateSuccess}
                    donorId={donorId}
                />
            </div>
        </LayoutComponent>
    );
}

export default SampleReport;