import React, { useState, useEffect } from "react";
import {
  FormInput,
  FormSelect,
  FormFileAttachment,
} from "../../../../BaseComponet/CustomeFormComponents";
import axiosInstance from "../../../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";

const UpdatePaymentProfileModal = ({
  isOpen,
  onClose,
  onSuccess,
  profileId,
}) => {
  const [formData, setFormData] = useState(null);
  const [qrFileName, setQrFileName] = useState(""); // UI State for file
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const paymentTypeOptions = [
    { value: "BANK", label: "Bank Transfer" },
    { value: "UPI", label: "UPI" },
    { value: "CARD", label: "CARD" },
  ];

  // Fetch Data
  useEffect(() => {
    if (isOpen && profileId) {
      const fetchData = async () => {
        setFetching(true);
        setError(null);
        try {
          const response = await axiosInstance.get(
            `getPaymentProfileById/${profileId}`
          );
          setFormData(response.data);

          // Logic to handle existing QR Code visual state
          if (response.data.qrCodeImage && response.data.type === "UPI") {
            setQrFileName("Existing QR Code.png");
          } else {
            setQrFileName("");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError("Could not fetch profile details.");
        } finally {
          setFetching(false);
        }
      };
      fetchData();
    }
  }, [isOpen, profileId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTypeChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      type: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/png") {
      toast.error("Only PNG images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("File size must be less than or equal to 1 MB.");
      e.target.value = "";
      return;
    }

    setQrFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      setFormData((prev) => ({
        ...prev,
        qrCodeImage: base64String,
      }));
    };

    reader.readAsDataURL(file);
  };

  const previewFile = (base64String) => {
    if (!base64String) return;
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleRemoveFile = () => {
    setQrFileName("");
    setFormData((prev) => ({ ...prev, qrCodeImage: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.put("updatePaymentProfile", formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update payment profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Update Payment Profile
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          formData && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Profile Name"
                  name="profileName"
                  value={formData.profileName || ""}
                  onChange={handleChange}
                  required
                  background="white"
                />

                <FormSelect
                  label="Payment Type"
                  name="type"
                  value={paymentTypeOptions.find(
                    (opt) => opt.value === formData.type
                  )}
                  onChange={handleTypeChange}
                  options={paymentTypeOptions}
                  required
                  background="white"
                />
              </div>

              {/* Conditional Fields: BANK */}
              {formData.type === "BANK" && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">
                    Bank Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput
                      label="Bank Name"
                      name="bankName"
                      value={formData.bankName || ""}
                      onChange={handleChange}
                      background="white"
                    />
                    <FormInput
                      label="Account Holder Name"
                      name="accountHolderName"
                      value={formData.accountHolderName || ""}
                      onChange={handleChange}
                      background="white"
                    />
                    <FormInput
                      label="Account Number"
                      name="accountNumber"
                      value={formData.accountNumber || ""}
                      onChange={handleChange}
                      background="white"
                    />
                    <FormInput
                      label="IFSC Code"
                      name="ifscCode"
                      value={formData.ifscCode || ""}
                      onChange={handleChange}
                      background="white"
                    />
                    <div className="md:col-span-2">
                      <FormInput
                        label="Branch Name"
                        name="branchName"
                        value={formData.branchName || ""}
                        onChange={handleChange}
                        background="white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Fields: UPI */}
              {formData.type === "UPI" && (
                <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-4">
                  <h4 className="text-sm font-semibold text-purple-800 mb-1">
                    UPI Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput
                      label="UPI ID"
                      name="upiId"
                      value={formData.upiId || ""}
                      onChange={handleChange}
                      background="white"
                    />

                    <FormFileAttachment
                      label="Update QR Code"
                      name="qrCodeImage"
                      fileName={qrFileName}
                      onChange={handleFileChange}
                      onRemove={handleRemoveFile}
                      accept="image/*"
                      background="white"
                      onPreview={() => previewFile(formData.qrCodeImage)}
                    />
                  </div>
                </div>
              )}

              {formData.type === "CARD" && (

                <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-4">
                  <h4 className="text-sm font-semibold text-purple-800 mb-1">
                    Card Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormInput
                      label="Card Type"
                      name="cardType"
                      value={formData.cardType}
                      onChange={handleChange}
                      background="white"
                    />

                    <FormInput
                      label=" Card Number"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      background="white"
                    />
                    <FormInput
                      label="Holder Name"
                      name="cardHolderName"
                      value={formData.cardHolderName}
                      onChange={handleChange}
                      background="white"
                    />

                    <FormInput
                      label="BankName"
                      name="cardBankName"
                      value={formData.cardBankName}
                      onChange={handleChange}
                      background="white"
                    />
                  </div>
                </div>
              )}

              {/* Flags */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {[
                  { label: "Is Active", name: "active" },
                  { label: "Set Default", name: "default" },
                  { label: "For Invoice", name: "forInvoice" },
                  { label: "For Expense", name: "forExpense" },
                ].map((field) => (
                  <label
                    key={field.name}
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={formData[field.name] || false}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      {field.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-lg transition-all font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
};

export default UpdatePaymentProfileModal;
