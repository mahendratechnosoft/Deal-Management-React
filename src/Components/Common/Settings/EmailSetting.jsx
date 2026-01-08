import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import RichTextEditor from "../../BaseComponet/RichTextEditor";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "../../BaseComponet/CustomeFormComponents";

const EmailSetting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    id: null,
    adminId: "",
    provider: "GMAIL",
    host: "smtp.gmail.com",
    port: 587,
    fromEmail: "",
    username: "",
    password: "",
    encryptionType: "TLS",
    emailHeader: "",
    emailFooter: "",
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Comprehensive SMTP provider configurations
  const smtpProviders = [
    // Email Services
    {
      value: "GMAIL",
      label: "Gmail",
      host: "smtp.gmail.com",
      ports: { TLS: 587, SSL: 465 },
      encryption: ["TLS", "SSL"],
    },
    {
      value: "GOOGLE_WORKSPACE",
      label: "Google Workspace",
      host: "smtp.gmail.com",
      ports: { TLS: 587, SSL: 465 },
      encryption: ["TLS", "SSL"],
    },
    {
      value: "OUTLOOK",
      label: "Outlook / Hotmail / Live",
      host: "smtp.office365.com",
      ports: { TLS: 587 },
      encryption: ["TLS"],
    },
    {
      value: "YAHOO",
      label: "Yahoo Mail",
      host: "smtp.mail.yahoo.com",
      ports: { TLS: 587, SSL: 465 },
      encryption: ["TLS", "SSL"],
    },
    {
      value: "ZOHO",
      label: "Zoho Mail",
      host: "smtp.zoho.com",
      ports: { TLS: 587, SSL: 465 },
      encryption: ["TLS", "SSL"],
    },
    {
      value: "PROTON",
      label: "Proton Mail",
      host: "smtp.protonmail.ch",
      ports: { TLS: 587 },
      encryption: ["TLS"],
    },
    {
      value: "ICLOUD",
      label: "iCloud Mail",
      host: "smtp.mail.me.com",
      ports: { TLS: 587 },
      encryption: ["TLS"],
    },
    {
      value: "YANDEX",
      label: "Yandex Mail",
      host: "smtp.yandex.com",
      ports: { TLS: 587, SSL: 465 },
      encryption: ["TLS", "SSL"],
    },

    // Email Marketing Services
    {
      value: "SENDGRID",
      label: "SendGrid",
      host: "smtp.sendgrid.net",
      ports: { TLS: 587, SSL: 465, NONE: 25 },
      encryption: ["TLS", "SSL", "NONE"],
    },
    {
      value: "MAILGUN",
      label: "Mailgun",
      host: "smtp.mailgun.org",
      ports: { TLS: 587, SSL: 465, NONE: 25 },
      encryption: ["TLS", "SSL", "NONE"],
    },
    {
      value: "AMAZON_SES",
      label: "Amazon SES",
      host: "email-smtp.us-east-1.amazonaws.com",
      ports: { TLS: 587, SSL: 465, NONE: 25 },
      encryption: ["TLS", "SSL", "NONE"],
    },
    {
      value: "BREVO",
      label: "Brevo",
      host: "smtp-relay.brevo.com",
      ports: { TLS: 587, SSL: 465 },
      encryption: ["TLS", "SSL"],
    },
    {
      value: "POSTMARK",
      label: "Postmark",
      host: "smtp.postmarkapp.com",
      ports: { TLS: 587 },
      encryption: ["TLS"],
    },
    {
      value: "SPARKPOST",
      label: "SparkPost",
      host: "smtp.sparkpostmail.com",
      ports: { TLS: 587 },
      encryption: ["TLS"],
    },
    {
      value: "ELASTIC_EMAIL",
      label: "Elastic Email",
      host: "smtp.elasticemail.com",
      ports: { TLS: 587, SSL: 465, NONE: 2525 },
      encryption: ["TLS", "SSL", "NONE"],
    },

    // Web Hosting Services
    {
      value: "GODADDY",
      label: "GoDaddy",
      host: "smtpout.secureserver.net",
      ports: { TLS: 587, SSL: 465 },
      encryption: ["TLS", "SSL"],
    },
    {
      value: "BLUEHOST",
      label: "Bluehost",
      host: "mail.yourdomain.com",
      ports: { TLS: 587, SSL: 465 },
      encryption: ["TLS", "SSL"],
    },
    {
      value: "HOSTGATOR",
      label: "HostGator",
      host: "mail.yourdomain.com",
      ports: { TLS: 587, SSL: 465 },
      encryption: ["TLS", "SSL"],
    },
    {
      value: "NAMECHEAP",
      label: "Namecheap",
      host: "mail.privateemail.com",
      ports: { TLS: 587, SSL: 465 },
      encryption: ["TLS", "SSL"],
    },

    // Custom option
    {
      value: "CUSTOM",
      label: "Custom SMTP",
      host: "",
      ports: { TLS: 587, SSL: 465, NONE: 25 },
      encryption: ["TLS", "SSL", "NONE"],
    },
  ];

  // Format providers for FormSelect
  const providerOptions = [
    {
      label: "Email Services",
      options: smtpProviders
        .slice(0, 8)
        .map((p) => ({ value: p.value, label: p.label })),
    },
    {
      label: "Email Marketing Services",
      options: smtpProviders
        .slice(8, 15)
        .map((p) => ({ value: p.value, label: p.label })),
    },
    {
      label: "Web Hosting Services",
      options: smtpProviders
        .slice(15, 19)
        .map((p) => ({ value: p.value, label: p.label })),
    },
    {
      label: "Other",
      options: smtpProviders
        .slice(19)
        .map((p) => ({ value: p.value, label: p.label })),
    },
  ];

  // Encryption options for FormSelect (including NONE)
  const encryptionOptions = [
    { value: "TLS", label: "TLS" },
    { value: "SSL", label: "SSL" },
    { value: "NONE", label: "None" },
  ];

  // Get available ports for selected provider and encryption
  const getAvailablePorts = (provider, encryptionType) => {
    const providerConfig = smtpProviders.find((p) => p.value === provider);
    if (!providerConfig) return [];

    const ports = providerConfig.ports;
    if (!ports) return [];

    const formattedPorts = [];

    if (encryptionType === "NONE" && ports.NONE) {
      formattedPorts.push({
        value: ports.NONE,
        label: `${ports.NONE} (None)`,
      });
    } else if (encryptionType === "SSL" && ports.SSL) {
      formattedPorts.push({ value: ports.SSL, label: `${ports.SSL} (SSL)` });
    } else if (encryptionType === "TLS" && ports.TLS) {
      formattedPorts.push({ value: ports.TLS, label: `${ports.TLS} (TLS)` });
    }

    return formattedPorts;
  };

  // Get supported encryption types for selected provider
  const getSupportedEncryptionTypes = (provider) => {
    const providerConfig = smtpProviders.find((p) => p.value === provider);
    return providerConfig?.encryption || ["TLS"];
  };

const getCurrentEncryptionOptions = () => {
  const supportedEncryptions = getSupportedEncryptionTypes(
    emailSettings.provider
  );

  // Always include "NONE" option regardless of provider support
  const allOptions = [...encryptionOptions];

  // Filter to show only options that are either supported by provider or NONE
  const filteredOptions = allOptions.filter(
    (option) =>
      option.value === "NONE" || supportedEncryptions.includes(option.value)
  );

  return filteredOptions;
};

useEffect(() => {
  const fetchEmailSettings = async () => {
    try {
      const response = await axiosInstance.get("getEmailConfiguration");
      const data = response.data;
      if (data) {
        // Check if encryptionType is null and convert it to "NONE" for UI
        const encryptionType =
          data.encryptionType === null ? "NONE" : data.encryptionType || "TLS";

        setEmailSettings({
          id: data.id || null,
          adminId: data.adminId || "",
          provider: data.provider || "GMAIL",
          host: data.host || "smtp.gmail.com",
          port: data.port || 587,
          fromEmail: data.fromEmail || "",
          username: data.username || "",
          password: data.password || "",
          encryptionType: encryptionType, // Use the converted value
          emailHeader: data.emailHeader || "",
          emailFooter: data.emailFooter || "",
          active: data.active !== undefined ? data.active : true,
        });
      }
    } catch (error) {
      console.error("Failed to fetch email settings", error);
    }
  };
  fetchEmailSettings();
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "provider") {
      const selectedProvider = smtpProviders.find((p) => p.value === value);
      if (selectedProvider) {
        const supportedEncryptions = getSupportedEncryptionTypes(value);
        const currentEncryption = emailSettings.encryptionType;
        const encryptionType = supportedEncryptions.includes(currentEncryption)
          ? currentEncryption
          : supportedEncryptions[0] || "TLS";

        const availablePorts = getAvailablePorts(value, encryptionType);
        const port = availablePorts.length > 0 ? availablePorts[0].value : 587;

        setEmailSettings((prev) => ({
          ...prev,
          provider: value,
          host: selectedProvider.host || "",
          port: port,
          encryptionType: encryptionType,
        }));
      }
    } else if (name === "encryptionType") {
      const availablePorts = getAvailablePorts(emailSettings.provider, value);
      const port = availablePorts.length > 0 ? availablePorts[0].value : 587;

      setEmailSettings((prev) => ({
        ...prev,
        encryptionType: value,
        port: port,
      }));
    } else {
      setEmailSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";

    if (name === "provider") {
      const selectedProvider = smtpProviders.find((p) => p.value === value);
      if (selectedProvider) {
        const supportedEncryptions = getSupportedEncryptionTypes(value);
        const currentEncryption = emailSettings.encryptionType;
        const encryptionType = supportedEncryptions.includes(currentEncryption)
          ? currentEncryption
          : supportedEncryptions[0] || "TLS";

        const availablePorts = getAvailablePorts(value, encryptionType);
        const port = availablePorts.length > 0 ? availablePorts[0].value : 587;

        setEmailSettings((prev) => ({
          ...prev,
          provider: value,
          host: selectedProvider.host || "",
          port: port,
          encryptionType: encryptionType,
        }));
      }
    } else if (name === "encryptionType") {
      const availablePorts = getAvailablePorts(emailSettings.provider, value);
      const port = availablePorts.length > 0 ? availablePorts[0].value : 587;

      setEmailSettings((prev) => ({
        ...prev,
        encryptionType: value,
        port: port,
      }));
    } else if (name === "port") {
      setEmailSettings((prev) => ({
        ...prev,
        port: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = {};
  if (!emailSettings.fromEmail) newErrors.fromEmail = "From email is required";
  if (!emailSettings.host) newErrors.host = "SMTP host is required";
  if (!emailSettings.port) newErrors.port = "SMTP port is required";
  if (!emailSettings.username) newErrors.username = "Username is required";
  if (!emailSettings.password) newErrors.password = "Password is required";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    toast.error("Please fill in all required fields");
    return;
  }

  setIsLoading(true);
  try {
    const payload = {
      ...emailSettings,
      port: parseInt(emailSettings.port),
      active: emailSettings.id ? emailSettings.active : true,
    };

    // Handle null/empty encryptionType
    if (!payload.encryptionType || payload.encryptionType === "NONE") {
      payload.encryptionType = null; // or delete payload.encryptionType;
    }

    const response = await axiosInstance.put(
      "updateEmailConfiguration",
      payload
    );

    if (response.data) {
      setEmailSettings((prev) => ({
        ...prev,
        ...response.data,
      }));
    }
    toast.success("Email configuration updated successfully.");
  } catch (err) {
    console.error("Error updating email settings:", err);
    toast.error(
      err.response?.data?.message ||
        "Failed to update email configuration. Please try again."
    );
  }
  setIsLoading(false);
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 ">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Email Configuration
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Configure your SMTP email service provider
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
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
      <hr className="border-gray-200" />
      <div className="p-4 h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Combined Section - All Settings in One */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="space-y-6">
              {/* Provider Selection */}
              <div>
                <FormSelect
                  name="provider"
                  value={providerOptions
                    .flatMap((group) => group.options)
                    .find((option) => option.value === emailSettings.provider)}
                  onChange={(selectedOption) =>
                    handleSelectChange("provider", selectedOption)
                  }
                  options={providerOptions}
                  required={true}
                  label="Email Service Provider"
                  error={errors.provider}
                />
              </div>

              {/* Connection and Account Details - 2 inputs per row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormSelect
                    name="encryptionType"
                    value={
                      emailSettings.encryptionType
                        ? getCurrentEncryptionOptions().find(
                            (option) =>
                              option.value === emailSettings.encryptionType
                          )
                        : { value: "NONE", label: "None" }
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange("encryptionType", selectedOption)
                    }
                    options={getCurrentEncryptionOptions()}
                    required={true}
                    label="Email Encryption"
                    error={errors.encryptionType}
                  />
                </div>

                {/* SMTP Host */}
                <div>
                  <FormInput
                    name="host"
                    value={emailSettings.host}
                    onChange={handleChange}
                    type="text"
                    required={true}
                    label="SMTP Host"
                    error={errors.host}
                    className="w-full"
                  />
                </div>

                {/* SMTP Port - Normal Input Field */}
                <div>
                  <FormInput
                    name="port"
                    value={emailSettings.port}
                    onChange={handleChange}
                    type="number"
                    required={true}
                    label="SMTP Port"
                    error={errors.port}
                    className="w-full"
                    min="1"
                    max="65535"
                  />
                </div>

                {/* From Email */}
                <div>
                  <FormInput
                    label="From Email Address"
                    name="fromEmail"
                    value={emailSettings.fromEmail}
                    onChange={handleChange}
                    type="email"
                    required={true}
                    error={errors.fromEmail}
                    className="w-full"
                  />
                </div>

                {/* Username */}
                <div>
                  <FormInput
                    label="SMTP Username"
                    name="username"
                    value={emailSettings.username}
                    onChange={handleChange}
                    type="email"
                    required={true}
                    error={errors.username}
                    className="w-full"
                  />
                </div>

                {/* Password with Eye Icon */}
                <div>
                  <div className="relative">
                    <FormInput
                      label="SMTP Password"
                      name="password"
                      value={emailSettings.password}
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
                      required={true}
                      error={errors.password}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Templates */}
              <div className="space-y-4">
                <div>
                  <RichTextEditor
                    value={emailSettings.emailHeader}
                    onChange={(content) =>
                      setEmailSettings((prev) => ({
                        ...prev,
                        emailHeader: content,
                      }))
                    }
                    placeholder="<div style='...'>Your header HTML</div>"
                    height="200px"
                    toolbarConfig="email"
                    label="Predefined Header"
                    error={errors.emailHeader}
                  />
                </div>

                <div>
                  <RichTextEditor
                    value={emailSettings.emailFooter}
                    onChange={(content) =>
                      setEmailSettings((prev) => ({
                        ...prev,
                        emailFooter: content,
                      }))
                    }
                    placeholder="Enter your email footer HTML here..."
                    height="200px"
                    toolbarConfig="email"
                    label="Predefined Footer"
                    error={errors.emailFooter}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EmailSetting;
