import React, { useState, useEffect } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import CustomeImageUploader from "../../BaseComponet/CustomeImageUploader";
import { FormPhoneInputFloating } from "../../BaseComponet/CustomeFormComponents";
import { hasPermission } from "../../BaseComponet/permissions";

// --- Reusable FormInput ---
const FormInput = ({
  name,
  label,
  value,
  onChange,
  error,
  disabled = false,
  ...props
}) => (
  <div className="relative">
    <input
      type={props.type || "text"}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`block w-full px-3 py-2.5 border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm ${
        disabled ? "bg-gray-100 cursor-not-allowed" : "bg-transparent"
      } ${
        error
          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      }`}
      placeholder=" "
      {...props}
    />
    <label
      htmlFor={name}
      className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5 peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none ${
        disabled ? "text-gray-400 bg-gray-100" : "bg-white"
      } ${error ? "text-red-600" : "text-gray-500 peer-focus:text-blue-600"}`}
    >
      {label}
    </label>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// --- Reusable FormTextarea ---
const FormTextarea = ({ name, label, value, onChange, error, ...props }) => (
  <div className="relative">
    <textarea
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2.5 bg-transparent border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm resize-none ${
        error
          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      }`}
      placeholder=" "
      {...props}
    />
    <label
      htmlFor={name}
      className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-2.5 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none ${
        error ? "text-red-600" : "text-gray-500 peer-focus:text-blue-600"
      }`}
    >
      {label}
    </label>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// --- Skeleton Loader ---
const SkeletonLoader = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 h-[78vh] overflow-hidden animate-pulse">
      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-300"></div>
          </div>
        </section>
      </div>
    </div>
  );
};

function General() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    companyName: "",
    description: "",
    logoBase64: "",
    gstNumber: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    companyEmail: "",
    signatureBase64: "",
    stampBase64: "",
    panNumber: "",
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      setInitialLoading(true);
      try {
        const response = await axiosInstance.get("/admin/getAdminInfo");
        const data = response.data;
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          companyName: data.companyName || "",
          description: data.description || "",
          logoBase64: data.logo || "",
          gstNumber: data.gstNumber || "",
          bankName: data.bankName || "",
          accountHolderName: data.accountHolderName || "",
          accountNumber: data.accountNumber || "",
          ifscCode: data.ifscCode || "",
          companyEmail: data.companyEmail || "",
          signatureBase64: data.companySignature || "",
          stampBase64: data.companyStamp || "",
          panNumber: data.panNumber || "",
          website: data.website || "",
        });
      } catch (error) {
        console.error("Error fetching admin info:", error);
        toast.error("Failed to fetch profile information.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchAdminInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (fieldName, phone) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: phone,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleImageUpload = (file, fieldName) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, [fieldName]: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.toString().split(",")[1];
      setFormData((prev) => ({
        ...prev,
        [fieldName]: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Admin name is required";
    if (!formData.phone || formData.phone.toString().length < 5) {
      newErrors.phone = "Mobile Number is required";
    }
    if (!formData.companyName?.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.companyEmail?.trim()) {
      newErrors.companyEmail = "Company email is required";
    } else if (!emailRegex.test(formData.companyEmail)) {
      newErrors.companyEmail = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    setLoading(true);

    const payload = {
      ...formData, // Spread existing formData to match payload structure
    };

    try {
      await axiosInstance.put("/admin/updateAdminInfo", payload);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating admin info:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* --- Header Section (Fixed) --- */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              General Settings
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage company details, branding and financial information
            </p>
          </div>
        </div>

        {/* Save Button in Header */}
        <button
          onClick={handleSubmit}
          disabled={loading || initialLoading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
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
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* --- Content Section (Scrollable) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[73vh] overflow-y-auto">
        {initialLoading ? (
          <SkeletonLoader />
        ) : (
          <form id="adminProfileForm" className="p-6">
            <div className="space-y-8">
              {/* --- Section 1: Company Logo --- */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1-1a2 2 0 00-2.828 0L8 14m0 0l-4 4h16l-4-4z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Company Logo
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Update your company's profile logo.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-1/2">
                    <CustomeImageUploader
                      name="logoBase64"
                      onFileChange={(file) =>
                        handleImageUpload(file, "logoBase64")
                      }
                      initialBase64={formData.logoBase64}
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* --- Section 2: Company Details --- */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Company Details
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Basic company and contact information.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    name="companyName"
                    label="Company Name *"
                    value={formData.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                  />
                  <FormInput
                    name="name"
                    label="Admin Name *"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                  />
                  <FormInput
                    name="companyEmail"
                    label="Company Email *"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    error={errors.companyEmail}
                  />

                  <FormPhoneInputFloating
                    label="phone"
                    name="Phone"
                    value={formData.phone}
                    onChange={(phone) => handlePhoneChange("phone", phone)}
                    error={errors.phone}
                    background="white"
                  />
                  <FormInput
                    name="website"
                    label="Company Website"
                    value={formData.website}
                    onChange={handleChange}
                    error={errors.website}
                  />
                  <div></div>
                  <FormTextarea
                    name="address"
                    label="Address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                  />
                  <FormTextarea
                    name="description"
                    label="Description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                  />
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* --- Section 3: Financial Details --- */}
              {!hasPermission("donor", "Access") && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Financial Details
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Banking and tax information.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="gstNumber"
                      label="GST Number"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      error={errors.gstNumber}
                    />
                    <FormInput
                      name="panNumber"
                      label="PAN Number"
                      value={formData.panNumber}
                      onChange={handleChange}
                      error={errors.panNumber}
                    />
                    <FormInput
                      name="bankName"
                      label="Bank Name"
                      value={formData.bankName}
                      onChange={handleChange}
                      error={errors.bankName}
                    />
                    <FormInput
                      name="accountHolderName"
                      label="Account Holder Name"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      error={errors.accountHolderName}
                    />
                    <FormInput
                      name="accountNumber"
                      label="Account Number"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      error={errors.accountNumber}
                    />
                    <FormInput
                      name="ifscCode"
                      label="IFSC Code"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      error={errors.ifscCode}
                    />
                  </div>
                </section>
              )}

              <hr className="border-gray-100" />

              {/* --- Section 4: Signature & Stamp --- */}
              {!hasPermission("donor", "Access") && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Authorised Signature & Company Stamp
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <CustomeImageUploader
                      title="Authorised Signature"
                      onFileChange={(file) =>
                        handleImageUpload(file, "signatureBase64")
                      }
                      initialBase64={formData.signatureBase64}
                    />
                    <CustomeImageUploader
                      title="Company Stamp"
                      onFileChange={(file) =>
                        handleImageUpload(file, "stampBase64")
                      }
                      initialBase64={formData.stampBase64}
                    />
                  </div>
                </section>
              )}
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default General;
