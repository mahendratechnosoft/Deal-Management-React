import React, { useState, useEffect } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField
} from '../../BaseComponet/CustomerFormInputs';

function EditTaskModal({ taskId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);
  const [showAssigneesDropdown, setShowAssigneesDropdown] = useState(false);
  const [showFollowersDropdown, setShowFollowersDropdown] = useState(false);
  const [searchAssignees, setSearchAssignees] = useState('');
  const [searchFollowers, setSearchFollowers] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [relatedData, setRelatedData] = useState([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    hourlyRate: '',
    startDate: '',
    dueDate: '',
    priority: 'Medium',
    repeatEvery: '',
    relatedTo: '',
    relatedId: '',
    assignees: [],
    followers: [],
    tags: [],
    estimateHours: '',
    isPublic: false,
    isBillable: false,
    attachedFiles: [],
    status: 'pending'
  });

  const [errors, setErrors] = useState({});

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' }
  ];

  const repeatOptions = [
    { value: '', label: 'Non selected' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const relatedToOptions = [
    { value: '', label: 'Non selected' },
    { value: 'lead', label: 'Lead' },
    { value: 'customer', label: 'Customer' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'proforma', label: 'Proforma' },
    { value: 'invoice', label: 'Invoice' }
  ];

  // Fetch team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Fetch task data on component mount
  useEffect(() => {
    if (taskId) {
      fetchTaskData();
    }
  }, [taskId]);

  // Fetch related data when relatedTo changes
  useEffect(() => {
    if (formData.relatedTo) {
      fetchRelatedData();
    } else {
      setRelatedData([]);
      setFormData(prev => ({ ...prev, relatedId: '' }));
    }
  }, [formData.relatedTo]);

  const fetchTeamMembers = async () => {
    setLoadingTeam(true);
    try {
      const response = await axiosInstance.get('getEmployeeNameAndId');
      if (response.data && Array.isArray(response.data)) {
        setTeamMembers(response.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoadingTeam(false);
    }
  };

  const fetchRelatedData = async () => {
    if (!formData.relatedTo) return;

    setLoadingRelatedData(true);
    try {
      let endpoint = '';
      let responseData = null;

      switch (formData.relatedTo) {
        case 'lead':
          endpoint = 'getLeadNameAndId';
          break;
        case 'customer':
          endpoint = 'getCustomerListWithNameAndId';
          break;
        case 'proforma':
          endpoint = 'getAllPerforma';
          break;
        case 'proposal':
          endpoint = '/proposals'; // You need to confirm this endpoint
          break;
        case 'invoice':
          endpoint = '/invoices'; // You need to confirm this endpoint
          break;
        default:
          return;
      }

      const response = await axiosInstance.get(endpoint);

      // Handle different response structures
      if (formData.relatedTo === 'proforma') {
        responseData = response.data?.body || [];
      } else {
        responseData = response.data || [];
      }

      if (Array.isArray(responseData)) {
        const formattedData = responseData.map(item => {
          switch (formData.relatedTo) {
            case 'lead':
              return {
                id: item.leadId,
                name: item.clientName,
                ...item
              };
            case 'customer':
              return {
                id: item.id,
                name: item.companyName,
                ...item
              };
            case 'proforma':
              return {
                id: item.proformaInvoiceId,
                name: `Proforma #${item.proformaInvoiceNumber} - ${item.companyName}`,
                ...item
              };
            case 'proposal':
              return {
                id: item.id || item.proposalId,
                name: item.name || item.proposalNumber || `Proposal ${item.id}`,
                ...item
              };
            case 'invoice':
              return {
                id: item.id || item.invoiceId,
                name: item.name || item.invoiceNumber || `Invoice ${item.id}`,
                ...item
              };
            default:
              return item;
          }
        });

        setRelatedData(formattedData);
      }
    } catch (error) {
      console.error(`Error fetching ${formData.relatedTo} data:`, error);
      toast.error(`Failed to load ${formData.relatedTo} data`);
      setRelatedData([]);
    } finally {
      setLoadingRelatedData(false);
    }
  };

  const fetchTaskData = async () => {
    try {
      setLoadingTask(true);
      const response = await axiosInstance.get(`/tasks/${taskId}`);
      
      if (response.data) {
        const taskData = response.data;
        
        // Format the assignees and followers to match the team members structure
        const formatAssignees = async (assigneeIds) => {
          try {
            const employeeResponse = await axiosInstance.get('getEmployeeNameAndId');
            const allEmployees = employeeResponse.data || [];
            return allEmployees.filter(emp => 
              assigneeIds.includes(emp.employeeId)
            );
          } catch (error) {
            console.error('Error fetching assignee details:', error);
            return [];
          }
        };

        const assignees = taskData.assignees ? await formatAssignees(taskData.assignees) : [];
        const followers = taskData.followers ? await formatAssignees(taskData.followers) : [];

        // Parse dates to YYYY-MM-DD format
        const formatDate = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        setFormData({
          subject: taskData.subject || '',
          description: taskData.description || '',
          hourlyRate: taskData.hourlyRate?.toString() || '',
          startDate: formatDate(taskData.startDate),
          dueDate: formatDate(taskData.dueDate),
          priority: taskData.priority || 'Medium',
          repeatEvery: taskData.repeatEvery || '',
          relatedTo: taskData.relatedTo || '',
          relatedId: taskData.relatedId || '',
          assignees: assignees,
          followers: followers,
          tags: taskData.tags || [],
          estimateHours: taskData.estimateHours?.toString() || '',
          isPublic: taskData.isPublic || false,
          isBillable: taskData.isBillable || false,
          status: taskData.status || 'pending',
          attachedFiles: taskData.attachedFiles || []
        });

        // If task has relatedTo, fetch the related data
        if (taskData.relatedTo) {
          setTimeout(() => {
            fetchRelatedData();
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error fetching task data:", error);
      toast.error("Failed to load task data");
    } finally {
      setLoadingTask(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // Reset relatedId when relatedTo changes
    if (name === 'relatedTo') {
      updatedFormData.relatedId = '';
    }

    setFormData(updatedFormData);

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleToggleAssignee = (employee) => {
    if (formData.assignees.some(a => a.employeeId === employee.employeeId)) {
      setFormData(prev => ({
        ...prev,
        assignees: prev.assignees.filter(a => a.employeeId !== employee.employeeId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignees: [...prev.assignees, employee]
      }));
    }
  };

  const handleToggleFollower = (employee) => {
    if (formData.followers.some(f => f.employeeId === employee.employeeId)) {
      setFormData(prev => ({
        ...prev,
        followers: prev.followers.filter(f => f.employeeId !== employee.employeeId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        followers: [...prev.followers, employee]
      }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      setLoading(true);
      const response = await axiosInstance.post('/tasks/upload-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && Array.isArray(response.data)) {
        const uploadedFiles = response.data.map(file => ({
          id: file.fileId || Date.now(),
          name: file.fileName,
          size: file.fileSize,
          url: file.fileUrl
        }));

        setFormData(prev => ({
          ...prev,
          attachedFiles: [...prev.attachedFiles, ...uploadedFiles]
        }));
        toast.success(`${files.length} file(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = async (fileId) => {
    try {
      await axiosInstance.delete(`/tasks/files/${fileId}`);
      setFormData(prev => ({
        ...prev,
        attachedFiles: prev.attachedFiles.filter(file => file.id !== fileId)
      }));
      toast.success("File removed successfully");
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Failed to remove file');
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const filteredAssignees = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchAssignees.toLowerCase()) &&
    !formData.assignees.some(a => a.employeeId === member.employeeId)
  );

  const filteredFollowers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchFollowers.toLowerCase()) &&
    !formData.followers.some(f => f.employeeId === member.employeeId)
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject?.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date(formData.startDate)) {
      newErrors.dueDate = "Due date cannot be before start date";
    }

    if (formData.hourlyRate && parseFloat(formData.hourlyRate) < 0) {
      newErrors.hourlyRate = "Hourly rate cannot be negative";
    }

    if (formData.estimateHours && parseFloat(formData.estimateHours) < 0) {
      newErrors.estimateHours = "Estimate hours cannot be negative";
    }

    // Validate relatedId if relatedTo is selected
    if (formData.relatedTo && !formData.relatedId) {
      newErrors.relatedId = `Please select a ${formData.relatedTo}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0,
        startDate: new Date(formData.startDate).toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        priority: formData.priority,
        repeatEvery: formData.repeatEvery || null,
        relatedTo: formData.relatedTo || null,
        relatedId: formData.relatedId || null,
        assignees: formData.assignees.map(a => a.employeeId),
        followers: formData.followers.map(f => f.employeeId),
        tags: formData.tags,
        estimateHours: formData.estimateHours ? parseFloat(formData.estimateHours) : null,
        isPublic: formData.isPublic,
        isBillable: formData.isBillable,
        status: formData.status
      };

      await axiosInstance.put(`/tasks/${taskId}`, payload);
      
      toast.success('Task updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinDueDate = () => {
    return formData.startDate || getTodayDate();
  };

  if (loadingTask) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Edit Task</h2>
                <p className="text-blue-100 text-xs">Update task information</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <form onSubmit={handleSubmit}>
            {/* Visibility & File Attachment Toggles */}
            <div className="flex flex-wrap gap-3 mb-3 pb-3 border-b">
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="text-xs font-medium text-gray-700">
                  Public
                </label>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="isBillable"
                  name="isBillable"
                  checked={formData.isBillable}
                  onChange={handleChange}
                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isBillable" className="text-xs font-medium text-gray-700">
                  Billable
                </label>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Attach Files
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('fileUpload').click()}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : '+ Add Files'}
                </button>
              </div>
            </div>

            {/* Attached Files Preview */}
            {formData.attachedFiles.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 mb-1">Attached Files:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {formData.attachedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded text-xs">
                      <span className="text-gray-600 truncate max-w-xs">{file.name}</span>
                      <span className="text-gray-400 text-xs">({file.size})</span>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700 ml-1"
                        disabled={loading}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Grid - Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Subject - Full width */}
              <div className="md:col-span-2">
                <GlobalInputField
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required={true}
                  error={errors.subject}
                  placeholder="Enter task subject"
                  className="text-sm"
                />
              </div>

              {/* Status & Priority */}
              <GlobalSelectField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                className="text-sm"
              />

              <GlobalSelectField
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
                className="text-sm"
              />

              {/* Hourly Rate */}
              <GlobalInputField
                label="Hourly Rate"
                name="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={handleChange}
                error={errors.hourlyRate}
                placeholder="0"
                min="0"
                step="0.01"
                className="text-sm"
              />

              {/* Estimate Hours */}
              <GlobalInputField
                label="Estimate hours"
                name="estimateHours"
                type="number"
                value={formData.estimateHours}
                onChange={handleChange}
                error={errors.estimateHours}
                placeholder="0"
                min="0"
                step="0.5"
                className="text-sm"
              />

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-2">
                <GlobalInputField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required={true}
                  error={errors.startDate}
                  min={getTodayDate()}
                  className="text-sm"
                />

                <GlobalInputField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  error={errors.dueDate}
                  min={getMinDueDate()}
                  className="text-sm"
                />
              </div>

              {/* Repeat & Related To */}
              <GlobalSelectField
                label="Repeat every"
                name="repeatEvery"
                value={formData.repeatEvery}
                onChange={handleChange}
                options={repeatOptions}
                className="text-sm"
              />

              <GlobalSelectField
                label="Related To"
                name="relatedTo"
                value={formData.relatedTo}
                onChange={handleChange}
                options={relatedToOptions}
                className="text-sm"
              />

              {/* Related Data Selection (Conditional) */}
              {formData.relatedTo && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Select {formData.relatedTo.charAt(0).toUpperCase() + formData.relatedTo.slice(1)}</span>
                    {formData.relatedTo && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    name="relatedId"
                    value={formData.relatedId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.relatedId ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors`}
                    disabled={loadingRelatedData}
                  >
                    <option value="">Select {formData.relatedTo}...</option>
                    {loadingRelatedData ? (
                      <option value="" disabled>Loading...</option>
                    ) : relatedData.length > 0 ? (
                      relatedData.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No {formData.relatedTo} data available</option>
                    )}
                  </select>
                  {errors.relatedId && (
                    <p className="mt-1 text-xs text-red-600">{errors.relatedId}</p>
                  )}
                </div>
              )}
            </div>

            {/* Assignees and Followers - Side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {/* Assignees */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">Assignees</label>
                  <button
                    type="button"
                    onClick={() => setShowAssigneesDropdown(!showAssigneesDropdown)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showAssigneesDropdown ? 'Close' : 'Select assignees'}
                  </button>
                </div>

                {/* Selected Assignees */}
                <div className="space-y-1">
                  {formData.assignees.map((assignee) => (
                    <div key={assignee.employeeId} className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded border border-gray-200">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(assignee.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 text-xs block truncate">{assignee.name}</span>
                        <span className="text-gray-500 text-xs block truncate">{assignee.employeeId?.substring(0, 8)}...</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAssignee(assignee)}
                        className="ml-auto text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Assignees Dropdown */}
                {showAssigneesDropdown && (
                  <div className="mb-1 p-2 bg-white rounded border border-gray-200 shadow">
                    <input
                      type="text"
                      value={searchAssignees}
                      onChange={(e) => setSearchAssignees(e.target.value)}
                      placeholder="Search team members..."
                      className="w-full px-2 py-1.5 mb-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="max-h-32 overflow-y-auto">
                      {loadingTeam ? (
                        <div className="text-center text-gray-500 italic p-2 text-xs">Loading team members...</div>
                      ) : filteredAssignees.length > 0 ? (
                        filteredAssignees.map((member) => (
                          <div
                            key={member.employeeId}
                            onClick={() => handleToggleAssignee(member)}
                            className="flex items-center gap-1.5 p-1.5 rounded cursor-pointer hover:bg-gray-50 text-xs"
                          >
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(member.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-900 block">{member.name}</span>
                              <span className="text-gray-500 text-xs block truncate">{member.employeeId?.substring(0, 8)}...</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 italic p-2 text-xs">No members found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Followers */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">Followers</label>
                  <button
                    type="button"
                    onClick={() => setShowFollowersDropdown(!showFollowersDropdown)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showFollowersDropdown ? 'Close' : 'Add followers'}
                  </button>
                </div>

                {/* Selected Followers */}
                <div className="space-y-1">
                  {formData.followers.map((follower) => (
                    <div key={follower.employeeId} className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded border border-gray-200">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(follower.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 text-xs block truncate">{follower.name}</span>
                        <span className="text-gray-500 text-xs block truncate">{follower.employeeId?.substring(0, 8)}...</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFollower(follower)}
                        className="ml-auto text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Followers Dropdown */}
                {showFollowersDropdown && (
                  <div className="mb-1 p-2 bg-white rounded border border-gray-200 shadow">
                    <input
                      type="text"
                      value={searchFollowers}
                      onChange={(e) => setSearchFollowers(e.target.value)}
                      placeholder="Search team members..."
                      className="w-full px-2 py-1.5 mb-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="max-h-32 overflow-y-auto">
                      {loadingTeam ? (
                        <div className="text-center text-gray-500 italic p-2 text-xs">Loading team members...</div>
                      ) : filteredFollowers.length > 0 ? (
                        filteredFollowers.map((member) => (
                          <div
                            key={member.employeeId}
                            onClick={() => handleToggleFollower(member)}
                            className="flex items-center gap-1.5 p-1.5 rounded cursor-pointer hover:bg-gray-50 text-xs"
                          >
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(member.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-900 block">{member.name}</span>
                              <span className="text-gray-500 text-xs block truncate">{member.employeeId?.substring(0, 8)}...</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 italic p-2 text-xs">No members found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags - Full width below Assignees & Followers */}
            <div className="mt-3 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Tags</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-current opacity-70 hover:opacity-100"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Description - Full width */}
            <div className="mt-3">
              <GlobalTextAreaField
                label="Task Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add Description"
                rows={3}
                className="text-sm"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-xs font-medium"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-green-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1.5"></div>
                  Updating...
                </>
              ) : (
                'Update Task'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditTaskModal;