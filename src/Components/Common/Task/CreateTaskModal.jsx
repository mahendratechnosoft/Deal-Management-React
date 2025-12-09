import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
  GlobalMultiSelectField
} from '../../BaseComponet/CustomerFormInputs';
import {
  formatInvoiceNumber,
  formatProposalNumber,
  formatDate,
  formatCurrency
} from '../../BaseComponet/UtilFunctions';

function CreateTaskModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [relatedData, setRelatedData] = useState([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(false);
  
  // Attachment state
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef(null);

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
    relatedName: '',
    assignees: [],
    followers: [],
    tags: [],
    estimateHours: '',
  });

  const [errors, setErrors] = useState({});

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
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

  const fetchTeamMembers = async () => {
    setLoadingTeam(true);
    try {
      const response = await axiosInstance.get('getEmployeeNameAndId');
      if (response.data && Array.isArray(response.data)) {
        const formattedTeamMembers = response.data.map(member => ({
          value: member.employeeId,
          label: member.name
        }));
        setTeamMembers(formattedTeamMembers);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    if (formData.relatedTo) {
      fetchRelatedData();
    }
  }, [formData.relatedTo]);

  const fetchRelatedData = async () => {
    if (!formData.relatedTo) {
      toast.error('Please select a Related To option first');
      return;
    }

    setLoadingRelatedData(true);
    try {
      let endpoint = '';

      switch (formData.relatedTo) {
        case 'lead':
          endpoint = 'getLeadNameAndIdWithConverted';
          break;
        case 'customer':
          endpoint = 'getCustomerListWithNameAndId';
          break;
        case 'proforma':
          endpoint = 'getProformaNumberAndId';
          break;
        case 'proposal':
          endpoint = 'getProposalNumberAndId';
          break;
        case 'invoice':
          endpoint = 'getInvoiceNumberAndId';
          break;
        default:
          return;
      }

      const response = await axiosInstance.get(endpoint);
      const responseData = response.data || [];

      if (Array.isArray(responseData)) {
        const formattedData = responseData.map(item => {
          switch (formData.relatedTo) {
            case 'lead':
              return {
                id: item.leadId || item.id,
                name: item.clientName || `Lead #${item.leadId || item.id}`,
                originalData: item
              };

            case 'customer':
              return {
                id: item.id,
                name: `${item.companyName || 'Customer'} (${item.email || 'No email'})`,
                originalData: item
              };

            case 'proforma':
              return {
                id: item.proformaInvoiceId || item.id,
                name: formatInvoiceNumber(item.proformaInvoiceNumber) ||
                  `Proforma #${item.proformaInvoiceId || item.id}`,
                originalData: item
              };

            case 'proposal':
              return {
                id: item.proposalId || item.id,
                name: formatProposalNumber(item.proposalNumber) ||
                  `Proposal #${item.proposalId || item.id}`,
                originalData: item
              };

            case 'invoice':
              return {
                id: item.invoiceId || item.id,
                name: formatInvoiceNumber(item.invoiceNumber) ||
                  `Invoice #${item.invoiceId || item.id}`,
                amount: item.totalAmount ? formatCurrency(item.totalAmount, item.currency) : '',
                originalData: item
              };

            default:
              return {
                id: item.id,
                name: String(item.name || item.title || `Item #${item.id}`),
                originalData: item
              };
          }
        });

        setRelatedData(formattedData);
      } else {
        toast.error(`No ${formData.relatedTo} data found`);
      }
    } catch (error) {
      console.error(`Error fetching ${formData.relatedTo} data:`, error);
      toast.error(`Failed to load ${formData.relatedTo} data`);
      setRelatedData([]);
    } finally {
      setLoadingRelatedData(false);
    }
  };

  // Handle file attachment selection
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check total number of files (max 4)
    const totalFiles = attachments.length + files.length;
    if (totalFiles > 4) {
      setAttachmentError('Maximum 4 files allowed');
      toast.error('You can only upload up to 4 files');
      return;
    }

    // Validate each file
    const validFiles = [];
    const errors = [];

    files.forEach((file, index) => {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        errors.push(`"${file.name}" exceeds 5MB limit`);
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed'
      ];

      if (!allowedTypes.includes(file.type)) {
        errors.push(`"${file.name}" has invalid file type`);
        return;
      }

      validFiles.push(file);
    });

    // Show errors if any
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    // Add valid files to attachments
    if (validFiles.length > 0) {
      const newAttachments = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        fileName: file.name,
        size: file.size,
        type: file.type
      }));

      setAttachments(prev => [...prev, ...newAttachments]);
      setAttachmentError('');
      
      if (validFiles.length > 0) {
        toast.success(`Added ${validFiles.length} file(s)`);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove single attachment
  const handleRemoveAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
    setAttachmentError('');
  };

  // Remove all attachments
  const handleRemoveAllAttachments = () => {
    setAttachments([]);
    setAttachmentError('');
    toast.info('All attachments removed');
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    if (fileType.includes('text')) return '📃';
    return '📎';
  };

  // Convert file to base64
// Convert file to base64 (returns just the base64 string)
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    switch (name) {
      case 'subject':
        if (value.length <= 150) {
          processedValue = value;
        } else {
          return;
        }
        break;

      case 'description':
        if (value.length <= 500) {
          processedValue = value;
        } else {
          return;
        }
        break;

      case 'hourlyRate':
      case 'estimateHours':
        if (value === '') {
          processedValue = value;
        } else {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            processedValue = value;
          } else {
            const intPart = Math.floor(numValue).toString();
            if (intPart.length > 4) {
              return;
            }
            processedValue = value;
          }
        }
        break;

      default:
        processedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    if (name === 'relatedTo') {
      setFormData(prev => ({
        ...prev,
        relatedId: '',
        relatedName: ''
      }));
      setRelatedData([]);
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleAssigneesChange = (selectedIds) => {
    setFormData(prev => ({
      ...prev,
      assignees: selectedIds
    }));
  };

  const handleFollowersChange = (selectedIds) => {
    setFormData(prev => ({
      ...prev,
      followers: selectedIds
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Subject validation
    if (!formData.subject?.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length > 150) {
      newErrors.subject = "Subject cannot exceed 150 characters";
    }

    // Start date validation
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    // Due date validation
    if (formData.dueDate && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);

      if (dueDate < startDate) {
        newErrors.dueDate = "Due date cannot be before start date";
      }
    }

    // Hourly rate validation
    if (formData.hourlyRate) {
      const hourlyRateNum = parseFloat(formData.hourlyRate);
      if (hourlyRateNum < 0) {
        newErrors.hourlyRate = "Hourly rate cannot be negative";
      } else if (hourlyRateNum.toString().split('.')[0].length > 4) {
        newErrors.hourlyRate = "Hourly rate cannot exceed 4 digits";
      }
    }

    // Estimate hours validation
    if (formData.estimateHours) {
      const estimateHoursNum = parseFloat(formData.estimateHours);
      if (estimateHoursNum < 0) {
        newErrors.estimateHours = "Estimate hours cannot be negative";
      } else if (estimateHoursNum.toString().split('.')[0].length > 4) {
        newErrors.estimateHours = "Estimate hours cannot exceed 4 digits";
      }
    }

    // Description validation
    if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    // Related ID validation
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
    // Convert attachments to base64
    const taskAttachments = [];
    
    for (const attachment of attachments) {
      try {
        // Read file as data URL
        const base64Data = await convertFileToBase64(attachment.file);
        
        // Push the attachment object with fileName, contentType, and data
        taskAttachments.push({
          fileName: attachment.fileName,
          contentType: attachment.type, // This should be the actual MIME type
          data: base64Data // The base64 string without data URL prefix
        });
      } catch (error) {
        console.error('Error converting file to base64:', error);
        toast.error(`Failed to process file: ${attachment.fileName}`);
      }
    }

    // Create the nested payload structure as per API requirement
    const payload = {
      task: {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0,
        startDate: formData.startDate,
        endDate: formData.dueDate || null,
        priority: formData.priority,
        relatedTo: formData.relatedTo || null,
        relatedToId: formData.relatedId || null,
        relatedToName: formData.relatedName || '',
        assignedEmployees: formData.assignees.map(employeeId => {
          // Find the employee object to get name
          const employee = teamMembers.find(member => member.value === employeeId);
          return {
            employeeId: employeeId,
            name: employee ? employee.label : `Employee ${employeeId}`
          };
        }),
        followersEmployees: formData.followers.map(employeeId => {
          // Find the employee object to get name
          const employee = teamMembers.find(member => member.value === employeeId);
          return {
            employeeId: employeeId,
            name: employee ? employee.label : `Employee ${employeeId}`
          };
        }),
        estimatedHours: formData.estimateHours ? parseFloat(formData.estimateHours) : 0,
        status: 'pending'
      }
    };

    // Add taskAttachments array only if there are attachments
    if (taskAttachments.length > 0) {
      payload.taskAttachments = taskAttachments;
    }

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    const response = await axiosInstance.post('createTask', payload);

    if (response.data) {
      console.log('Response:', response.data);
      toast.success('Task created successfully!');
      onSuccess();
    } else {
      throw new Error('No response data received');
    }
  } catch (error) {
    console.error('Error creating task:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      if (error.response.status === 500) {
        toast.error('Server error: ' + (error.response.data?.message || 'Check console for details'));
      } else {
        toast.error('Failed to create task: ' + (error.response.data?.message || 'Unknown error'));
      }
    } else if (error.request) {
      console.error('Request error:', error.request);
      toast.error('Network error. Please check your connection.');
    } else {
      console.error('Error:', error.message);
      toast.error('Failed to create task. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinDueDate = () => {
    return formData.startDate;
  };

  const assigneesOptions = teamMembers || [];
  const followersOptions = teamMembers || [];
  const selectedAssignees = formData.assignees || [];
  const selectedFollowers = formData.followers || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Create New Task</h2>
                <p className="text-blue-100 text-xs">Fill in the task information below</p>
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
            {/* Form Grid - Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Subject - Full width */}
              <div className="md:col-span-2">
                <div className="relative">
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
                  <div className="absolute right-2 top-0 text-xs text-gray-500">
                    {formData.subject.length}/150
                  </div>
                </div>
              </div>

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
                max="9999"
                step="0.01"
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

              {/* Priority */}
              <GlobalSelectField
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
                className="text-sm"
              />

              {/* Related To */}
              <GlobalSelectField
                label="Related To"
                name="relatedTo"
                value={formData.relatedTo}
                onChange={handleChange}
                options={relatedToOptions}
                className="text-sm"
              />

              {/* Assignees */}
              <GlobalMultiSelectField
                label="Assignees"
                name="assignees"
                value={formData.assignees}
                onChange={handleAssigneesChange}
                options={teamMembers}
                placeholder="Select assignees..."
                loading={loadingTeam}
                className="text-sm"
                isSearchable={true}
                closeMenuOnSelect={false}
              />

              {/* Followers */}
              <GlobalMultiSelectField
                label="Followers"
                name="followers"
                value={formData.followers}
                onChange={handleFollowersChange}
                options={teamMembers}
                placeholder="Select followers..."
                loading={loadingTeam}
                className="text-sm"
                isSearchable={true}
                closeMenuOnSelect={false}
              />
              
              {/* Related Item Selection */}
              {formData.relatedTo && (
                <GlobalSelectField
                  label={`Select ${formData.relatedTo.charAt(0).toUpperCase() + formData.relatedTo.slice(1)}`}
                  name="relatedId"
                  value={formData.relatedId}
                  onChange={(e) => {
                    const selected = relatedData.find(item => item.id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      relatedId: e.target.value,
                      relatedName: selected?.name || ''
                    }));
                  }}
                  options={relatedData.map(item => ({
                    value: item.id,
                    label: item.name
                  }))}
                  loading={loadingRelatedData}
                  error={errors.relatedId}
                  className="text-sm"
                />
              )}

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
                max="9999"
                step="0.5"
                className="text-sm"
              />
            </div>

            {/* Task Description */}
            <div className="mt-3">
              <div className="relative">
                <GlobalTextAreaField
                  label="Task Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add Description"
                  rows={3}
                  error={errors.description}
                  className="text-sm"
                />
                <div className="absolute right-2 bottom-2 text-xs text-gray-500">
                  {formData.description.length}/500
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Attachments (Max 4 files, 5MB each)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {attachments.length}/4 files
                  </span>
                  {attachments.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRemoveAllAttachments}
                      className="text-xs text-red-600 hover:text-red-800 hover:underline"
                    >
                      Remove All
                    </button>
                  )}
                </div>
              </div>
              
              {/* Single File Input */}
              <div className="mb-3">
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    onChange={handleAttachmentChange}
                    className="hidden"
                    id="file-upload"
                    disabled={attachments.length >= 4}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${attachments.length >= 4 ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'}`}
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        {attachments.length >= 4 
                          ? 'Maximum 4 files reached'
                          : 'Click to select files or drag and drop'
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Images, Documents, Text files (Max 5MB each)
                      </p>
                    </div>
                  </label>
                </div>
                
                {attachmentError && (
                  <p className="mt-2 text-xs text-red-600">{attachmentError}</p>
                )}
              </div>

              {/* Selected Files Row */}
              {attachments.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="group relative flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors"
                      >
                        <span className="text-lg">{getFileIcon(attachment.type)}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                            {attachment.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove file"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* File Summary */}
                  <div className="mt-2 text-xs text-gray-500">
                    <p>
                      Total: {attachments.length} file(s) • 
                      Total size: {(attachments.reduce((sum, att) => sum + att.size, 0) / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
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
              Close
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1.5"></div>
                  Saving...
                </>
              ) : (
                'Save Task'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTaskModal;