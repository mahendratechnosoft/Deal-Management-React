// components/ExpenseCategoryModal.js
import React, { useState, useEffect } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";

const ExpenseCategoryModal = ({
  isOpen,
  onClose,
  onCategoryCreated,
  onCategoryUpdated,
  categoryData = null, // For edit mode
  mode = "create", // 'create' or 'edit'
}) => {
  const [loading, setLoading] = useState(false);
  const [checkingExistence, setCheckingExistence] = useState(false);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [selectOptions, setSelectOptions] = useState([]);
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
  const [fetchCategoryGroupsLoading, setfetchCategoryGroupsLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    type: "DIRECT",
    categoryGroup: "",
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isExisting, setIsExisting] = useState(false);

  // Colors for consistent styling
const colors = {
  blue: {
    primary: "#2563eb",
    light: "#dbeafe",
    dark: "#1d4ed8",
  },
  amber: {
    primary: "#d97706",
    light: "#fef3c7",
    dark: "#b45309",
  },
  purple: {
    primary: "#7c3aed",
    light: "#ede9fe",
    dark: "#5b21b6",
  },
};
  // Fetch category groups for dropdown
  const fetchCategoryGroups = async () => {
    setfetchCategoryGroupsLoading(true);
    try {
      const response = await axiosInstance.get("getAllGroupsExpenseCategory");
      const groups = response.data || [];
      setCategoryGroups(groups);

      // Convert to react-select format
      const options = groups.map((group) => ({
        value: group,
        label: group,
        color: group.toLowerCase().includes("indirect")
          ? colors.purple.primary
          : colors.blue.primary,
      }));
      setSelectOptions(options);
    } catch (error) {
      console.error("Error fetching category groups:", error);
      toast.error("Failed to load category groups");
    }
    finally{
      setfetchCategoryGroupsLoading(false);
    };
  };

  // Check if category already exists in the group
  const checkCategoryExistence = async (categoryGroup, categoryName) => {
    if (!categoryGroup || !categoryName) {
      setIsExisting(false);
      return;
    }

    setCheckingExistence(true);
    try {
      const response = await axiosInstance.get(
        `isCategoryExistInGroup?categoryGroup=${encodeURIComponent(
          categoryGroup
        )}&categoryName=${encodeURIComponent(categoryName)}`
      );
      setIsExisting(response.data === true);
    } catch (error) {
      console.error("Error checking category existence:", error);
      setIsExisting(false);
    } finally {
      setCheckingExistence(false);
    }
  };

  // Reset and initialize form
  useEffect(() => {
    if (isOpen) {
      fetchCategoryGroups();
      setIsCreatingNewGroup(false);

      if (mode === "edit" && categoryData) {
        // Pre-fill form for edit mode
        setFormData({
          categoryName: categoryData.categoryName || "",
          description: categoryData.description || "",
          type: categoryData.type || "DIRECT",
          categoryGroup: categoryData.categoryGroup || "",
          active:
            categoryData.active !== undefined ? categoryData.active : true,
        });
        setIsExisting(false); // Reset existence check for edit
      } else {
        // Reset for create mode
        setFormData({
          categoryName: "",
          description: "",
          type: "DIRECT",
          categoryGroup: "",
          active: true,
        });
        setIsExisting(false);
      }
      setErrors({});
    }
  }, [isOpen, mode, categoryData]);

  // Check for existing category when form changes
  useEffect(() => {
    if (mode === "create" && formData.categoryGroup && formData.categoryName) {
      const debounceTimer = setTimeout(() => {
        checkCategoryExistence(formData.categoryGroup, formData.categoryName);
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [formData.categoryGroup, formData.categoryName, mode]);

  const handleChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };

    setFormData(newFormData);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Reset category group when type changes
    if (field === "type") {
      newFormData.categoryGroup = "";
      setIsExisting(false);
      setIsCreatingNewGroup(false);
    }

    // Reset existence check if category name or group changes
    if (field === "categoryName" || field === "categoryGroup") {
      setIsExisting(false);
    }
  };

  // Handle select change for category group
  const handleGroupChange = (selectedOption) => {
    if (selectedOption?.__isNew__) {
      // User is creating a new group
      const newGroupName = selectedOption.value;
      setIsCreatingNewGroup(true);
      handleChange("categoryGroup", newGroupName);

      // Add to select options temporarily
      const newOption = {
        value: newGroupName,
        label: newGroupName,
        color:
          formData.type === "INDIRECT"
            ? colors.purple.primary
            : colors.blue.primary,
        isNew: true,
      };

      if (!selectOptions.some((opt) => opt.value === newGroupName)) {
        setSelectOptions([newOption, ...selectOptions]);
      }
    } else {
      // User selected an existing group
      setIsCreatingNewGroup(false);
      handleChange("categoryGroup", selectedOption?.value || "");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryGroup?.trim()) {
      newErrors.categoryGroup = "Category group is required";
    }

    if (!formData.categoryName?.trim()) {
      newErrors.categoryName = "Category name is required";
    }

    if (!formData.type) {
      newErrors.type = "Expense type is required";
    }

    // Check if category already exists (only for create mode)
    if (mode === "create" && isExisting) {
      newErrors.categoryName =
        "Category with this name already exists in the selected group";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    if (isExisting) {
      toast.error("Category already exists in this group");
    } else {
      toast.error("Please fill in all required fields");
    }
    return;
  }

  setLoading(true);
  try {
    let response;

    if (mode === "edit" && categoryData) {
      // FIX: Send ALL data including ID in the request body
      const updatePayload = {
        expenseCategoryId: categoryData.expenseCategoryId, // Include ID in body
        adminId: categoryData.adminId, // Include adminId if needed
        categoryGroup: formData.categoryGroup,
        categoryName: formData.categoryName,
        description: formData.description,
        type: formData.type,
        active: formData.active,
        createdAt: categoryData.createdAt, // Include original createdAt
      };

      // FIX: Call updateExpenseCategory without ID in URL
      response = await axiosInstance.post(
    
        "updateExpenseCategory", // No ID in URL
        updatePayload
      );

      toast.success("Category updated successfully!");

      if (onCategoryUpdated) {
        onCategoryUpdated(response.data);
      }
    } else {
      // Create new category
      const createPayload = {
        categoryGroup: formData.categoryGroup,
        categoryName: formData.categoryName,
        description: formData.description,
        type: formData.type,
        active: formData.active,
      };

      response = await axiosInstance.post(
        "updateExpenseCategory",
        createPayload
      );

      toast.success("Expense category created successfully!");

      if (onCategoryCreated) {
        onCategoryCreated(response.data);
      }
    }

    onClose();
  } catch (error) {
    console.error(
      `Error ${mode === "edit" ? "updating" : "creating"} expense category:`,
      error
    );

    if (error.response) {
      console.error("Error details:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method,
        payload: error.config.data,
      });
    }

    if (error.response?.status === 400) {
      toast.error(
        error.response.data?.message ||
          "Validation error. Please check your input."
      );
    } else if (error.response?.status === 404) {
      toast.error("API endpoint not found. Please check the URL.");
    } else if (error.response?.status === 409) {
      toast.error(
        "Category with this name already exists in the selected group"
      );
    } else {
      toast.error(
        `Failed to ${mode === "edit" ? "update" : "create"} expense category`
      );
    }
  } finally {
    setLoading(false);
  }
};

  // Get filtered options based on type
  const getFilteredOptions = () => {
    if (!formData.type || isCreatingNewGroup) return selectOptions;

    // Filter options based on type keywords
    return selectOptions.filter((option) => {
      if (option.isNew) return true; // Always show newly created groups

      const groupLower = option.label.toLowerCase();
      if (formData.type === "DIRECT") {
        return !groupLower.includes("indirect");
      } else if (formData.type === "INDIRECT") {
        return groupLower.includes("indirect");
      }
      return true;
    });
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: errors.categoryGroup
        ? "#ef4444"
        : state.isFocused
        ? mode === "edit"
          ? colors.blue.primary
          : colors.blue.primary
        : "#d1d5db",
      borderRadius: "0.5rem",
      padding: "0.2rem",
      boxShadow: state.isFocused
        ? `0 0 0 2px ${mode === "edit" ? colors.blue.light : colors.blue.light}`
        : "none",
      "&:hover": {
        borderColor: errors.categoryGroup ? "#ef4444" : "#9ca3af",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? mode === "edit"
          ? colors.blue.light
          : colors.blue.light
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected
        ? mode === "edit"
          ? colors.blue.dark
          : colors.blue.dark
        : "#374151",
      fontWeight: state.isSelected ? "600" : "400",
      "&:active": {
        backgroundColor:
          mode === "edit" ? colors.blue.light : colors.blue.light,
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#111827",
      fontWeight: "500",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: errors.categoryGroup ? "#ef4444" : "#d1d5db",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: errors.categoryGroup ? "#ef4444" : "#6b7280",
      "&:hover": {
        color: mode === "edit" ? colors.blue.primary : colors.blue.primary,
      },
    }),
  };

  const title =
    mode === "edit" ? "Edit Expense Category" : "Create Expense Category";
  const submitText = mode === "edit" ? "Update Category" : "Create Category";
  const isLoading = loading || checkingExistence;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div
          className={`border-b p-6 text-white ${
            mode === "edit"
              ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-3"
              : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-3"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  mode === "edit" ? "bg-blue-600" : "bg-blue-100"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${
                    mode === "edit" ? "bg-blue-600" : "text-blue-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mode === "edit" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  )}
                </svg>
              </div>
              <div>
                <h2
                  className={`text-lg font-bold ${
                    mode === "edit" ? "text-white" : "text-white"
                  }`}
                >
                  {title}
                </h2>
                <p
                  className={`text-sm ${
                    mode === "edit" ? "text-white" : "text-white"
                  }`}
                >
                  {mode === "edit"
                    ? "Edit existing expense category"
                    : "Add a new expense category"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Expense Type (Moved to top) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange("type", "DIRECT")}
                    disabled={loading}
                    className={`px-4 py-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      formData.type === "DIRECT"
                        ? `border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500`
                        : "border-gray-300 hover:border-gray-400"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <svg
                      className="w-5 h-5 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    <span className="text-sm font-medium">Direct</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("type", "INDIRECT")}
                    disabled={loading}
                    className={`px-4 py-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                      formData.type === "INDIRECT"
                        ? `border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500`
                        : "border-gray-300 hover:border-gray-400"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <svg
                      className="w-5 h-5 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span className="text-sm font-medium">Indirect</span>
                  </button>
                </div>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">{errors.type}</p>
                )}
              </div>

              {/* Category Group Dropdown - Moved above Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Group <span className="text-red-500">*</span>
                  
                </label>

                <CreatableSelect
                  isClearable
                  isDisabled={fetchCategoryGroupsLoading}
                  isLoading={fetchCategoryGroupsLoading}
                  options={getFilteredOptions()}
                  value={
                    formData.categoryGroup
                      ? {
                          value: formData.categoryGroup,
                          label: formData.categoryGroup,
                        }
                      : null
                  }
                  onChange={handleGroupChange}
                  onCreateOption={(inputValue) => {
                    const newOption = {
                      value: inputValue,
                      label: inputValue,
                      __isNew__: true,
                    };
                    handleGroupChange(newOption);
                  }}
                  placeholder="Select or create a group..."
                  noOptionsMessage={() => "Type to create a new group"}
                  formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                  styles={customStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />

                {isCreatingNewGroup && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-xs text-green-700">
                        New group "
                        <span className="font-semibold">
                          {formData.categoryGroup}
                        </span>
                        " will be create automatically.
                      </p>
                    </div>
                  </div>
                )}

                
                {errors.categoryGroup && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.categoryGroup}
                  </p>
                )}

                {mode === "create" && !isCreatingNewGroup && formData.type && (
                  <p className="text-xs text-gray-500 mt-1">
                    Showing groups for{" "}
                    {formData.type === "DIRECT" ? "Direct" : "Indirect"}{" "}
                    expenses. Type to create a new group.
                  </p>
                )}
              </div>

              {/* Category Name - Moved below Category Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                  {checkingExistence && (
                    <span className="ml-2 text-xs text-gray-500 animate-pulse">
                      Checking...
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.categoryName}
                  onChange={(e) => handleChange("categoryName", e.target.value)}
                  placeholder="e.g., Electricity Charges, Office Supplies"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    errors.categoryName
                      ? "border-red-500 ring-1 ring-red-500"
                      : isExisting
                      ? "border-orange-500 ring-1 ring-orange-500"
                      : "border-gray-300"
                  }`}
                  disabled={loading}
                />
                {isExisting && (
                  <div className="mt-1 flex items-center gap-1 text-orange-600 text-xs">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Category already exists in this group
                  </div>
                )}
                {errors.categoryName && !isExisting && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.categoryName}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief description of this expense category"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={loading}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                mode === "edit"
                  ? "border-blue-300 text-blue-700 bg-white hover:bg-blue-50"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (mode === "create" && isExisting)}
              className={`px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors ${
                mode === "edit"
                  ? `bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700`
                  : `bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700`
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {mode === "edit" ? (
                    <>
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Update Category
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategoryModal;
