import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import Pagination from "../pagination";

import CreateSample from "./CreateSample";

function SampleList() {
    const navigate = useNavigate();
    const { sampleReportId } = useParams();
    const { uin } = useParams();
    const { LayoutComponent, role } = useLayout();
    const [searchTerm, setSearchTerm] = useState("");
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSamples, setTotalSamples] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [openModal, setOpenModal] = useState(false);

    const InlineSpinner = ({ label = "Loading..." }) => (
        <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            <span className="text-sm text-gray-600">{label}</span>
        </div>
    );

    const TableSkeleton = ({ rows = 5, cols = 8 }) => {
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

    // Fetch samples from API
    const fetchSamples = useCallback(
        async (page = 0, search = "") => {
            if (!sampleReportId) {
                setError(" Report ID is required");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get(
                    `getAllDonarSampleList/${page}/${pageSize}/${sampleReportId}?search=${search}`
                );

                if (response.data && response.data.donarSampleList) {
                    setSamples(response.data.donarSampleList);
                    setCurrentPage(response.data.number);
                    setTotalPages(response.data.totalPages);
                    setTotalSamples(response.data.totalElements);
                } else {
                    setSamples([]);
                    setTotalSamples(0);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Error fetching samples:", error);
                setError("Failed to load samples. Please try again.");
                toast.error("Failed to load samples");
            } finally {
                setLoading(false);
            }
        },
        [sampleReportId, pageSize]
    );

    // Single useEffect for data fetching
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSamples(0, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchSamples]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchSamples(newPage, searchTerm);
        }
    };

    const handleEdit = (sampleId) => {
        if (role === "ROLE_ADMIN") {
            navigate(`/Admin/SampleReport/${sampleId}`);
        } else if (role === "ROLE_EMPLOYEE") {
            navigate(`/Employee/SampleReport/${sampleId}`);
        }
    };

    const handleRefresh = () => {
        fetchSamples(currentPage, searchTerm);
    };

    const handleDelete = async (sampleId) => {
        if (window.confirm("Are you sure you want to delete this sample?")) {
            try {
                await axiosInstance.delete(`deleteSample/${sampleId}`);
                toast.success("Sample deleted successfully!");
                fetchSamples(currentPage, searchTerm);
            } catch (error) {
                console.error("Error deleting sample:", error);
                toast.error("Failed to delete sample");
            }
        }
    };

    const handleCreateSuccess = () => {
        setOpenModal(false);
        toast.success("Sample created successfully!");
        fetchSamples(currentPage, searchTerm); // Refresh the list
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
                            Error Loading Samples
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
                                     Sample List |  {uin}
                                    </h1>
                                    {!loading && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {totalSamples} sample(s) found
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
                                        placeholder="Search samples..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
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
                                Create Sample
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
                                        Tank No
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cane No
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Canister No
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No Of Vials
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Remarks
                                    </th>
                            
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            {loading ? (
                                <TableSkeleton rows={6} cols={7} />
                            ) : (
                                <tbody className="bg-white divide-y divide-gray-200 overflow-x-auto">
                                    {samples.map((sample) => (
                                        <tr
                                            key={sample.donorSampleId}
                                            className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                                          //  onClick={() => handleEdit(sample.donorSampleId)}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {sample.tankNo || "N/A"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {sample.caneNo || "N/A"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {sample.canisterNo || "N/A"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {sample.numberOfVials || "N/A"}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap text-sm max-w-[200px] truncate">
                                                {sample.remarks || "N/A"}
                                            </td>

                                          

                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    {/* <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(sample.donorSampleId);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Open Report
                                                    </button> */}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Add edit functionality here
                                                            console.log("Edit sample:", sample.donorSampleId);
                                                        }}
                                                        className="text-green-600 hover:text-green-800 font-medium ml-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(sample.donorSampleId);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 font-medium ml-4"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            )}
                        </table>
                    </div>

                    {!loading && samples.length === 0 && (
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
                                No samples found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm
                                    ? "No samples match your search criteria."
                                    : "No samples have been created for this donor yet."}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setOpenModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Create First Sample
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && samples.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalSamples}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            fetchSamples(0, searchTerm);
                        }}
                        itemsName="samples"
                        showPageSize={true}
                        sticky={true}
                    />
                )}

                {/* Create Sample Modal */}
                <CreateSample
                    isOpen={openModal}
                    onClose={() => setOpenModal(false)}
                    onSuccess={handleCreateSuccess}
                    sampleReportId={sampleReportId}
                />
            </div>
        </LayoutComponent>
    );
}

export default SampleList;