import React, { useState, useEffect } from "react";
// Ensure these paths are correct based on your project structure
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";

// --- HELPER FUNCTION: Convert File to Base64 string ---
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
// ------------------------------------------------------

const CreateDonar = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { LayoutComponent } = useLayout();

  // Initial state constant to avoid repetition
  const initialFormState = {
    name: "",
    maritalStatus: "",
    age: "",
    dateOfBirth: "",
    address: "",
    city: "",
    pincode: "",
    mobile: "",
    email: "",
    height: "",
    weight: "",
    bloodGroup: "",
    profession: "",
    education: "",
    selfPic: null, // Will hold File object initially
    fullPic: null, // Will hold File object initially
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options define
  const statusOptionsMarried = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  const bloodGroupOptions = [
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
  ];

  const educationOptions = [
    { value: "UnderGraduation", label: "Under Graduation" },
    { value: "PostGraduation", label: "Post Graduation" },
    { value: "Masters", label: "Masters" },
    { value: "Graduated", label: "Graduated" },
  ];

  // Reset form when modal closes via props
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleFileChange = (e) => {
    // Ensure a file was actually selected before setting state
    if (e.target.files && e.target.files[0]) {
      // We still store the File object in state initially for previewing if needed later
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    onClose && onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Convert images to Base64 if they exist
      let selfPicBase64 = null;
      let fullPicBase64 = null;

      // Check if it's a valid File object before converting
      if (formData.selfPic instanceof File) {
        selfPicBase64 = await convertToBase64(formData.selfPic);
      }

      if (formData.fullPic instanceof File) {
        fullPicBase64 = await convertToBase64(formData.fullPic);
      }

      // 2. Prepare JSON payload
      const apiDataPayload = {
        name: formData.name,
        marriedStatus: formData.maritalStatus,
        age: Number(formData.age),
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        phoneNumber: formData.mobile,
        email: formData.email,
        height: Number(formData.height),
        weight: Number(formData.weight),
        bloodGroup: formData.bloodGroup,
        profession: formData.profession,
        education: formData.education,
        selfPic: selfPicBase64,
        fullPic: fullPicBase64,
      };

      // 3. Send JSON data using Axios
      const response = await axiosInstance.post("createDonor", apiDataPayload);

      toast.success("Donor created successfully!");
      setFormData(initialFormState);

      // Call onSuccess callback so parent can refresh data
      onSuccess && onSuccess();
      handleClose();
      window.location.reload();

    } catch (error) {
      console.error("Error creating donor:", error);
      const errMsg = error.response?.data?.message || "Error creating donor. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header Row - Fixed at top */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Create New Donor</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 hover:bg-gray-200 rounded-full transition-colors"
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* --- SECTION 1: PERSONAL INFORMATION --- */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Name */}
                <FormInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter full name"
                />

                {/* Marital Status */}
                <FormSelect
                  label="Marital Status"
                  name="maritalStatus"
                  value={statusOptionsMarried.find(
                    (o) => o.value === formData.maritalStatus
                  )}
                  onChange={(option) =>
                    handleSelectChange(option, { name: "maritalStatus" })
                  }
                  options={statusOptionsMarried}
                  required
                  isDisabled={isSubmitting}
                  placeholder="Select status"
                />

                {/* Age */}
                <FormInput
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="e.g., 30"
                  min="18"
                />

                {/* Date of Birth */}
                <FormInput
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />

                {/* Mobile Number */}
                <FormInput
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter 10-digit number"
                  pattern="[0-9]{10}"
                />

                {/* Email ID */}
                <FormInput
                  label="Email ID"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="john@example.com"
                />

                {/* Height */}
                <FormInput
                  label="Height (cm)"
                  name="height"
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="e.g., 175.5"
                />

                {/* Weight */}
                <FormInput
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="e.g., 70.5"
                />

                {/* Blood Group */}
                <FormSelect
                  label="Blood Group"
                  name="bloodGroup"
                  value={bloodGroupOptions.find(
                    (o) => o.value === formData.bloodGroup
                  )}
                  onChange={(option) =>
                    handleSelectChange(option, { name: "bloodGroup" })
                  }
                  options={bloodGroupOptions}
                  required
                  isDisabled={isSubmitting}
                  placeholder="Select Blood Group"
                />

              {/* Educational Qualification */}
                <FormSelect
                  label="Education"
                  name="education"
                  value={educationOptions.find((o) => o.value === formData.education)}
                  onChange={(option) => handleSelectChange(option, { name: "education" })}
                  options={educationOptions}
                />

                {/* Professional Qualification */}
                <FormInput
                  label="Professional Qualification"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="e.g., Software Engineer"
                />

              
                {/* <FormInput
                  label="Educational Qualification"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="e.g., B.Tech, MBA"
                /> */}


              </div>

              {/* Photos Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="flex flex-col space-y-1">
                  <label htmlFor="selfPic" className="text-sm font-medium text-gray-700">Self Pic (Close-up) <span className="text-gray-400 text-xs">(Optional)</span></label>
                  <input
                    id="selfPic"
                    type="file"
                    name="selfPic"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-1"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor="fullPic" className="text-sm font-medium text-gray-700">Full Length Pic <span className="text-gray-400 text-xs">(Optional)</span></label>
                  <input
                    id="fullPic"
                    type="file"
                    name="fullPic"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-1"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 2: ADDRESS INFORMATION --- */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Address Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address (Full Width) */}
                <div className="md:col-span-2">
                  <FormTextarea
                    label="Residential Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    required
                    disabled={isSubmitting}
                    placeholder="Enter full residential address including street, landmark, etc."
                  />
                </div>

                {/* City */}
                <FormInput
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter city name"
                />

                {/* Pincode */}
                <FormInput
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="e.g., 400001"
                  pattern="[0-9]{6}"
                />
              </div>
            </div>

            {/* Footer - Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Save Donor"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDonar;