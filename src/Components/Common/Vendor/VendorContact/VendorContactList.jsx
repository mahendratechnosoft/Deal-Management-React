import { useLocation, useParams } from "react-router-dom";
import { useLayout } from "../../../Layout/useLayout";
import { useEffect, useState } from "react";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import Pagination from "../../pagination";
import CreateContactModal from "./CreateContactModal";
import EditContactModal from "./EditContactModal";
import toast from "react-hot-toast";
import { showDeleteConfirmation } from "../../../BaseComponet/alertUtils";
import { hasPermission } from "../../../BaseComponet/permissions";

const TableRowSkeleton = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-2">
        <div className="h-4 w-6 bg-gray-200 rounded" />
      </td>

      <td className="px-2 py-2">
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </td>

      <td className="px-2 py-4">
        <div className="h-4 w-40 bg-gray-200 rounded" />
      </td>

      <td className="px-2 py-4">
        <div className="h-4 w-28 bg-gray-200 rounded" />
      </td>

      <td className="px-2 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </td>

      <td className="px-2 py-4">
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </td>
    </tr>
  );
};

const VendorContactList = () => {
  const { vendorId } = useParams();
  const { LayoutComponent, role } = useLayout();
  const location = useLocation();
  const vendorName = location.state?.vendorName || "Unknown Vendor";

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [vendorContacts, setVendorContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVendorContactId, setSelectedVendorContactId] = useState(null);

  const fetchVendorContacts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `getAllVendorContacts/${vendorId}`,
        {
          params: {
            page: currentPage,
            size: pageSize,
            search: searchTerm,
          },
        }
      );

      setVendorContacts(response.data.content);
      const pageable = response.data;
      setTotalPages(pageable.totalPages);
      setTotalItems(pageable.totalElements);
    } catch (error) {
      console.error("Error fetching vendor contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorContacts();
  }, [vendorId, currentPage, pageSize, searchTerm]);

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleDelete = async (vendorContactId) => {
    const result = await showDeleteConfirmation("this contact");
    if (!result.isConfirmed) return;
    try {
      const response = await axiosInstance.delete(
        `deleteVendorContact/${vendorContactId}`
      );

      if (response.status === 204) {
        toast.success("Contact deleted successfully!");
        setVendorContacts((prevContacts) =>
          prevContacts.filter(
            (contact) => contact.vendorContactId !== vendorContactId
          )
        );
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  const handleStatusToggle = async (vendorContactId, isActive) => {
    const newStatus = !isActive;
    try {
      const response = await axiosInstance.put(
        `updateVendorContactStatus/${vendorContactId}?active=${newStatus}`
      );
      if (response.status == 200) {
        toast.success("Status updated successfully!");
        setVendorContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.vendorContactId === vendorContactId
              ? { ...contact, isActive: newStatus }
              : contact
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {vendorName} Contacts
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    List of contacts for {vendorName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
              <div className="relative flex-1 sm:max-w-64 w-full">
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
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                />
              </div>
              {hasPermission("vendor", "Create") && (
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
                  onClick={() => setIsCreateModalOpen(true)}
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
                  Create Contact
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 table-fixed w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="w-[5%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="w-[25%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              ) : vendorContacts.length > 0 ? (
                vendorContacts.map((contact, index) => (
                  <tr
                    key={contact.id || index}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                  >
                    <td className="px-4 py-2 truncate text-sm font-medium text-gray-900">
                      {index + 1 + currentPage * pageSize}
                    </td>
                    <td
                      className="px-2 py-2 truncate text-sm font-medium text-gray-900"
                      title={contact.contactPersonName}
                    >
                      {contact.contactPersonName || "N/A"}
                      <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          title="Edit"
                          className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 text-xs font-normal"
                          onClick={() => {
                            setSelectedVendorContactId(contact.vendorContactId);
                            setIsEditModalOpen(true);
                          }}
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        {hasPermission("vendor", "Delete") && (
                          <button
                            onClick={() =>
                              handleDelete(contact.vendorContactId)
                            }
                            className="text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-1 text-xs font-normal"
                            title="Delete Task"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-2 py-4 truncate text-sm text-gray-500"
                      title={contact.emailAddress}
                    >
                      {contact.emailAddress || "N/A"}
                    </td>
                    <td
                      className="px-2 py-4 truncate text-sm text-gray-500"
                      title={contact.phone}
                    >
                      {contact.phone || "N/A"}
                    </td>
                    <td
                      className="px-2 py-4 truncate text-sm text-gray-500"
                      title={contact.position}
                    >
                      {contact.position || "N/A"}
                    </td>
                    <td
                      className="px-2 py-4 truncate text-sm"
                      title={contact.isActive ? "Active" : "Inactive"}
                    >
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={contact.isActive}
                          onChange={() =>
                            handleStatusToggle(
                              contact.vendorContactId,
                              contact.isActive
                            )
                          }
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemsName={`${vendorName} Contacts`}
        />
      </div>

      {isCreateModalOpen && (
        <CreateContactModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchVendorContacts}
          vendorId={vendorId}
        />
      )}

      {isEditModalOpen && (
        <EditContactModal
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchVendorContacts}
          vendorContactId={selectedVendorContactId}
        />
      )}
    </LayoutComponent>
  );
};

export default VendorContactList;
