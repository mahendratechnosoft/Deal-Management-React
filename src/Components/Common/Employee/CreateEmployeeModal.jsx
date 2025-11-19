import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import Select from "react-select";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Country, State, City } from "country-state-city";

const customReactSelectStyles = (hasError) => ({
    control: (provided, state) => ({
        ...provided,
        minHeight: "40px",
        borderColor: state.isFocused
            ? "#3b82f6"
            : hasError
                ? "#ef4444"
                : "#e5e7eb",
        borderWidth: "1px",
        borderRadius: "6px",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
        "&:hover": {
            borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
        },
        backgroundColor: "white",
    }),
    menu: (base) => ({
        ...base,
        zIndex: 50,
        borderRadius: "6px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? "#3b82f6"
            : state.isFocused
                ? "#f3f4f6"
                : "white",
        color: state.isSelected ? "white" : "#1f2937",
        "&:active": {
            backgroundColor: "#3b82f6",
            color: "white",
        },
    }),
});

const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
];

function CreateEmployeeModal({ onClose, onSuccess }) {
    const { LayoutComponent, role } = useLayout();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);

    const [isDeptLoading, setIsDeptLoading] = useState(false);
    const [isRoleLoading, setIsRoleLoading] = useState(false);

    const [dropdownData, setDropdownData] = useState({
        countries: [],
        states: [],
        cities: [],
    });

    // Separate state for phone display and data
    const [phoneDisplay, setPhoneDisplay] = useState("");
    const [phoneData, setPhoneData] = useState({
        country: "in",
        completeNumber: "",
    });

    const [formData, setFormData] = useState({
        loginEmail: "",
        password: "",
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
    });

    const [errors, setErrors] = useState({});



    // Add Module Access State
    const [moduleAccess, setModuleAccess] = useState({
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
        paymentcreate: false,
        paymentDelete: false,
        paymentEdit: false,

        timeSheetAccess: false,
        timeSheetViewAll: false,
        timeSheetCreate: false,
        timeSheetDelete: false,
        timeSheetEdit: false
    });

    // =======================================COUNTrY STATE CITY DROPDOWN START__>===================================

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
            const states = State.getStatesOfCountry(formData.country).map((state) => ({
                value: state.isoCode,
                label: state.name,
            }));

            setDropdownData((prev) => ({
                ...prev,
                states,
                cities: [], // Clear cities when country changes
            }));
        }
    }, [formData.country]);

    // Load cities when state changes
    useEffect(() => {
        if (formData.country && formData.state) {
            const cities = City.getCitiesOfState(formData.country, formData.state).map((city) => ({
                value: city.name,
                label: city.name,
            }));

            setDropdownData((prev) => ({
                ...prev,
                cities,
            }));
        }
    }, [formData.country, formData.state]);




    // Add these handlers after your existing change handlers

    // Country change handler
    const handleCountryChange = (selectedOption) => {
        const countryCode = selectedOption ? selectedOption.value : "";

        setFormData((prev) => ({
            ...prev,
            country: countryCode,
            state: "", // Reset state when country changes
            city: "",  // Reset city when country changes
        }));
    };

    // State change handler
    const handleStateChange = (selectedOption) => {
        const stateCode = selectedOption ? selectedOption.value : "";

        setFormData((prev) => ({
            ...prev,
            state: stateCode,
            city: "", // Reset city when state changes
        }));
    };

    // City change handler
    const handleCityChange = (selectedOption) => {
        const cityName = selectedOption ? selectedOption.value : "";

        setFormData((prev) => ({
            ...prev,
            city: cityName,
        }));
    };



    // =======================================COUNTrY STATE CITY DROPDOWN===================================

    const checkEmailAvailability = async (email) => {
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors((prev) => ({
                ...prev,
                loginEmail: "Email address is invalid",
            }));
            return;
        }

        setIsVerifyingEmail(true);
        setErrors((prev) => ({ ...prev, loginEmail: "" }));

        try {
            const response = await axiosInstance.get(`/checkEmail/${email}`);
            if (response.data === true) {
                setErrors((prev) => ({
                    ...prev,
                    loginEmail: "This email is already in use.",
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    loginEmail: "",
                }));
            }
        } catch (error) {
            console.error("Error checking email:", error);
            setErrors((prev) => ({
                ...prev,
                loginEmail: "Could not verify email. Please try again.",
            }));
        } finally {
            setIsVerifyingEmail(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (name === "loginEmail") {
            if (value.trim() === "") {
                setErrors((prev) => ({
                    ...prev,
                    loginEmail: "",
                }));
            } else {
                checkEmailAvailability(value);
            }
        } else {
            if (errors[name]) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: "",
                }));
            }
        }
    };

    // Handle phone change with react-phone-input-2
    const handlePhoneChange = (value, country, e, formattedValue) => {
        const countryCode = country.countryCode;
        const countryDialCode = country.dialCode;

        // Format: +countryCode localNumber
        const completeNumber = `+${countryDialCode}${value.slice(countryDialCode.length)}`;
        const displayNumber = value;

        setPhoneDisplay(displayNumber);
        setPhoneData({
            country: countryCode,
            completeNumber: completeNumber,
        });

        // Update form data with complete number
        setFormData((prev) => ({
            ...prev,
            phone: completeNumber,
        }));

        // Clear phone errors if any
        if (errors.phone) {
            setErrors((prev) => ({
                ...prev,
                phone: "",
            }));
        }
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
                setErrors((prev) => ({
                    ...prev,
                    profileImageBase64: "",
                }));
            }
        }
    };

    const handleGenderChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            gender: selectedOption ? selectedOption.value : "",
        }));
        if (errors.gender) {
            setErrors((prev) => ({
                ...prev,
                gender: "",
            }));
        }
    };

    const loadDepartments = async () => {
        if (departmentOptions.length > 0) {
            return;
        }
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
    if (!formData.departmentId) {
        return;
    }
    setIsRoleLoading(true);
    try {
        const response = await axiosInstance.get(
            `/admin/getRoleByDepartment/${formData.departmentId}`
        );
        // Include all permission fields in the role options
        const options = response.data.map((role) => ({
            value: role.roleId,
            label: role.name,
            // Include all permission fields
            leadAccess: role.leadAccess,
            leadViewAll: role.leadViewAll,
            leadCreate: role.leadCreate,
            leadDelete: role.leadDelete,
            leadEdit: role.leadEdit,
            customerAccess: role.customerAccess,
            customerViewAll: role.customerViewAll,
            customerCreate: role.customerCreate,
            customerDelete: role.customerDelete,
            customerEdit: role.customerEdit,
            proposalAccess: role.proposalAccess,
            proposalViewAll: role.proposalViewAll,
            proposalCreate: role.proposalCreate,
            proposalDelete: role.proposalDelete,
            proposalEdit: role.proposalEdit,
            proformaInvoiceAccess: role.proformaInvoiceAccess,
            proformaInvoiceViewAll: role.proformaInvoiceViewAll,
            proformaInvoiceCreate: role.proformaInvoiceCreate,
            proformaInvoiceDelete: role.proformaInvoiceDelete,
            proformaInvoiceEdit: role.proformaInvoiceEdit,
            invoiceAccess: role.invoiceAccess,
            invoiceViewAll: role.invoiceViewAll,
            invoiceCreate: role.invoiceCreate,
            invoiceDelete: role.invoiceDelete,
            invoiceEdit: role.invoiceEdit,
            paymentAccess: role.paymentAccess,
            paymentViewAll: role.paymentViewAll,
            paymentcreate: role.paymentcreate,
            paymentDelete: role.paymentDelete,
            paymentEdit: role.paymentEdit,
            timeSheetAccess: role.timeSheetAccess,
            timeSheetViewAll: role.timeSheetViewAll,
            timeSheetCreate: role.timeSheetCreate,
            timeSheetDelete: role.timeSheetDelete,
            timeSheetEdit: role.timeSheetEdit
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
    setModuleAccess({
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
        paymentcreate: false,
        paymentDelete: false,
        paymentEdit: false,
        timeSheetAccess: false,
        timeSheetViewAll: false,
        timeSheetCreate: false,
        timeSheetDelete: false,
        timeSheetEdit: false
    });

    if (errors.departmentId) {
        setErrors((prev) => ({ ...prev, departmentId: "" }));
    }
    if (errors.roleId) {
        setErrors((prev) => ({ ...prev, roleId: "" }));
    }
};

const handleRoleChange = (selectedOption) => {
    if (selectedOption) {
        // Find the selected role from roleOptions to get all permissions
        const selectedRole = roleOptions.find(role => role.value === selectedOption.value);
        
        console.log("Selected Role:", selectedRole); // Debug log
        
        setFormData((prev) => ({
            ...prev,
            roleId: selectedOption.value,
            roleName: selectedOption.label,
        }));

        // Update module access based on selected role permissions
        if (selectedRole) {
            setModuleAccess({
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
                paymentcreate: selectedRole.paymentcreate || false,
                paymentDelete: selectedRole.paymentDelete || false,
                paymentEdit: selectedRole.paymentEdit || false,
                
                timeSheetAccess: selectedRole.timeSheetAccess || false,
                timeSheetViewAll: selectedRole.timeSheetViewAll || false,
                timeSheetCreate: selectedRole.timeSheetCreate || false,
                timeSheetDelete: selectedRole.timeSheetDelete || false,
                timeSheetEdit: selectedRole.timeSheetEdit || false
            });
            
            // Show success message
            // toast.success(`Permissions loaded from "${selectedOption.label}" role`);
        } else {
            console.error("Selected role not found in roleOptions");
            toast.error("Failed to load role permissions");
        }
    } else {
        // If role is cleared, reset module access
        setFormData((prev) => ({
            ...prev,
            roleId: "",
            roleName: "",
        }));
        
        // Reset module access when role is cleared
        setModuleAccess({
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
            paymentcreate: false,
            paymentDelete: false,
            paymentEdit: false,
            timeSheetAccess: false,
            timeSheetViewAll: false,
            timeSheetCreate: false,
            timeSheetDelete: false,
            timeSheetEdit: false
        });
        
        toast.success("Permissions reset");
    }

    if (errors.roleId) {
        setErrors((prev) => ({ ...prev, roleId: "" }));
    }
};
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim()) newErrors.name = "Full name is required";
        if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
        if (!formData.gender) newErrors.gender = "Gender is required";
        if (!formData.departmentId)
            newErrors.departmentId = "Department is required";
        if (!formData.roleId) newErrors.roleId = "Role is required";

        if (isVerifyingEmail) {
            newErrors.loginEmail = "Verifying email, please wait...";
        } else if (!formData.loginEmail?.trim()) {
            newErrors.loginEmail = "Email is required";
        } else if (errors.loginEmail) {
            newErrors.loginEmail = errors.loginEmail;
        } else if (!/\S+@\S+\.\S+/.test(formData.loginEmail)) {
            newErrors.loginEmail = "Email address is invalid";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 4) {
            newErrors.password = "Password must be at least 4 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix the form errors before submitting.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                ...moduleAccess
            };

              console.log("Form Data:", formData);
        console.log("Module Access:", moduleAccess);
        console.log("Final Payload:", payload);

            await axiosInstance.post("/admin/createEmployee", payload);

            toast.success("Employee created successfully!");
            if (onSuccess) {
                onSuccess();
            } else {
                if (role === "ROLE_ADMIN") {
                    navigate("/Admin/EmployeeList");
                }
            }
        } catch (error) {
            console.error("Error creating employee:", error);
            if (error.response?.data?.message) {
                toast.error(`Failed to create employee: ${error.response.data.message}`);
            } else if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
                toast.error("Cannot connect to server. Please check if the backend is running.");
            } else {
                toast.error("Failed to create employee. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (onClose) {
            onClose();
        } else {
            if (role === "ROLE_ADMIN") {
                navigate("/Admin/EmployeeList");
            }
        }
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };



    // Access Toggle Component
    const AccessToggle = ({ field, label, isChecked, onChange }) => {
        const handleToggle = () => {
            onChange(!isChecked);
        };

        return (
            <label
                htmlFor={field}
                className="flex items-center cursor-pointer select-none"
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
                        className={`block w-10 h-6 rounded-full transition-colors ${isChecked ? "bg-blue-600" : "bg-gray-300"
                            }`}
                    ></div>
                    <div
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform ${isChecked ? "translate-x-4" : "translate-x-0"
                            }`}
                    ></div>
                </div>
                <span className="ml-2 text-sm text-gray-700">{label}</span>
            </label>
        );
    };






    // Handle Access Change
    const handleAccessChange = (field, value) => {
        setModuleAccess((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Get Access State
    const getAccess = (field) => {
        return moduleAccess[field] || false;
    };

    // Select All Access
    const handleSelectAllAccess = () => {
        const allAccessTrue = Object.keys(moduleAccess).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setModuleAccess(allAccessTrue);
    };

    // Clear All Access
    const handleClearAllAccess = () => {
        const allAccessFalse = Object.keys(moduleAccess).reduce((acc, key) => {
            acc[key] = false;
            return acc;
        }, {});
        setModuleAccess(allAccessFalse);
    };

    // Module Access Group Component
    const ModuleAccessGroup = ({
        title,
        permissions,
        getAccess,
        handleAccessChange,
    }) => {
        return (
            <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">{title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {permissions.map((perm) => (
                        <AccessToggle
                            key={perm.field}
                            field={perm.field}
                            label={perm.label}
                            isChecked={getAccess(perm.field)}
                            onChange={(isChecked) => handleAccessChange(perm.field, isChecked)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // Select All Access Button Component
    const SelectAllAccessButton = ({ onSelectAll, onClearAll, getAccess }) => {
        return (
            <div className="flex justify-end mb-4">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                        Clear All
                    </button>
                    <button
                        type="button"
                        onClick={onSelectAll}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                        Select All Access
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
                {/* Modal Header */}
                <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                <svg
                                    className="w-5 h-5 text-white"
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
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Create New Employee</h2>
                                <p className="text-green-100 text-sm">
                                    Fill in the employee information below
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                            <svg
                                className="w-5 h-5"
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

                {/* Modal Body */}
                <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-6">
                            {/* Profile Image Section */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Profile Image</h3>
                                    <p className="text-gray-600 text-sm">Upload employee's profile picture</p>
                                </div>

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
                                            src={`data:image/;base64,${formData.profileImageBase64}`}
                                            alt="Profile Preview"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200">
                                            <svg
                                                className="w-12 h-12"
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
                                                Upload Image
                                            </span>
                                        </div>
                                    )}
                                </label>
                                {errors.profileImageBase64 && (
                                    <p className="text-red-500 text-xs text-center">
                                        {errors.profileImageBase64}
                                    </p>
                                )}
                            </div>

                            {/* Personal Information Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <span>Full Name</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.name ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="Enter full name"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs flex items-center gap-1">
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
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <span>Email</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="loginEmail"
                                        value={formData.loginEmail}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.loginEmail ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="Enter email address"
                                    />
                                    {errors.loginEmail && (
                                        <p className="text-red-500 text-xs flex items-center gap-1">
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
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            {errors.loginEmail}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <span>Password</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={isPasswordVisible ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${errors.password ? "border-red-500" : "border-gray-300"
                                                }`}
                                            placeholder="Enter password"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {isPasswordVisible ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3.82 3.82l16.36 16.36" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs flex items-center gap-1">
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
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Phone - Using react-phone-input-2 */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <span>Phone</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`phone-input-wrapper ${errors.phone ? "border-red-500 rounded-lg" : ""}`}>
                                        <PhoneInput
                                            country={"in"}
                                            value={phoneDisplay}
                                            onChange={handlePhoneChange}
                                            enableSearch={true}
                                            placeholder="Enter phone number"
                                            inputClass="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            buttonClass="!border-r-0 !rounded-l"
                                            inputStyle={{
                                                width: "100%",
                                                height: "40px",
                                                borderLeft: "none",
                                                borderTopLeftRadius: "0",
                                                borderBottomLeftRadius: "0",
                                            }}
                                            buttonStyle={{
                                                borderRight: "none",
                                                borderTopRightRadius: "0",
                                                borderBottomRightRadius: "0",
                                                height: "40px",
                                            }}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs flex items-center gap-1">
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
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>


                                {/* Country */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Country
                                    </label>
                                    <Select
                                        name="country"
                                        value={dropdownData.countries.find(
                                            (option) => option.value === formData.country
                                        )}
                                        onChange={handleCountryChange}
                                        options={dropdownData.countries}
                                        placeholder="Select country"
                                        isSearchable
                                        styles={customReactSelectStyles(false)}
                                        menuPosition="fixed"
                                    />
                                </div>

                                {/* State */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        State
                                    </label>
                                    <Select
                                        name="state"
                                        value={dropdownData.states.find(
                                            (option) => option.value === formData.state
                                        )}
                                        onChange={handleStateChange}
                                        options={dropdownData.states}
                                        placeholder="Select state"
                                        isSearchable
                                        isDisabled={!formData.country}
                                        styles={customReactSelectStyles(false)}
                                        menuPosition="fixed"
                                    />
                                </div>

                                {/* City */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        City
                                    </label>
                                    <Select
                                        name="city"
                                        value={dropdownData.cities.find(
                                            (option) => option.value === formData.city
                                        )}
                                        onChange={handleCityChange}
                                        options={dropdownData.cities}
                                        placeholder="Select city"
                                        isSearchable
                                        isDisabled={!formData.state}
                                        styles={customReactSelectStyles(false)}
                                        menuPosition="fixed"
                                    />
                                </div>

                                {/* Address - Keep your existing address field but update the label */}
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Full Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                        placeholder="Enter complete address (street, area, landmark, etc.)"
                                    />
                                </div>

                                {/* Gender */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <span>Gender</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        name="gender"
                                        value={genderOptions.find(
                                            (option) => option.value === formData.gender
                                        )}
                                        onChange={handleGenderChange}
                                        options={genderOptions}
                                        placeholder="Select gender"
                                        isSearchable
                                        styles={customReactSelectStyles(!!errors.gender)}
                                        menuPosition="fixed"
                                    />
                                    {errors.gender && (
                                        <p className="text-red-500 text-xs flex items-center gap-1">
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
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            {errors.gender}
                                        </p>
                                    )}
                                </div>

                                {/* Department */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <span>Department</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        name="departmentId"
                                        value={departmentOptions.find(
                                            (option) => option.value === formData.departmentId
                                        )}
                                        onChange={handleDepartmentChange}
                                        onMenuOpen={loadDepartments}
                                        options={departmentOptions}
                                        placeholder="Select department"
                                        isSearchable
                                        isLoading={isDeptLoading}
                                        styles={customReactSelectStyles(!!errors.departmentId)}
                                        menuPosition="fixed"
                                    />
                                    {errors.departmentId && (
                                        <p className="text-red-500 text-xs flex items-center gap-1">
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
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            {errors.departmentId}
                                        </p>
                                    )}
                                </div>

                                {/* Role */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <span>Role</span>
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        name="roleId"
                                        value={roleOptions.find(
                                            (option) => option.value === formData.roleId
                                        )}
                                        onChange={handleRoleChange}
                                        onMenuOpen={loadRoles}
                                        options={roleOptions}
                                        placeholder="Select role"
                                        isSearchable
                                        isLoading={isRoleLoading}
                                        isDisabled={!formData.departmentId}
                                        styles={customReactSelectStyles(!!errors.roleId)}
                                        menuPosition="fixed"
                                    />
                                    {errors.roleId && (
                                        <p className="text-red-500 text-xs flex items-center gap-1">
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
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            {errors.roleId}
                                        </p>
                                    )}
                                </div>

                                {/* Address
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                        placeholder="Enter address"
                                    />
                                </div> */}

                                {/* Description */}
                                <div className="lg:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                        placeholder="Enter employee description"
                                    />
                                </div>
                            </div>



                            {/* Module Access Section */}
<div className="lg:col-span-2 space-y-4">
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
            </svg>
        </div>
        <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">
                Module Access Permissions
            </h3>
            <p className="text-gray-600 text-sm">
                Set permissions for CRM modules
            </p>
        </div>
    </div>

    {/* Select All Button */}
    <SelectAllAccessButton
        onSelectAll={handleSelectAllAccess}
        onClearAll={handleClearAllAccess}
        getAccess={getAccess}
    />

    <div className="space-y-4">
        {/* Leads Permissions */}
        <ModuleAccessGroup
            title="Leads Permissions"
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

        {/* Customer Permissions */}
        <ModuleAccessGroup
            title="Customer Permissions"
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

        {/* Proposal Permissions */}
        <ModuleAccessGroup
            title="Proposal Permissions"
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

        {/* Proforma Invoice Permissions */}
        <ModuleAccessGroup
            title="Proforma Invoice Permissions"
            permissions={[
                { label: "Access", field: "proformaInvoiceAccess" },
                { label: "View All", field: "proformaInvoiceViewAll" },
                { label: "Create", field: "proformaInvoiceCreate" },
                { label: "Edit", field: "proformaInvoiceEdit" },
                { label: "Delete", field: "proformaInvoiceDelete" },
            ]}
            getAccess={getAccess}
            handleAccessChange={handleAccessChange}
        />

        {/* Invoice Permissions */}
        <ModuleAccessGroup
            title="Invoice Permissions"
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

        {/* Payment Permissions */}
        <ModuleAccessGroup
            title="Payment Permissions"
            permissions={[
                { label: "Access", field: "paymentAccess" },
                { label: "View All", field: "paymentViewAll" },
                { label: "Create", field: "paymentcreate" },
                { label: "Edit", field: "paymentEdit" },
                { label: "Delete", field: "paymentDelete" },
            ]}
            getAccess={getAccess}
            handleAccessChange={handleAccessChange}
        />

        {/* Timesheet Permissions */}
        <ModuleAccessGroup
            title="Timesheet Permissions"
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
    </div>
</div>
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 font-medium flex items-center gap-2 hover:shadow-sm text-sm"
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
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 text-sm"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating...
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
                                    Create Employee
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateEmployeeModal;