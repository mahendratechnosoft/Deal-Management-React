import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../../Layout/useLayout";
import CreateFamily from "./CreateFamily";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { toast } from "react-hot-toast";
import Pagination from "../pagination"; // Ensure this path is correct
import FamilyListPDFModal from "./FamilyListPDFModal";

const PdfIcon = () => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
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

const PreviewIcon = () => (
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
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

function FamilyList() {
  const { LayoutComponent, role } = useLayout();
  const navigate = useNavigate();

  // --- Data State ---
  const [familyList, setFamilyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [openModal, setOpenModal] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);

  // 3. Add PDF handler
  const handleViewPDF = (familyInfoId) => {
    setSelectedFamilyId(familyInfoId);
    setPdfModalOpen(true);
  };
  // --- Fetch Data ---
  const fetchFamilyList = useCallback(
    async (page = 0, search = "") => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `getAllFamilyList/${page}/${pageSize}`,
          {
            params: {
              search: search,
            },
          }
        );
        const data = response.data;
        console.log("Family List Data:", data);

        setFamilyList(data.familyList || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 0);
        setTotalElements(data.totalElements || 0);
      } catch (error) {
        console.error("Error fetching family list:", error);
        toast.error("Failed to load family list.");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // --- Effects ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFamilyList(0, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchFamilyList]);

  // --- Handlers ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditFamily = (familyInfoId) => {
    if (role === "ROLE_ADMIN") {
      navigate(`/Admin/EditFamily/${familyInfoId}`);
    } else {
      navigate(`/Employee/EditFamily/${familyInfoId}`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchFamilyList(newPage, searchTerm);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
  };

  const handleSuccess = () => {
    fetchFamilyList(currentPage, searchTerm);
  };

  // --- Skeleton Loader ---
  const TableSkeleton = ({ rows = 5, cols = 6 }) => {
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
      {/* Main Container: 
          - h-[90vh] ensures it takes up viewport height.
          - flex flex-col makes children stack vertically.
      */}
      <div className="p-6 pb-0 h-[90vh] flex flex-col">
        {/* Header Section (Fixed Height) */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Family List
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
                  placeholder="Search Family"
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
                Create Family
              </button>
            </div>
          </div>
        </div>

        {/* Table Container: 
            - flex-grow: Takes up remaining space.
            - overflow-hidden: Prevents outer scroll.
            - flex flex-col: Stacks table and pagination.
        */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-grow overflow-hidden">
          {/* Table Wrapper: 
              - flex-grow: Takes up all space not used by pagination.
              - overflow-auto: Enables internal scrolling for the table body.
          */}
          <div className="flex-grow overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UIN
                  </th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Husband Name
                  </th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wife Name
                  </th>
                  <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refer Hospital
                  </th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refer Doctor
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <TableSkeleton rows={10} cols={6} />
                ) : familyList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <p>No families found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  familyList.map((family) => (
                    <tr
                      key={family.familyInfoId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 truncate text-sm text-gray-900 font-medium">
                        {family.uin || "-"}
                      </td>
                      <td className="px-4 py-4 truncate text-sm text-gray-900 font-bold">
                        {family.husbandName}
                      </td>
                      <td className="px-4 py-4 truncate text-sm text-gray-900">
                        {family.wifeName}
                      </td>
                      <td className="px-4 py-4 truncate text-sm text-gray-900">
                        {family.referHospital}
                      </td>
                      <td className="px-4 py-4 truncate text-sm text-gray-900">
                        {family.referDoctor}
                      </td>

                      <td className="px-4 py-1 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            title="Edit"
                            onClick={() =>
                              handleEditFamily(family.familyInfoId)
                            }
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          >
                            <EditIcon />
                          </button>

                          {/* <button
                            title="Preview"
                            onClick={() => handleEditFamily(family.familyInfoId)}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-50"
                          >
                            <PreviewIcon />
                          </button> */}

                          <button
                            title="Generate PDF"
                            onClick={() => handleViewPDF(family.familyInfoId)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <PdfIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Component (Fixed at Bottom of Container) */}
          {!loading && (
            <div className="border-t border-gray-200 bg-white flex-shrink-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalElements}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                itemsName="families"
                showPageSize={true}
              />
            </div>
          )}
        </div>
      </div>
      <FamilyListPDFModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        familyId={selectedFamilyId}
      />

      {/* Modal */}
      <CreateFamily
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={handleSuccess}
        donorId={null}
      />
    </LayoutComponent>
  );
}

export default FamilyList;
