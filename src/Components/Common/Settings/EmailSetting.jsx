import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import RichTextEditor from "../../BaseComponet/RichTextEditor";

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
      encryption: ["TLS", "SSL"],
    },
    {
      value: "MAILGUN",
      label: "Mailgun",
      host: "smtp.mailgun.org",
      ports: { TLS: 587, SSL: 465, NONE: 25 },
      encryption: ["TLS", "SSL"],
    },
    {
      value: "AMAZON_SES",
      label: "Amazon SES",
      host: "email-smtp.us-east-1.amazonaws.com",
      ports: { TLS: 587, SSL: 465, NONE: 25 },
      encryption: ["TLS", "SSL"],
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
      encryption: ["TLS", "SSL"],
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

  // Encryption options
  const encryptionOptions = [
    { value: "TLS", label: "TLS (Recommended)" },
    { value: "SSL", label: "SSL" },
    { value: "NONE", label: "No Encryption" },
  ];

  // Get available ports for selected provider and encryption
  const getAvailablePorts = (provider, encryptionType) => {
    const providerConfig = smtpProviders.find((p) => p.value === provider);
    if (!providerConfig) return [{ value: 587, label: "587 (TLS)" }];

    const ports = providerConfig.ports;
    if (!ports) return [{ value: 587, label: "587 (TLS)" }];

    // Return ports for selected encryption
    if (encryptionType === "NONE") {
      return ports.NONE
        ? [{ value: ports.NONE, label: `${ports.NONE} (No Encryption)` }]
        : [];
    } else if (encryptionType === "SSL") {
      return ports.SSL
        ? [{ value: ports.SSL, label: `${ports.SSL} (SSL)` }]
        : [];
    } else if (encryptionType === "TLS") {
      return ports.TLS
        ? [{ value: ports.TLS, label: `${ports.TLS} (TLS)` }]
        : [];
    }

    // Default to all available ports
    const availablePorts = [];
    if (ports.TLS)
      availablePorts.push({ value: ports.TLS, label: `${ports.TLS} (TLS)` });
    if (ports.SSL)
      availablePorts.push({ value: ports.SSL, label: `${ports.SSL} (SSL)` });
    if (ports.NONE)
      availablePorts.push({
        value: ports.NONE,
        label: `${ports.NONE} (No Encryption)`,
      });

    return availablePorts;
  };

  // Get supported encryption types for selected provider
  const getSupportedEncryptionTypes = (provider) => {
    const providerConfig = smtpProviders.find((p) => p.value === provider);
    return providerConfig?.encryption || ["TLS"];
  };

  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        const response = await axiosInstance.get("getEmailConfiguration");
        const data = response.data;
        if (data) {
          setEmailSettings({
            id: data.id || null,
            adminId: data.adminId || "",
            provider: data.provider || "GMAIL",
            host: data.host || "smtp.gmail.com",
            port: data.port || 587,
            fromEmail: data.fromEmail || "",
            username: data.username || "",
            password: data.password || "",
            encryptionType: data.encryptionType || "TLS",
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
    const { name, value, type } = e.target;

    if (name === "provider") {
      const selectedProvider = smtpProviders.find((p) => p.value === value);
      if (selectedProvider) {
        // Get supported encryption types for new provider
        const supportedEncryptions = getSupportedEncryptionTypes(value);
        // Check if current encryption is supported
        const currentEncryption = emailSettings.encryptionType;
        const encryptionType = supportedEncryptions.includes(currentEncryption)
          ? currentEncryption
          : supportedEncryptions[0] || "TLS";

        // Get available ports for selected encryption
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
      // When encryption changes, update port based on provider and encryption
      const selectedProvider = smtpProviders.find(
        (p) => p.value === emailSettings.provider
      );
      const availablePorts = getAvailablePorts(emailSettings.provider, value);
      const port = availablePorts.length > 0 ? availablePorts[0].value : 587;

      setEmailSettings((prev) => ({
        ...prev,
        encryptionType: value,
        port: port,
      }));
    } else if (name === "port") {
      const newValue = type === "number" ? parseInt(value) || 0 : value;
      setEmailSettings((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setEmailSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!emailSettings.fromEmail)
      newErrors.fromEmail = "From email is required";
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
      // Prepare payload - don't include encryptionType if it's "NONE"
      const payload = {
        ...emailSettings,
        port: parseInt(emailSettings.port),
        active: emailSettings.id ? emailSettings.active : true, // If no ID, set active to true
      };

      // If encryption is NONE, remove encryptionType from payload
      if (payload.encryptionType === "NONE") {
        delete payload.encryptionType;
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

  // Get current encryption options based on selected provider
  const currentEncryptionOptions = getSupportedEncryptionTypes(
    emailSettings.provider
  );

  // Get available ports for current provider and encryption
  const availablePorts = getAvailablePorts(
    emailSettings.provider,
    emailSettings.encryptionType
  );

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
          {/* SMTP Provider Selection */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              SMTP Provider Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Service Provider *
                </label>
                <select
                  name="provider"
                  value={emailSettings.provider}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {/* Group Email Services */}
                  <optgroup label="Email Services">
                    {smtpProviders.slice(0, 8).map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </optgroup>

                  {/* Group Email Marketing Services */}
                  <optgroup label="Email Marketing Services">
                    {smtpProviders.slice(8, 15).map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </optgroup>

                  {/* Group Web Hosting Services */}
                  <optgroup label="Web Hosting Services">
                    {smtpProviders.slice(15, 19).map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </optgroup>

                  {/* Custom Option */}
                  <optgroup label="Other">
                    {smtpProviders.slice(19).map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
                {errors.provider && (
                  <p className="mt-1 text-sm text-red-600">{errors.provider}</p>
                )}
              </div>
            </div>
          </div>

          {/* SMTP Connection Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              SMTP Connection Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  name="host"
                  value={emailSettings.host}
                  onChange={handleChange}
                  placeholder="e.g., smtp.gmail.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.host ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                  readOnly={emailSettings.provider !== "CUSTOM"}
                />
                {errors.host && (
                  <p className="mt-1 text-sm text-red-600">{errors.host}</p>
                )}
                {emailSettings.provider !== "CUSTOM" && (
                  <p className="mt-1 text-xs text-gray-500">
                    Host is auto-filled based on provider
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encryption Type *
                </label>
                <select
                  name="encryptionType"
                  value={emailSettings.encryptionType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.encryptionType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {encryptionOptions
                    .filter((option) =>
                      currentEncryptionOptions.includes(option.value)
                    )
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                {errors.encryptionType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.encryptionType}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Available for {emailSettings.provider}:{" "}
                  {currentEncryptionOptions.join(", ")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port *
                </label>
                <select
                  name="port"
                  value={emailSettings.port}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.port ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  {availablePorts.length > 0 ? (
                    availablePorts.map((portOption) => (
                      <option key={portOption.value} value={portOption.value}>
                        {portOption.label}
                      </option>
                    ))
                  ) : (
                    <option value={emailSettings.port}>
                      {emailSettings.port}
                    </option>
                  )}
                </select>
                {errors.port && (
                  <p className="mt-1 text-sm text-red-600">{errors.port}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Recommended port for {emailSettings.encryptionType}
                </p>
              </div>
            </div>
          </div>

          {/* Email Account Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Email Account Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email Address *
                </label>
                <input
                  type="email"
                  name="fromEmail"
                  value={emailSettings.fromEmail}
                  onChange={handleChange}
                  placeholder="your-email@example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fromEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.fromEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fromEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username / Login Email *
                </label>
                <input
                  type="email"
                  name="username"
                  value={emailSettings.username}
                  onChange={handleChange}
                  placeholder="your-email@example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password / App Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={emailSettings.password}
                  onChange={handleChange}
                  placeholder="Enter your SMTP password"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                {emailSettings.provider === "GMAIL" && (
                  <p className="mt-1 text-xs text-gray-500">
                    Note: Use Gmail App Password (not your regular password).
                    Generate it from Google Account Security settings.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Email Templates
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Header
                </label>
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
                  label=""
                  error={errors.emailHeader}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Footer
                </label>
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
                  label=""
                  error={errors.emailFooter}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EmailSetting;
