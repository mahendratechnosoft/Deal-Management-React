import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function LeadList() {
  const navigate = useNavigate();
  const [showColumnPopup, setShowColumnPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // "table" or "kanban"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const fakeLeads = [
    {
      id: 1,
      name: "Lindsay Walton",
      title: "Front-end Developer",
      email: "lindsay.walton@example.com",
      role: "Member",
      phone: "+1-555-0101",
      company: "ABC Corp",
      status: "New",
      source: "Website",
      avatar: "/api/placeholder/32/32",
      lastContact: "2 hours ago",
    },
    {
      id: 2,
      name: "Courtney Henry",
      title: "Designer",
      email: "courtney.henry@example.com",
      role: "Admin",
      phone: "+1-555-0102",
      company: "XYZ Inc",
      status: "Contacted",
      source: "Referral",
      avatar: "/api/placeholder/32/32",
      lastContact: "1 day ago",
    },
    {
      id: 3,
      name: "Tom Cook",
      title: "Director of Product",
      email: "tom.cook@example.com",
      role: "Member",
      phone: "+1-555-0103",
      company: "Tech Solutions",
      status: "Qualified",
      source: "Trade Show",
      avatar: "/api/placeholder/32/32",
      lastContact: "3 days ago",
    },
    {
      id: 4,
      name: "Whitney Francis",
      title: "Copywriter",
      email: "whitney.francis@example.com",
      role: "Admin",
      phone: "+1-555-0104",
      company: "Global Enterprises",
      status: "New",
      source: "Website",
      avatar: "/api/placeholder/32/32",
      lastContact: "Just now",
    },
  ];

  const kanbanColumns = [
    { id: "new", title: "New", color: "bg-blue-500", leads: [] },
    { id: "contacted", title: "Contacted", color: "bg-purple-500", leads: [] },
    { id: "qualified", title: "Qualified", color: "bg-green-500", leads: [] },
    { id: "proposal", title: "Proposal", color: "bg-yellow-500", leads: [] },
    { id: "negotiation", title: "Negotiation", color: "bg-orange-500", leads: [] },
    { id: "won", title: "Won", color: "bg-green-600", leads: [] },
    { id: "lost", title: "Lost", color: "bg-red-500", leads: [] },
  ];

  // Filter leads based on search and status
  const filteredLeads = fakeLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Organize leads for kanban view
  const organizedKanbanColumns = kanbanColumns.map(column => ({
    ...column,
    leads: filteredLeads.filter(lead => lead.status.toLowerCase() === column.id)
  }));

  const handleCreateLead = () => {
    navigate("/Admin/CreateLead");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOpenPopup = () => {
    setTempColumns([...columns]);
    setShowColumnPopup(true);
  };

  const handleClosePopup = () => {
    setShowColumnPopup(false);
  };

  const handleApplyChanges = () => {
    setColumns([...tempColumns]);
    setShowColumnPopup(false);
  };

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
    navigate(`/Admin/EditLead/${leadId}`);
  };

  const visibleColumns = columns
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-purple-100 text-purple-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      case "proposal":
        return "bg-yellow-100 text-yellow-800";
      case "negotiation":
        return "bg-orange-100 text-orange-800";
      case "won":
        return "bg-green-500 text-white";
      case "lost":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
   
          <div className="p-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
                  <p className="text-gray-600 mt-2">Manage and track all your leads in one place</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Leads</p>
                      <p className="text-2xl font-bold text-gray-900">24</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New This Week</p>
                      <p className="text-2xl font-bold text-gray-900">8</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">24%</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-bold text-gray-900">2.4h</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
                  <p className="text-gray-600 mt-1">
                    A list of all the leads in your account. ({filteredLeads.length} results)
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        viewMode === "table" 
                          ? "bg-white text-gray-900 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Table
                      </div>
                    </button>
                    <button
                      onClick={() => setViewMode("kanban")}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        viewMode === "kanban" 
                          ? "bg-white text-gray-900 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                        Kanban
                      </div>
                    </button>
                  </div>

                  <button
                    className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium border border-gray-300 flex items-center gap-2"
                    onClick={handleOpenPopup}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    Customize Columns
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                    onClick={handleCreateLead}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Lead
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            {viewMode === "table" ? (
              /* Table View */
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {visibleColumns.map((column) => (
                          <th
                            key={column.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column.name}
                          </th>
                        ))}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          {visibleColumns.map((column) => (
                            <td
                              key={column.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {column.id === "name" ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {getInitials(lead.name)}
                                  </div>
                                  <span className="font-semibold">
                                    {lead[column.id]}
                                  </span>
                                </div>
                              ) : column.id === "role" ? (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(lead.id)}
                              className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Kanban View */
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {organizedKanbanColumns.map((column) => (
                    <div key={column.id} className="w-80 flex-shrink-0">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                              <h3 className="font-semibold text-gray-900">{column.title}</h3>
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                {column.leads.length}
                              </span>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-3 min-h-[200px]">
                          {column.leads.map((lead) => (
                            <div
                              key={lead.id}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {getInitials(lead.name)}
                                  </div>
                                  <span className="font-medium text-sm text-gray-900">{lead.name}</span>
                                </div>
                                <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                  {lead.status}
                                </span>
                              </div>
                              
                              <p className="text-xs text-gray-600 mb-2">{lead.title} • {lead.company}</p>
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{lead.lastContact}</span>
                                <button
                                  onClick={() => handleEdit(lead.id)}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          {column.leads.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-sm">No leads</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Column Customization Popup */}
            {showColumnPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Customize Columns
                    </h3>
                    <button
                      className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-colors duration-200"
                      onClick={handleClosePopup}
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-gray-600 text-sm mb-4">
                      Drag and drop to rearrange columns. Check/uncheck to
                      show/hide columns.
                    </p>

                    <div className="space-y-2">
                      {tempColumns
                        .sort((a, b) => a.order - b.order)
                        .map((column, index) => (
                          <div
                            key={column.id}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-grab"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={handleDrop}
                            onDragEnd={() => {
                              dragItem.current = null;
                              dragOverItem.current = null;
                            }}
                          >
                            <div className="text-gray-400 mr-3 cursor-grab">
                              ⋮⋮
                            </div>
                            <label className="flex items-center space-x-3 cursor-pointer flex-1 m-0">
                              <input
                                type="checkbox"
                                checked={column.visible}
                                onChange={() => handleColumnToggle(column.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700 font-medium">
                                {column.name}
                              </span>
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
                      onClick={handleApplyChanges}
                    >
                      Apply Changes
                    </button>
                    <button
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
                      onClick={handleClosePopup}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
    
  );
}

export default LeadList;