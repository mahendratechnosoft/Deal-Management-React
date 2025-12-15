// AmcHistoryModal.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  GlobalInputField,
  GlobalTextAreaField,
  GlobalSelectField
} from '../../BaseComponet/CustomerFormInputs';
import axiosInstance from '../../BaseComponet/axiosInstance';

const AmcHistoryModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  amcId,
  isEditMode = false,
  initialData = null 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amcStartDate: '',
    amcEndDate: '',
    amcAmount: '',
    amcScope: '',
    amcRecycleType: 'Yearly',
    sequence: 1
  });

  const [errors, setErrors] = useState({});

  const recycleTypeOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Half-Yearly", label: "Half-Yearly" },
    { value: "Yearly", label: "Yearly" },
    { value: "2 Years", label: "2 Years" }
  ];

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        amcStartDate: initialData.amcStartDate || '',
        amcEndDate: initialData.amcEndDate || '',
        amcAmount: initialData.amcAmount || '',
        amcScope: initialData.amcScope || '',
        amcRecycleType: initialData.amcRecycleType || 'Yearly',
        sequence: initialData.sequence || 1
      });
    } else {
      setFormData({
        amcStartDate: '',
        amcEndDate: '',
        amcAmount: '',
        amcScope: '',
        amcRecycleType: 'Yearly',
        sequence: 1
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Function to calculate end date based on start date and recycle type
  const calculateAmcEndDate = (startDate, recycleType) => {
    if (!startDate) return "";

    const date = new Date(startDate);
    
    switch (recycleType) {
      case "Monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "Quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "Half-Yearly":
        date.setMonth(date.getMonth() + 6);
        break;
      case "Yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
      case "2 Years":
        date.setFullYear(date.getFullYear() + 2);
        break;
      default:
        date.setFullYear(date.getFullYear() + 1);
    }
    
    return date.toISOString().split('T')[0];
  };

  // Auto-calculate end date when start date or recycle type changes
  const calculateAndUpdateEndDate = (startDate, recycleType) => {
    if (!startDate) {
      setFormData(prev => ({ ...prev, amcEndDate: '' }));
      return;
    }

    const endDate = calculateAmcEndDate(startDate, recycleType);
    setFormData(prev => ({ ...prev, amcEndDate: endDate }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-calculate end date when start date changes
    if (field === 'amcStartDate') {
      calculateAndUpdateEndDate(value, formData.amcRecycleType);
    }
    
    // Auto-calculate end date when recycle type changes (if start date exists)
    if (field === 'amcRecycleType') {
      if (formData.amcStartDate) {
        calculateAndUpdateEndDate(formData.amcStartDate, value);
      }
    }
  };

  // Handle start date change specifically
  const handleStartDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      amcStartDate: date
    }));
    
    if (errors.amcStartDate) {
      setErrors(prev => ({ ...prev, amcStartDate: '' }));
    }

    calculateAndUpdateEndDate(date, formData.amcRecycleType);
  };

  // Handle recycle type change specifically
  const handleRecycleTypeChange = (recycleType) => {
    setFormData(prev => ({
      ...prev,
      amcRecycleType: recycleType
    }));

    if (errors.amcRecycleType) {
      setErrors(prev => ({ ...prev, amcRecycleType: '' }));
    }

    if (formData.amcStartDate) {
      calculateAndUpdateEndDate(formData.amcStartDate, recycleType);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amcStartDate) {
      newErrors.amcStartDate = "AMC start date is required";
    }

    if (!formData.amcEndDate) {
      newErrors.amcEndDate = "AMC end date is required";
    }

    if (!formData.amcAmount) {
      newErrors.amcAmount = "AMC amount is required";
    } else if (isNaN(formData.amcAmount) || parseFloat(formData.amcAmount) <= 0) {
      newErrors.amcAmount = "AMC amount must be a positive number";
    }

    if (!formData.amcScope?.trim()) {
      newErrors.amcScope = "AMC scope is required";
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
        amcAmount: parseFloat(formData.amcAmount)
      };

      // Add acmHistoryId for update
      if (isEditMode && initialData?.acmHistoryId) {
        payload.acmHistoryId = initialData.acmHistoryId;
      }

      // Correct API endpoint names
      const response = isEditMode 
        ? await axiosInstance.put('updateAMCHistory', payload)
        : await axiosInstance.post('addAMCHistory', payload); // Changed from put to post for create

      toast.success(isEditMode ? 'AMC History updated successfully' : 'AMC History created successfully');
      
      if (onSuccess) {
        onSuccess(response.data || payload);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving AMC history:', error);
      toast.error(error.response?.data?.message || 'Failed to save AMC history');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-3">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isEditMode ? 'Edit AMC History' : 'Add New AMC History'}
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
                    Start Date
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                name="amcStartDate"
                type="date"
                value={formData.amcStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                error={errors.amcStartDate}
                className="text-sm"
              />

              <GlobalInputField
                label={
                  <>
                    End Date
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                name="amcEndDate"
                type="date"
                value={formData.amcEndDate}
                onChange={(e) => handleChange('amcEndDate', e.target.value)}
                error={errors.amcEndDate}
                className="text-sm"
                readOnly
                style={{ backgroundColor: '#f9f9f9' }}
              />

              <GlobalInputField
                label={
                  <>
                    Amount (₹)
                    <span className="text-red-500 ml-1">*</span>
                  </>
                }
                name="amcAmount"
                type="number"
                value={formData.amcAmount}
                onChange={(e) => handleChange('amcAmount', e.target.value)}
                error={errors.amcAmount}
                placeholder="25000"
                min="0"
                step="0.01"
                className="text-sm"
              />

              <GlobalSelectField
                label="Recycle Type"
                name="amcRecycleType"
                value={formData.amcRecycleType}
                onChange={(e) => handleRecycleTypeChange(e.target.value)}
                options={recycleTypeOptions}
                className="text-sm"
              />

              <div className="md:col-span-2">
                <GlobalTextAreaField
                  label={
                    <>
                      Scope
                      <span className="text-red-500 ml-1">*</span>
                    </>
                  }
                  name="amcScope"
                  value={formData.amcScope}
                  onChange={(e) => handleChange('amcScope', e.target.value)}
                  error={errors.amcScope}
                  placeholder="Describe the AMC scope..."
                  rows={4}
                  className="text-sm"
                />
              </div>
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
                isEditMode ? 'Update History' : 'Create History'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmcHistoryModal;