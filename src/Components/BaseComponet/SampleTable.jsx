import React from "react";

// You can keep your SVG icons as separate components or use them inline like this.
const EditIcon = () => (
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
);

const PreviewIcon = () => (
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
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const PdfIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    ></path>
  </svg>
);

function SampleTable() {
  // Dummy handlers for button clicks
  const handleEdit = (id) => console.log("Edit", id);
  const handlePreview = (id) => console.log("Preview", id);
  const handleOpenPdfPreview = (id) => console.log("PDF", id);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      {/* KEY: `table-fixed` and `w-full` are essential.
        `table-fixed` tells the browser to use the <th> widths, not the content.
      */}
      <table className="min-w-full divide-y divide-gray-200 table-fixed w-full">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {/* KEY: Define column widths on the headers.
              They must add up to 100% (or be close).
            */}
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Column One
            </th>
            <th className="w-[25%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Column Two
            </th>
            <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Column Three
            </th>
            <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Column Four
            </th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Column Five
            </th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Column Six
            </th>
            <th className="w-[8%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Column Seven
            </th>
            <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Column Eight
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {/* ----- RECORD 1 ----- */}
          <tr>
            {/* KEY: `truncate` applies the ellipsis (...) automatically */}
            <td className="px-4 py-4 truncate text-sm text-gray-900 font-bold ">
              Data 1-1
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900">
              Normal length subject
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900">
              Company Name Inc.
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900">
              $1,500.00
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900 ">
              2025-11-17
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900 ">
              2025-12-17
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900 ">Sent</td>
            {/* KEY: Use `whitespace-nowrap` for button groups to prevent them from wrapping */}
            <td className="px-4 py-1 whitespace-nowrap text-sm font-medium ">
              <div className="flex items-center gap-3">
                <button
                  title="Edit"
                  onClick={() => handleEdit(1)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <EditIcon />
                </button>
                <button
                  title="Preview"
                  onClick={() => handlePreview(1)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <PreviewIcon />
                </button>
                <button
                  title="View PDF"
                  onClick={() => handleOpenPdfPreview(1)}
                  className="text-red-600 hover:text-red-900"
                >
                  <PdfIcon />
                </button>
              </div>
            </td>
          </tr>

          {/* ----- RECORD 2 (WITH LONG TEXT) ----- */}
          <tr>
            <td className="px-4 py-4 truncate text-sm text-gray-900 font-bold ">
              Data 2-1
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900">
              {/* This long text will be truncated and show an ellipsis */}
              This is a very, very long subject line for the proposal that
              absolutely must not wrap or cause horizontal scrolling. It is
              designed to test the 'truncate' class.
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900">
              Another Long Company Name, LLC International
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900">
              $10,250.75
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900 ">
              2025-11-16
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900 ">
              2025-12-16
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900 ">Draft</td>
            <td className="px-4 py-1 whitespace-nowrap text-sm font-medium ">
              <div className="flex items-center gap-3">
                <button
                  title="Edit"
                  onClick={() => handleEdit(2)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <EditIcon />
                </button>
                <button
                  title="Preview"
                  onClick={() => handlePreview(2)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <PreviewIcon />
                </button>
                <button
                  title="View PDF"
                  onClick={() => handleOpenPdfPreview(2)}
                  className="text-red-600 hover:text-red-900"
                >
                  <PdfIcon />
                </button>
              </div>
            </td>
          </tr>

          {/* ----- RECORD 3 ----- */}
          <tr>
            <td className="px-4 py-4 truncate text-sm text-gray-900 font-bold ">
              Data 3-1
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900">
              A Third Proposal
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900">
              Tech Solutions
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900">
              $7,800.00
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900 ">
              2025-11-15
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900 ">
              2025-12-15
            </td>
            <td className="px-4 py-4 truncate text-sm text-gray-900 ">
              Accepted
            </td>
            <td className="px-4 py-1 whitespace-nowrap text-sm font-medium ">
              <div className="flex items-center gap-3">
                <button
                  title="Edit"
                  onClick={() => handleEdit(3)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <EditIcon />
                </button>
                <button
                  title="Preview"
                  onClick={() => handlePreview(3)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <PreviewIcon />
                </button>
                <button
                  title="View PDF"
                  onClick={() => handleOpenPdfPreview(3)}
                  className="text-red-600 hover:text-red-900"
                >
                  <PdfIcon />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default SampleTable;
