import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../../Layout/useLayout";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-hot-toast";
import Pagination from "../pagination";
import CreateSemenEnquiry from "./CreateSemenEnquiry";

// --- Icons ---
const EditIcon = () => (
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
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

function SemenEnquiryList() {
  const { LayoutComponent, role } = useLayout();
  const navigate = useNavigate();

  // --- Data State ---
  const [enquiryList, setEnquiryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // --- Modal State (Placeholder for Create Modal) ---
  const [openModal, setOpenModal] = useState(false);

  // --- Fetch Data ---
  const fetchEnquiryList = useCallback(
    async (page = 0, search = "") => {
      setLoading(true);
      try {
        // Updated Endpoint based on your request
        const response = await axiosInstance.get(`getAllSemenEnquiry`, {
          params: {
            page: page,
            size: pageSize,
            search: search,
          },
        });
        const data = response.data;
        console.log("Semen Enquiry Data:", data);

        // Mapped based on the JSON structure provided (data.content holds the array)
        setEnquiryList(data.content || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.number || 0); // 'number' is usually the current page index in Spring Pageable
        setTotalElements(data.totalElements || 0);
      } catch (error) {
        console.error("Error fetching enquiry list:", error);
        toast.error("Failed to load enquiry list.");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // --- Effects ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEnquiryList(0, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchEnquiryList]);

  // --- Handlers ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditEnquiry = (id) => {
    // Adjust route as per your routing configuration
    if (role === "ROLE_ADMIN") {
      navigate(`/Admin/EditSemenEnquiry/${id}`);
    } else {
      navigate(`/Employee/EditSemenEnquiry/${id}`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchEnquiryList(newPage, searchTerm);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
  };

  const handleSuccess = () => {
    fetchEnquiryList(currentPage, searchTerm);
    setOpenModal(false);
  };

  // --- Helper to format date ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --- Skeleton Loader ---
  const TableSkeleton = ({ rows = 5, cols = 5 }) => {
    const r = Array.from({ length: rows });
    const c = Array.from({ length: cols });
    return (
      <tbody>
        {r.map((_, i) => (
          <tr key={i} className="animate-pulse border-b border-gray-100">
            {c.map((_, j) => (
              <td key={j} className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 h-[90vh] flex flex-col">
        {/* Header Section */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Semen Enquiries
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
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
                  placeholder="Search by Name"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                />
              </div>

              {/* Create Button */}
              <button
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
                New Enquiry
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-grow overflow-hidden">
          {/* Table Wrapper */}
          <div className="flex-grow overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="w-[5%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DOB
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marital Status
                  </th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  // Adjusted skeleton cols to match new column count (8)
                  <TableSkeleton rows={10} cols={8} />
                ) : enquiryList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-300 mb-2"
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
                        <p>No enquiries found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  enquiryList.map((item) => (
                    <tr
                      key={item.semenEnquiryId}
                      onClick={() => handleEditEnquiry(item.semenEnquiryId)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-4 truncate max-w-0 text-sm text-gray-900 font-bold">
                        {item.name || "N/A"}
                      </td>

                      <td className="px-4 py-4 truncate max-w-0 text-sm text-gray-900">
                        {item.age || "-"}
                      </td>

                      <td className="px-4 py-4 truncate max-w-0 text-sm text-gray-900">
                        {formatDate(item.dateOfBirth)}
                      </td>

                      <td className="px-4 py-4 truncate max-w-0 text-sm text-gray-900">
                        {item.marriedStatus || "-"}
                      </td>

                      <td className="px-4 py-4 truncate max-w-0 text-sm text-gray-900">
                        {item.phoneNumber || "-"}
                      </td>

                      <td className="px-4 py-4 truncate max-w-0 text-sm text-gray-900">
                        {item.city || "-"}
                      </td>

                      <td
                        className="px-4 py-4 truncate max-w-0 text-sm text-gray-900"
                        title={item.address}
                      >
                        {item.address || "-"}
                      </td>

                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            title="Edit / View"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEnquiry(item.semenEnquiryId);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          >
                            <EditIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && (
            <div className="border-t border-gray-200 bg-white flex-shrink-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalElements}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                itemsName="enquiries"
                showPageSize={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Note: You'll need to create a 'CreateSemenEnquiry' component 
        similar to 'CreateFamily' if you want the modal functionality.
      */}
      <CreateSemenEnquiry
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={handleSuccess}
      />
    </LayoutComponent>
  );
}

export default SemenEnquiryList;
