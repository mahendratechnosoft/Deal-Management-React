import React, { useState } from 'react';
import axiosInstance from '../../BaseComponet/axiosInstance';
import toast from "react-hot-toast";

function CreateItemModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    quantity: '',
    rate: ''
  });

  const [errors, setErrors] = useState({});

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
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
        rate: parseFloat(formData.rate)
      };

      await axiosInstance.post('createItem', payload);
    //   toast.success('Item created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating item:', error);
      if (error.response?.data?.message) {
        toast.error(`Failed to create item: ${error.response.data.message}`);
      } else {
        toast.error('Failed to create item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Item</h2>
                <p className="text-blue-100 text-sm">
                  Fill in the item information below
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
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 font-medium flex items-center gap-2 hover:shadow-sm text-sm"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
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
                  Create Item
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateItemModal;