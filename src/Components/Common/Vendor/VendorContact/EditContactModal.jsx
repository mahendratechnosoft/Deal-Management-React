import { useEffect, useState } from "react";
import {
  GlobalInputField,
  GlobalPhoneInputField,
} from "../../../BaseComponet/CustomerFormInputs";
import toast from "react-hot-toast";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import { hasPermission } from "../../../BaseComponet/permissions";

const VendorContactFormSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto p-3 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
};

function EditContactModal({ onClose, onSuccess, ...props }) {
  const { vendorContactId } = props;
  const [contact, setContact] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const canEdit = hasPermission("vendor", "Edit");

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `getVendorContactById/${vendorContactId}`
      );
      setContact(response.data);
    } catch (error) {
      console.error("Error fetching contact:", error);
      toast.error("Failed to load contact. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact({ ...contact, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!contact.contactPersonName.trim()) {
      newErrors.contactPersonName = "Name is required";
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contact.emailAddress && !emailRegex.test(contact.emailAddress)) {
      newErrors.emailAddress = "Invalid email format";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit) {
      toast.error("You don't have permission to edit contacts.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      const response = await axiosInstance.put("updateVendorContact", contact);
      if (response.status === 200) {
        toast.success("Contact updated successfully!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to create contact. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Update Contact</h2>
                <p className="text-blue-100 text-xs">
                  Fill the form below to update contact
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition"
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
            </button>
          </div>
        </div>

        {!isLoading ? (
          <div className="flex-1 overflow-y-auto p-3">
            <form onSubmit={handleSubmit} id="createVendorContact">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlobalInputField
                  label="Name"
                  name="contactPersonName"
                  value={contact.contactPersonName}
                  onChange={handleChange}
                  required={true}
                  error={errors.contactPersonName}
                  placeholder="Enter name"
                  className="text-sm"
                  disabled={!canEdit} // Disable input fields if no edit permission
                />
                <GlobalInputField
                  label="Email"
                  name="emailAddress"
                  value={contact.emailAddress}
                  onChange={handleChange}
                  error={errors.emailAddress}
                  placeholder="Enter email"
                  className="text-sm"
                  disabled={!canEdit} // Disable input fields if no edit permission
                />
                <GlobalPhoneInputField
                  label="Phone Number"
                  name="phone"
                  value={contact.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  disabled={!canEdit} // Disable input fields if no edit permission
                />
                <GlobalInputField
                  label="Position"
                  name="position"
                  value={contact.position}
                  onChange={handleChange}
                  placeholder="Enter position"
                  className="text-sm"
                  disabled={!canEdit} // Disable input fields if no edit permission
                />
              </div>
            </form>
          </div>
        ) : (
          <VendorContactFormSkeleton />
        )}

        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            {/* Left side - Permission message */}
            <div className="text-xs text-gray-500">
              {!canEdit ? (
                <span className="flex items-center gap-1 text-red-600">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.246 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  You don't have edit permission
                </span>
              ) : null}
            </div>

            {/* Right side - Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-xs font-medium"
              >
                Cancel
              </button>

              <div className="relative group">
                <button
                  form="createVendorContact"
                  type="submit"
                  disabled={!canEdit}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditContactModal;
