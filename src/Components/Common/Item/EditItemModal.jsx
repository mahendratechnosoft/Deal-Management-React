import React, { useState, useEffect } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import { useLayout } from '../../Layout/useLayout';
import toast from "react-hot-toast";

function EditItemModal({ onClose, onSuccess, itemId }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { role } = useLayout();

  const [originalItemData, setOriginalItemData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    quantity: '',
    rate: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch item details when modal opens
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!itemId) {
        toast.error('Item ID is required');
        onClose();
        return;
      }

      try {
        setFetching(true);
        const response = await axiosInstance.get(`getItemByItemId/${itemId}`);
        const item = response.data;
        
        // Store original data including adminId and employeeId
        setOriginalItemData(item);
        
        setFormData({
          name: item.name || '',
          description: item.description || '',
          code: item.code || '',
          quantity: item.quantity?.toString() || '',
          rate: item.rate?.toString() || ''
        });
      } catch (error) {
        console.error('Error fetching item details:', error);
        toast.error('Failed to load item details');
        onClose();
      } finally {
        setFetching(false);
      }
    };

    fetchItemDetails();
  }, [itemId, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Item name is required";
    }

    if (!formData.code?.trim()) {
      newErrors.code = "Item code is required";
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = "Valid quantity is required";
    }

    if (!formData.rate || parseFloat(formData.rate) < 0) {
      newErrors.rate = "Valid rate is required";
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
      // Prepare payload with proper adminId/employeeId based on role
      const payload = {
        itemId: itemId,
        name: formData.name,
        description: formData.description,
        code: formData.code,
        quantity: parseInt(formData.quantity),
        rate: parseFloat(formData.rate)
      };

      // Add adminId and employeeId based on role and original data
      if (role === "ROLE_ADMIN") {
        // For admin, keep the original adminId and set employeeId to null
        payload.adminId = originalItemData?.adminId || null;
        payload.employeeId = null;
      } else if (role === "ROLE_EMPLOYEE") {

        payload.adminId = originalItemData?.adminId || null;
        payload.employeeId = originalItemData?.employeeId || null;
        
      }

      console.log('Update payload:', payload); // For debugging

      await axiosInstance.put('updateItem', payload);
    //   toast.success('Item updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating item:', error);
      if (error.response?.data?.message) {
        toast.error(`Failed to update item: ${error.response.data.message}`);
      } else {
        toast.error('Failed to update item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-3">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold">Edit Item</h2>
                  <p className="text-blue-100 text-sm">Loading item details...</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-12 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading item details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Modal Header - Same colors as customer modal */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-3">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Item</h2>
                <p className="text-blue-100 text-sm">
                  Update the item information below
                </p>
         
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 transform hover:scale-110"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body - All fields in one view */}
        <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Item Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span>Item Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter item name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Item Code */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span>Item Code</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.code ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter item code"
                />
                {errors.code && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.code}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span>Quantity</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.quantity ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm">units</span>
                  </div>
                </div>
                {errors.quantity && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* Rate */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span>Rate</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.rate ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.rate && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.rate}
                  </p>
                )}
              </div>
            </div>

            {/* Description - Full width */}
            <div className="mt-6 space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                placeholder="Enter item description"
              />
            </div>

 
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-end gap-3">
     

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Update Item
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditItemModal;