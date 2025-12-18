import { useLocation, useParams } from "react-router-dom";
import { useLayout } from "../../../Layout/useLayout";
import { useEffect, useState } from "react";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import Pagination from "../../pagination";

const VendorContactList = () => {
  const { vendorId } = useParams();
  const { LayoutComponent, role } = useLayout();
  const location = useLocation();
  const vendorName = location.state?.vendorName || "Unknown Vendor";

  const [searchTerm, setSearchTerm] = useState("");
  // Fixed: Initialize currentPage to 0 (API standard)
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [vendorContacts, setVendorContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVendorContacts = async () => {
    setIsLoading(true);
    try {
      // Updated: Pass params using axios 'params' object
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
      const pageable = response.data; // Depending on API structure, sometimes pageable info is at root

      // Ensure we map the API response fields correctly to state
      setTotalPages(pageable.totalPages);
      setTotalItems(pageable.totalElements);
      // Note: We don't usually setPageSize from API response unless server forces it
    } catch (error) {
      console.error("Error fetching vendor contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when these dependencies change
  useEffect(() => {
    // Optional: Add a small timeout (debounce) here if search is lagging
    fetchVendorContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId, currentPage, pageSize, searchTerm]);

  // Handlers
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page when size changes
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
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

              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md w-full sm:w-auto justify-center">
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
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading contacts...
                  </td>
                </tr>
              ) : vendorContacts.length > 0 ? (
                vendorContacts.map((contact, index) => (
                  <tr key={contact.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 truncate text-sm font-medium text-gray-900">
                      {index + 1 + currentPage * pageSize}
                    </td>
                    <td
                      className="px-2 py-2 truncate text-sm font-medium text-gray-900"
                      title={contact.contactPersonName}
                    >
                      {contact.contactPersonName || "N/A"}
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
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          contact.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {contact.status || "Active"}
                      </span>
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
    </LayoutComponent>
  );
};

export default VendorContactList;
