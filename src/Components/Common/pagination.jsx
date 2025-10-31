import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemsName = "items",
  showPageSize = true,
  sticky = true,
}) => {
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      onPageChange(newPage);
    }
  };

  if (totalPages <= 1 && !showPageSize) return null;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-xs p-3 mt-4 ${
        sticky ? "sticky bottom-0" : ""
      }`}
      style={{ zIndex: "39" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="text-gray-600">
            {totalPages > 1
              ? `Page ${currentPage + 1} of ${totalPages}`
              : `${totalItems} ${itemsName}`}
          </div>

          {showPageSize && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value);
                  onPageSizeChange(newSize);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              className="px-2 py-1 rounded border border-gray-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-w-8 transition-colors duration-200"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-2 py-1 rounded border border-gray-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-w-8 transition-colors duration-200"
            >
              ‹
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-2 py-1 rounded text-xs font-medium min-w-8 transition-colors duration-200 ${
                  currentPage === page
                    ? "bg-blue-600 text-white border border-blue-600"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-2 py-1 rounded border border-gray-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-w-8 transition-colors duration-200"
            >
              ›
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              className="px-2 py-1 rounded border border-gray-300 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-w-8 transition-colors duration-200"
            >
              Last
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
