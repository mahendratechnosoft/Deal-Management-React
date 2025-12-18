import { useState } from "react";
import {
  GlobalInputField,
  GlobalPhoneInputField,
} from "../../../BaseComponet/CustomerFormInputs";
import toast from "react-hot-toast";
import axiosInstance from "../../../BaseComponet/axiosInstance";

function CreateContactModal({ onClose, onSuccess, ...props }) {
  const { vendorId } = props;
  const [errors, setErrors] = useState({});

  const [contact, setContact] = useState({
    vendorId,
    contactPersonName: "",
    emailAddress: "",
    phone: "",
    position: "",
    isActive: true,
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact({ ...contact, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    try {
      const response = await axiosInstance.post("createVendorContact", contact);
      if (response.status === 200) {
        toast.success("Contact created successfully!");
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
                <h2 className="text-lg font-bold">Create Contact</h2>
                <p className="text-blue-100 text-xs">
                  Fill the form below to create a new contact
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
              />
              <GlobalInputField
                label="Email"
                name="emailAddress"
                value={contact.emailAddress}
                onChange={handleChange}
                error={errors.emailAddress}
                placeholder="Enter name"
                className="text-sm"
              />
              <GlobalPhoneInputField
                label="Phone Number"
                name="phone"
                value={contact.phone}
                onChange={handleChange}
                error={errors.phone}
              />
              <GlobalInputField
                label="Position"
                name="position"
                value={contact.position}
                onChange={handleChange}
                placeholder="Enter name"
                className="text-sm"
              />
            </div>
          </form>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-xs font-medium"
            >
              Close
            </button>

            <button
              form="createVendorContact"
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateContactModal;
