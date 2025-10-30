import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

// A small spinner component for the modal buttons
const MiniSpinner = () => (
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
);

// Skeleton for the role table (Updated for 3 columns)
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-4"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex gap-4">
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
    </td>
  </tr>
);

function RoleList() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { departmentId } = useParams(); // Get departmentId from URL
  const navigate = useNavigate();
  const location = useLocation();
  const departmentName = location.state?.departmentName || "Department";

  // --- Create Modal State ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createModalError, setCreateModalError] = useState(null);

  // --- Update Modal State ---
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateModalError, setUpdateModalError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (departmentId) {
      fetchRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/admin/getRoleByDepartment/${departmentId}`
      );
      setRoles(response.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast.error("Failed to load roles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Create Modal Logic ---
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setCreateModalError("Role name cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    setCreateModalError(null);
    try {
      await axiosInstance.post("/admin/createRole", {
        name: newRoleName,
        departmentId: departmentId, // From useParams()
      });
      handleCloseCreateModal();
      fetchRoles(); // Refresh the list
      toast.success("Role created successfully.");
    } catch (err) {
      console.error("Error creating role:", err);
      setCreateModalError(
        err.response?.data?.message || "Failed to create role."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCreateModal = () => {
    if (isSubmitting) return;
    setIsCreateModalOpen(false);
    setNewRoleName("");
    setCreateModalError(null);
  };

  // --- Update Modal Logic ---
  const handleOpenUpdateModal = (role) => {
    setEditingRole(role);
    setIsUpdateModalOpen(true);
    setUpdateModalError(null);
  };

  const handleCloseUpdateModal = () => {
    if (isUpdating) return;
    setIsUpdateModalOpen(false);
    setEditingRole(null);
    setUpdateModalError(null);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editingRole || !editingRole.name.trim()) {
      setUpdateModalError("Role name cannot be empty.");
      return;
    }
    setIsUpdating(true);
    setUpdateModalError(null);

    try {
      await axiosInstance.post("/admin/createRole", {
        name: editingRole.name,
        roleId: editingRole.roleId,
        departmentId: editingRole.departmentId,
      });
      handleCloseUpdateModal();
      fetchRoles(); // Refresh list after update
      toast.success("Role updated successfully.");
    } catch (err) {
      console.error("Error updating role:", err);
      setUpdateModalError(
        err.response?.data?.message || "Failed to update role."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const executeDelete = async (roleId, roleName) => {
    console.log(roleId, roleName);
    setDeletingId(roleId);

    try {
      await axiosInstance.delete(`/admin/deleteRole/${roleId}`);
      setRoles((prevRoles) =>
        prevRoles.filter((role) => role.roleId !== roleId)
      );
      // Use toast for success, as it's less intrusive
      toast.success(`Role "${roleName}" deleted successfully.`);
    } catch (err) {
      console.error("Error deleting role:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Failed to delete role. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteRole = (role) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You won't be able to revert deleting "${role.name}"!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6", // Blue
      cancelButtonColor: "#d33", // Red
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        executeDelete(role.roleId, role.name);
      }
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

    if (roles.length === 0) {
      return (
        <tr>
          {/* Updated colSpan */}
          <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
            No roles found for this department.
          </td>
        </tr>
      );
    }

    return roles.map((role, index) => (
      <tr key={role.roleId}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {index + 1}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          {role.name}
        </td>
        {/* --- NEW ACTIONS CELL --- */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex gap-4">
            <button
              onClick={() => handleOpenUpdateModal(role)}
              className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200 flex items-center gap-1"
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
              onClick={() => handleDeleteRole(role)}
              disabled={deletingId === role.roleId} // Disable if deleting
              className="text-red-600 hover:text-red-900 font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === role.roleId ? (
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
              {deletingId === role.roleId ? "Deleting..." : "Delete"}
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div>
      {/* Header bar updated with Create button */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Roles</h2>
            <p className="text-gray-600 mt-2">{departmentName}</p>
          </div>
          {/* Button container */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/Admin/Settings/Department")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Departments
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
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
              Create Role
            </button>
          </div>
        </div>
      </div>

      {/* Roles Table */}
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
                  Role Name
                </th>
                {/* --- NEW HEADER --- */}
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

      {/* --- Create Role Modal --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Role
              </h3>
              <button
                onClick={handleCloseCreateModal}
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
            <form onSubmit={handleCreateRole}>
              <div className="relative mb-4">
                <input
                  type="text"
                  id="role-name"
                  className="block w-full px-3 py-2.5 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                  placeholder=" "
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="role-name"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1
                      peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5
                      peer-focus:px-2 peer-focus:text-blue-600 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2
                      pointer-events-none"
                >
                  Role Name
                </label>
              </div>
              {createModalError && (
                <div className="mb-4 text-sm text-red-600">
                  {createModalError}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
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
                  {isSubmitting ? <MiniSpinner /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Update Role Modal --- */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Update Role</h3>
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
            <form onSubmit={handleUpdateRole}>
              <div className="relative mb-4">
                <input
                  type="text"
                  id="update-role-name"
                  className="block w-full px-3 py-2.5 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                  placeholder=" "
                  value={editingRole?.name || ""}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
                      name: e.target.value,
                    })
                  }
                  disabled={isUpdating}
                />
                <label
                  htmlFor="update-role-name"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1
                    peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5
                    peer-focus:px-2 peer-focus:text-blue-600 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2
                    pointer-events-none"
                >
                  Role Name
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
                  {isUpdating ? <MiniSpinner /> : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleList;
