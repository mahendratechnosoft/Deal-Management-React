import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { FormPhoneInputFloating } from "../../BaseComponet/CustomeFormComponents";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "../../BaseComponet/permissions";

function ContactByCustomer({ customerId, customerName, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Add with other state declarations

  const [canCustomerLogin, setCanCustomerLogin] = useState(false);
  const [enableCustomerLogin, setEnableCustomerLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [originalLoginEmail, setOriginalLoginEmail] = useState("");

  const emailCheckTimeout = useRef(null); // Add this

  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    contact: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    status: true,

    loginEmail: "",
    loginPassword: "",
    userId: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
  });

  // Validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s.'-]+$/,
      message:
        "Name should contain letters, numbers, spaces, and basic punctuation (2-50 characters)",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    phone: {
      required: true,
      minLength: 10,
      pattern: /^\+?[\d\s-()]+$/,
      message: "Please enter a valid phone number (at least 10 digits)",
    },

    loginEmail: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    loginPassword: {
      minLength: 6,
      message: "Password must be at least 6 characters",
    },
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "",
      status: true,

      loginEmail: "",
      loginPassword: "",
      userId: "",
    });
    setFormErrors({
      name: "",
      email: "",
      phone: "",
      loginEmail: "",
      loginPassword: "",
    });
    setTouched({
      name: false,
      email: false,
      phone: false,
      loginEmail: false,
      loginPassword: false,
    });
    setEditingContact(null);
    setShowCreateForm(false);
    setEnableCustomerLogin(false); // Reset toggle
    setOriginalLoginEmail(""); // Reset original email
  };

  // Validate individual field
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";

    if (rules.required && !value.trim()) {
      return "This field is required";
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} characters required`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} characters allowed`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message;
    }

    return "";
  };

  const validateForm = () => {
    const errors = {};

    // Validate basic fields (always required)
    ["name", "email", "phone"].forEach((field) => {
      errors[field] = validateField(field, formData[field]);
    });

    // Validate login fields only if toggle is enabled
    if (enableCustomerLogin) {
      // Login email is required when toggle is on
      if (!formData.loginEmail?.trim()) {
        errors.loginEmail = "Login email is required";
      } else {
        errors.loginEmail = validateField("loginEmail", formData.loginEmail);
      }

      // Password validation depends on context
      if (formData.loginPassword) {
        errors.loginPassword = validateField(
          "loginPassword",
          formData.loginPassword
        );
      }
    }

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, formData[name]);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle phone blur separately
  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    const error = validateField("phone", formData.phone);
    setFormErrors((prev) => ({ ...prev, phone: error }));
  };

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`getContacts/${customerId}`);
      setContacts(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts");
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get moduleAccess from localStorage
    const moduleAccess = localStorage.getItem("moduleAccess");
    if (moduleAccess) {
      try {
        const parsed = JSON.parse(moduleAccess);
        setCanCustomerLogin(parsed.canCustomerLogin === true);
      } catch (error) {
        console.error("Error parsing moduleAccess:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!enableCustomerLogin) {
      setFormData((prev) => ({
        ...prev,
        loginPassword: "",
      }));
      setFormErrors((prev) => ({
        ...prev,
        loginEmail: "",
        loginPassword: "",
      }));
    }
  }, [enableCustomerLogin]);

  useEffect(() => {
    if (customerId) {
      fetchContacts();
    }
  }, [customerId]);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }
    };
  }, []);

  // Handle phone input change for the global component
  const handlePhoneChange = (phone) => {
    setFormData((prev) => ({
      ...prev,
      phone: phone,
    }));

    // Validate phone in real-time if it's been touched
    if (touched.phone) {
      const error = validateField("phone", phone);
      setFormErrors((prev) => ({ ...prev, phone: error }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field in real-time if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }

    // Check email availability when loginEmail changes
    if (name === "loginEmail" && value.trim()) {
      // Clear previous timeout
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }

      // Validate email format first
      if (!/\S+@\S+\.\S+/.test(value)) {
        setFormErrors((prev) => ({
          ...prev,
          loginEmail: "Email address is invalid",
        }));
      } else {
        // Set timeout for email availability check
        emailCheckTimeout.current = setTimeout(() => {
          checkEmailAvailability(value);
        }, 800); // Increased delay to reduce API calls
      }
    }

    // Also check when regular email changes if it's being used as login email
    if (
      name === "email" &&
      enableCustomerLogin &&
      formData.loginEmail === value
    ) {
      setFormErrors((prev) => ({
        ...prev,
        loginEmail: "Login email cannot be same as contact email",
      }));
    }
  };

  // Create contact
  const handleCreateContact = async (e) => {
    e.preventDefault();

    // Check for duplicate email before submitting
    if (enableCustomerLogin && formData.loginEmail) {
      if (formData.loginEmail === formData.email) {
        toast.error("Login email cannot be same as contact email");
        return;
      }

      // Perform one final check
      await checkEmailAvailability(formData.loginEmail);

      // If there's still an error, don't submit
      if (formErrors.loginEmail) {
        toast.error("Please fix email validation errors");
        return;
      }
    }

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      loginEmail: enableCustomerLogin ? true : false,
      loginPassword:
        enableCustomerLogin && formData.loginPassword ? true : false,
    });

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      const contactData = {
        customerId: customerId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        position: formData.position.trim(),
        status: formData.status,
        loginEmail: enableCustomerLogin ? formData.loginEmail.trim() : null,
        password: formData.loginPassword || null,
      };

      // Log the data being sent for debugging
      console.log("Creating contact with data:", contactData);

      const response = await axiosInstance.post("createContact", contactData);

      if (response.status === 200 || response.status === 201) {
        toast.success("Contact created successfully!");
        resetForm();
        fetchContacts();
      } else {
        throw new Error("Failed to create contact");
      }
    } catch (error) {
      console.error("Error creating contact:", error);

      // Enhanced error handling
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;

      if (
        statusCode === 409 ||
        errorMessage.toLowerCase().includes("already exists")
      ) {
        toast.error("This email is already registered in the system");
        setFormErrors((prev) => ({
          ...prev,
          loginEmail:
            "This email is already in use. Please use a different email.",
        }));
      } else if (statusCode === 400) {
        toast.error("Invalid data provided. Please check all fields.");
      } else {
        toast.error(`Failed to create contact: ${errorMessage}`);
      }
    }
  };

  // Update contact
  const handleUpdateContact = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      loginEmail: enableCustomerLogin ? true : false,
      loginPassword:
        enableCustomerLogin && formData.loginPassword ? true : false,
    });

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      const updateData = {
        id: editingContact.id,
        customerId: customerId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        position: formData.position.trim(),
        status: formData.status,

        loginEmail: formData.loginEmail || null,
        password: formData.loginPassword || null,
        userId: formData.userId || null, // Send userId only in update
        active: enableCustomerLogin,
      };

      const response = await axiosInstance.put("updateContact", updateData);

      if (response.status === 200) {
        toast.success("Contact updated successfully!");
        resetForm();
        fetchContacts();
      } else {
        throw new Error("Failed to update contact");
      }
    } catch (error) {
      console.error("Error updating contact:", error);

      // Handle specific backend errors
      if (error.response?.data?.message) {
        // Check if it's a duplicate email error
        const errorMessage = error.response.data.message.toLowerCase();
        if (
          errorMessage.includes("email") &&
          errorMessage.includes("already")
        ) {
          toast.error("Email is already in use. Please use a different email.");
          setFormErrors((prev) => ({
            ...prev,
            loginEmail: "This email is already in use.",
          }));
        } else {
          toast.error(
            `Failed to update contact: ${error.response.data.message}`
          );
        }
      } else if (error.response?.status === 409) {
        // Conflict - duplicate email
        toast.error("This email address is already registered.");
        setFormErrors((prev) => ({
          ...prev,
          loginEmail: "This email is already in use.",
        }));
      } else {
        toast.error("Failed to update contact. Please try again.");
      }
    }
  };

  // Delete contact with modern popup
  const handleDeleteContact = async (contactId) => {
    try {
      await axiosInstance.delete(`deleteContacts/${contactId}`);
      toast.success("Contact deleted successfully!");
      fetchContacts();
      setDeleteModal({ show: false, contact: null });
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (contact) => {
    setDeleteModal({ show: true, contact });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ show: false, contact: null });
  };

  const handleEdit = async (contact) => {
    try {
      setLoading(true); // Show loading while fetching contact data

      // Call the API to get contact details by ID
      const response = await axiosInstance.get(`getContactById/${contact.id}`);
      const contactData = response.data;

      setEditingContact(contactData);

      setFormData({
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        position: contactData.position || "",
        status: contactData.status !== false,
        loginEmail: contactData.loginEmail || "",
        loginPassword: "",
        userId: contactData.userId || "",
        active: contactData.active,
      });

      setOriginalLoginEmail(contactData.loginEmail || "");
      setEnableCustomerLogin(contactData.active);

      // Reset touched state
      setTouched({
        name: false,
        email: false,
        phone: false,
        loginEmail: false,
        loginPassword: false,
      });

      // Clear any existing errors
      setFormErrors({
        name: "",
        email: "",
        phone: "",
        loginEmail: "",
        loginPassword: "",
      });

      setShowCreateForm(true);
    } catch (error) {
      console.error("Error fetching contact details:", error);
      toast.error("Failed to load contact details for editing");

      // Fallback to current table data if API fails
      setEditingContact(contact);

      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        position: contact.position || "",
        status: contact.status !== false,
        loginEmail: contact.loginEmail || "",
        loginPassword: "",
        userId: contact.userId || "",
      });

      setOriginalLoginEmail(contact.loginEmail || "");

      setEnableCustomerLogin(contact.active);

      // Reset touched state
      setTouched({
        name: false,
        email: false,
        phone: false,
        loginEmail: false,
        loginPassword: false,
      });

      // Clear any existing errors
      setFormErrors({
        name: "",
        email: "",
        phone: "",
        loginEmail: "",
        loginPassword: "",
      });

      setShowCreateForm(true);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  const checkEmailAvailability = async (email) => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormErrors((prev) => ({
        ...prev,
        loginEmail: "Email address is invalid",
      }));
      return;
    }

    // If the email hasn't changed from original (during edit), don't check
    if (email === originalLoginEmail) {
      setFormErrors((prev) => ({
        ...prev,
        loginEmail: "",
      }));
      return;
    }

    // Don't check if email is same as contact email
    if (email === formData.email) {
      setFormErrors((prev) => ({
        ...prev,
        loginEmail: "Login email cannot be same as contact email",
      }));
      return;
    }

    setIsVerifyingEmail(true);
    setFormErrors((prev) => ({ ...prev, loginEmail: "" }));

    try {
      // Check if email exists in the system
      const response = await axiosInstance.get(
        `/checkEmail/${encodeURIComponent(email)}`
      );

      // Handle response based on your backend structure
      if (
        response.data.exists ||
        response.data.isTaken ||
        response.data === true
      ) {
        setFormErrors((prev) => ({
          ...prev,
          loginEmail: "This email is already in use by another user.",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          loginEmail: "",
        }));
      }
    } catch (error) {
      console.error("Error checking email:", error);

      // Handle specific error cases
      if (error.response?.status === 404) {
        // Email doesn't exist - it's available
        setFormErrors((prev) => ({
          ...prev,
          loginEmail: "",
        }));
      } else if (
        error.response?.status === 409 ||
        error.response?.status === 400
      ) {
        // Conflict - email already exists
        setFormErrors((prev) => ({
          ...prev,
          loginEmail: "This email is already in use by another user.",
        }));
      } else {
        // Network or server error
        setFormErrors((prev) => ({
          ...prev,
          loginEmail: "Could not verify email. Please try again.",
        }));
      }
    } finally {
      setIsVerifyingEmail(false);
    }
  };
  const handleViewPF = (contact) => {
    navigate(
      `/Admin/ComplianceList?customerId=${customerId}&contactId=${contact.id}&tab=pf`
    );
  };

  const handleViewESIC = (contact) => {
    navigate(
      `/Admin/ComplianceList?customerId=${customerId}&contactId=${contact.id}&tab=esic`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Title, Stats and Add Button */}
      <div className="flex justify-between items-center border-b pb-2">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Contacts</h2>
            <p className="text-sm text-gray-600 mt-1">{customerName}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-blue-600 text-xs font-medium">
                  Total Contacts
                </p>
                <p className="text-xl font-bold text-blue-900">
                  {contacts.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hide Add Contact button when editing */}
        {!editingContact && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Contact
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingContact) && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold mb-4">
            {editingContact ? (
              <div className="flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading contact...
                  </>
                ) : (
                  "Edit Contact"
                )}
              </div>
            ) : (
              "Create New Contact"
            )}
          </h4>
          <form
            onSubmit={
              editingContact ? handleUpdateContact : handleCreateContact
            }
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.name && touched.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter contact name"
                  minLength="2"
                  maxLength="50"
                />
                {formErrors.name && touched.name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.email && touched.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                />
                {formErrors.email && touched.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary No *
                </label>
                <FormPhoneInputFloating
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  required={false}
                  country="in"
                  background="white"
                  className="w-full"
                  error={
                    formErrors.phone && touched.phone ? formErrors.phone : ""
                  }
                />
                {formErrors.phone && touched.phone && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Position Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter position"
                  maxLength="100"
                />
              </div>

              {/* Status Toggle Button */}
              {/* <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStatusToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      formData.status ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.status ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      formData.status ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formData.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div> */}

              {/* Customer Login Section - Only show if canCustomerLogin is true */}
            </div>

            {canCustomerLogin && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                {/* Toggle Button */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Contact Login Credentials
                    </h3>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {enableCustomerLogin ? "Enabled" : "Disabled"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setEnableCustomerLogin(!enableCustomerLogin)
                      }
                      disabled={!canCustomerLogin}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                        enableCustomerLogin ? "bg-blue-600" : "bg-gray-300"
                      } ${
                        !canCustomerLogin ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          enableCustomerLogin
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Login Credentials Form - Only show when toggle is enabled */}
                {enableCustomerLogin && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-blue-50 p-3 rounded">
                    {/* Login Email */}
                    {/* Login Email Field */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                        <span>Login Email</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="loginEmail"
                          value={formData.loginEmail}
                          onChange={handleInputChange}
                          onBlur={(e) => {
                            handleBlur(e);
                            // Check availability on blur as well
                            if (
                              formData.loginEmail &&
                              formData.loginEmail !== originalLoginEmail
                            ) {
                              checkEmailAvailability(formData.loginEmail);
                            }
                          }}
                          autoComplete="new-email"
                          className={`w-full px-3 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10 ${
                            formErrors.loginEmail
                              ? "border-red-300 bg-red-50"
                              : formData.loginEmail &&
                                !formErrors.loginEmail &&
                                !isVerifyingEmail
                              ? "border-green-300 bg-green-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter login email"
                          disabled={!enableCustomerLogin}
                        />
                        {isVerifyingEmail && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        {!isVerifyingEmail &&
                          formData.loginEmail &&
                          !formErrors.loginEmail && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
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
                            </div>
                          )}
                      </div>
                      {formErrors.loginEmail ? (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formErrors.loginEmail}
                        </p>
                      ) : (
                        formData.loginEmail &&
                        /\S+@\S+\.\S+/.test(formData.loginEmail) &&
                        !isVerifyingEmail && (
                          <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Email format is valid and available
                          </p>
                        )
                      )}
                    </div>

                    {/* Login Password - Different label for edit/create */}
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                        <span>
                          {editingContact ? "New Password" : "Login Password"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {editingContact
                            ? "(leave blank to keep current)"
                            : "(min 6 characters)"}
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="loginPassword"
                          value={formData.loginPassword}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          autoComplete="new-password"
                          className={`w-full px-3 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10 ${
                            formErrors.loginPassword && touched.loginPassword
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder={
                            editingContact
                              ? "Enter new password to change"
                              : "Enter login password"
                          }
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          {showPassword ? (
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
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
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
                      {formErrors.loginPassword && touched.loginPassword && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formErrors.loginPassword}
                        </p>
                      )}
                      {!formErrors.loginPassword && formData.loginPassword && (
                        <p
                          className={`mt-1 text-xs flex items-center gap-1 ${
                            formData.loginPassword.length >= 6
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Password strength ({formData.loginPassword.length}
                          /6 characters)
                        </p>
                      )}
                      {/* <p className="text-xs text-gray-500">
                        {formData.loginEmail
                          ? "Contact currently has login access. " +
                            (editingContact
                              ? "Leave password blank to keep current password."
                              : "")
                          : "Enable contact login access with email and password."}
                      </p> */}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  // Check for basic field errors
                  (formErrors.name && touched.name) ||
                  (formErrors.email && touched.email) ||
                  (formErrors.phone && touched.phone) ||
                  // Check for login errors if login is enabled
                  (enableCustomerLogin &&
                    ((formErrors.loginEmail && touched.loginEmail) ||
                      (formErrors.loginPassword &&
                        touched.loginPassword &&
                        formData.loginPassword))) ||
                  // Disable if email verification is in progress
                  (enableCustomerLogin && isVerifyingEmail)
                }
              >
                {editingContact ? "Update Contact" : "Create Contact"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 text-xs rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rest of the component remains the same */}
      {/* Contacts List */}
      {error ? (
        <div className="text-center py-8 text-red-600">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p>Error loading contacts: {error}</p>
          <button
            onClick={fetchContacts}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No contacts found
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first contact.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CONTACT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRIMARY NO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    POSITION
                  </th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {contact.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {contact.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {contact.phone}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {contact.position || "-"}
                    </td>
                    {/* <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contact.status === false
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {contact.status === false ? "Inactive" : "Active"}
                      </span>
                    </td> */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
                          disabled={loading} // Disable while loading
                        >
                          {loading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              Loading...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openDeleteModal(contact)}
                          className="text-red-600 hover:text-red-900 font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>

                        {/* Updated View PF button */}

                        {hasPermission("compliance", "Access") && (
                          <>
                            <button
                              onClick={() => handleViewPF(contact)}
                              className="text-green-600 hover:text-green-900 font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              View PF
                            </button>

                            {/* Updated View ESIC button */}
                            <button
                              onClick={() => handleViewESIC(contact)}
                              className="text-purple-600 hover:text-purple-900 font-medium transition-colors duration-200 flex items-center gap-1 text-xs"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              View ESIC
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Contact
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteModal.contact?.name}</span>
              ? This will permanently remove the contact from the system.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteContact(deleteModal.contact?.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactByCustomer;
