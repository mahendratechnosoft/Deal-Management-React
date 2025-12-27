import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { hasPermission } from "../../../BaseComponet/permissions";

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

// Access Toggle Component
const AccessToggle = ({ field, label, isChecked, onChange }) => {
  const handleToggle = () => {
    onChange(!isChecked);
  };

  return (
    <label
      htmlFor={field}
      className="flex items-center cursor-pointer select-none"
    >
      <div className="relative">
        <input
          type="checkbox"
          id={field}
          checked={isChecked}
          onChange={handleToggle}
          className="sr-only"
        />
        <div
          className={`block w-10 h-6 rounded-full transition-colors ${isChecked ? "bg-blue-600" : "bg-gray-300"
            }`}
        ></div>
        <div
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${isChecked ? "translate-x-4" : "translate-x-0"
            }`}
        ></div>
      </div>
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
};

// Module Access Group Component
const ModuleAccessGroup = ({
  title,
  permissions,
  getAccess,
  handleAccessChange,
}) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {permissions.map((perm) => (
          <AccessToggle
            key={perm.field}
            field={perm.field}
            label={perm.label}
            isChecked={getAccess(perm.field)}
            onChange={(isChecked) => handleAccessChange(perm.field, isChecked)}
          />
        ))}
      </div>
    </div>
  );
};

// Select All Access Button Component
const SelectAllAccessButton = ({ onSelectAll, onClearAll, getAccess }) => {
  const hasSomeAccess = Object.keys(getAccess).some(
    (key) => key.includes("Access") && getAccess(key)
  );

  return (
    <div className="flex justify-end mb-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClearAll}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Clear All
        </button>
        {/* <button
          type="button"
          onClick={onSelectAll}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          Select All Access
        </button> */}
      </div>
    </div>
  );
};

function RoleListCompo() {
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

  // Module Access State for Create Modal
  const [moduleAccess, setModuleAccess] = useState({
    leadAccess: false,
    leadViewAll: false,
    leadCreate: false,
    leadDelete: false,
    leadEdit: false,

    customerAccess: false,
    customerViewAll: false,
    customerCreate: false,
    customerDelete: false,
    customerEdit: false,

    proposalAccess: false,
    proposalViewAll: false,
    proposalCreate: false,
    proposalDelete: false,
    proposalEdit: false,

    proformaInvoiceAccess: false,
    proformaInvoiceViewAll: false,
    proformaInvoiceCreate: false,
    proformaInvoiceDelete: false,
    proformaInvoiceEdit: false,

    invoiceAccess: false,
    invoiceViewAll: false,
    invoiceCreate: false,
    invoiceDelete: false,
    invoiceEdit: false,

    paymentAccess: false,
    paymentViewAll: false,
    paymentCreate: false,
    paymentDelete: false,
    paymentEdit: false,

    timeSheetAccess: false,
    timeSheetViewAll: false,
    timeSheetCreate: false,
    timeSheetDelete: false,
    timeSheetEdit: false,

    donorAccess: false,
    donorViewAll: false,
    donorCreate: false,
    donorDelete: false,
    donorEdit: false,

    itemAccess: false,
    itemViewAll: false,
    itemCreate: false,
    itemDelete: false,
    itemEdit: false,

    taskViewAll: false,
    taskAccess: false,
    taskCreate: false,
    taskDelete: false,
    taskEdit: false,

    amcAccess: false,
    amcCreate: false,
    amcDelete: false,
    amcEdit: false,
    amcViewAll: false,

    vendorAccess: false,
    vendorCreate: false,
    vendorDelete: false,
    vendorEdit: false,
    vendorViewAll: false,

    complianceAccess: false,
    complianceCreate: false,
    complianceDelete: false,
    complianceEdit: false,
    complianceViewAll: false,
  });

  // Module Access State for Update Modal
  const [updateModuleAccess, setUpdateModuleAccess] = useState({
    leadAccess: false,
    leadViewAll: false,
    leadCreate: false,
    leadDelete: false,
    leadEdit: false,

    customerAccess: false,
    customerViewAll: false,
    customerCreate: false,
    customerDelete: false,
    customerEdit: false,

    proposalAccess: false,
    proposalViewAll: false,
    proposalCreate: false,
    proposalDelete: false,
    proposalEdit: false,

    proformaInvoiceAccess: false,
    proformaInvoiceViewAll: false,
    proformaInvoiceCreate: false,
    proformaInvoiceDelete: false,
    proformaInvoiceEdit: false,

    invoiceAccess: false,
    invoiceViewAll: false,
    invoiceCreate: false,
    invoiceDelete: false,
    invoiceEdit: false,

    paymentAccess: false,
    paymentViewAll: false,
    paymentCreate: false,
    paymentDelete: false,
    paymentEdit: false,

    timeSheetAccess: false,
    timeSheetViewAll: false,
    timeSheetCreate: false,
    timeSheetDelete: false,
    timeSheetEdit: false,

    donorAccess: false,
    donorViewAll: false,
    donorCreate: false,
    donorDelete: false,
    donorEdit: false,

    itemAccess: false,
    itemViewAll: false,
    itemCreate: false,
    itemDelete: false,
    itemEdit: false,

    taskViewAll: false,
    taskAccess: false,
    taskCreate: false,
    taskDelete: false,
    taskEdit: false,

    amcAccess: false,
    amcCreate: false,
    amcDelete: false,
    amcEdit: false,
    amcViewAll: false,

    vendorAccess: false,
    vendorCreate: false,
    vendorDelete: false,
    vendorEdit: false,
    vendorViewAll: false,

    complianceAccess: false,
    complianceCreate: false,
    complianceDelete: false,
    complianceEdit: false,
    complianceViewAll: false,
  });

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

  // Handle Access Change for Create Modal
  const handleAccessChange = (field, value) => {
    setModuleAccess((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle Access Change for Update Modal
  const handleUpdateAccessChange = (field, value) => {
    setUpdateModuleAccess((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get Access State for Create Modal
  const getAccess = (field) => {
    return moduleAccess[field] || false;
  };

  // Get Access State for Update Modal
  const getUpdateAccess = (field) => {
    return updateModuleAccess[field] || false;
  };

  // Reset Module Access when modal closes
  const resetModuleAccess = () => {
    setModuleAccess({
      leadAccess: false,
      leadViewAll: false,
      leadCreate: false,
      leadDelete: false,
      leadEdit: false,
      customerAccess: false,
      customerViewAll: false,
      customerCreate: false,
      customerDelete: false,
      customerEdit: false,
      proposalAccess: false,
      proposalViewAll: false,
      proposalCreate: false,
      proposalDelete: false,
      proposalEdit: false,
      proformaInvoiceAccess: false,
      proformaInvoiceViewAll: false,
      proformaInvoiceCreate: false,
      proformaInvoiceDelete: false,
      proformaInvoiceEdit: false,
      invoiceAccess: false,
      invoiceViewAll: false,
      invoiceCreate: false,
      invoiceDelete: false,
      invoiceEdit: false,
      paymentAccess: false,
      paymentViewAll: false,
      paymentCreate: false,
      paymentDelete: false,
      paymentEdit: false,
      timeSheetAccess: false,
      timeSheetViewAll: false,
      timeSheetCreate: false,
      timeSheetDelete: false,
      timeSheetEdit: false,

      donorAccess: false,
      donorViewAll: false,
      donorCreate: false,
      donorDelete: false,
      donorEdit: false,

      itemAccess: false,
      itemViewAll: false,
      itemCreate: false,
      itemDelete: false,
      itemEdit: false,

      taskViewAll: false,
      taskAccess: false,
      taskCreate: false,
      taskDelete: false,
      taskEdit: false,

      amcAccess: false,
      amcCreate: false,
      amcDelete: false,
      amcEdit: false,
      amcViewAll: false,

      vendorAccess: false,
      vendorCreate: false,
      vendorDelete: false,
      vendorEdit: false,
      vendorViewAll: false,

      complianceAccess: false,
      complianceCreate: false,
      complianceDelete: false,
      complianceEdit: false,
      complianceViewAll: false,
    });
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
        ...moduleAccess,
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
    resetModuleAccess();
  };

  // Update Role
  const handleOpenUpdateModal = (role) => {
    setEditingRole(role);

    // Set current role permissions for update modal
    if (role) {
      setUpdateModuleAccess({
        leadAccess: role.leadAccess || false,
        leadViewAll: role.leadViewAll || false,
        leadCreate: role.leadCreate || false,
        leadDelete: role.leadDelete || false,
        leadEdit: role.leadEdit || false,

        customerAccess: role.customerAccess || false,
        customerViewAll: role.customerViewAll || false,
        customerCreate: role.customerCreate || false,
        customerDelete: role.customerDelete || false,
        customerEdit: role.customerEdit || false,

        proposalAccess: role.proposalAccess || false,
        proposalViewAll: role.proposalViewAll || false,
        proposalCreate: role.proposalCreate || false,
        proposalDelete: role.proposalDelete || false,
        proposalEdit: role.proposalEdit || false,

        proformaInvoiceAccess: role.proformaInvoiceAccess || false,
        proformaInvoiceViewAll: role.proformaInvoiceViewAll || false,
        proformaInvoiceCreate: role.proformaInvoiceCreate || false,
        proformaInvoiceDelete: role.proformaInvoiceDelete || false,
        proformaInvoiceEdit: role.proformaInvoiceEdit || false,

        invoiceAccess: role.invoiceAccess || false,
        invoiceViewAll: role.invoiceViewAll || false,
        invoiceCreate: role.invoiceCreate || false,
        invoiceDelete: role.invoiceDelete || false,
        invoiceEdit: role.invoiceEdit || false,

        paymentAccess: role.paymentAccess || false,
        paymentViewAll: role.paymentViewAll || false,
        paymentCreate: role.paymentCreate || false,
        paymentDelete: role.paymentDelete || false,
        paymentEdit: role.paymentEdit || false,

        timeSheetAccess: role.timeSheetAccess || false,
        timeSheetViewAll: role.timeSheetViewAll || false,
        timeSheetCreate: role.timeSheetCreate || false,
        timeSheetDelete: role.timeSheetDelete || false,
        timeSheetEdit: role.timeSheetEdit || false,

        donorAccess: role.donorAccess || false,
        donorViewAll: role.donorViewAll || false,
        donorCreate: role.donorCreate || false,
        donorDelete: role.donorDelete || false,
        donorEdit: role.donorEdit || false,

        itemAccess: role.itemAccess || false,
        itemViewAll: role.itemViewAll || false,
        itemCreate: role.itemCreate || false,
        itemDelete: role.itemDelete || false,
        itemEdit: role.itemEdit || false,

        taskAccess: role.taskAccess || false,
        taskViewAll: role.taskViewAll || false,
        taskCreate: role.taskCreate || false,
        taskDelete: role.taskDelete || false,
        taskEdit: role.taskEdit || false,

        amcAccess: role.amcAccess || false,
        amcViewAll: role.amcViewAll || false,
        amcCreate: role.amcCreate || false,
        amcDelete: role.amcDelete || false,
        amcEdit: role.amcEdit || false,

        vendorAccess: role.vendorAccess || false,
        vendorViewAll: role.vendorViewAll || false,
        vendorCreate: role.vendorCreate || false,
        vendorDelete: role.vendorDelete || false,
        vendorEdit: role.vendorEdit || false,

        complianceAccess: role.complianceAccess || false,
        complianceViewAll: role.complianceViewAll || false,
        complianceCreate: role.complianceCreate || false,
        complianceDelete: role.complianceDelete || false,
        complianceEdit: role.complianceEdit || false,
      });
    }

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
        ...updateModuleAccess,
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

  // Select All Access for Create Modal
  const handleSelectAllAccess = () => {
    const allAccessTrue = Object.keys(moduleAccess).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setModuleAccess(allAccessTrue);
  };

  // Clear All Access for Create Modal
  const handleClearAllAccess = () => {
    const allAccessFalse = Object.keys(moduleAccess).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
    setModuleAccess(allAccessFalse);
  };

  // Select All Access for Update Modal
  const handleUpdateSelectAllAccess = () => {
    const allAccessTrue = Object.keys(updateModuleAccess).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setUpdateModuleAccess(allAccessTrue);
  };

  // Clear All Access for Update Modal
  const handleUpdateClearAllAccess = () => {
    const allAccessFalse = Object.keys(updateModuleAccess).reduce(
      (acc, key) => {
        acc[key] = false;
        return acc;
      },
      {}
    );
    setUpdateModuleAccess(allAccessFalse);
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

  const hasModulePermission = (moduleName) => {
    return hasPermission(moduleName, "Access");
  };

  return (
    <>
      {/* Header Section */}
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[60vh] overflow-y-auto">
        <div className="min-w-full">
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 transform transition-all max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
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
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
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

                {/* Module Access Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-cyan-600 rounded flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Module Access Permissions
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Set permissions for CRM modules
                      </p>
                    </div>
                  </div>

                  <SelectAllAccessButton
                    onSelectAll={handleSelectAllAccess}
                    onClearAll={handleClearAllAccess}
                    getAccess={getAccess}
                  />

                  <div className="space-y-4">
                    {/* Rest of the ModuleAccessGroup components remain the same */}

                    {/* Leads Permissions */}

                    {!hasPermission("donor", "Access") && (
                      <>
                        {hasModulePermission("lead") && (
                          <ModuleAccessGroup
                            title="Leads Permissions"
                            permissions={[
                              { label: "Access", field: "leadAccess" },
                              { label: "View All", field: "leadViewAll" },
                              { label: "Create", field: "leadCreate" },
                              { label: "Edit", field: "leadEdit" },
                              { label: "Delete", field: "leadDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}

                        {hasModulePermission("customer") && (
                          <ModuleAccessGroup
                            title="Customer Permissions"
                            permissions={[
                              { label: "Access", field: "customerAccess" },
                              { label: "View All", field: "customerViewAll" },
                              { label: "Create", field: "customerCreate" },
                              { label: "Edit", field: "customerEdit" },
                              { label: "Delete", field: "customerDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}

                        {hasModulePermission("proposal") && (
                          <ModuleAccessGroup
                            title="Proposal Permissions"
                            permissions={[
                              { label: "Access", field: "proposalAccess" },
                              { label: "View All", field: "proposalViewAll" },
                              { label: "Create", field: "proposalCreate" },
                              { label: "Edit", field: "proposalEdit" },
                              { label: "Delete", field: "proposalDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}
                        {hasModulePermission("proforma") && (
                          <ModuleAccessGroup
                            title="Proforma Invoice Permissions"
                            permissions={[
                              {
                                label: "Access",
                                field: "proformaInvoiceAccess",
                              },
                              {
                                label: "View All",
                                field: "proformaInvoiceViewAll",
                              },
                              {
                                label: "Create",
                                field: "proformaInvoiceCreate",
                              },
                              { label: "Edit", field: "proformaInvoiceEdit" },
                              {
                                label: "Delete",
                                field: "proformaInvoiceDelete",
                              },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}

                        {hasModulePermission("invoice") && (
                          <ModuleAccessGroup
                            title="Invoice Permissions"
                            permissions={[
                              { label: "Access", field: "invoiceAccess" },
                              { label: "View All", field: "invoiceViewAll" },
                              { label: "Create", field: "invoiceCreate" },
                              { label: "Edit", field: "invoiceEdit" },
                              { label: "Delete", field: "invoiceDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}
                        {hasModulePermission("payment") && (
                          <ModuleAccessGroup
                            title="Payment Permissions"
                            permissions={[
                              { label: "Access", field: "paymentAccess" },
                              { label: "View All", field: "paymentViewAll" },
                              { label: "Create", field: "paymentCreate" },
                              { label: "Edit", field: "paymentEdit" },
                              { label: "Delete", field: "paymentDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}
                        {hasModulePermission("timeSheet") && (
                          <ModuleAccessGroup
                            title="Timesheet Permissions"
                            permissions={[
                              { label: "Access", field: "timeSheetAccess" },
                              { label: "View All", field: "timeSheetViewAll" },
                              { label: "Create", field: "timeSheetCreate" },
                              { label: "Edit", field: "timeSheetEdit" },
                              { label: "Delete", field: "timeSheetDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}
                        {hasModulePermission("item") && (
                          <ModuleAccessGroup
                            title="Item Permissions"
                            permissions={[
                              { label: "Access", field: "itemAccess" },
                              { label: "View All", field: "itemViewAll" },
                              { label: "Create", field: "itemCreate" },
                              { label: "Edit", field: "itemEdit" },
                              { label: "Delete", field: "itemDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}

                        {hasModulePermission("task") && (
                          <ModuleAccessGroup
                            title="Task Permissions"
                            permissions={[
                              { label: "Access", field: "taskAccess" },
                              { label: "View All", field: "taskViewAll" },
                              { label: "Create", field: "taskCreate" },
                              { label: "Edit", field: "taskEdit" },
                              { label: "Delete", field: "taskDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}

                        {hasModulePermission("amc") && (
                          <ModuleAccessGroup
                            title="AMC Permissions"
                            permissions={[
                              { label: "Access", field: "amcAccess" },
                              { label: "View All", field: "amcViewAll" },
                              { label: "Create", field: "amcCreate" },
                              { label: "Edit", field: "amcEdit" },
                              { label: "Delete", field: "amcDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}

                        {hasModulePermission("vendor") && (
                          <ModuleAccessGroup
                            title="Vendor Permissions"
                            permissions={[
                              { label: "Access", field: "vendorAccess" },
                              { label: "View All", field: "vendorViewAll" },
                              { label: "Create", field: "vendorCreate" },
                              { label: "Edit", field: "vendorEdit" },
                              { label: "Delete", field: "vendorDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}

                        {hasModulePermission("compliance") && (
                          <ModuleAccessGroup
                            title="Compliance Permissions"
                            permissions={[
                              { label: "Access", field: "complianceAccess" },
                              { label: "View All", field: "complianceViewAll" },
                              { label: "Create", field: "complianceCreate" },
                              { label: "Edit", field: "complianceEdit" },
                              { label: "Delete", field: "complianceDelete" },
                            ]}
                            getAccess={getAccess}
                            handleAccessChange={handleAccessChange}
                          />
                        )}
                 
                      </>
                    )}
                    {hasPermission("donor", "Access") && (
                      <ModuleAccessGroup
                        title="Donor Permissions"
                        permissions={[
                          { label: "Access", field: "donorAccess" },
                          { label: "View All", field: "donorViewAll" },
                          { label: "Create", field: "donorCreate" },
                          { label: "Edit", field: "donorEdit" },
                          { label: "Delete", field: "donorDelete" },
                        ]}
                        getAccess={getAccess}
                        handleAccessChange={handleAccessChange}
                      />
                    )}
                  </div>
                </div>

                {createModalError && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {createModalError}
                  </div>
                )}
              </form>
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
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
                  onClick={handleCreateRole}
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
            </div>
          </div>
        </div>
      )}

      {/* Update Role Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 transform transition-all max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
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
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
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

                {/* Module Access Section for Update */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-cyan-600 rounded flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Module Access Permissions
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Update permissions for CRM modules
                      </p>
                    </div>
                  </div>

                  <SelectAllAccessButton
                    onSelectAll={handleUpdateSelectAllAccess}
                    onClearAll={handleUpdateClearAllAccess}
                    getAccess={getUpdateAccess}
                  />

                  <div className="space-y-4">
                    {/* Rest of the ModuleAccessGroup components remain the same */}

                    {!hasPermission("donor", "Access") && (
                      <>
                        {hasModulePermission("lead") && (
                          <ModuleAccessGroup
                            title="Leads Permissions"
                            permissions={[
                              { label: "Access", field: "leadAccess" },
                              { label: "View All", field: "leadViewAll" },
                              { label: "Create", field: "leadCreate" },
                              { label: "Edit", field: "leadEdit" },
                              { label: "Delete", field: "leadDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}

                        {hasModulePermission("customer") && (
                          <ModuleAccessGroup
                            title="Customer Permissions"
                            permissions={[
                              { label: "Access", field: "customerAccess" },
                              { label: "View All", field: "customerViewAll" },
                              { label: "Create", field: "customerCreate" },
                              { label: "Edit", field: "customerEdit" },
                              { label: "Delete", field: "customerDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}

                        {hasModulePermission("proposal") && (
                          <ModuleAccessGroup
                            title="Proposal Permissions"
                            permissions={[
                              { label: "Access", field: "proposalAccess" },
                              { label: "View All", field: "proposalViewAll" },
                              { label: "Create", field: "proposalCreate" },
                              { label: "Edit", field: "proposalEdit" },
                              { label: "Delete", field: "proposalDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}
                        {hasModulePermission("proforma") && (
                          <ModuleAccessGroup
                            title="Proforma Invoice Permissions"
                            permissions={[
                              {
                                label: "Access",
                                field: "proformaInvoiceAccess",
                              },
                              {
                                label: "View All",
                                field: "proformaInvoiceViewAll",
                              },
                              {
                                label: "Create",
                                field: "proformaInvoiceCreate",
                              },
                              { label: "Edit", field: "proformaInvoiceEdit" },
                              {
                                label: "Delete",
                                field: "proformaInvoiceDelete",
                              },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}

                        {hasModulePermission("invoice") && (
                          <ModuleAccessGroup
                            title="Invoice Permissions"
                            permissions={[
                              { label: "Access", field: "invoiceAccess" },
                              { label: "View All", field: "invoiceViewAll" },
                              { label: "Create", field: "invoiceCreate" },
                              { label: "Edit", field: "invoiceEdit" },
                              { label: "Delete", field: "invoiceDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}
                        {hasModulePermission("payment") && (
                          <ModuleAccessGroup
                            title="Payment Permissions"
                            permissions={[
                              { label: "Access", field: "paymentAccess" },
                              { label: "View All", field: "paymentViewAll" },
                              { label: "Create", field: "paymentCreate" },
                              { label: "Edit", field: "paymentEdit" },
                              { label: "Delete", field: "paymentDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}
                        {hasModulePermission("timeSheet") && (
                          <ModuleAccessGroup
                            title="Timesheet Permissions"
                            permissions={[
                              { label: "Access", field: "timeSheetAccess" },
                              { label: "View All", field: "timeSheetViewAll" },
                              { label: "Create", field: "timeSheetCreate" },
                              { label: "Edit", field: "timeSheetEdit" },
                              { label: "Delete", field: "timeSheetDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}
                        {hasModulePermission("item") && (
                          <ModuleAccessGroup
                            title="Item Permissions"
                            permissions={[
                              { label: "Access", field: "itemAccess" },
                              { label: "View All", field: "itemViewAll" },
                              { label: "Create", field: "itemCreate" },
                              { label: "Edit", field: "itemEdit" },
                              { label: "Delete", field: "itemDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}

                        {hasModulePermission("task") && (
                          <ModuleAccessGroup
                            title="Task Permissions"
                            permissions={[
                              { label: "Access", field: "taskAccess" },
                              { label: "View All", field: "taskViewAll" },
                              { label: "Create", field: "taskCreate" },
                              { label: "Edit", field: "taskEdit" },
                              { label: "Delete", field: "taskDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}

                        {hasModulePermission("amc") && (
                          <ModuleAccessGroup
                            title="AMC Permissions"
                            permissions={[
                              { label: "Access", field: "amcAccess" },
                              { label: "View All", field: "amcViewAll" },
                              { label: "Create", field: "amcCreate" },
                              { label: "Edit", field: "amcEdit" },
                              { label: "Delete", field: "amcDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}

                        {hasModulePermission("vendor") && (
                          <ModuleAccessGroup
                            title="Vendor Permissions"
                            permissions={[
                              { label: "Access", field: "vendorAccess" },
                              { label: "View All", field: "vendorViewAll" },
                              { label: "Create", field: "vendorCreate" },
                              { label: "Edit", field: "vendorEdit" },
                              { label: "Delete", field: "vendorDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}

                        {hasModulePermission("compliance") && (
                          <ModuleAccessGroup
                            title="Compliance Permissions"
                            permissions={[
                              { label: "Access", field: "complianceAccess" },
                              { label: "View All", field: "complianceViewAll" },
                              { label: "Create", field: "complianceCreate" },
                              { label: "Edit", field: "complianceEdit" },
                              { label: "Delete", field: "complianceDelete" },
                            ]}
                            getAccess={getUpdateAccess}
                            handleAccessChange={handleUpdateAccessChange}
                          />
                        )}
                      </>
                    )}
                    {hasPermission("donor", "Access") && (
                      <ModuleAccessGroup
                        title="Donor Permissions"
                        permissions={[
                          { label: "Access", field: "donorAccess" },
                          { label: "View All", field: "donorViewAll" },
                          { label: "Create", field: "donorCreate" },
                          { label: "Edit", field: "donorEdit" },
                          { label: "Delete", field: "donorDelete" },
                        ]}
                        getAccess={getAccess}
                        handleAccessChange={handleUpdateAccessChange}
                      />
                    )}
                  </div>
                </div>

                {updateModalError && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    {updateModalError}
                  </div>
                )}
              </form>
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
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
                  onClick={handleUpdateRole}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RoleListCompo;
