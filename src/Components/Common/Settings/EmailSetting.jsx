import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import {
  FormInput,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";

const EmailSetting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    id: null,
    gmail: "",
    gmailPassword: "",
    hostingerMail: "",
    hostingerPassword: "",
    activeHost: "GMAIL", // default
    emailHeader: "",
    emailFooter: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        const response = await axiosInstance.get("getEmailConfiguration");
        const data = response.data;
        if (data) {
          setEmailSettings((prev) => ({
            ...prev,
            ...data,
            id: data.id || data.emailConfigurationId || null, // Handle potential id field names
          }));
        }
      } catch (error) {
        // It's possible there's no config yet, so we might ignore 404 or just log it
        // toast.error("Failed to fetch email settings.");
        console.error("Failed to fetch email settings", error);
      }
    };
    fetchEmailSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(
        "updateEmailConfiguration",
        emailSettings
      );
      // Update state with response if needed, specifically ensuring ID is set for future updates
      if (response.data) {
        setEmailSettings((prev) => ({
          ...prev,
          ...response.data,
          id: response.data.id || response.data.emailConfigurationId || prev.id,
        }));
      }
      toast.success("Email settings updated successfully.");
    } catch (err) {
      console.error("Error updating email settings:", err);
      toast.error("Failed to update email settings. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Email Configuration
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage your email service configurations
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
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
      </div>
      <hr />
      <div className="p-4 h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Active Email Service
            </label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="activeHost"
                  value="GMAIL"
                  checked={emailSettings.activeHost === "GMAIL"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Gmail
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="activeHost"
                  value="HOSTINGER"
                  checked={emailSettings.activeHost === "HOSTINGER"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Hostinger Mail
                </span>
              </label>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
              Gmail Settings
            </h3>
          </div>
          <FormInput
            label="Gmail Address"
            name="gmail"
            value={emailSettings.gmail}
            onChange={handleChange}
            type="email"
            error={errors.gmail}
          />
          <FormInput
            label="Gmail App Password"
            name="gmailPassword"
            value={emailSettings.gmailPassword}
            onChange={handleChange}
            type="password"
            error={errors.gmailPassword}
          />

          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
              Hostinger Mail Settings
            </h3>
          </div>
          <FormInput
            label="Hostinger Mail Address"
            name="hostingerMail"
            value={emailSettings.hostingerMail}
            onChange={handleChange}
            type="email"
            error={errors.hostingerMail}
          />
          <FormInput
            label="Hostinger Password"
            name="hostingerPassword"
            value={emailSettings.hostingerPassword}
            onChange={handleChange}
            type="password"
            error={errors.hostingerPassword}
          />

          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
              Email Templates
            </h3>
          </div>
          <div className="col-span-1 md:col-span-2">
            <FormTextarea
              label="Email Header"
              name="emailHeader"
              value={emailSettings.emailHeader}
              onChange={handleChange}
              rows={4}
              error={errors.emailHeader}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <FormTextarea
              label="Email Footer"
              name="emailFooter"
              value={emailSettings.emailFooter}
              onChange={handleChange}
              rows={4}
              error={errors.emailFooter}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailSetting;
