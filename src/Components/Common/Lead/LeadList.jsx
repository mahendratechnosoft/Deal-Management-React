import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function LeadList() {
  const navigate = useNavigate();
  const [showColumnPopup, setShowColumnPopup] = useState(false);
  const [columns, setColumns] = useState([
    { id: "name", name: "NAME", visible: true, order: 0 },
    { id: "title", name: "TITLE", visible: true, order: 1 },
    { id: "email", name: "EMAIL", visible: true, order: 2 },
    { id: "role", name: "ROLE", visible: true, order: 3 },
    { id: "phone", name: "PHONE", visible: true, order: 4 },
    { id: "company", name: "COMPANY", visible: true, order: 5 },
    { id: "status", name: "STATUS", visible: true, order: 6 },
    { id: "source", name: "SOURCE", visible: true, order: 7 },
  ]);

  const [tempColumns, setTempColumns] = useState(columns);
  const dragItem = useRef();
  const dragOverItem = useRef();

  // Updated fake data to match the table structure
  const fakeLeads = [
    {
      id: 1,
      name: "Lindsay Walton",
      title: "Front-end Developer",
      email: "lindsay.walton@example.com",
      role: "Member",
      phone: "+1-555-0101",
      company: "ABC Corp",
      status: "Active",
      source: "Website",
    },
    {
      id: 2,
      name: "Courtney Henry",
      title: "Designer",
      email: "courtney.henry@example.com",
      role: "Admin",
      phone: "+1-555-0102",
      company: "XYZ Inc",
      status: "Active",
      source: "Referral",
    },
    {
      id: 3,
      name: "Tom Cook",
      title: "Director of Product",
      email: "tom.cook@example.com",
      role: "Member",
      phone: "+1-555-0103",
      company: "Tech Solutions",
      status: "Active",
      source: "Trade Show",
    },
    {
      id: 4,
      name: "Whitney Francis",
      title: "Copywriter",
      email: "whitney.francis@example.com",
      role: "Admin",
      phone: "+1-555-0104",
      company: "Global Enterprises",
      status: "Active",
      source: "Website",
    },
    {
      id: 5,
      name: "Leonard Krasner",
      title: "Senior Designer",
      email: "leonard.krasner@example.com",
      role: "Owner",
      phone: "+1-555-0105",
      company: "Innovate LLC",
      status: "Active",
      source: "Social Media",
    },
    {
      id: 6,
      name: "Floyd Miles",
      title: "Principal Designer",
      email: "floyd.miles@example.com",
      role: "Member",
      phone: "+1-555-0106",
      company: "Design Co",
      status: "Active",
      source: "Referral",
    },
  ];

  // Navigate to create lead page
  const handleCreateLead = () => {
    navigate("/CreateLead");
  };


  // Open popup and initialize temp columns
  const handleOpenPopup = () => {
    setTempColumns([...columns]);
    setShowColumnPopup(true);
  };

  // Close popup without saving changes
  const handleClosePopup = () => {
    setShowColumnPopup(false);
  };

  // Apply changes and close popup
  const handleApplyChanges = () => {
    setColumns([...tempColumns]);
    setShowColumnPopup(false);
  };

  // Toggle column visibility in temp state
  const handleColumnToggle = (columnId) => {
    setTempColumns(
      tempColumns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dragItemIndex = dragItem.current;
    const dragOverItemIndex = dragOverItem.current;

    if (dragItemIndex !== dragOverItemIndex) {
      const newTempColumns = [...tempColumns];
      const draggedColumn = newTempColumns[dragItemIndex];

      newTempColumns.splice(dragItemIndex, 1);
      newTempColumns.splice(dragOverItemIndex, 0, draggedColumn);

      const updatedColumns = newTempColumns.map((col, index) => ({
        ...col,
        order: index,
      }));

      setTempColumns(updatedColumns);
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleEdit = (leadId) => {
    navigate(`/EditLead/${leadId}`);
  };

  const visibleColumns = columns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  // Role color mapping
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "owner":
        return "bg-red-100 text-red-800";
      case "member":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-sans">
                Leads
              </h2>
              <p className="text-gray-600 mt-1 font-sans">
                A list of all the leads in your account.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium font-sans"
                onClick={handleOpenPopup}
              >
                Customize Columns
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium font-sans"
                onClick={handleCreateLead}
              >
                Create Lead
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden font-sans">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans"
                    >
                      {column.name}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fakeLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {visibleColumns.map((column) => (
                      <td
                        key={column.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-sans"
                      >
                        {column.id === "role" ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                              lead[column.id]
                            )}`}
                          >
                            {lead[column.id]}
                          </span>
                        ) : column.id === "status" ? (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              lead[column.id]
                            )}`}
                          >
                            {lead[column.id]}
                          </span>
                        ) : (
                          lead[column.id]
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-sans">
                      <button
                        onClick={() => handleEdit(lead.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200 font-sans"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column Customization Popup */}
        {showColumnPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-sans">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 font-sans">
                  Customize Columns
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors duration-200 font-sans"
                  onClick={handleClosePopup}
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <p className="text-gray-600 text-sm mb-4 font-sans">
                  Drag and drop to rearrange columns. Check/uncheck to show/hide
                  columns.
                </p>

                <div className="space-y-2">
                  {tempColumns
                    .sort((a, b) => a.order - b.order)
                    .map((column, index) => (
                      <div
                        key={column.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-grab font-sans"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={handleDrop}
                        onDragEnd={() => {
                          dragItem.current = null;
                          dragOverItem.current = null;
                        }}
                      >
                        <div className="text-gray-400 mr-3 cursor-grab">⋮⋮</div>
                        <label className="flex items-center space-x-3 cursor-pointer flex-1 m-0 font-sans">
                          <input
                            type="checkbox"
                            checked={column.visible}
                            onChange={() => handleColumnToggle(column.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700 font-medium font-sans">
                            {column.name}
                          </span>
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium font-sans"
                  onClick={handleApplyChanges}
                >
                  Apply Changes
                </button>
                <button
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium font-sans"
                  onClick={handleClosePopup}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadList;
