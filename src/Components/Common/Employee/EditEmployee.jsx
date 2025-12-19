import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";
import { Country, State, City } from "country-state-city";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormPhoneInputFloating,
} from "../../BaseComponet/CustomeFormComponents"; // Your existing components
import { showConfirmDialog } from "../../BaseComponet/alertUtils";
import { hasPermission } from "../../BaseComponet/permissions";

// Constants
const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

function EditEmployee() {
  const { LayoutComponent, role } = useLayout();
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [isDeptLoading, setIsDeptLoading] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [moduleAccess, setModuleAccess] = useState(null);
  // Add this near other useState declarations
  const [showPassword, setShowPassword] = useState(false);

  const [dropdownData, setDropdownData] = useState({
    countries: [],
    states: [],
    cities: [],
  });

  const [formData, setFormData] = useState({
    loginEmail: "",
    name: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    gender: "",
    description: "",
    profileImageBase64: "",
    departmentId: "",
    roleId: "",
    departmentName: "",
    roleName: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // Load countries on component mount
  useEffect(() => {
    const countries = Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));

    setDropdownData((prev) => ({
      ...prev,
      countries,
    }));
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (formData.country) {
      const states = State.getStatesOfCountry(formData.country).map(
        (state) => ({
          value: state.isoCode,
          label: state.name,
        })
      );

      setDropdownData((prev) => ({
        ...prev,
        states,
        cities: [],
      }));
    }
  }, [formData.country]);

  // Load cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const cities = City.getCitiesOfState(
        formData.country,
        formData.state
      ).map((city) => ({
        value: city.name,
        label: city.name,
      }));

      setDropdownData((prev) => ({
        ...prev,
        cities,
      }));
    }
  }, [formData.country, formData.state]);

  // Fetch employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) {
        toast.error("Employee ID not found in URL.");
        navigate("/Admin/EmployeeList");
        return;
      }
      setInitialLoading(true);
      try {
        const response = await axiosInstance.get(
          `/admin/getEmployeeById/${employeeId}`
        );
        const employeeData = response.data;

        setFormData({
          loginEmail: employeeData.loginEmail || "",
          name: employeeData.name || "",
          phone: employeeData.phone || "",
          address: employeeData.address || "",
          country: employeeData.country || "",
          state: employeeData.state || "",
          city: employeeData.city || "",
          gender: employeeData.gender || "",
          description: employeeData.description || "",
          profileImageBase64: employeeData.profileImage || "",
          departmentId: employeeData.departmentId || "",
          roleId: employeeData.roleId || "",
          departmentName: employeeData.departmentName || "",
          roleName: employeeData.roleName || "",
        });

        setModuleAccess(employeeData.moduleAccess || null);

        // Pre-fill department and role options
        if (employeeData.departmentId && employeeData.departmentName) {
          setDepartmentOptions([
            {
              value: employeeData.departmentId,
              label: employeeData.departmentName,
            },
          ]);
        }
        if (employeeData.roleId && employeeData.roleName) {
          setRoleOptions([
            { value: employeeData.roleId, label: employeeData.roleName },
          ]);
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        toast.error("Failed to fetch employee details. Please try again.");
        navigate("/Admin/EmployeeList");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (phone) => {
    setFormData((prev) => ({ ...prev, phone }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleSelectChange = (selectedOption, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: selectedOption ? selectedOption.value : "",
    }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleCountryChange = (selectedOption) => {
    const countryCode = selectedOption ? selectedOption.value : "";
    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      state: "",
      city: "",
    }));
  };

  const handleStateChange = (selectedOption) => {
    const stateCode = selectedOption ? selectedOption.value : "";
    setFormData((prev) => ({
      ...prev,
      state: stateCode,
      city: "",
    }));
  };

  const handleCityChange = (selectedOption) => {
    const cityName = selectedOption ? selectedOption.value : "";
    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          profileImageBase64: "Invalid file type. Please select a JPG or PNG.",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profileImageBase64: "File is too large. Maximum size is 5MB.",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.toString().split(",")[1];
        setFormData((prev) => ({
          ...prev,
          profileImageBase64: base64String,
        }));
      };
      reader.readAsDataURL(file);

      if (errors.profileImageBase64) {
        setErrors((prev) => ({ ...prev, profileImageBase64: "" }));
      }
    }
  };

  const loadDepartments = async () => {
    if (departmentOptions.length > 1) return;

    setIsDeptLoading(true);
    try {
      const response = await axiosInstance.get("/admin/getAllDepartment");
      const options = response.data.map((dept) => ({
        value: dept.departmentId,
        label: dept.name,
      }));
      setDepartmentOptions(options);
    } catch (error) {
      console.error("Failed to fetch departments", error);
      toast.error("Failed to load departments");
    } finally {
      setIsDeptLoading(false);
    }
  };

  const loadRoles = async () => {
    if (!formData.departmentId) return;
    if (roleOptions.length > 1 && roleOptions[0]?.value === formData.roleId)
      return;

    setIsRoleLoading(true);
    try {
      const response = await axiosInstance.get(
        `/admin/getRoleByDepartment/${formData.departmentId}`
      );
      const options = response.data.map((role) => ({
        value: role.roleId,
        label: role.name,
        permissions: role, // Store the entire role object with permissions
      }));
      setRoleOptions(options);
    } catch (error) {
      console.error("Failed to fetch roles", error);
      setRoleOptions([]);
      toast.error("Failed to load roles");
    } finally {
      setIsRoleLoading(false);
    }
  };

  const handleDepartmentChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      departmentId: selectedOption ? selectedOption.value : "",
      departmentName: selectedOption ? selectedOption.label : "",
      roleId: "",
      roleName: "",
    }));
    setRoleOptions([]);

    // Reset module access when department changes
    setModuleAccess(null);

    if (errors.departmentId) {
      setErrors((prev) => ({ ...prev, departmentId: "" }));
    }
    if (errors.roleId) {
      setErrors((prev) => ({ ...prev, roleId: "" }));
    }
  };

  const handleRoleChange = (selectedOption) => {
    const selectedRole = selectedOption ? selectedOption.permissions : null;

    setFormData((prev) => ({
      ...prev,
      roleId: selectedOption ? selectedOption.value : "",
      roleName: selectedOption ? selectedOption.label : "",
    }));

    // Apply role permissions to module access
    if (selectedRole) {
      setModuleAccess({
        moduleAccessId: moduleAccess?.moduleAccessId || null,
        leadAccess: selectedRole.leadAccess || false,
        leadViewAll: selectedRole.leadViewAll || false,
        leadCreate: selectedRole.leadCreate || false,
        leadDelete: selectedRole.leadDelete || false,
        leadEdit: selectedRole.leadEdit || false,
        customerAccess: selectedRole.customerAccess || false,
        customerViewAll: selectedRole.customerViewAll || false,
        customerCreate: selectedRole.customerCreate || false,
        customerDelete: selectedRole.customerDelete || false,
        customerEdit: selectedRole.customerEdit || false,
        proposalAccess: selectedRole.proposalAccess || false,
        proposalViewAll: selectedRole.proposalViewAll || false,
        proposalCreate: selectedRole.proposalCreate || false,
        proposalDelete: selectedRole.proposalDelete || false,
        proposalEdit: selectedRole.proposalEdit || false,
        proformaInvoiceAccess: selectedRole.proformaInvoiceAccess || false,
        proformaInvoiceViewAll: selectedRole.proformaInvoiceViewAll || false,
        proformaInvoiceCreate: selectedRole.proformaInvoiceCreate || false,
        proformaInvoiceDelete: selectedRole.proformaInvoiceDelete || false,
        proformaInvoiceEdit: selectedRole.proformaInvoiceEdit || false,
        invoiceAccess: selectedRole.invoiceAccess || false,
        invoiceViewAll: selectedRole.invoiceViewAll || false,
        invoiceCreate: selectedRole.invoiceCreate || false,
        invoiceDelete: selectedRole.invoiceDelete || false,
        invoiceEdit: selectedRole.invoiceEdit || false,
        paymentAccess: selectedRole.paymentAccess || false,
        paymentViewAll: selectedRole.paymentViewAll || false,
        paymentCreate: selectedRole.paymentCreate || false,
        paymentDelete: selectedRole.paymentDelete || false,
        paymentEdit: selectedRole.paymentEdit || false,
        timeSheetAccess: selectedRole.timeSheetAccess || false,
        timeSheetViewAll: selectedRole.timeSheetViewAll || false,
        timeSheetCreate: selectedRole.timeSheetCreate || false,
        timeSheetDelete: selectedRole.timeSheetDelete || false,
        timeSheetEdit: selectedRole.timeSheetEdit || false,

        donorAccess: selectedRole.donorAccess || false,
        donorViewAll: selectedRole.donorViewAll || false,
        donorCreate: selectedRole.donorCreate || false,
        donorDelete: selectedRole.donorDelete || false,
        donorEdit: selectedRole.donorEdit || false,

        itemAccess: selectedRole.itemAccess || false,
        itemViewAll: selectedRole.itemViewAll || false,
        itemCreate: selectedRole.itemCreate || false,
        itemDelete: selectedRole.itemDelete || false,
        itemEdit: selectedRole.itemEdit || false,

        taskAccess: selectedRole.taskAccess || false,
        taskViewAll: selectedRole.taskViewAll || false,
        taskCreate: selectedRole.taskCreate || false,
        taskDelete: selectedRole.taskDelete || false,
        taskEdit: selectedRole.taskEdit || false,

        amcAccess: selectedRole.amcAccess || false,
        amcViewAll: selectedRole.amcViewAll || false,
        amcCreate: selectedRole.amcCreate || false,
        amcDelete: selectedRole.amcDelete || false,
        amcEdit: selectedRole.amcEdit || false,

        vendorAccess: selectedRole.vendorAccess || false,
        vendorViewAll: selectedRole.vendorViewAll || false,
        vendorCreate: selectedRole.vendorCreate || false,
        vendorDelete: selectedRole.vendorDelete || false,
        vendorEdit: selectedRole.vendorEdit || false,
      });
    }

    if (errors.roleId) {
      setErrors((prev) => ({ ...prev, roleId: "" }));
    }
  };

  const handleAccessChange = (field, value) => {
    setModuleAccess((prev) => {
      if (!prev) {
        return {
          moduleAccessId: null,
          leadAccess: false,
          leadViewAll: false,
          leadCreate: false,
          leadDelete: false,
          leadEdit: false,
          customerAccess: false,
          customerViewAll: false,
          customerCreate: false,
          customerDelete: false,
          customerEdit: false,
          proposalAccess: false,
          proposalViewAll: false,
          proposalCreate: false,
          proposalDelete: false,
          proposalEdit: false,
          proformaInvoiceAccess: false,
          proformaInvoiceViewAll: false,
          proformaInvoiceCreate: false,
          proformaInvoiceDelete: false,
          proformaInvoiceEdit: false,
          invoiceAccess: false,
          invoiceViewAll: false,
          invoiceCreate: false,
          invoiceDelete: false,
          invoiceEdit: false,
          paymentAccess: false,
          paymentViewAll: false,
          paymentCreate: false,
          paymentDelete: false,
          paymentEdit: false,
          timeSheetAccess: false,
          timeSheetViewAll: false,
          timeSheetCreate: false,
          timeSheetDelete: false,
          timeSheetEdit: false,

          donorAccess: false,
          donorViewAll: false,
          donorCreate: false,
          donorDelete: false,
          donorEdit: false,

          itemAccess: false,
          itemViewAll: false,
          itemCreate: false,
          itemDelete: false,
          itemEdit: false,

          taskAccess: false,
          taskCreate: false,
          taskDelete: false,
          taskEdit: false,
          taskViewAll: false,
          [field]: value,

          amcAccess: false,
          amcCreate: false,
          amcDelete: false,
          amcEdit: false,
          amcViewAll: false,

          vendorAccess: false,
          vendorCreate: false,
          vendorDelete: false,
          vendorEdit: false,
          vendorViewAll: false,
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  // Add these functions before the handleSubmit function
  const handleClearAllAccess = () => {
    setModuleAccess({
      moduleAccessId: moduleAccess?.moduleAccessId || null,
      leadAccess: false,
      leadViewAll: false,
      leadCreate: false,
      leadDelete: false,
      leadEdit: false,
      customerAccess: false,
      customerViewAll: false,
      customerCreate: false,
      customerDelete: false,
      customerEdit: false,
      proposalAccess: false,
      proposalViewAll: false,
      proposalCreate: false,
      proposalDelete: false,
      proposalEdit: false,
      proformaInvoiceAccess: false,
      proformaInvoiceViewAll: false,
      proformaInvoiceCreate: false,
      proformaInvoiceDelete: false,
      proformaInvoiceEdit: false,
      invoiceAccess: false,
      invoiceViewAll: false,
      invoiceCreate: false,
      invoiceDelete: false,
      invoiceEdit: false,
      paymentAccess: false,
      paymentViewAll: false,
      paymentCreate: false,
      paymentDelete: false,
      paymentEdit: false,
      timeSheetAccess: false,
      timeSheetViewAll: false,
      timeSheetCreate: false,
      timeSheetDelete: false,
      timeSheetEdit: false,

      donorAccess: false,
      donorViewAll: false,
      donorCreate: false,
      donorDelete: false,
      donorEdit: false,

      itemAccess: false,
      itemViewAll: false,
      itemCreate: false,
      itemDelete: false,
      itemEdit: false,

      taskAccess: false,
      taskCreate: false,
      taskDelete: false,
      taskEdit: false,
      taskViewAll: false,

      amcAccess: false,
      amcCreate: false,
      amcDelete: false,
      amcEdit: false,
      amcViewAll: false,

      vendorAccess: false,
      vendorCreate: false,
      vendorDelete: false,
      vendorEdit: false,
      vendorViewAll: false,
    });
    toast.success("All permissions cleared");
  };

  const handleSetAllAccess = () => {
    setModuleAccess({
      moduleAccessId: moduleAccess?.moduleAccessId || null,
      leadAccess: true,
      leadViewAll: true,
      leadCreate: true,
      leadDelete: true,
      leadEdit: true,
      customerAccess: true,
      customerViewAll: true,
      customerCreate: true,
      customerDelete: true,
      customerEdit: true,
      proposalAccess: true,
      proposalViewAll: true,
      proposalCreate: true,
      proposalDelete: true,
      proposalEdit: true,
      proformaInvoiceAccess: true,
      proformaInvoiceViewAll: true,
      proformaInvoiceCreate: true,
      proformaInvoiceDelete: true,
      proformaInvoiceEdit: true,
      invoiceAccess: true,
      invoiceViewAll: true,
      invoiceCreate: true,
      invoiceDelete: true,
      invoiceEdit: true,
      paymentAccess: true,
      paymentViewAll: true,
      paymentCreate: true,
      paymentDelete: true,
      paymentEdit: true,
      timeSheetAccess: true,
      timeSheetViewAll: true,
      timeSheetCreate: true,
      timeSheetDelete: true,
      timeSheetEdit: true,

      donorAccess: true,
      donorViewAll: true,
      donorCreate: true,
      donorDelete: true,
      donorEdit: true,

      itemAccess: true,
      itemViewAll: true,
      itemCreate: true,
      itemDelete: true,
      itemEdit: true,

      taskAccess: true,
      taskCreate: true,
      taskDelete: true,
      taskEdit: true,
      taskViewAll: true,

      amcAccess: true,
      amcCreate: true,
      amcDelete: true,
      amcEdit: true,
      amcViewAll: true,

      vendorAccess: true,
      vendorCreate: true,
      vendorDelete: true,
      vendorEdit: true,
      vendorViewAll: true,
    });
    toast.success("All permissions granted");
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Full name is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.departmentId)
      newErrors.departmentId = "Department is required";
    if (!formData.roleId) newErrors.roleId = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update handleSubmit to include password update if provided
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      ...formData,
      profileImage: formData.profileImageBase64,
      employeeId: employeeId,
      moduleAccess: moduleAccess,
    };
    delete payload.profileImageBase64;

    try {
      // Update employee details
      await axiosInstance.put("/admin/updateEmployee", payload);

      // Update password separately if provided
      if (formData.password) {
        const passwordPayload = {
          loginEmail: formData.loginEmail,
          password: formData.password,
        };
        await axiosInstance.put(
          "/admin/updateEmployeePassword",
          passwordPayload
        );
        toast.success("Employee details and password updated successfully!");
      } else {
        toast.success("Employee updated successfully!");
      }

      navigate("/Admin/EmployeeList");
    } catch (error) {
      console.error("Error updating employee:", error);
      if (error.request) {
        toast.error(
          "Cannot connect to server. Please check if the backend is running."
        );
      } else {
        toast.error("Failed to update employee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const result = await showConfirmDialog(
      "Are you sure you want to cancel? Any unsaved changes will be lost."
    );

    if (result.isConfirmed) {
      navigate("/Admin/EmployeeList");
    }
  };

  // Loading Skeleton (similar to EditCustomer)
  if (initialLoading) {
    return (
      <LayoutComponent>
        <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="skeleton h-4 w-24 rounded"></div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="space-y-2">
                <div className="skeleton h-6 w-48 rounded"></div>
                <div className="skeleton h-4 w-64 rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="skeleton h-9 w-20 rounded"></div>
                <div className="skeleton h-9 w-32 rounded"></div>
              </div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 space-y-6">
                  {/* Profile Image Section Skeleton */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="skeleton w-8 h-8 rounded-lg"></div>
                      <div className="skeleton h-6 w-48 rounded"></div>
                    </div>
                    <div className="flex justify-center mb-6">
                      <div className="skeleton w-24 h-24 rounded-full"></div>
                    </div>
                  </section>

                  {/* Personal Details Section Skeleton */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="skeleton w-8 h-8 rounded-lg"></div>
                      <div className="skeleton h-6 w-40 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(6)].map((_, index) => (
                        <div key={index} className="space-y-2">
                          <div className="skeleton h-4 w-24 rounded"></div>
                          <div className="skeleton h-10 w-full rounded"></div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Module Access Section Skeleton */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="skeleton w-8 h-8 rounded-lg"></div>
                      <div className="skeleton h-6 w-32 rounded"></div>
                    </div>
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div
                          key={index}
                          className="skeleton h-24 w-full rounded-lg"
                        ></div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            .skeleton {
              background: linear-gradient(
                90deg,
                #f0f0f0 25%,
                #e0e0e0 50%,
                #f0f0f0 75%
              );
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
            }

            @keyframes loading {
              0% {
                background-position: 200% 0;
              }
              100% {
                background-position: -200% 0;
              }
            }
          `}</style>
        </div>
      </LayoutComponent>
    );
  }

  const getAccess = (field) => {
    return moduleAccess ? moduleAccess[field] : false;
  };

  const hasModulePermission = (moduleName) => {
    return hasPermission(moduleName, "Access");
  };

  return (
    <LayoutComponent>
      <div className="bg-white h-[90vh] overflow-y-auto CRM-scroll-width-none">
        {/* Compact Header */}
        <div className="bg-white border-gray-200 px-4 py-3 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/Admin/EmployeeList")}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded transition-colors"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Edit Employee
                </h1>
                <p className="text-xs text-gray-600">
                  Update employee information
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Compact Form */}
        <div className="p-4 pt-0">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column - Personal Information */}
              <div className="space-y-4">
                {/* Profile Image - More Compact */}

                {/* Personal Details - Phone & Gender in one line */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Personal Details
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {" "}
                    <div className="flex flex-col items-center">
                      <input
                        type="file"
                        id="profileImageInput"
                        name="profileImageBase64"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="profileImageInput"
                        className="cursor-pointer"
                      >
                        {formData.profileImageBase64 ? (
                          <img
                            src={`data:image/jpeg;base64,${formData.profileImageBase64}`}
                            alt="Profile Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 hover:border-gray-400">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span className="text-xs font-medium mt-1">
                              Upload
                            </span>
                          </div>
                        )}
                      </label>
                      {errors.profileImageBase64 && (
                        <p className="mt-1 text-xs text-red-600 text-center">
                          {errors.profileImageBase64}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <FormInput
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required={true}
                        error={errors.name}
                        background="white"
                      />

                      <FormInput
                        label="Email"
                        name="loginEmail"
                        value={formData.loginEmail}
                        onChange={handleChange}
                        disabled={true}
                        background="white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Phone and Password in one line */}
                    <div className="grid grid-cols-2 gap-3">
                      <FormPhoneInputFloating
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        required={true}
                        error={errors.phone}
                        background="white"
                      />

                      {/* Password field with eye icon - matching FormInput style */}
                      <div className="relative ">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder=" "
                          className={`block w-full h-full px-3 py-2 bg-white border rounded-lg appearance-none focus:outline-none focus:ring-2 peer text-sm ${
                            errors.password
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          } pr-10`}
                        />
                        <label
                          htmlFor="password"
                          className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-3 left-1 
          peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-3 
          peer-focus:px-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:top-2 pointer-events-none 
          ${
            errors.password
              ? "text-red-600"
              : "text-gray-700 peer-focus:text-blue-600"
          }`}
                        >
                          New Password (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
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
                        {errors.password && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.password}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormSelect
                        label="Gender"
                        name="gender"
                        value={genderOptions.find(
                          (opt) => opt.value === formData.gender
                        )}
                        onChange={(selectedOption) =>
                          handleSelectChange(selectedOption, "gender")
                        }
                        options={genderOptions}
                        required={true}
                        error={errors.gender}
                        background="white"
                      />
                      <FormSelect
                        label="Department"
                        name="departmentId"
                        value={departmentOptions.find(
                          (opt) => opt.value === formData.departmentId
                        )}
                        onChange={handleDepartmentChange}
                        onMenuOpen={loadDepartments}
                        options={departmentOptions}
                        isLoading={isDeptLoading}
                        required={true}
                        error={errors.departmentId}
                        background="white"
                      />

                      <FormSelect
                        label="Role"
                        name="roleId"
                        value={roleOptions.find(
                          (opt) => opt.value === formData.roleId
                        )}
                        onChange={handleRoleChange}
                        onMenuOpen={loadRoles}
                        options={roleOptions}
                        isLoading={isRoleLoading}
                        isDisabled={!formData.departmentId}
                        required={true}
                        error={errors.roleId}
                        background="white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Address & Description */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 h-full">
                  <h3 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Address Information
                  </h3>

                  <div className="space-y-3">
                    {/* Country, State, City in one line */}
                    <div className="grid grid-cols-3 gap-2">
                      <FormSelect
                        label="Country"
                        name="country"
                        value={dropdownData.countries.find(
                          (opt) => opt.value === formData.country
                        )}
                        onChange={handleCountryChange}
                        options={dropdownData.countries}
                        isSearchable={true}
                        background="white"
                      />

                      <FormSelect
                        label="State"
                        name="state"
                        value={dropdownData.states.find(
                          (opt) => opt.value === formData.state
                        )}
                        onChange={handleStateChange}
                        options={dropdownData.states}
                        isSearchable={true}
                        isDisabled={!formData.country}
                        background="white"
                      />

                      <FormSelect
                        label="City"
                        name="city"
                        value={dropdownData.cities.find(
                          (opt) => opt.value === formData.city
                        )}
                        onChange={handleCityChange}
                        options={dropdownData.cities}
                        isSearchable={true}
                        isDisabled={!formData.state}
                        background="white"
                      />
                    </div>

                    {/* Address and Description in one line with smaller height */}
                    <div className="grid grid-cols-2 gap-3">
                      <FormTextarea
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        background="white"
                        className="min-h-[80px]"
                      />

                      <FormTextarea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        background="white"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {/* Module Access - All modules in 6-column grid */}
              <div className="bg-gray-50 rounded-lg p-3 h-full">
                <div className="flex items-center justify-left mb-3">
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mr-5">
                    Module Access
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearAllAccess}
                      className="px-3 py-1.5 text-xs border border-red-300 text-red-700 rounded bg-white hover:bg-red-50 transition-colors"
                    >
                      Clear All
                    </button>
                    {/* <button
                      type="button"
                      onClick={handleSetAllAccess}
                      className="px-3 py-1.5 text-xs border border-green-300 text-green-700 rounded bg-white hover:bg-green-50 transition-colors"
                    >
                      Set All
                    </button> */}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {!hasPermission("donor", "Access") && (
                    <>
                      {hasModulePermission("lead") && (
                        <ModuleAccessGroup
                          title="Leads"
                          permissions={[
                            { label: "Access", field: "leadAccess" },
                            { label: "View All", field: "leadViewAll" },
                            { label: "Create", field: "leadCreate" },
                            { label: "Edit", field: "leadEdit" },
                            { label: "Delete", field: "leadDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}

                      {hasModulePermission("customer") && (
                        <ModuleAccessGroup
                          title="Customer"
                          permissions={[
                            { label: "Access", field: "customerAccess" },
                            { label: "View All", field: "customerViewAll" },
                            { label: "Create", field: "customerCreate" },
                            { label: "Edit", field: "customerEdit" },
                            { label: "Delete", field: "customerDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}

                      {hasModulePermission("proposal") && (
                        <ModuleAccessGroup
                          title="Proposal"
                          permissions={[
                            { label: "Access", field: "proposalAccess" },
                            { label: "View All", field: "proposalViewAll" },
                            { label: "Create", field: "proposalCreate" },
                            { label: "Edit", field: "proposalEdit" },
                            { label: "Delete", field: "proposalDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}

                      {hasModulePermission("proformaInvoice") && (
                        <ModuleAccessGroup
                          title="Proforma Invoice"
                          permissions={[
                            { label: "Access", field: "proformaInvoiceAccess" },
                            {
                              label: "View All",
                              field: "proformaInvoiceViewAll",
                            },
                            { label: "Create", field: "proformaInvoiceCreate" },
                            { label: "Edit", field: "proformaInvoiceEdit" },
                            { label: "Delete", field: "proformaInvoiceDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}

                      {hasModulePermission("invoice") && (
                        <ModuleAccessGroup
                          title="Invoice"
                          permissions={[
                            { label: "Access", field: "invoiceAccess" },
                            { label: "View All", field: "invoiceViewAll" },
                            { label: "Create", field: "invoiceCreate" },
                            { label: "Edit", field: "invoiceEdit" },
                            { label: "Delete", field: "invoiceDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}

                      {hasModulePermission("payment") && (
                        <ModuleAccessGroup
                          title="Payment"
                          permissions={[
                            { label: "Access", field: "paymentAccess" },
                            { label: "View All", field: "paymentViewAll" },
                            { label: "Create", field: "paymentCreate" },
                            { label: "Edit", field: "paymentEdit" },
                            { label: "Delete", field: "paymentDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}

                      {hasModulePermission("timeSheet") && (
                        <ModuleAccessGroup
                          title="TimeSheet"
                          permissions={[
                            { label: "Access", field: "timeSheetAccess" },
                            { label: "View All", field: "timeSheetViewAll" },
                            { label: "Create", field: "timeSheetCreate" },
                            { label: "Edit", field: "timeSheetEdit" },
                            { label: "Delete", field: "timeSheetDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}

                      {hasModulePermission("lead") && (
                        <ModuleAccessGroup
                          title="Item Permissions"
                          permissions={[
                            { label: "Access", field: "itemAccess" },
                            { label: "View All", field: "itemViewAll" },
                            { label: "Create", field: "itemCreate" },
                            { label: "Edit", field: "itemEdit" },
                            { label: "Delete", field: "itemDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}

                      {hasModulePermission("task") && (
                        <ModuleAccessGroup
                          title="Task Permissions"
                          permissions={[
                            { label: "Access", field: "taskAccess" },
                            { label: "View All", field: "taskViewAll" },
                            { label: "Create", field: "taskCreate" },
                            { label: "Edit", field: "taskEdit" },
                            { label: "Delete", field: "taskDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}
                      {hasModulePermission("amc") && (
                        <ModuleAccessGroup
                          title="AMC Permissions"
                          permissions={[
                            { label: "Access", field: "amcAccess" },
                            { label: "View All", field: "amcViewAll" },
                            { label: "Create", field: "amcCreate" },
                            { label: "Edit", field: "amcEdit" },
                            { label: "Delete", field: "amcDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}

                      {hasModulePermission("vendor") && (
                        <ModuleAccessGroup
                          title="Vendor Permissions"
                          permissions={[
                            { label: "Access", field: "vendorAccess" },
                            { label: "View All", field: "vendorViewAll" },
                            { label: "Create", field: "vendorCreate" },
                            { label: "Edit", field: "vendorEdit" },
                            { label: "Delete", field: "vendorDelete" },
                          ]}
                          getAccess={getAccess}
                          handleAccessChange={handleAccessChange}
                        />
                      )}
                    </>
                  )}

                  {hasPermission("donor", "Access") && (
                    <ModuleAccessGroup
                      title="Donor Permissions"
                      permissions={[
                        { label: "Access", field: "donorAccess" },
                        { label: "View All", field: "donorViewAll" },
                        { label: "Create", field: "donorCreate" },
                        { label: "Edit", field: "donorEdit" },
                        { label: "Delete", field: "donorDelete" },
                      ]}
                      getAccess={getAccess}
                      handleAccessChange={handleAccessChange}
                    />
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </LayoutComponent>
  );

  function ModuleAccessGroup({
    title,
    permissions,
    getAccess,
    handleAccessChange,
  }) {
    return (
      <div className="p-2 border border-gray-200 rounded bg-white">
        <h3 className="text font-medium text-gray-800 mb-2">{title}</h3>
        <div className="space-y-1 grid grid-cols-2 gap-3">
          {permissions.map((perm) => (
            <AccessToggle
              key={perm.field}
              field={perm.field}
              label={perm.label}
              isChecked={getAccess(perm.field)}
              onChange={(isChecked) =>
                handleAccessChange(perm.field, isChecked)
              }
            />
          ))}
        </div>
      </div>
    );
  }
}

function AccessToggle({ field, label, isChecked, onChange }) {
  const handleToggle = (e) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation();
    onChange(!isChecked);
  };

  return (
    <label
      htmlFor={field}
      className="flex items-center cursor-pointer select-none"
      onClick={handleToggle}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={field}
          checked={isChecked}
          onChange={handleToggle}
          className="sr-only"
        />
        <div
          className={`block w-10 h-6 rounded-full transition-colors ${
            isChecked ? "bg-blue-600" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${
            isChecked ? "translate-x-4" : "translate-x-0"
          }`}
        ></div>
      </div>
      <span className="ml-2 text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default EditEmployee;
