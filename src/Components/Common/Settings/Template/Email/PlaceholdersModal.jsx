// PlaceholdersModal.js
import React, { useState, useEffect, useRef, useMemo } from "react";

const PlaceholdersModal = ({
  isOpen,
  onClose,
  placeholders = {},
  triggerEvent,
  onInsert,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Filter placeholders based on search term
  const filteredPlaceholders = useMemo(() => {
    if (!searchTerm.trim()) return placeholders;

    const filtered = {};
    Object.entries(placeholders).forEach(([category, items]) => {
      const filteredItems = items.filter(
        (item) =>
          item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredItems.length > 0) {
        filtered[category] = filteredItems;
      }
    });
    return filtered;
  }, [placeholders, searchTerm]);

  // Get total placeholders count
  const totalPlaceholders = useMemo(() => {
    return Object.values(placeholders).reduce(
      (total, arr) => total + arr.length,
      0
    );
  }, [placeholders]);

  // Get total filtered placeholders count
  const totalFilteredPlaceholders = useMemo(() => {
    return Object.values(filteredPlaceholders).reduce(
      (total, arr) => total + arr.length,
      0
    );
  }, [filteredPlaceholders]);

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const handleInsertAndClose = (key) => {
    onInsert(key);
    onClose();
  };

  // Auto scroll to top when search changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[70vh] overflow-hidden border border-gray-200 flex flex-col"
      >
        {/* Modal Header - Compact */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
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
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  Available Placeholders
                </h2>
                <div className="flex items-center gap-2 text-xs text-blue-100">
                  <span>{triggerEvent?.replace(/_/g, " ")}</span>
                  <span>•</span>
                  <span>{Object.keys(placeholders).length} categories</span>
                  <span>•</span>
                  <span>{totalPlaceholders} placeholders</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <svg
                className="w-5 h-5"
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

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="relative">
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
              placeholder="Search placeholders..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
            )}
          </div>
        </div>

        {/* Placeholders Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4"
          style={{ maxHeight: "calc(70vh - 180px)" }}
        >
          {Object.keys(filteredPlaceholders).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(filteredPlaceholders).map(([category, items]) => (
                <div
                  key={category}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                >
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {category}
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {items.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item, index) => (
                        <button
                          key={`${item.key}-${index}`}
                          onClick={() => handleInsertAndClose(item.key)}
                          className="group text-left p-2 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          title={`${item.label}: ${item.key}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded flex items-center justify-center group-hover:bg-blue-100">
                              <svg
                                className="w-3 h-3 text-gray-500 group-hover:text-blue-600"
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
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-xs text-blue-600 group-hover:text-blue-800 truncate">
                                {item.key}
                              </div>
                              <div className="text-xs text-gray-600 truncate mt-0.5">
                                {item.label}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 mb-2">
                No matching placeholders found
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600">No placeholders available</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {searchTerm
                ? `${totalFilteredPlaceholders} results`
                : "Click any placeholder to insert"}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholdersModal;
