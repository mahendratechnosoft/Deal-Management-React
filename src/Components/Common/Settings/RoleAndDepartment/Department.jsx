import { useState, useEffect } from "react";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-1 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-4"></div>
    </td>
    <td className="px-6 py-1 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </td>
    <td className="px-6 py-1 whitespace-nowrap">
      <div className="flex gap-2">
        <div className="h-6 w-12 bg-gray-200 rounded"></div>
        <div className="h-6 w-12 bg-gray-200 rounded"></div>
        <div className="h-6 w-12 bg-gray-200 rounded"></div>
      </div>
    </td>
  </tr>
);

const MiniSpinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-current"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

function Department() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDepartments, setTotalDepartments] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateModalError, setUpdateModalError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, [searchTerm]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/admin/getAllDepartment", {
        params: {
          name: searchTerm,
        },
      });
      setDepartments(response.data);
      setTotalDepartments(response.data.length);
    } catch (err) {
      console.error("Error fetching departments:", err);
      toast.error("Failed to load departments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create Department
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) {
      setModalError("Department name cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await axiosInstance.post("/admin/createDepartment", {
        name: newDepartmentName,
      });
      handleCloseModal();
      fetchDepartments();
      toast.success("Department created successfully.");
    } catch (err) {
      console.error("Error creating department:", err);
      setModalError(
        err.response?.data?.message || "Failed to create department."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setNewDepartmentName("");
    setModalError(null);
  };

  // Update Department
  const handleOpenUpdateModal = (dept) => {
    setEditingDepartment(dept);
    setIsUpdateModalOpen(true);
    setUpdateModalError(null);
  };

  const handleCloseUpdateModal = () => {
    if (isUpdating) return;
    setIsUpdateModalOpen(false);
    setEditingDepartment(null);
    setUpdateModalError(null);
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    if (!editingDepartment || !editingDepartment.name.trim()) {
      setUpdateModalError("Department name cannot be empty.");
      return;
    }
    setIsUpdating(true);
    setUpdateModalError(null);
    try {
      await axiosInstance.post("/admin/createDepartment", {
        name: editingDepartment.name,
        departmentId: editingDepartment.departmentId,
      });
      handleCloseUpdateModal();
      fetchDepartments();
      toast.success("Department updated successfully.");
    } catch (err) {
      console.error("Error updating department:", err);
      setUpdateModalError(
        err.response?.data?.message || "Failed to update department."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Department
  const executeDelete = async (departmentId, name) => {
    setDeletingId(departmentId);
    try {
      await axiosInstance.delete(`/admin/deleteDepartment/${departmentId}`);
      setDepartments((prevDepartments) =>
        prevDepartments.filter((dept) => dept.departmentId !== departmentId)
      );
      toast.success(`Department "${name}" deleted successfully.`);
    } catch (err) {
      console.error("Error deleting department:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Failed to delete department. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteDepartment = (department) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert deleting "${department.name}"!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        executeDelete(department.departmentId, department.name);
      }
    });
  };

  const handleViewRoles = (departmentId, departmentName) => {
    navigate(`/Admin/Settings/Department/${departmentId}/Roles`, {
      state: { departmentName },
    });
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      );
    }

    if (departments.length === 0) {
      return (
        <tr>
          <td colSpan="3" className="px-6 py-8 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No departments found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first department."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Your First Department
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    }

    return departments.map((dept, index) => (
      <tr
        key={dept.departmentId}
        className="hover:bg-gray-50 transition-colors duration-150"
      >
        <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">
          {index + 1}
        </td>
        <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-900 font-semibold">
          {dept.name}
        </td>
        <td className="px-6 py-1 whitespace-nowrap text-sm font-medium">
          <div className="flex gap-2">
            {/* View Roles Button */}
            <button
              onClick={() => handleViewRoles(dept.departmentId, dept.name)}
              disabled={deletingId === dept.departmentId}
              className="text-green-600 hover:text-green-800 font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Roles
            </button>

            {/* Edit Button */}
            <button
              onClick={() => handleOpenUpdateModal(dept)}
              disabled={deletingId === dept.departmentId}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>

            {/* Delete Button */}
            <button
              onClick={() => handleDeleteDepartment(dept)}
              disabled={deletingId === dept.departmentId}
              className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              {deletingId === dept.departmentId ? (
                <MiniSpinner />
              ) : (
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
              {deletingId === dept.departmentId ? "Deleting..." : "Delete"}
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
      {/* Header Section - Consistent with other list pages */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Departments
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage and organize departments and their roles
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
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
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
              Create Department
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
        {/* Total Departments Card */}
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 text-[12px] font-medium truncate">
                Total Departments
              </p>
              <p className="text-gray-900 text-sm font-bold truncate">
                {totalDepartments.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "70%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>

            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Create New Department
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors duration-200"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateDepartment}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter department name"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {modalError && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {modalError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Department"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Update Department
              </h3>
              <button
                onClick={handleCloseUpdateModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors duration-200"
                disabled={isUpdating}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateDepartment}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter department name"
                  value={editingDepartment?.name || ""}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      name: e.target.value,
                    })
                  }
                  disabled={isUpdating}
                />
              </div>

              {updateModalError && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {updateModalError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  disabled={isUpdating}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Department"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Department;
