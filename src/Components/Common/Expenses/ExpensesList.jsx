import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance.js";
import { useLayout } from "../../Layout/useLayout";
import toast from "react-hot-toast";
import Pagination from "../pagination";
import { hasPermission } from "../../BaseComponet/permissions";
import { showDeleteConfirmation } from "../../BaseComponet/alertUtils";
import CreateExpenseModal from "./CreateExpenseModal.jsx";
import EditExpenseModal from "./EditExpenseModal.jsx";
// import PreviewExpenseModal from "./PreviewExpenseModal.jsx";
// import EditExpenseModal from "./EditExpenseModal.jsx";

function ExpensesList() {
  const navigate = useNavigate();
  const { LayoutComponent } = useLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);

  const TableSkeleton = ({ rows = 5, cols = 5 }) => {
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

  // Fetch expenses with search
  const fetchExpenses = useCallback(
    async (page = 0, search = "") => {
      try {
        setLoading(true);

        // Build API URL with parameters
        let url = `getAllExpenses?page=${page}&size=${pageSize}`;
        const params = new URLSearchParams();

        if (search.trim()) params.append("search", search);

        if (params.toString()) url += `&${params.toString()}`;

        const response = await axiosInstance.get(url);
        const data = response.data;

        if (data && data.content) {
          setExpenses(data.content);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.number || 0);
          setTotalItems(data.totalElements || 0);
        } else {
          setExpenses([]);
          setTotalPages(1);
          setCurrentPage(0);
          setTotalItems(0);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load expenses"
        );
        toast.error("Failed to load expenses");
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      const response = await axiosInstance.get("getAllVendor");
      if (response.data && Array.isArray(response.data)) {
        setVendors(response.data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("getEmployeeNameAndId");
      if (response.data && Array.isArray(response.data)) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchEmployees();
  }, []);

  // Single useEffect for data fetching with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchExpenses(0, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchExpenses]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchExpenses(newPage, searchTerm);
    }
  };

  // Create Modal handlers
  const handleCreateExpense = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchExpenses(currentPage, searchTerm);
  };

  // Edit Modal handlers
  const handleEdit = (expenseId) => {
    setSelectedExpenseId(expenseId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedExpenseId(null);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedExpenseId(null);
    toast.success("Expense updated successfully!");
    fetchExpenses(currentPage, searchTerm);
  };

  const handleRefresh = () => {
    fetchExpenses(currentPage, searchTerm);
  };

  const handleDelete = async (expenseId, expenseName) => {
    try {
      const result = await showDeleteConfirmation(
        expenseName || "this expense"
      );
      if (!result.isConfirmed) return;

      await axiosInstance.delete(`deleteExpense/${expenseId}`);
      setExpenses((prev) => prev.filter((e) => e.expenseId !== expenseId));
      setTotalItems((prev) => Math.max(0, prev - 1));
      toast.success("Expense deleted successfully!");
    } catch (error) {
      const message =
        error?.response?.data || "You are not allowed to delete this expense.";
      toast.error(message);
    }
  };

  const getExpenseTypeColor = (type) => {
    switch (type) {
      case "GOODS":
        return "bg-blue-100 text-blue-800";
      case "SERVICES":
        return "bg-purple-100 text-purple-800";
      case "TRAVEL":
        return "bg-indigo-100 text-indigo-800";
      case "UTILITIES":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "Company";
    const employee = employees.find((emp) => emp.employeeId === employeeId);
    return employee ? employee.name : "Unknown Employee";
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
          <h3 className="text-lg font-semibold mb-2">Error Loading Expenses</h3>
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
        <div className="">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Track and manage all company expenses
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
              {/* Search Bar */}
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
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                />
              </div>

              {/* Create Expense Button */}
              {hasPermission("expense", "Create") && (
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                  onClick={handleCreateExpense}
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
                  Create Expense
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto crm-Leadlist-kanbadn-col-list">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EXPENSE DETAILS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EXPRENSE TYPE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VENDOR
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AMOUNT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATES
                  </th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={6} cols={5} />
              ) : (
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => {
                    const isOverdue =
                      expense.dueDate &&
                      new Date(expense.dueDate) < new Date() &&
                      expense.status === "UNPAID";

                    return (
                      <tr
                        key={expense.expenseId}
                        className={`group hover:bg-gray-50 transition-colors duration-150 ${
                          isOverdue
                            ? "border-l-4 border-l-red-500 shadow-[inset_4px_0_0_0_rgb(239,68,68)]"
                            : ""
                        }`}
                        onClick={() => handleEdit(expense.expenseId)}
                      >
                        {/* Expense Details */}
                        <td className="px-4 py-3">
                          <div className="min-w-[200px]">
                            <div className=" justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <div
                                  className="font-semibold text-gray-900 mb-1 truncate max-w-[280px]"
                                  title={expense.expenseCategoryName}
                                >
                                  {expense.expenseCategoryName ||
                                    "No Expense Category"}
                                </div>
                              </div>
                              {/* Edit button - hidden by default, shown on hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                                <button
                                  onClick={() => handleEdit(expense.expenseId)}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="Edit Expense"
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
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {" "}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full ${getExpenseTypeColor(
                                expense.expenseType
                              )}`}
                            >
                              {expense.expenseType}
                            </span>
                          </div>
                        </td>
                        {/* Vendor with truncation */}
                        <td className="px-4 py-3">
                          <div className="max-w-[180px]">
                            <div
                              className="text-sm font-medium text-gray-900 truncate"
                              title={expense.vendorName || "N/A"}
                            >
                              {expense.vendorName || "N/A"}
                            </div>
                            {expense.invoiceNumber && (
                              <div
                                className="text-xs text-gray-500 truncate"
                                title={`Invoice: ${expense.invoiceNumber}`}
                              >
                                Invoice: {expense.invoiceNumber}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Category with truncation */}
                        <td className="px-4 py-3">
                          <div className="max-w-[150px]">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                !expense.status
                                  ? "bg-gray-100 text-gray-800"
                                  : expense.status === "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : expense.status === "PARTIALLY_PAID"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {!expense.status
                                ? "N/A"
                                : expense.status === "PAID"
                                ? "Paid"
                                : expense.status === "PARTIALLY_PAID"
                                ? "Partially Paid"
                                : "Unpaid"}
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(
                                expense.totalAmount || expense.taxableAmount
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Tax: {expense.taxPercentage}%
                            </div>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 text-xs">
                                Date:
                              </span>
                              <span className="font-medium">
                                {formatDate(expense.expenseDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 text-xs">
                                Due:
                              </span>
                              <span
                                className={`font-medium ${
                                  isOverdue ? "text-red-600 font-semibold" : ""
                                }`}
                              >
                                {expense.dueDate
                                  ? formatDate(expense.dueDate)
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>

          {!loading && expenses.length === 0 && (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No expenses found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first expense."}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateExpense}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Your First Expense
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
            fetchExpenses(0, searchTerm);
          }}
          itemsName="expenses"
          showPageSize={true}
          sticky={true}
        />
      </div>

      {/* Create Expense Modal */}
      {showCreateModal && (
        <CreateExpenseModal
          onClose={handleCloseCreateModal}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedExpenseId && (
        <EditExpenseModal
          expenseId={selectedExpenseId}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </LayoutComponent>
  );
}

export default ExpensesList;
