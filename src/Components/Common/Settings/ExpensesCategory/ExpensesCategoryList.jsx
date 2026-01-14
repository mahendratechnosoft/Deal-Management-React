// pages/ExpensesCategoryList.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import { showDeleteConfirmation } from "../../../BaseComponet/alertUtils";
import toast from "react-hot-toast";
import ExpenseCategoryModal from "./ExpenseCategoryModal";

const ExpensesCategoryList = () => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({});

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch all expense categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("getAllExpenseCategories");
      setCategories(response.data);

      // Auto-expand all sections initially
      const expanded = {};
      Object.keys(response.data).forEach((type) => {
        expanded[type] = true;
        if (response.data[type]) {
          Object.keys(response.data[type]).forEach((group) => {
            expanded[`${type}_${group}`] = true;
          });
        }
      });
      setExpandedSections(expanded);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      toast.error("Failed to load expense categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toggle section expansion
  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Toggle all sections
  const toggleAllSections = (expand) => {
    const newState = {};
    Object.keys(categories).forEach((type) => {
      newState[type] = expand;
      if (categories[type]) {
        Object.keys(categories[type]).forEach((group) => {
          newState[`${type}_${group}`] = expand;
        });
      }
    });
    setExpandedSections(newState);
  };

  // Handle category deletion
  const handleDelete = async (id, name) => {
    const result = await showDeleteConfirmation(name || "this category");
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`deleteExpenseCategoryById/${id}`);
        // Update local state
        const updatedCategories = { ...categories };
        Object.keys(updatedCategories).forEach((type) => {
          Object.keys(updatedCategories[type]).forEach((group) => {
            updatedCategories[type][group] = updatedCategories[type][
              group
            ].filter((cat) => cat.expenseCategoryId !== id);
          });
        });
        setCategories(updatedCategories);
        toast.success("Category deleted successfully!");
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
      }
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await axiosInstance.put(
        `updateExpenseCategoryStatus/${id}?active=${newStatus}`
      );

      // Update local state
      const updatedCategories = { ...categories };
      Object.keys(updatedCategories).forEach((type) => {
        Object.keys(updatedCategories[type]).forEach((group) => {
          const index = updatedCategories[type][group].findIndex(
            (cat) => cat.expenseCategoryId === id
          );
          if (index !== -1) {
            updatedCategories[type][group][index].active = newStatus;
          }
        });
      });
      setCategories(updatedCategories);

      toast.success(
        `Category ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Open edit modal
  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  // Handle category creation
  const handleCategoryCreated = (newCategory) => {
    // Refresh the list
    fetchCategories();
  };

  // Handle category update
  const handleCategoryUpdated = (updatedCategory) => {
    // Update local state
    const updatedCategories = { ...categories };
    let updated = false;

    Object.keys(updatedCategories).forEach((type) => {
      Object.keys(updatedCategories[type]).forEach((group) => {
        const index = updatedCategories[type][group].findIndex(
          (cat) => cat.expenseCategoryId === updatedCategory.expenseCategoryId
        );
        if (index !== -1) {
          updatedCategories[type][group][index] = updatedCategory;
          updated = true;
        }
      });
    });

    if (updated) {
      setCategories(updatedCategories);
    } else {
      // If category type/group changed, refresh the list
      fetchCategories();
    }
  };

  // Get type display name
  const getTypeDisplayName = (type) => {
    const typeMap = {
      DIRECT: "Direct Expenses",
      INDIRECT: "Indirect Expenses",
    };
    return typeMap[type] || type;
  };

  // Get type color
  const getTypeColor = (type) => {
    const colorMap = {
      DIRECT: "bg-blue-100 text-blue-800 border-blue-200",
      INDIRECT: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  };

  // Filter categories by search term
  const filterCategories = (categoryList) => {
    if (!searchTerm.trim()) return categoryList;

    return categoryList.filter(
      (cat) =>
        cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.categoryGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Count total categories
  const getTotalCount = () => {
    let count = 0;
    Object.values(categories).forEach((typeGroups) => {
      Object.values(typeGroups).forEach((group) => {
        count += group.length;
      });
    });
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading expense categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Expense Categories
                </h1>
                <p className="text-gray-600 text-sm">
                  Manage and organize your expense categories
                </p>
              </div>
            </div>
       
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAllSections(true)}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                Expand All
              </button>
              <button
                onClick={() => toggleAllSections(false)}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
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
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                Collapse All
              </button>
            </div>

            {/* Search */}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
              />
            </div>

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
              Create Category
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {Object.keys(categories).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No expense categories yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first expense category to get started
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
            Create Category
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Iterate through DIRECT and INDIRECT */}
          {Object.entries(categories).map(([type, groups]) => (
            <div key={type} className="space-y-3">
              {/* Type Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                      type
                    )}`}
                  >
                    {getTypeDisplayName(type)}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getTypeDisplayName(type)}
                  </h3>
                </div>
                <button
                  onClick={() => toggleSection(type)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      expandedSections[type] ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Type Content - Show groups */}
              {expandedSections[type] && (
                <div className="space-y-4 ml-4">
                  {Object.entries(groups).map(
                    ([groupName, groupCategories]) => {
                      const filteredCategories =
                        filterCategories(groupCategories);
                      const sectionKey = `${type}_${groupName}`;

                      if (filteredCategories.length === 0 && searchTerm)
                        return null;

                      return (
                        <div
                          key={sectionKey}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                          {/* Group Header */}
                          <button
                            onClick={() => toggleSection(sectionKey)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <span className="font-medium text-gray-900">
                                {groupName}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {filteredCategories.length} categories
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                  expandedSections[sectionKey]
                                    ? "transform rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </button>

                          {/* Group Content */}
                          {expandedSections[sectionKey] &&
                            filteredCategories.length > 0 && (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category Name
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCategories.map(
                                      (category, index) => (
                                        <tr
                                          key={category.expenseCategoryId}
                                          className="hover:bg-gray-50 transition-colors"
                                        >
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                          </td>
                                          <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                              {category.categoryName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {category.categoryGroup}
                                            </div>
                                          </td>
                                          <td className="px-6 py-4">
                                            <div
                                              className="text-sm text-gray-500 truncate max-w-[200px]"
                                              title={category.description}
                                            >
                                              {category.description || "-"}
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(
                                              category.createdAt
                                            ).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            })}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                              onClick={() =>
                                                handleStatusToggle(
                                                  category.expenseCategoryId,
                                                  category.active
                                                )
                                              }
                                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                category.active
                                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                                              }`}
                                            >
                                              {category.active
                                                ? "Active"
                                                : "Inactive"}
                                            </button>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-3">
                                              <button
                                                onClick={() =>
                                                  handleEditClick(category)
                                                }
                                                className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                                                title="Edit"
                                              >
                                                <svg
                                                  className="w-4 h-4"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                  />
                                                </svg>
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleDelete(
                                                    category.expenseCategoryId,
                                                    category.categoryName
                                                  )
                                                }
                                                className="text-red-600 hover:text-red-900 transition-colors p-1"
                                                title="Delete"
                                              >
                                                <svg
                                                  className="w-4 h-4"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                  />
                                                </svg>
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}

                          {/* Empty state for group with search */}
                          {expandedSections[sectionKey] &&
                            filteredCategories.length === 0 && (
                              <div className="px-6 py-8 text-center">
                                <p className="text-gray-500">
                                  No categories found in this group matching
                                  your search.
                                </p>
                              </div>
                            )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <ExpenseCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
        mode="create"
      />

      {/* Edit Modal */}
      <ExpenseCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onCategoryUpdated={handleCategoryUpdated}
        categoryData={selectedCategory}
        mode="edit"
      />
    </div>
  );
};

export default ExpensesCategoryList;
