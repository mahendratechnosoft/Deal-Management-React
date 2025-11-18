import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";

import Pagination from "../pagination";
import CreateSample from "./CreateSample";

function SelectedDonarList() {
    const navigate = useNavigate();
    const { LayoutComponent, role } = useLayout();
    const [searchTerm, setSearchTerm] = useState("");
    const [industryFilter, setIndustryFilter] = useState("all");
    const [Donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDonors, setTotalDonors] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [openModal, setOpenModal] = useState(false);





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

    // Fetch Donors with search functionality - using useCallback to prevent unnecessary recreations
    // Fetch Donors with dummy records (no API call)
     const fetchDonors = useCallback(
        async (page = 0, search = "") => {
            setLoading(true);

            try {
                const response = await axiosInstance.get(
                    `getAllSelectedDonarList/${page}/${pageSize}`,
                    {
                        params: {
                            search: search
                        }
                    }
                );

                const data = response.data;

                // Extract values from backend response
                const DonorList = data.donarList || [];
                const totalPages = data.totalPages || 1;
                const currentPage = data.currentPage || 0;

                // Update state
                setDonors(DonorList);
                setCurrentPage(currentPage);
                setTotalPages(totalPages);
                setTotalDonors(DonorList.length);

                setError(null);
            } catch (err) {
                console.error("Error fetching Donors:", err);
                setError("Failed to load Donor list");
            }

            setLoading(false);
        },
        [pageSize]
    );


    // Single useEffect for data fetching
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDonors(0, searchTerm);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchDonors]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchDonors(newPage, searchTerm);
        }
    };

    // 🔥 MODAL HANDLERS - Most Important
    const handleCreateDonor = () => {
        setShowCreateModal(true); // Open modal instead of navigating
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        // toast.success("Donor created successfully!");
        fetchDonors(currentPage, searchTerm); // Refresh the list
    };



    const handleEdit = (DonorId) => {
        if (role === "ROLE_ADMIN") {
            navigate(`/Admin/SampleList/${DonorId}`);
        } else if (role === "ROLE_EMPLOYEE") {
            navigate(`/Employee/SampleList/${DonorId}`);
        }
    };

    // Contact Management Functions
    const handleContact = (Donor) => {
        setSelectedDonor(Donor);
        setShowContactModal(true);
    };

    const handleCloseContactModal = () => {
        setShowContactModal(false);
        setSelectedDonor(null);
    };

    const handleRefresh = () => {
        fetchDonors(currentPage, searchTerm);
    };

    const handleDelete = async (DonorId) => {
        if (window.confirm("Are you sure you want to delete this Donor?")) {
            try {
                await axiosInstance.delete(`deleteDonor/${DonorId}`);
                toast.success("Donor deleted successfully!");
                fetchDonors(currentPage, searchTerm);
            } catch (error) {
                console.error("Error deleting Donor:", error);
                toast.error("Failed to delete Donor");
            }
        }
    };



    const getInitials = (companyName) => {
        if (!companyName) return "??";
        return companyName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return "₹0.00";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Filter Donors based on industry
    const filteredDonors = Donors.filter((Donor) => {
        const matchesIndustry =
            industryFilter === "all" ||
            Donor.industry?.toLowerCase() === industryFilter.toLowerCase();
        return matchesIndustry;
    });

    if (error) {
        return (
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
                        Error Loading Donors
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
                                      Selected  Donors List
                                    </h1>
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
                                        placeholder="Search Donors..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                                    />
                                </div>


                            </div>

                            {/* Create Button */}
                            {/* <button hidden
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                                onClick={() => setOpenModal(true)}
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
                            </button>  */}
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
                                        UIN
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NAME
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        AGE
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        DOB
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Material Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mobile
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        City
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            {loading ? (
                                <TableSkeleton rows={6} cols={7} />
                            ) : (
                                <tbody className="bg-white divide-y divide-gray-200 overflow-x-auto">
                                    {filteredDonors.map((Donor) => (
                                        <tr
                                            key={Donor.donorId}
                                            className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                                            onClick={() => handleEdit(Donor.donorId)}
                                        >
                                            {/* AGE */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {Donor.uin || "N/A"}
                                            </td>
                                          
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 
                                                        rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        {getInitials(Donor.name)}
                                                    </div>

                                                    <div className="font-semibold">
                                                        {Donor.name || "N/A"}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* AGE */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {Donor.age || "N/A"}
                                            </td>

                                            {/* DOB */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {Donor.dateOfBirth || "N/A"}
                                            </td>

                                            {/* Material Status */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {Donor.marriedStatus || "N/A"}
                                            </td>

                                            {/* Mobile */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {Donor.phoneNumber || "N/A"}
                                            </td>

                                            {/* City */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {Donor.city || "N/A"}
                                            </td>

                                            {/* Address */}
                                            <td className="px-4 py-3 whitespace-nowrap text-sm truncate max-w-[150px]">
                                                {Donor.address || "N/A"}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm truncate max-w-[150px]">
                                               <button className="text-blue-600 hover:text-blue-800 font-medium"> Open Sample</button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            )}
                        </table>
                    </div>

                    {!loading && filteredDonors.length === 0 && (
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
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Donors found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || industryFilter !== "all"
                                    ? "Try adjusting your search or filter criteria."
                                    : "Get started by creating your first Donor."}
                            </p>
                            {!searchTerm && industryFilter === "all" && (
                                <button
                                    onClick={handleCreateDonor}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Create Your First Lead
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalDonors}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={(newSize) => {
                        // update pageSize and reset to page 0
                        setPageSize(newSize);
                        fetchDonors(0, searchTerm);
                    }}
                    itemsName="Donors"
                    showPageSize={true}
                    sticky={true}
                />


                {/* Modal */}
                <CreateSample
                    isOpen={openModal}
                    onClose={() => setOpenModal(false)}
                    onSuccess={() => console.log("Donor added!")}
                />
            </div>





        </LayoutComponent>
    );
}

export default SelectedDonarList;
