import { useState, useEffect } from "react";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-4"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {/* 2. UPDATED for three buttons */}
      <div className="flex gap-4">
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
    </td>
  </tr>
);

// A small spinner component for the delete button
const MiniSpinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-currentColor"
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

  // --- Create Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // --- Update Modal State ---
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
    } catch (err) {
      console.error("Error fetching departments:", err);
      toast.error("Failed to load departments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Create Modal Logic ---
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

  // --- Update Modal Logic ---
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
      toast.error("Failed to update department. Please try again.");
      setUpdateModalError(
        err.response?.data?.message || "Failed to update department."
      );
    } finally {
      setIsUpdating(false);
    }
  };
  const executeDelete = async (departmentId, name) => {
    setDeletingId(departmentId);
    try {
      await axiosInstance.delete(`/admin/deleteDepartment/${departmentId}`);
      setDepartments((prevDepartments) =>
        prevDepartments.filter((dept) => dept.departmentId !== departmentId)
      );
      toast.success(`Department "${name}" deleted successfully.`);
    } catch (err) {
      console.error("Error deleting role:", err);
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
      confirmButtonColor: "#3085d6", // Blue
      cancelButtonColor: "#d33", // Red
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
          <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
            No departments found.
          </td>
        </tr>
      );
    }

    return departments.map((dept, index) => (
      <tr key={dept.departmentId}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {index + 1}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          {dept.name}
        </td>
        {/* --- UPDATED ACTIONS CELL --- */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex gap-4">
            {/* View Roles Button */}
            <button
              onClick={() => handleViewRoles(dept.departmentId, dept.name)}
              disabled={deletingId === dept.departmentId} // Disable if deleting
              className="text-green-600 hover:text-green-900 font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1.5a4.5 4.5 0 014.5-4.5h3a4.5 4.5 0 014.5 4.5V21zm4-12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Roles
            </button>
            {/* Edit Button */}
            <button
              onClick={() => handleOpenUpdateModal(dept)}
              disabled={deletingId === dept.departmentId} // Disable if deleting
              className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* New Delete Button */}
            <button
              onClick={() => handleDeleteDepartment(dept)}
              disabled={deletingId === dept.departmentId} // Disable if deleting
              className="text-red-600 hover:text-red-900 font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          <div className="sm:col-span-1">
            <h2 className="text-xl font-bold text-gray-900">
              Department and Roles
            </h2>
          </div>
          <div className="relative w-full sm:col-span-1">
            <input
              type="text"
              placeholder="Search department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
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
          </div>
          <div className="sm:col-span-1 flex sm:justify-end w-full">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
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

      {/* --- Table --- */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: "5%" }}
                >
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Name
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: "15%" }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Create Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Department
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSubmitting}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateDepartment}>
              <div className="relative mb-4">
                <input
                  type="text"
                  id="dept-name"
                  className="block w-full px-3 py-2.5 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                  placeholder=" "
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="dept-name"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1
                      peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5
                      peer-focus:px-2 peer-focus:text-blue-600 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2
                      pointer-events-none"
                >
                  Department Name
                </label>
              </div>

              {modalError && (
                <div className="mb-4 text-sm text-red-600">{modalError}</div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {isSubmitting ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Update Modal --- */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Update Department
              </h3>
              <button
                onClick={handleCloseUpdateModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={isUpdating}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateDepartment}>
              <div className="relative mb-4">
                <input
                  type="text"
                  id="update-dept-name"
                  className="block w-full px-3 py-2.5 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                  placeholder=" "
                  value={editingDepartment?.name || ""}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      name: e.target.value,
                    })
                  }
                  disabled={isUpdating}
                />
                <label
                  htmlFor="update-dept-name"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1
                    peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5
                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2
                    pointer-events-none"
                >
                  Department Name
                </label>
              </div>

              {updateModalError && (
                <div className="mb-4 text-sm text-red-600">
                  {updateModalError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {isUpdating ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                  ) : (
                    "Update"
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
