import React, { useState } from "react";
import { FormInput, FormSelect, FormTextarea } from "../../BaseComponet/CustomeFormComponents";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";

const CreateDonar = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { LayoutComponent, role } = useLayout();
  const [formData, setFormData] = useState({
    name: "",
    maritalStatus: "",
    age: "",
    dob: "",
    address: "",
    city: "",
    pincode: "",
    mobile: "",
    email: "",
    height: "",
    weight: "",
    bloodGroup: "",
    professionalQualification: "",
    educationalQualification: "",
    selfPic: null,
    fullPic: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        maritalStatus: "",
        age: "",
        dob: "",
        address: "",
        city: "",
        pincode: "",
        mobile: "",
        email: "",
        height: "",
        weight: "",
        bloodGroup: "",
        professionalQualification: "",
        educationalQualification: "",
        selfPic: null,
        fullPic: null,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare the data for API call
    const apiData = {
      name: formData.name,
      marriedStatus: formData.maritalStatus,
      age: parseInt(formData.age),
      dateOfBirth: formData.dob,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      phoneNumber: formData.mobile,
      email: formData.email,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      bloodGroup: formData.bloodGroup,
      professionalQualification: formData.professionalQualification,
      educationalQualification: formData.educationalQualification,
    };

    try {
      const response = await axiosInstance.post("createDonor", apiData);

      toast.success("Donor created successfully!");

      // Reset form
      setFormData({
        name: "",
        maritalStatus: "",
        age: "",
        dob: "",
        address: "",
        city: "",
        pincode: "",
        mobile: "",
        email: "",
        height: "",
        weight: "",
        bloodGroup: "",
        professionalQualification: "",
        educationalQualification: "",
        selfPic: null,
        fullPic: null,
      });

      // Call onSuccess callback if provided
      onSuccess && onSuccess();

      // Close modal
      onClose && onClose();

      window.location.reload();


    } catch (error) {
      console.error("Error creating donor:", error);
      toast.error("Error creating donor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      maritalStatus: "",
      age: "",
      dob: "",
      address: "",
      city: "",
      pincode: "",
      mobile: "",
      email: "",
      height: "",
      weight: "",
      bloodGroup: "",
      professionalQualification: "",
      educationalQualification: "",
      selfPic: null,
      fullPic: null,
    });
    onClose && onClose();
  };

    const statusOptions = [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
    ];

      const handleSelectChange = (selectedOption, { name }) => {
        setFormData((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : "",
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[80%] max-w-5xl p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">

        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Donor</h2>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
              disabled={isSubmitting}
            >
              Close
            </button>

            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Name */}
            <FormInput
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            {/* Marital Status */}
            <FormSelect
              label="Marital Status Yes/No"
              name="maritalStatus"
              value={statusOptions.find(
                (o) => o.value === formData.maritalStatus
              )}
              onChange={(option) =>
                handleSelectChange(option, { name: "maritalStatus" })
              }
              options={statusOptions}
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
            />

            {/* Date of Birth */}
            <FormInput
              label="Date of Birth"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            {/* Address */}
            <FormTextarea
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              required
              disabled={isSubmitting}
            />

            {/* City */}
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            {/* Pincode */}
            <FormInput
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            {/* Mobile Number */}
            <FormInput
              label="Mobile Number"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              disabled={isSubmitting}
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
            />

            {/* Height */}
            <FormInput
              label="Height (cm)"
              name="height"
              type="number"
              step="0.1"
              value={formData.height}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            {/* Weight */}
            <FormInput
              label="Weight (kg)"
              name="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            {/* Blood Group */}
            <div className="flex flex-col">
              <label className="font-medium">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-3 py-2"
                required
                disabled={isSubmitting}
              >
                <option value="">Select</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Professional Qualification */}
            <FormInput
              label="Professional Qualification"
              name="professionalQualification"
              value={formData.professionalQualification}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            {/* Educational Qualification */}
            <FormInput
              label="Educational Qualification"
              name="educationalQualification"
              value={formData.educationalQualification}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />

            {/* File Uploads */}
            <div>
              <label className="font-medium">Self Pic (Close-up)</label>
              <input
                type="file"
                name="selfPic"
                accept="image/*"
                onChange={handleFileChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="font-medium">Full Length Pic</label>
              <input
                type="file"
                name="fullPic"
                accept="image/*"
                onChange={handleFileChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required
                disabled={isSubmitting}
              />
            </div>

          </div>

          {/* Bottom Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Donor..." : "Save Donor"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateDonar;