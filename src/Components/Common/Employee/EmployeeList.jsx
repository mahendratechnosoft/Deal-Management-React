import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Pagination from "../pagination";
import { useLayout } from "../../Layout/useLayout";
import CreateEmployeeModal from "./CreateEmployeeModal";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { showConfirmDialog, showDeleteConfirmation } from "../../BaseComponet/alertUtils";
// Skeleton component for a single table row
const EmployeeRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-1 whitespace-nowrap text-sm">
      <div className="h-4 bg-gray-200 rounded w-6"></div>
    </td>
    <td className="px-6 py-1 whitespace-nowrap text-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
        <div className="ml-3">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </td>
    <td className="px-6 py-1 whitespace-nowrap text-sm">
      <div className="h-4 bg-gray-200 rounded w-48"></div>
    </td>
    <td className="px-6 py-1 whitespace-nowrap text-sm">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-6 py-1 whitespace-nowrap text-sm">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-6 py-1 whitespace-nowrap text-sm">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
    </td>
  </tr>
);

// Skeleton component for the entire page
const EmployeeListSkeleton = () => {
  return (
    <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none animate-pulse">
      {/* Header Section Skeleton */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-7 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search Input Skeleton */}
            <div className="relative flex-1 sm:max-w-64">
              <div className="w-full h-11 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Create Button Skeleton */}
            <div className="w-full sm:w-48 h-11 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-2 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-200 flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section Skeleton */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <div className="relative">
            <table className="min-w-full divide-y divide-gray-200">
              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>

              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {[...Array(6)].map((_, index) => (
                    <th key={index} className="px-6 py-3 text-left">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(10)].map((_, index) => (
                  <EmployeeRowSkeleton key={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="py-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>

  );
};

function EmployeeList() {
  const { LayoutComponent, role } = useLayout();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Add modal state
  const [showCreateModal, setShowCreateModal] = useState(false);



  async function fetchEmployeesList(page = 0, search = "") {
    if (!loading) {
      setListLoading(true);
    }

    try {
      let url = `getAllEmployees/${page}/${pageSize}`;
      if (search.trim()) {
        url += `?search=${encodeURIComponent(search)}`;
      }

      const response = await axiosInstance.get(url);
      const data = response.data;

      setEmployees(data.employeeList || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
      setTotalEmployees(data.totalItems || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
      setListLoading(false);
    }
  }

  // Refresh data when pageSize changes
  useEffect(() => {
    fetchEmployeesList(0, searchTerm);
  }, [pageSize]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEmployeesList(0, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load data on component mount
  useEffect(() => {
    fetchEmployeesList(0);
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchEmployeesList(newPage, searchTerm);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
  };

  // const handleCreateEmployee = () => {
  //   navigate("/Admin/CreateEmployee");
  // };

  // Update the create employee handler
  const handleCreateEmployee = () => {
    setShowCreateModal(true);
  };

  // Add success handler for modal
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchEmployeesList(0, searchTerm); // Refresh the list
  };

  // Add close handler for modal
  const handleCloseModal = () => {
    setShowCreateModal(false);
  };


  const handleEdit = (employeeId) => {
    navigate(`/Admin/EditEmployee/${employeeId}`);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    fetchEmployeesList(0);
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };



const handleDelete = async (e, employeeId) => {
    e.stopPropagation();

    const result = await showDeleteConfirmation("this employee");
    
    if (!result.isConfirmed) return;

    try {
        await axiosInstance.delete(`admin/deleteEmployee/${employeeId}`);
        
        setEmployees((prev) => prev.filter((emp) => emp.employeeId !== employeeId));
        setTotalEmployees((prev) => prev - 1);
        
        toast.success("Employee deleted successfully!");
    } catch (error) {
        console.error("Delete employee failed:", error);
        toast.error("Failed to delete employee");
    }
};



  if (loading) {
    return (
      <LayoutComponent>
        <EmployeeListSkeleton />
      </LayoutComponent>
    );
  }
  if (error) {
    return (
      <LayoutComponent>
        <div className=" flex items-center justify-center min-h-screen">
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
              Error Loading Employees
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
                    Employees
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Manage and track all your employees in one place
                  </p>
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
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                />
              </div>

              {/* Create Button */}
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                onClick={handleCreateEmployee}
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
                Create Employee
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-gray-100">
                <svg
                  className="w-3 h-3 text-gray-600"
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
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-[12px] font-medium truncate">
                  Total Employees
                </p>
                <p className="text-gray-900 text-sm font-bold truncate">
                  {totalEmployees.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-blue-100">
                <svg
                  className="w-3 h-3 text-blue-600"
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
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-[12px] font-medium truncate">
                  Showing
                </p>
                <p className="text-gray-900 text-sm font-bold truncate">
                  {employees.length} of {totalEmployees}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <div className="relative">
              <table className="min-w-full divide-y divide-gray-200">
                <colgroup>
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "15%" }} />
                </colgroup>

                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {listLoading
                    ? Array.from({ length: pageSize }).map((_, index) => (
                      <EmployeeRowSkeleton key={index} />
                    ))
                    : employees.map((employee, index) => (
                      <tr
                        key={employee.id}
                        className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                        onClick={() => handleEdit(employee.employeeId)}
                      >
                        <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">
                          {currentPage * pageSize + index + 1}
                        </td>
                        <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {employee.profileImage ? (
                                <img
                                  className="w-8 h-8 rounded-full object-cover"
                                  src={`data:image/png;base64,${employee.profileImage}`}
                                  alt={`${employee.name} profile`}
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {getInitials(employee.name)}
                                </div>
                              )}
                            </div>

                            {/* Name + Buttons */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900">
                                {employee.name || "N/A"}
                              </div>

                              {/* ACTION BUTTONS (same style as leads table) */}
                              <div className="action-buttons flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {/* Edit Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(employee.employeeId);
                                  }}
                                  className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 text-xs"
                                  title="Edit"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 
                 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={(e) =>
                                    handleDelete(e, employee.employeeId)
                                  }
                                  className="text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-1 text-xs"
                                  title="Delete"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 
               0116.138 21H7.862a2 2 0 01-1.995-1.858L5 
               7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 
               0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-900">
                          {employee.loginEmail || "N/A"}
                        </td>
                        <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-900">
                          {employee.phone || "N/A"}
                        </td>
                        <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-900">
                          {employee.gender || "N/A"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {employees.length === 0 && !listLoading && (
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
                No employees found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first employee."}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateEmployee}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Your First Employee
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reusable Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalEmployees}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemsName="employees"
        />

        {/* Render the modal */}
        {showCreateModal && (
          <CreateEmployeeModal
            onClose={handleCloseModal}
            onSuccess={handleCreateSuccess}
          />
        )}
      </div>
    </LayoutComponent>
  );
}

export default EmployeeList;
