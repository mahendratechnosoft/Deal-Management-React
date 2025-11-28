import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import Pagination from "../pagination";
import CreateItemModal from "./CreateItemModal";
import EditItemModal from "./EditItemModal"; // Import the Edit modal
import { hasPermission } from "../../BaseComponet/permissions";
import { showDeleteConfirmation } from "../../BaseComponet/alertUtils";

function ItemList() {
  const navigate = useNavigate();
  const { LayoutComponent, role } = useLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const InlineSpinner = ({ label = "Loading..." }) => (
    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );

  const TableSkeleton = ({ rows = 5, cols = 7 }) => {
    const r = Array.from({ length: rows });
    const c = Array.from({ length: cols });
    return (
      <tbody>
        {r.map((_, i) => (
          <tr key={i} className="animate-pulse">
            {c.map((_, j) => (
              <td key={j} className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  // Fetch items with search functionality
  const fetchItems = useCallback(
    async (page = 0, search = "") => {
      try {
        setLoading(true);
        let url = `getAllItems/${page}/${pageSize}`;
        if (search.trim()) {
          url += `?search=${encodeURIComponent(search)}`;
        }
        const response = await axiosInstance.get(url);
        const data = response.data;
        setItems(data.itemList || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
        setTotalItems(data.totalItems || data.itemList?.length || 0);
        setError(null);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError(err.message);
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Single useEffect for data fetching with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems(0, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchItems]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchItems(newPage, searchTerm);
    }
  };

  // Create Modal handlers
  const handleCreateItem = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    toast.success("Item created successfully!");
    fetchItems(currentPage, searchTerm);
  };

  // Edit Modal handlers
  const handleEdit = (itemId) => {
    setSelectedItemId(itemId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedItemId(null);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedItemId(null);
    toast.success("Item updated successfully!");
    fetchItems(currentPage, searchTerm);
  };

  const handleRefresh = () => {
    fetchItems(currentPage, searchTerm);
  };

const handleDelete = async (itemId, itemName) => {
  try {
    const result = await showDeleteConfirmation(itemName || "this item");

    if (result.isConfirmed) {
      // Remove the item from local state immediately
      setItems(prevItems => prevItems.filter(item => item.itemId !== itemId));
      
      // Update total items count
      setTotalItems(prevTotal => prevTotal - 1);
      
      // Only call delete API, no fetch call
      await axiosInstance.delete(`deleteItem/${itemId}`);
      showSuccessAlert("Item deleted successfully!");
    }

  } catch (error) {
    console.error("Error deleting item:", error);
    
    // If delete fails, revert the local state changes by refreshing from server
    // fetchItems(currentPage, searchTerm);
    
    showErrorAlert("Failed to delete item. Please try again.");
  }
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

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return "bg-red-100 text-red-800";
    if (quantity < 10) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStockText = (quantity) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity < 10) return "Low Stock";
    return "In Stock";
  };

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
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
          <h3 className="text-lg font-semibold mb-2">Error Loading Items</h3>
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
                  <h1 className="text-2xl font-bold text-gray-900">Items</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage your inventory items and products
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
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
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                  />
                </div>
              </div>
              
          
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                  onClick={handleCreateItem}
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
                  Create Item
                </button>
            
            </div>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
          {/* Total Items Card */}
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-[12px] font-medium truncate">
                  Total Items
                </p>
                <p className="text-gray-900 text-sm font-bold truncate">
                  {loading ? (
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  ) : (
                    totalItems.toLocaleString()
                  )}
                </p>
              </div>
            </div>
          </div>



                  
        </div>

        {/* Table View */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto crm-Leadlist-kanbadn-col-list">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ITEM NAME
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CODE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QUANTITY
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DESCRIPTION
                  </th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={6} cols={5} />
              ) : (
                <tbody className="bg-white divide-y divide-gray-200 overflow-x-auto">
                  {items.map((item) => (
                    <tr
                      key={item.itemId}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                    >
                      {/* Item Name with Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center justify-between min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {getInitials(item.name)}
                            </div>

                            <div>
                              <div
                                className="font-semibold truncate max-w-[120px]"
                                title={item.name}
                              >
                                {item.name || "N/A"}
                              </div>
                              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {/* Edit Button */}
                               
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(item.itemId);
                                    }}
                                    className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1 text-xs"
                                    title="Edit Item"
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
                             

                                {/* Delete Button */}
                              
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(item.itemId);
                                    }}
                                    className="text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center gap-1 text-xs"
                                    title="Delete Item"
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
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                    Delete
                                  </button>
                                
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Item Code */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full truncate max-w-[100px]"
                          title={item.code}
                        >
                          {item.code || "N/A"}
                        </span>
                      </td>

                      {/* Quantity with Stock Status */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-gray-900">
                            {item.quantity || 0}
                          </span>
                    
                        </div>
                      </td>

                      {/* Rate */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                        {item.rate}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px]">
                        <span
                          className="truncate block"
                          title={item.description}
                        >
                          {item.description || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {!loading && items.length === 0 && (
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No items found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first item."}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Your First Item
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            fetchItems(0, searchTerm);
          }}
          itemsName="items"
          showPageSize={true}
          sticky={true}
        />
      </div>

      {/* Create Item Modal */}
      {showCreateModal && (
        <CreateItemModal
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItemId && (
        <EditItemModal
          itemId={selectedItemId}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </LayoutComponent>
  );
}

export default ItemList;