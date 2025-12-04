import React, { useState, useEffect } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import toast from "react-hot-toast";
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField,
  GlobalMultiSelectField
} from '../../BaseComponet/CustomerFormInputs';

// Add this import at the top with other imports
import {
  formatInvoiceNumber,
  formatProposalNumber,
  formatDate,
  formatCurrency
} from '../../BaseComponet/UtilFunctions'; // Adjust path as needed

function CreateTaskModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [relatedData, setRelatedData] = useState([]);
  const [loadingRelatedData, setLoadingRelatedData] = useState(false);
  const [showRelatedDropdown, setShowRelatedDropdown] = useState(false);

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
    assignees: [],  // This should store array of IDs for GlobalMultiSelectField
    followers: [],  // This should store array of IDs for GlobalMultiSelectField
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
        // Format for react-select
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
  // Fetch related data
  // Fetch related data
  const fetchRelatedData = async () => {
    if (!formData.relatedTo) {
      toast.error('Please select a Related To option first');
      return;
    }

    setLoadingRelatedData(true);
    try {
      let endpoint = '';

      // Updated API endpoints as per requirements
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
        // Format data using utility functions
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
                // You can add formatted amount if available
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
        setShowRelatedDropdown(true);
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'relatedTo') {
      setFormData(prev => ({
        ...prev,
        relatedId: '',
        relatedName: ''
      }));
      setRelatedData([]);
      setShowRelatedDropdown(false);
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


  const handleSelectRelatedItem = (item) => {
    setFormData(prev => ({
      ...prev,
      relatedId: item.id,
      relatedName: item.name
    }));
    setShowRelatedDropdown(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject?.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    // Check due date only if it's provided
    if (formData.dueDate && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);

      if (dueDate < startDate) {
        newErrors.dueDate = "Due date cannot be before start date";
      }
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
        relatedTo: formData.relatedTo || null,
        relatedId: formData.relatedId || null,
        assignedEmployees: formData.assignees.map(employeeId => ({
          employeeId: employeeId
        })),

        followersEmployees: formData.followers.map(employeeId => ({
          employeeId: employeeId
        })),
        estimateHours: formData.estimateHours ? parseFloat(formData.estimateHours) : null,
        status: 'pending'
      };

      const response = await axiosInstance.post('createTask', payload);

      if (response.data) {
        toast.success('Task created successfully!');
        onSuccess();
      } else {
        throw new Error('No response data received');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.');
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

  // FIXED: Use teamMembers directly as options
  const assigneesOptions = teamMembers || [];
  const followersOptions = teamMembers || [];

  // FIXED: formData.assignees and formData.followers are already arrays of IDs
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
                closeMenuOnSelect={false} // This is optional - remove if you want menu to close after selection
              />

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
                closeMenuOnSelect={false} // This is optional - remove if you want menu to close after selection
              />
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
                step="0.5"
                className="text-sm"
              />
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
              Close
            </button>

            <button
              type="button" a
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