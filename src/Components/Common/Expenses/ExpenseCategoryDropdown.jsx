import React, { useState, useEffect, useRef } from "react";

const ExpenseCategoryDropdown = ({
  label = "Expense Category",
  value,
  onChange,
  error,
  required = false,
  loading = false,
  categoriesData,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState({});
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Find selected category details
  const getSelectedCategory = () => {
    if (!value || !categoriesData) return null;

    // Search through all categories
    for (const type in categoriesData) {
      for (const group in categoriesData[type]) {
        const category = categoriesData[type][group].find(
          (cat) => cat.expenseCategoryId === value
        );
        if (category) {
          return category;
        }
      }
    }
    return null;
  };

  const selectedCategory = getSelectedCategory();

  // Filter categories based on search term
  useEffect(() => {
    if (!categoriesData) {
      setFilteredData({});
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredData(categoriesData);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = {};

    Object.keys(categoriesData).forEach((type) => {
      Object.keys(categoriesData[type]).forEach((group) => {
        const matchingCategories = categoriesData[type][group].filter(
          (cat) =>
            cat.categoryName.toLowerCase().includes(searchLower) ||
            (cat.categoryGroup &&
              cat.categoryGroup.toLowerCase().includes(searchLower))
        );

        if (matchingCategories.length > 0) {
          if (!filtered[type]) filtered[type] = {};
          filtered[type][group] = matchingCategories;
        }
      });
    });

    setFilteredData(filtered);
  }, [searchTerm, categoriesData]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Handle category selection - Return both ID and Name
  const handleSelect = (category) => {
    // Call onChange with both ID and Name
    onChange(category.expenseCategoryId, category.categoryName);
    setIsOpen(false);
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="animate-pulse">
          <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Dropdown Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[40px] px-3 py-2 border rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-between ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        } ${isOpen ? "border-blue-500 ring-2 ring-blue-500" : ""}`}
      >
        <div className="flex items-center gap-2">
          {selectedCategory ? (
            <>
              <div
                className={`px-2 py-1 text-xs font-medium rounded ${
                  selectedCategory.type === "DIRECT"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {selectedCategory.type}
              </div>
              <span className="text-sm text-gray-900">
                {selectedCategory.categoryName}
              </span>
            </>
          ) : (
            <span className="text-gray-500">Select category...</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
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

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
              <input
                ref={searchRef}
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="overflow-y-auto max-h-64">
            {Object.keys(filteredData).length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchTerm ? "No categories found" : "No categories available"}
              </div>
            ) : (
              Object.keys(filteredData).map((type) => (
                <div key={type}>
                  {/* Type Header */}
                  <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        {type} Expenses
                      </span>
                    </div>
                  </div>

                  {/* Groups within Type */}
                  {Object.keys(filteredData[type]).map((group) => (
                    <div
                      key={`${type}-${group}`}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      {/* Group Header */}
                      <div className="px-4 py-2 bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">
                          {group}
                        </span>
                      </div>

                      {/* Categories within Group */}
                      <div className="divide-y divide-gray-100">
                        {filteredData[type][group].map((category) => (
                          <div
                            key={category.expenseCategoryId}
                            onClick={() => handleSelect(category)}
                            className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                              value === category.expenseCategoryId
                                ? "bg-blue-50"
                                : ""
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {category.categoryName}
                              </span>
                              {category.description && (
                                <span className="text-xs text-gray-500 mt-1">
                                  {category.description}
                                </span>
                              )}
                            </div>
                            {value === category.expenseCategoryId && (
                              <svg
                                className="w-5 h-5 text-blue-600 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoryDropdown;
