import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../BaseComponet/axiosInstance";
import { showDeleteConfirmation } from "../../../../BaseComponet/alertUtils";
import toast from "react-hot-toast";
import CreateTemplate from "./CreateTemplate";
import EditTemplate from "./EditTemplate";

const TaskTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTriggers, setExpandedTriggers] = useState({});

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [selectedTrigger, setSelectedTrigger] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Available triggers for TASK - Updated with all 3 triggers
  const triggers = ["NEW_TASK", "UPDATE_TASK", "TASK_STATUS_CHANGE"];

  // Fetch templates for a specific trigger
  const fetchTemplates = async (trigger) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `getEmailTemplates/TASK/${trigger}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching templates for ${trigger}:`, error);
      toast.error(`Failed to load templates for ${trigger.replace(/_/g, " ")}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Handle accordion toggle
  const handleTriggerToggle = async (trigger) => {
    const newExpandedState = { ...expandedTriggers };
    newExpandedState[trigger] = !newExpandedState[trigger];
    setExpandedTriggers(newExpandedState);

    // If opening the accordion, fetch templates
    if (newExpandedState[trigger]) {
      // Check if templates for this trigger are already loaded
      const existingTemplates = templates.filter(
        (template) => template.triggerEvent === trigger
      );

      if (existingTemplates.length === 0) {
        const newTemplates = await fetchTemplates(trigger);
        setTemplates((prev) => [...prev, ...newTemplates]);
      }
    }
  };

  // Expand/Collapse all triggers
  const toggleAllTriggers = (expand) => {
    const newState = {};
    triggers.forEach((trigger) => {
      newState[trigger] = expand;
    });
    setExpandedTriggers(newState);
  };

  const handleDelete = async (id, name) => {
    const result = await showDeleteConfirmation(name || "this template");
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`deleteEmailTemplate/${id}`);
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



  const handleCloseCreate = () => setIsCreateModalOpen(false);
  const handleCloseUpdate = () => {
    setIsUpdateModalOpen(false);
    setSelectedTemplateId(null);
  };

  // Add this function to handle edit click
  const handleEditClick = (id) => {
    setSelectedTemplateId(id);
    setIsEditModalOpen(true);
  };

  // Add this function to handle edit modal close
  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setSelectedTemplateId(null);
  };

  // Add this function to handle successful template update
  const handleTemplateUpdated = (updatedTemplate) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.emailTemplateId === updatedTemplate.emailTemplateId
          ? updatedTemplate
          : template
      )
    );
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      await axiosInstance.put(
        `updateEmailTemplateStatus/${id}?active=${newStatus}`
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
      await axiosInstance.put(`setTemplateAsDefault/${id}`);

      // Update local state
      setTemplates((prevTemplates) =>
        prevTemplates.map((template) => ({
          ...template,
          default: template.emailTemplateId === id,
        }))
      );

      toast.success("Template set as default successfully");
    } catch (error) {
      console.error("Error setting default template:", error);
      toast.error("Failed to set default template");
    }
  };

  // Filter templates for search
  const getFilteredTemplates = (trigger) => {
    return templates
      .filter((template) => template.triggerEvent === trigger)
      .filter((template) =>
        template.templateName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  // Open create modal for specific trigger
  const handleCreateForTrigger = (trigger) => {
    setSelectedTrigger(trigger);
    setIsCreateModalOpen(true);
  };

  // Get trigger display name
  const getTriggerDisplayName = (trigger) => {
    const triggerMap = {
      NEW_TASK: "New Task",
      UPDATE_TASK: "Update Task",
      TASK_STATUS_CHANGE: "Task Status Change",
    };
    return triggerMap[trigger] || trigger.replace(/_/g, " ");
  };

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
                  Task Email Templates
                </h1>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
              {/* <button
                onClick={() => toggleAllTriggers(true)}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Expand All
              </button> */}
              <button
                onClick={() => toggleAllTriggers(false)}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Collapse All
              </button>
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

            {/* Create Button - Now opens without pre-selected trigger */}
            <button
              onClick={() => {
                setSelectedTrigger("");
                setIsCreateModalOpen(true);
              }}
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

      {/* Triggers Accordion */}
      <div className="space-y-4">
        {triggers.map((trigger) => {
          const filteredTemplates = getFilteredTemplates(trigger);
          const isExpanded = expandedTriggers[trigger];

          return (
            <div
              key={trigger}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                onClick={() => handleTriggerToggle(trigger)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {getTriggerDisplayName(trigger)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateForTrigger(trigger);
                    }}
                    className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded-lg hover:bg-blue-50"
                  >
                    + Add Template
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      isExpanded ? "transform rotate-180" : ""
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

              {/* Accordion Content */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {filteredTemplates.length === 0 ? (
                    <div className="px-6 py-8 text-center">
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
                      <p className="text-gray-500 mb-2">
                        No templates found for{" "}
                        <span className="font-medium">
                          {getTriggerDisplayName(trigger)}
                        </span>
                      </p>
                      <button
                        onClick={() => handleCreateForTrigger(trigger)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Create Template
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Template Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Preview
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
                          {filteredTemplates.map((template, index) => (
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
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="font-medium">
                                  {template.subject}
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
                                      onClick={() =>
                                        handleMakeDefault(
                                          template.emailTemplateId
                                        )
                                      }
                                      className="text-green-600 hover:text-green-900 transition-colors"
                                      title="Set as Default"
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
                                          strokeWidth="2"
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleEditClick(template.emailTemplateId)
                                    }
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Template Modal */}
      <CreateTemplate
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        trigger={selectedTrigger}
        category="TASK"
        onTemplateCreated={(newTemplate) => {
          // Add the new template to the state
          setTemplates((prev) => [...prev, newTemplate]);

          // Expand the trigger if not already expanded
          if (!expandedTriggers[newTemplate.triggerEvent]) {
            setExpandedTriggers((prev) => ({
              ...prev,
              [newTemplate.triggerEvent]: true,
            }));
          }
        }}
      />

      <EditTemplate
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        templateId={selectedTemplateId}
        category="TASK" // or "SALES" depending on your context
        onTemplateUpdated={handleTemplateUpdated}
      />
      {/* <UpdateTemplateModal ... /> */}
    </div>
  );
};

export default TaskTemplateList;
