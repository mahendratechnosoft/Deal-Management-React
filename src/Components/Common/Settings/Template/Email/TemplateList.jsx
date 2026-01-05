import React, { useState, useEffect } from "react";
import CreateTemplateModal from "./CreateTemplateModal";
import UpdateTemplateModal from "./UpdateTemplateModal";
import axiosInstance from "../../../../BaseComponet/axiosInstance";
import { showDeleteConfirmation } from "../../../../BaseComponet/alertUtils";
import toast from "react-hot-toast";

const TemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("TASK");
  const [selectedTrigger, setSelectedTrigger] = useState("NEW_TASK");

  // Available categories and triggers
  const categories = ["TASK", "SALES"];
  const triggers = {
    TASK: ["NEW_TASK"],
    SALES: [
      "PROPOSAL_SEND",
      "PROFORMA_SEND",
      "PROFORMA_DUE_REMINDER",
      "PROFORMA_OVERDUE_ALERT",
      "INVOICE_SEND",
      "PAYMENT_RECORDED"
    ]
  };

  // Fetch Data based on category and trigger
  const fetchTemplates = async (category, trigger) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/admin/getEmailTemplates/${category}/${trigger}`
      );
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(selectedCategory, selectedTrigger);
  }, [selectedCategory, selectedTrigger]);

  const handleDelete = async (id, name) => {
    const result = await showDeleteConfirmation(name || "this template");
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/admin/deleteEmailTemplate/${id}`);
        setTemplates((prev) =>
          prev.filter((template) => template.emailTemplateId !== id)
        );
        toast.success("Template deleted successfully!");
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template");
      }
    }
  };

  // Open Update Modal
  const handleEditClick = (id) => {
    setSelectedTemplateId(id);
    setIsUpdateModalOpen(true);
  };

  const handleCloseCreate = () => setIsCreateModalOpen(false);
  const handleCloseUpdate = () => {
    setIsUpdateModalOpen(false);
    setSelectedTemplateId(null);
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      await axiosInstance.put(
        `/admin/updateEmailTemplateStatus/${id}?active=${newStatus}`
      );

      setTemplates((prevTemplates) =>
        prevTemplates.map((template) =>
          template.emailTemplateId === id
            ? { ...template, active: newStatus }
            : template
        )
      );

      toast.success(
        `Template ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleMakeDefault = async (id) => {
    try {
      await axiosInstance.put(`/admin/setDefaultEmailTemplate/${id}`);
      
      // Update local state
      setTemplates((prevTemplates) =>
        prevTemplates.map((template) => ({
          ...template,
          default: template.emailTemplateId === id
        }))
      );
      
      toast.success("Template set as default successfully");
    } catch (error) {
      console.error("Error setting default template:", error);
      toast.error("Failed to set default template");
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.templateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Email Templates
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage email templates for different events
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none pr-10"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Trigger Event Dropdown */}
            <div className="relative">
              <select
                value={selectedTrigger}
                onChange={(e) => setSelectedTrigger(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white appearance-none pr-10"
              >
                {triggers[selectedCategory]?.map((trigger) => (
                  <option key={trigger} value={trigger}>
                    {trigger.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
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
              Create Template
            </button>
          </div>
        </div>
      </div>

      {/* --- Table Section (Scrollable) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[60vh] overflow-y-auto CRM-scroll-width-none">
        <div className="min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
            </colgroup>

            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Template Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Preview
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider shadow-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading email templates...
                  </td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No templates found for {selectedCategory} - {selectedTrigger.replace(/_/g, ' ')}.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template, index) => (
                  <tr
                    key={template.emailTemplateId}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {template.templateName}
                      </div>
                      {template.default && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          template.category === "TASK"
                            ? "bg-blue-100 text-blue-700"
                            : template.category === "SALES"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {template.category}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {template.triggerEvent.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="font-medium">{template.subject}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {/* Variables: {{'{{taskTitle}}'}}, {{'{{dueDate}}'}}, etc. */}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {template.emailBody.substring(0, 80)}...
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                        View Full
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={template.active}
                          onChange={() =>
                            handleStatusToggle(
                              template.emailTemplateId,
                              template.active
                            )
                          }
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        {!template.default && (
                          <button
                            onClick={() => handleMakeDefault(template.emailTemplateId)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Set as Default"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleEditClick(template.emailTemplateId)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
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
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              template.emailTemplateId,
                              template.templateName
                            )
                          }
                          className="text-red-600 hover:text-red-900 transition-colors"
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
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        onSuccess={() => fetchTemplates(selectedCategory, selectedTrigger)}
        category={selectedCategory}
        trigger={selectedTrigger}
      />

      <UpdateTemplateModal
        isOpen={isUpdateModalOpen}
        templateId={selectedTemplateId}
        onClose={handleCloseUpdate}
        onSuccess={() => fetchTemplates(selectedCategory, selectedTrigger)}
      /> */}
    </>
  );
};

export default TemplateList;