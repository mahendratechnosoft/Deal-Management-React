import React, { useState } from "react";
import { useLayout } from "../../Layout/useLayout";
import EditFamily from "./EditFamily";
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

function FamilyList() {
  // Dummy handlers for button clicks
  const { LayoutComponent, role } = useLayout();
  const handleEdit = (id) => console.log("Edit", id);
  // In FamilyList component, update the handlePreviewMatchingDonor function:


  const handlePreviewMatchingDonor = (familyId) => {
   
    window.location.href = `/Admin/PreviewMatchingDonors/${familyId}`;
    
   
};

// Update the preview button in the table:
<button
    title="Preview"
    onClick={() => handlePreviewMatchingDonor(1)} // Pass the actual family ID
    className="text-blue-600 hover:text-blue-900"
>
    <PreviewIcon />
</button>
  const handleOpenPdfPreview = (id) => console.log("PDF", id);
  const [openModal, setOpenModal] = useState(false);
  return (
    <LayoutComponent>
      <div className="p-6 pb-0 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="mb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <div>
                  {/* Updated Text */}
                  <h1 className="text-2xl font-bold text-gray-900">
                    Family List
                  </h1>
                
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search Input */}
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
                  // Updated Text
                  placeholder="Search Family"
                //  value={searchTerm}
                 // onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors duration-200"
                />
              </div>

              {/* Create Button */}
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                // Updated Handler
             onClick={() => setOpenModal(true)}
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
                {/* Updated Text */}
                Create Family
              </button>
            </div>
          </div>
        </div>
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
                  Name
                </th>
                <th className="w-[25%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 Mobile
                </th>
                <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refer Hospital
                </th>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Refer Doctor
                </th>

                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Action
                </th>
             
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {/* ----- RECORD 1 ----- */}
              <tr>
                {/* KEY: `truncate` applies the ellipsis (...) automatically */}
                <td className="px-4 py-4 truncate text-sm text-gray-900 font-bold ">
                 Sandip Gaikwad
                </td>
                <td className="px-4 py-4 truncate text-sm text-gray-900">
                  8975053147
                </td>
                <td className="px-4 py-4 truncate text-sm text-gray-900">
                 Sanchiti 
                </td>
                <td className="px-4 py-4 truncate text-sm text-gray-900">
                  Dr. Patil 
                </td>
           
                
                {/* KEY: Use `whitespace-nowrap` for button groups to prevent them from wrapping */}
                <td className="px-4 py-1 whitespace-nowrap text-sm font-medium ">
                  <div className="flex items-center gap-3">
                    <button
                      title="Edit"
                      onClick={() => setOpenModal(true)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EditIcon />
                    </button>
                    <button
                      title="Preview"
                      onClick={() => handlePreviewMatchingDonor(1)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PreviewIcon />
                    </button>
                 
                  </div>
                </td>
              </tr>

           

              {/* ----- RECORD 3 ----- */}
              <tr>
                <td className="px-4 py-4 truncate text-sm text-gray-900 font-bold ">
                 Ramesh Deshmukh
                </td>
                <td className="px-4 py-4 truncate text-sm text-gray-900">
                 745174568
                </td>
                <td className="px-4 py-4 truncate text-sm text-gray-900">
                  Sahyadhri Hospital
                </td>
                <td className="px-4 py-4 truncate text-sm text-gray-900">
                 Dr. Suresh
                </td>
            
                <td className="px-4 py-1 whitespace-nowrap text-sm font-medium ">
                  <div className="flex items-center gap-3">
                    <button
                      title="Edit"
                       onClick={() => setOpenModal(true)}
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
               
              
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


   {/* Modal */}
                <EditFamily
                    isOpen={openModal}
                    onClose={() => setOpenModal(false)}
                    onSuccess={() => console.log("Donor added!")}
                />
            

    </LayoutComponent>
  );
}

export default FamilyList;
