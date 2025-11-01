import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

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
      </div>
    </td>
  </tr>
);

function RoleList() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const departmentName = location.state?.departmentName || "Department";
  const [totalRoles, setTotalRoles] = useState(0);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createModalError, setCreateModalError] = useState(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateModalError, setUpdateModalError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (departmentId) {
      fetchRoles();
    }
  }, [departmentId]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/admin/getRoleByDepartment/${departmentId}`
      );
      setRoles(response.data);
      setTotalRoles(response.data.length);
    } catch (err) {
      console.error("Error fetching roles:", err);
      toast.error("Failed to load roles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Create Role
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
        departmentId: departmentId,
      });
      handleCloseCreateModal();
      fetchRoles();
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

  // Update Role
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
      fetchRoles();
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

  // Delete Role
  const executeDelete = async (roleId, roleName) => {
    setDeletingId(roleId);
    try {
      await axiosInstance.delete(`/admin/deleteRole/${roleId}`);
      setRoles((prevRoles) =>
        prevRoles.filter((role) => role.roleId !== roleId)
      );
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
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No roles found
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating the first role for this department.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create Your First Role
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return roles.map((role, index) => (
      <tr
        key={role.roleId}
        className="hover:bg-gray-50 transition-colors duration-150"
      >
        <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">
          {index + 1}
        </td>
        <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-900 font-semibold">
          {role.name}
        </td>
        <td className="px-6 py-1 whitespace-nowrap text-sm font-medium">
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenUpdateModal(role)}
              disabled={deletingId === role.roleId}
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

            <button
              onClick={() => handleDeleteRole(role)}
              disabled={deletingId === role.roleId}
              className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
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
    <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
      {/* Header Section - Consistent with other list pages */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage roles for {departmentName}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate("/Admin/Settings/Department")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
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

            {/* Create Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
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
              Create Role
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
        {/* Total Roles Card */}
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 text-[12px] font-medium truncate">
                Total Roles
              </p>
              <p className="text-gray-900 text-sm font-bold truncate">
                {totalRoles.toLocaleString()}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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

      {/* Create Role Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Create New Role
              </h3>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors duration-200"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRole}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter role name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {createModalError && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {createModalError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
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
                    "Create Role"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Role Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Update Role
              </h3>
              <button
                onClick={handleCloseUpdateModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors duration-200"
                disabled={isUpdating}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateRole}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter role name"
                  value={editingRole?.name || ""}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
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
                    "Update Role"
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

export default RoleList;
