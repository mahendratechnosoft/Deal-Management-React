import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";
import {
  FormInput,
  FormTextarea,
  FormPhoneInputFloating,
} from "../../BaseComponet/CustomeFormComponents";
import { showConfirmDialog } from "../../BaseComponet/alertUtils";

function EditAdmin() {
  const { LayoutComponent, role } = useLayout();
  const navigate = useNavigate();
  const { adminId } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    companyEmail: "",
    name: "",
    phone: "",
    address: "",
    companyName: "",
    gstNumber: "",
  });

  const [moduleAccess, setModuleAccess] = useState({
    moduleAccessId: "",
    adminId: "",
    employeeId: null,
    leadAccess: false,
    customerAccess: false,
    proposalAccess: false,
    proformaInvoiceAccess: false,
    invoiceAccess: false,
    paymentAccess: false,
    timeSheetAccess: false,

    donorAccess: false,
    employeeAccess: false,
    settingAccess: false,
    itemAccess: false,

    // Detailed access permissions - add all the new fields here
    leadViewAll: false,
    leadCreate: false,
    leadDelete: false,
    leadEdit: false,

    customerViewAll: false,
    customerCreate: false,
    customerDelete: false,
    customerEdit: false,

    proposalViewAll: false,
    proposalCreate: false,
    proposalDelete: false,
    proposalEdit: false,

    proformaInvoiceViewAll: false,
    proformaInvoiceCreate: false,
    proformaInvoiceDelete: false,
    proformaInvoiceEdit: false,

    invoiceViewAll: false,
    invoiceCreate: false,
    invoiceDelete: false,
    invoiceEdit: false,

    paymentViewAll: false,
    paymentCreate: false,
    paymentDelete: false,
    paymentEdit: false,

    timeSheetViewAll: false,
    timeSheetCreate: false,
    timeSheetDelete: false,
    timeSheetEdit: false,

    taskViewAll: false,
    taskAccess: false,
    taskCreate: false,
    taskDelete: false,
    taskEdit: false,
    //   DONAR ACCESS

    donorViewAll: false,
    donorCreate: false,
    donorDelete: false,
    donorEdit: false,

    itemViewAll: false,
    itemCreate: false,
    itemDelete: false,
    itemEdit: false,

    amcCreate: false,
    amcDelete: false,
    amcEdit: false,
    amcViewAll: false,
    vendorAccess: false,

    vendorAccess: false,
    vendorCreate: false,
    vendorDelete: false,
    vendorEdit: false,
    vendorViewAll: false,

    canCustomerLogin: false,
    canContactPersonLogin: false,
    customerComplianceAccess: false,
    customerComplianceViewAll: false,
    customerComplianceCreate: false,
    customerComplianceDelete: false,
    customerComplianceEdit: false,

    complianceAccess: false,
    complianceCreate: false,
    complianceDelete: false,
    complianceEdit: false,
    complianceViewAll: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!adminId) {
      toast.error("Admin ID not found in URL.");
      navigate("/SuperAdmin/AdminList");
    }
  }, [adminId, navigate]);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!adminId) return;

      setInitialLoading(true);
      try {
        const response = await axiosInstance.get(
          `getAdminInfoAndModuleAccess/${adminId}`
        );
        const { adminInfo, moduleAccess: accessData } = response.data;

        setFormData({
          companyEmail: adminInfo.companyEmail || "",
          name: adminInfo.name || "",
          phone: adminInfo.phone || "",
          address: adminInfo.address || "",
          companyName: adminInfo.companyName || "",
          gstNumber: adminInfo.gstNumber || "",
        });

        if (accessData) {
          setModuleAccess({
            moduleAccessId: accessData.moduleAccessId || "",
            adminId: adminId,
            employeeId: null,
            leadAccess: accessData.leadAccess || false,
            customerAccess: accessData.customerAccess || false,
            proposalAccess: accessData.proposalAccess || false,
            proformaInvoiceAccess: accessData.proformaInvoiceAccess || false,
            invoiceAccess: accessData.invoiceAccess || false,
            paymentAccess: accessData.paymentAccess || false,
            timeSheetAccess: accessData.timeSheetAccess || false,
            taskAccess: accessData.taskAccess || false,
            amcAccess: accessData.amcAccess || false,
            vendorAccess: accessData.vendorAccess || false,

            donorAccess: accessData.donorAccess || false,
            employeeAccess: accessData.employeeAccess || false,
            settingAccess: accessData.settingAccess || false,
            itemAccess: accessData.itemAccess || false,

            canCustomerLogin: accessData.canCustomerLogin || false,
            canContactPersonLogin: accessData.canContactPersonLogin || false,
            customerComplianceAccess:
              accessData.customerComplianceAccess || false,
            customerComplianceViewAll:
              accessData.customerComplianceViewAll || false,
            customerComplianceCreate:
              accessData.customerComplianceCreate || false,
            customerComplianceDelete:
              accessData.customerComplianceDelete || false,
            customerComplianceEdit: accessData.customerComplianceEdit || false,

            complianceAccess: accessData.complianceAccess || false,
          });
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to fetch admin details. Please try again.");
        navigate("/SuperAdmin/AdminList");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAdminData();
  }, [adminId, navigate]);

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

  const handleAccessChange = (field, value) => {
    setModuleAccess((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // If "canCustomerLogin" is turned OFF, set all related permissions to false
      if (field === "canCustomerLogin" && !value) {
        updated.canContactPersonLogin = false;
        updated.customerComplianceAccess = false;
        updated.customerComplianceViewAll = false;
        updated.customerComplianceCreate = false;
        updated.customerComplianceDelete = false;
        updated.customerComplianceEdit = false;
      }

      return updated;
    });
  };

  const handleClearAllAccess = () => {
    setModuleAccess((prev) => ({
      ...prev,
      leadAccess: false,
      customerAccess: false,
      proposalAccess: false,
      proformaInvoiceAccess: false,
      invoiceAccess: false,
      paymentAccess: false,
      timeSheetAccess: false,
      taskAccess: false,
      amcAccess: false,
      vendorAccess: false,

      donorAccess: false,
      employeeAccess: false,
      settingAccess: false,
      itemAccess: false,

      canCustomerLogin: false,
      canContactPersonLogin: false,
      customerComplianceAccess: false,
      customerComplianceViewAll: false,
      customerComplianceCreate: false,
      customerComplianceDelete: false,
      customerComplianceEdit: false,

      complianceAccess:false,
    }));
    toast.success("All permissions cleared");
  };

  const handleSetAllAccess = () => {
    setModuleAccess((prev) => ({
      ...prev,
      leadAccess: true,
      customerAccess: true,
      proposalAccess: true,
      proformaInvoiceAccess: true,
      invoiceAccess: true,
      paymentAccess: true,
      timeSheetAccess: true,
      taskAccess: true,
      donorAccess: true,
      employeeAccess: true,
      settingAccess: true,
      itemAccess: true,
      amcAccess: true,

      vendorAccess: true,

      canCustomerLogin: true,
      canContactPersonLogin: true,
      customerComplianceAccess: true,
      customerComplianceViewAll: true,
      customerComplianceCreate: true,
      customerComplianceDelete: true,
      customerComplianceEdit: true,

      complianceAccess:true,
    }));
    toast.success("All permissions granted");
  };

  const validateForm = () => {
    const newErrors = {};

    // if (!formData.name?.trim()) newErrors.name = "Admin name is required";
    if (!formData.companyEmail?.trim())
      newErrors.companyEmail = "Company email is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required";
    if (!formData.companyName?.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.gstNumber?.trim())
      newErrors.gstNumber = "GST number is required";

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
        adminId: adminId,
        companyEmail: formData.companyEmail,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        moduleAccess: {
          ...moduleAccess, // Keep existing moduleAccess values

          // Force these detailed permissions to ALWAYS be true
          leadViewAll: true,
          leadCreate: true,
          leadDelete: true,
          leadEdit: true,

          customerViewAll: true,
          customerCreate: true,
          customerDelete: true,
          customerEdit: true,

          proposalViewAll: true,
          proposalCreate: true,
          proposalDelete: true,
          proposalEdit: true,

          proformaInvoiceViewAll: true,
          proformaInvoiceCreate: true,
          proformaInvoiceDelete: true,
          proformaInvoiceEdit: true,

          invoiceViewAll: true,
          invoiceCreate: true,
          invoiceDelete: true,
          invoiceEdit: true,

          paymentViewAll: true,
          paymentCreate: true,
          paymentDelete: true,
          paymentEdit: true,

          timeSheetViewAll: true,
          timeSheetCreate: true,
          timeSheetDelete: true,
          timeSheetEdit: true,

          donorViewAll: true,
          donorCreate: true,
          donorDelete: true,
          donorEdit: true,

          itemViewAll: true,
          itemCreate: true,
          itemDelete: true,
          itemEdit: true,

          taskViewAll: true,

          taskCreate: true,
          taskDelete: true,
          taskEdit: true,

          amcCreate: true,
          amcDelete: true,
          amcEdit: true,
          amcViewAll: true,

          vendorCreate: true,
          vendorDelete: true,
          vendorEdit: true,
          vendorViewAll: true,

          complianceCreate: true,
          complianceDelete: true,
          complianceEdit: true,
          complianceViewAll: true,
        },
      };

      await axiosInstance.put("updateAdminInfoWithAccess", payload);
      toast.success("Admin updated successfully!");
      navigate("/SuperAdmin/AdminList");
    } catch (error) {
      console.error("Error updating admin:", error);
      if (error.response?.data?.message) {
        toast.error(`Failed to update admin: ${error.response.data.message}`);
      } else {
        toast.error("Failed to update admin. Please try again.");
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
      navigate("/SuperAdmin/AdminList");
    }
  };

  const getAccess = (field) => {
    return moduleAccess ? moduleAccess[field] : false;
  };

  if (initialLoading) {
    return (
      <LayoutComponent>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <div className="skeleton h-4 w-24 rounded mb-2"></div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                <div className="space-y-1">
                  <div className="skeleton h-5 w-48 rounded"></div>
                  <div className="skeleton h-3 w-64 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="skeleton h-8 w-20 rounded"></div>
                  <div className="skeleton h-8 w-32 rounded"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="skeleton h-14 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
        <div className="">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-1">
              <button
                onClick={() => navigate("/SuperAdmin/AdminList")}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Admins
              </button>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Admin</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Update Admin
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Admin Information */}
            <div className="lg:col-span-2 space-y-4 ">
              <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Admin Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* <FormInput
                      label="Admin Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required={true}
                      error={errors.name}
                      background="white"
                    /> */}
                  <FormInput
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required={true}
                    error={errors.companyName}
                    background="white"
                  />

                  <FormInput
                    label="Company Email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    required={true}
                    error={errors.companyEmail}
                    background="white"
                  />

                  <FormPhoneInputFloating
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    required={true}
                    error={errors.phone}
                    background="white"
                  />

                  <FormInput
                    label="GST Number"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    required={true}
                    error={errors.gstNumber}
                    background="white"
                  />

                  <div className="md:col-span-2">
                    <FormTextarea
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      background="white"
                    />

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 transition-colors mb-2 mt-2">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-600"
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
                          <span className="text-sm font-medium text-gray-800">
                            Set Customer Login
                          </span>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={getAccess("canCustomerLogin")}
                              onChange={(e) =>
                                handleAccessChange(
                                  "canCustomerLogin",
                                  e.target.checked
                                )
                              }
                              className="sr-only"
                            />
                            <div
                              className={`block w-10 h-5 rounded-full transition-colors ${
                                getAccess("canCustomerLogin")
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <div
                              className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform ${
                                getAccess("canCustomerLogin")
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>

                           <ModuleAccessToggle
                              title="Contact Person Login"
                              field="canContactPersonLogin"
                              isChecked={getAccess("canContactPersonLogin")}
                              onChange={(isChecked) =>
                                handleAccessChange(
                                  "canContactPersonLogin",
                                  isChecked
                                )
                              }
                            />

                      {/* Customer Login Sub-permissions - Conditionally shown */}
                      {getAccess("canCustomerLogin") && (
                        <div className="mt-3 p-4 border border-gray-200 rounded bg-blue-50">
                          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
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
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            Customer Login Permissions
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       

                            <ModuleAccessToggle
                              title="Compliance Access"
                              field="customerComplianceAccess"
                              isChecked={getAccess("customerComplianceAccess")}
                              onChange={(isChecked) =>
                                handleAccessChange(
                                  "customerComplianceAccess",
                                  isChecked
                                )
                              }
                            />

                            <ModuleAccessToggle
                              title="View All Compliance"
                              field="customerComplianceViewAll"
                              isChecked={getAccess("customerComplianceViewAll")}
                              onChange={(isChecked) =>
                                handleAccessChange(
                                  "customerComplianceViewAll",
                                  isChecked
                                )
                              }
                            />

                            <ModuleAccessToggle
                              title="Create Compliance"
                              field="customerComplianceCreate"
                              isChecked={getAccess("customerComplianceCreate")}
                              onChange={(isChecked) =>
                                handleAccessChange(
                                  "customerComplianceCreate",
                                  isChecked
                                )
                              }
                            />

                            <ModuleAccessToggle
                              title="Delete Compliance"
                              field="customerComplianceDelete"
                              isChecked={getAccess("customerComplianceDelete")}
                              onChange={(isChecked) =>
                                handleAccessChange(
                                  "customerComplianceDelete",
                                  isChecked
                                )
                              }
                            />

                            <ModuleAccessToggle
                              title="Edit Compliance"
                              field="customerComplianceEdit"
                              isChecked={getAccess("customerComplianceEdit")}
                              onChange={(isChecked) =>
                                handleAccessChange(
                                  "customerComplianceEdit",
                                  isChecked
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Module Access */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Module Access
                    </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleClearAllAccess}
                      className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded bg-white hover:bg-red-50 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      onClick={handleSetAllAccess}
                      className="px-2 py-1 text-xs border border-green-300 text-green-700 rounded bg-white hover:bg-green-50 transition-colors"
                    >
                      Set All
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* First row - 2 buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <ModuleAccessToggle
                      title="Leads"
                      field="leadAccess"
                      isChecked={getAccess("leadAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("leadAccess", isChecked)
                      }
                    />
                    <ModuleAccessToggle
                      title="Customer"
                      field="customerAccess"
                      isChecked={getAccess("customerAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("customerAccess", isChecked)
                      }
                    />
                  </div>
                  {/* Second row - 2 buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <ModuleAccessToggle
                      title="Proposal"
                      field="proposalAccess"
                      isChecked={getAccess("proposalAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("proposalAccess", isChecked)
                      }
                    />
                    <ModuleAccessToggle
                      title="Proforma Invoice"
                      field="proformaInvoiceAccess"
                      isChecked={getAccess("proformaInvoiceAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("proformaInvoiceAccess", isChecked)
                      }
                    />
                  </div>
                  {/* Third row - 2 buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <ModuleAccessToggle
                      title="Invoice"
                      field="invoiceAccess"
                      isChecked={getAccess("invoiceAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("invoiceAccess", isChecked)
                      }
                    />
                    <ModuleAccessToggle
                      title="Payment"
                      field="paymentAccess"
                      isChecked={getAccess("paymentAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("paymentAccess", isChecked)
                      }
                    />
                  </div>
                  {/* Fourth row - 2 buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <ModuleAccessToggle
                      title="TimeSheet"
                      field="timeSheetAccess"
                      isChecked={getAccess("timeSheetAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("timeSheetAccess", isChecked)
                      }
                    />
                    <ModuleAccessToggle
                      title="Donor"
                      field="donorAccess"
                      isChecked={getAccess("donorAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("donorAccess", isChecked)
                      }
                    />
                  </div>
                  {/* Fifth row - 2 buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <ModuleAccessToggle
                      title="Employee"
                      field="employeeAccess"
                      isChecked={getAccess("employeeAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("employeeAccess", isChecked)
                      }
                    />
                    <ModuleAccessToggle
                      title="Item"
                      field="itemAccess"
                      isChecked={getAccess("itemAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("itemAccess", isChecked)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <ModuleAccessToggle
                      title="Task"
                      field="taskAccess"
                      isChecked={getAccess("taskAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("taskAccess", isChecked)
                      }
                    />
                    <ModuleAccessToggle
                      title="Setting"
                      field="settingAccess"
                      isChecked={getAccess("settingAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("settingAccess", isChecked)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <ModuleAccessToggle
                      title="Amc"
                      field="amcAccess"
                      isChecked={getAccess("amcAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("amcAccess", isChecked)
                      }
                    />
                    <ModuleAccessToggle
                      title="Vendor"
                      field="vendorAccess"
                      isChecked={getAccess("vendorAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("vendorAccess", isChecked)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <ModuleAccessToggle
                      title="compliance"
                      field="complianceAccess"
                      isChecked={getAccess("complianceAccess")}
                      onChange={(isChecked) =>
                        handleAccessChange("complianceAccess", isChecked)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}

function ModuleAccessToggle({ title, field, isChecked, onChange }) {
  const handleToggle = () => {
    onChange(!isChecked);
  };

  return (
    <div className="flex items-center justify-between p-2 border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 transition-colors">
      <span className="text-sm font-medium text-gray-800">{title}</span>
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleToggle}
            className="sr-only"
          />
          <div
            className={`block w-10 h-5 rounded-full transition-colors ${
              isChecked ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform ${
              isChecked ? "translate-x-5" : "translate-x-0"
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
}

export default EditAdmin;
