import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";

// --- Options Arrays ---
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

const marriedOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const educationOptions = [
  { value: "below_10th", label: "Below 10th" },
  { value: "ssc_10th", label: "10th Pass (SSC)" },
  { value: "hsc_12th", label: "12th Pass (HSC)" },
  { value: "diploma", label: "Diploma" },
  { value: "iti_vocational", label: "ITI / Vocational Training" },
  { value: "ug_pursuing", label: "Undergraduate (UG) - Pursuing" },
  { value: "bachelor_completed", label: "Undergraduate (Bachelor’s Degree)" },
  { value: "pg_pursuing", label: "Postgraduate (PG) - Pursuing" },
  { value: "masters_completed", label: "Postgraduate (Master’s Degree)" },
  { value: "doctorate", label: "Doctorate (PhD)" },
  { value: "professional_course", label: "Professional Course" },
  { value: "other", label: "Other" },
];

// --- Validation Logic ---
const validateField = (name, value) => {
  switch (name) {
    case "name":
      if (!value?.trim()) return "Name is required";
      return "";
    case "age":
      if (!value) return "Age is required";
      return "";
    case "phoneNumber": // API field name
      if (!value) return "Mobile number is required";
      if (!/^[6-9]\d{9}$/.test(value)) return "Invalid 10-digit mobile number";
      return "";
    case "email":
      if (!value) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email";
      return "";
    case "adharCardNo":
      if (!value) return "Adhar card is required";
      if (!/^\d{12}$/.test(value)) return "Invalid 12-digit Adhar number";
      return "";
    case "pincode":
      if (!value) return "Pincode is required";
      if (!/^\d{6}$/.test(value)) return "Invalid 6-digit pincode";
      return "";
    case "height":
    case "weight":
    case "city":
    case "profession":
    case "address":
    case "bloodGroup":
      if (!value || (typeof value === "string" && !value.trim()))
        return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
      return "";
    default:
      return "";
  }
};

const EditSemenEnquirySkeleton = () => (
  <div className="p-4 bg-gray-50 h-full animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-40 w-full bg-gray-200 rounded"></div>
        <div className="h-40 w-full bg-gray-200 rounded"></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

function EditSemenEnquiry() {
  const navigate = useNavigate();
  // Expecting route like /edit-semen-enquiry/:id
  const { id } = useParams();
  const { LayoutComponent } = useLayout();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initial State matching API structure
  const [formData, setFormData] = useState({
    semenEnquiryId: "",
    name: "",
    age: "",
    dateOfBirth: "",
    marriedStatus: "",
    phoneNumber: "",
    email: "",
    adharCardNo: "",
    height: "",
    weight: "",
    bloodGroup: "",
    education: "",
    profession: "",
    address: "",
    city: "",
    pincode: "",
    selfeImage: null,
    fullLengthImage: null,
  });

  // --- Fetch Data ---
  useEffect(() => {
    const fetchEnquiry = async () => {
      setLoading(true);
      try {
        // Assuming endpoint: /getSemenEnquiryById/{id}
        const response = await axiosInstance.get(`getSemenEnquiryById/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching enquiry:", error);
        toast.error("Failed to load enquiry data.");
        navigate(-1); // Go back if failed
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEnquiry();
  }, [id, navigate]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (option, name) => {
    const value = option ? option.value : "";
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Convert File to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      try {
        const base64DataUrl = await convertToBase64(file);
        // Remove prefix (data:image/jpeg;base64,) if backend expects raw base64
        const rawBase64 = base64DataUrl.split(",")[1];
        setFormData((prev) => ({ ...prev, [fieldName]: rawBase64 }));
      } catch (error) {
        toast.error("Error processing image");
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = [
      "name",
      "age",
      "dateOfBirth",
      "phoneNumber",
      "email",
      "adharCardNo",
      "pincode",
      "height",
      "weight",
      "city",
      "profession",
      "address",
      "bloodGroup",
    ];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConvertToProspect = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `convertSemenEnquiryToDonor/${id}`
      );
      if (response.status === 204) {
        toast.success("Successfully moved to Prospect!");
        navigate(-1);
      }
    } catch (error) {
      console.error("Conversion failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to convert to prospect."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);
    try {
      // API call to update
      await axiosInstance.put("updateSemenEnquiry", formData);
      toast.success("Enquiry updated successfully!");
      navigate(-1); // Go back to list
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(
        error.response?.data?.message || "Update failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---
  const renderInput = (label, name, type = "text", props = {}) => (
    <div>
      <FormInput
        label={
          <>
            {label} <span className="text-red-500">*</span>
          </>
        }
        name={name}
        type={type}
        value={formData[name] || ""}
        onChange={handleChange}
        disabled={loading}
        {...props}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  const renderSelect = (label, name, options) => (
    <div>
      <FormSelect
        label={
          <>
            {label} <span className="text-red-500">*</span>
          </>
        }
        name={name}
        value={options.find((o) => o.value === formData[name])}
        onChange={(o) => handleSelectChange(o, name)}
        options={options}
        isDisabled={loading}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  if (loading && !formData.name) {
    return (
      <LayoutComponent>
        <EditSemenEnquirySkeleton />
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Semen Enquiry
            </h1>
            <p className="text-sm text-gray-500">
              Update personal and address details
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
          >
            Back to List
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- Images Section --- */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                Images
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Selfie */}
                <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 flex flex-col items-center">
                  <span className="text-sm font-semibold text-gray-700 mb-3">
                    Selfie / Close-up
                  </span>
                  <div className="relative mb-3 group">
                    {formData.selfeImage ? (
                      <img
                        src={`data:image/jpeg;base64,${formData.selfeImage}`}
                        alt="Selfie"
                        className="h-40 w-40 object-cover rounded-full border-4 border-white shadow-sm"
                      />
                    ) : (
                      <div className="h-40 w-40 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, "selfeImage")}
                    />
                  </label>
                </div>

                {/* Full Body */}
                <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 flex flex-col items-center">
                  <span className="text-sm font-semibold text-gray-700 mb-3">
                    Full Length Photo
                  </span>
                  <div className="relative mb-3">
                    {formData.fullLengthImage ? (
                      <img
                        src={`data:image/jpeg;base64,${formData.fullLengthImage}`}
                        alt="Full Length"
                        className="h-40 w-auto object-contain rounded border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="h-40 w-32 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, "fullLengthImage")}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* --- Personal Information --- */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderInput("Name", "name", "text", {
                  placeholder: "Full Name",
                })}
                {renderSelect(
                  "Marital Status",
                  "marriedStatus",
                  marriedOptions
                )}
                {renderInput("Age", "age", "number", {
                  placeholder: "e.g. 28",
                })}
                {renderInput("Date of Birth", "dateOfBirth", "date")}
                {renderInput("Mobile Number", "phoneNumber", "tel", {
                  maxLength: 10,
                })}
                {renderInput("Email", "email", "email")}
                {renderInput("Adhar Card No", "adharCardNo", "text", {
                  maxLength: 12,
                })}
                {renderSelect("Blood Group", "bloodGroup", bloodGroupOptions)}
                {renderSelect("Education", "education", educationOptions)}
                {renderInput("Profession", "profession", "text")}
                {renderInput("Height (cm)", "height", "number", {
                  step: "0.01",
                })}
                {renderInput("Weight (kg)", "weight", "number", {
                  step: "0.01",
                })}
              </div>
            </div>

            {/* --- Address Information --- */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <FormTextarea
                    label={
                      <>
                        Address <span className="text-red-500">*</span>
                      </>
                    }
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Full residential address"
                    disabled={loading}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>
                {renderInput("City", "city", "text")}
                {renderInput("Pincode", "pincode", "text", { maxLength: 6 })}
              </div>
            </div>

            {/* --- Submit Button --- */}
            <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConvertToProspect}
                className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg shadow-sm hover:bg-purple-700 disabled:bg-purple-300 transition-all"
                disabled={loading}
              >
                Move to Prospect
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  "Update Enquiry"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </LayoutComponent>
  );
}

export default EditSemenEnquiry;
