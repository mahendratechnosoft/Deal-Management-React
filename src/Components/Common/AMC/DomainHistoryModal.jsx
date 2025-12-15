// DomainHistoryModal.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  GlobalInputField,
  GlobalSelectField
} from '../../BaseComponet/CustomerFormInputs';
import axiosInstance from '../../BaseComponet/axiosInstance';

const DomainHistoryModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  amcId,
  isEditMode = false,
  initialData = null 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    domainStartDate: '',
    domainRenewalDate: '',
    domainAmount: '',
    domainRenewalCycle: '1 Year',
    sequence: 1
  });

  const [errors, setErrors] = useState({});

  const domainRenewalOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Half-Yearly", label: "Half-Yearly" },
    { value: "1 Year", label: "1 Year" },
    { value: "2 Years", label: "2 Years" },
    { value: "3 Years", label: "3 Years" }
  ];

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        domainStartDate: initialData.domainStartDate || '',
        domainRenewalDate: initialData.domainRenewalDate || '',
        domainAmount: initialData.domainAmount || '',
        domainRenewalCycle: initialData.domainRenewalCycle || '1 Year',
        sequence: initialData.sequence || 1
      });
    } else {
      setFormData({
        domainStartDate: '',
        domainRenewalDate: '',
        domainAmount: '',
        domainRenewalCycle: '1 Year',
        sequence: 1
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Function to calculate renewal date based on start date and renewal cycle
  const calculateDomainRenewalDate = (startDate, renewalCycle) => {
    if (!startDate) return "";

    const date = new Date(startDate);
    
    switch (renewalCycle) {
      case "Monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "Quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "Half-Yearly":
        date.setMonth(date.getMonth() + 6);
        break;
      case "1 Year":
        date.setFullYear(date.getFullYear() + 1);
        break;
      case "2 Years":
        date.setFullYear(date.getFullYear() + 2);
        break;
      case "3 Years":
        date.setFullYear(date.getFullYear() + 3);
        break;
      default:
        date.setFullYear(date.getFullYear() + 1);
    }
    
    return date.toISOString().split('T')[0];
  };

  // Auto-calculate renewal date when start date or renewal cycle changes
  const calculateAndUpdateRenewalDate = (startDate, renewalCycle) => {
    if (!startDate) {
      setFormData(prev => ({ ...prev, domainRenewalDate: '' }));
      return;
    }

    const renewalDate = calculateDomainRenewalDate(startDate, renewalCycle);
    setFormData(prev => ({ ...prev, domainRenewalDate: renewalDate }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-calculate renewal date when start date changes
    if (field === 'domainStartDate') {
      calculateAndUpdateRenewalDate(value, formData.domainRenewalCycle);
    }
    
    // Auto-calculate renewal date when renewal cycle changes (if start date exists)
    if (field === 'domainRenewalCycle') {
      if (formData.domainStartDate) {
        calculateAndUpdateRenewalDate(formData.domainStartDate, value);
      }
    }
  };

  // Handle start date change specifically
  const handleStartDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      domainStartDate: date
    }));
    
    if (errors.domainStartDate) {
      setErrors(prev => ({ ...prev, domainStartDate: '' }));
    }

    calculateAndUpdateRenewalDate(date, formData.domainRenewalCycle);
  };

  // Handle renewal cycle change specifically
  const handleRenewalCycleChange = (renewalCycle) => {
    setFormData(prev => ({
      ...prev,
      domainRenewalCycle: renewalCycle
    }));

    if (errors.domainRenewalCycle) {
      setErrors(prev => ({ ...prev, domainRenewalCycle: '' }));
    }

    if (formData.domainStartDate) {
      calculateAndUpdateRenewalDate(formData.domainStartDate, renewalCycle);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.domainStartDate) {
      newErrors.domainStartDate = "Domain start date is required";
    }

    if (!formData.domainRenewalDate) {
      newErrors.domainRenewalDate = "Domain renewal date is required";
    }

    if (!formData.domainAmount) {
      newErrors.domainAmount = "Domain amount is required";
    } else if (isNaN(formData.domainAmount) || parseFloat(formData.domainAmount) <= 0) {
      newErrors.domainAmount = "Domain amount must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amcId,
        ...formData,
        domainAmount: parseFloat(formData.domainAmount)
      };

      // Add acmDomainHistoryId for update
      if (isEditMode && initialData?.acmDomainHistoryId) {
        payload.acmDomainHistoryId = initialData.acmDomainHistoryId;
      }

      // Correct API endpoint names
      const response = isEditMode 
        ? await axiosInstance.put('updateAMCDomainHistoy', payload)
        : await axiosInstance.post('addAMCDomainHistory', payload); // Changed from put to post for create

      toast.success(isEditMode ? 'Domain History updated successfully' : 'Domain History created successfully');
      
      if (onSuccess) {
        onSuccess(response.data || payload);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving domain history:', error);
      toast.error(error.response?.data?.message || 'Failed to save domain history');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-3">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isEditMode ? 'Edit Domain History' : 'Add New Domain History'}
                </h2>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlobalInputField
                label={
                  <>
                    Domain Start Date
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                name="domainStartDate"
                type="date"
                value={formData.domainStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                error={errors.domainStartDate}
                className="text-sm"
              />

              <GlobalInputField
                label={
                  <>
                    Domain Renewal Date
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                name="domainRenewalDate"
                type="date"
                value={formData.domainRenewalDate}
                onChange={(e) => handleChange('domainRenewalDate', e.target.value)}
                error={errors.domainRenewalDate}
                className="text-sm"
                readOnly
                style={{ backgroundColor: '#f9f9f9' }}
              />

              <GlobalInputField
                label={
                  <>
                    Domain Amount (₹)
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                name="domainAmount"
                type="number"
                value={formData.domainAmount}
                onChange={(e) => handleChange('domainAmount', e.target.value)}
                error={errors.domainAmount}
                placeholder="1200"
                min="0"
                step="0.01"
                className="text-sm"
              />

              <GlobalSelectField
                label="Renewal Cycle"
                name="domainRenewalCycle"
                value={formData.domainRenewalCycle}
                onChange={(e) => handleRenewalCycleChange(e.target.value)}
                options={domainRenewalOptions}
                className="text-sm"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Domain' : 'Create Domain'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainHistoryModal;