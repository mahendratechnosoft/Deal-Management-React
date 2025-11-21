import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-hot-toast";
import axiosInstance from "../../BaseComponet/axiosInstance";
import { useLayout } from "../../Layout/useLayout";
import { FormInput, FormSelect } from "../../BaseComponet/CustomeFormComponents";

function EditDonar() {
    const navigate = useNavigate();
    const { donorId } = useParams();
    const [loading, setLoading] = useState(false);
    const { LayoutComponent, role } = useLayout();
    const [activeTab, setActiveTab] = useState("personal");

    const [formData, setFormData] = useState({
        // Personal Information
        name: "",
        age: "",
        dob: "",
        address: "",
        phone: "",
        adharCardNo: "",
        marriedStatus: "",
        kidsMale: "",
        kidsFemale: "",
        height: "",
        weight: "",
        religion: "",
        bloodGroup: "",
        skinColor:"",

        // Medical Information
        bsl: "",
        hiv: "",
        hbsag: "",
        vdrl: "",
        hcv: "",
        hbElectrophoresis: "",
        srCreatinine: "",
        cmv: "",

        // Family Information
        brotherAge: "",
        brotherProfession: "",
        brotherKids: "",
        brotherIllness: "",
        sisterAge: "",
        sisterProfession: "",
        sisterKids: "",
        sisterIllness: "",

        // Medical History
        hospitalAdmissionStatus: false,
        hospitalAdmissionReason: "",
        surgeryStatus: false,
        surgeryReason: "",
        bloodDonationStatus: false,
        bloodDonationReason: "",
        prolongedIllnessStatus: false,
        prolongedIllnessReason: "",

        status: ""
    });

    const [errors, setErrors] = useState({});

    const tabs = [
        { id: "personal", label: "Personal Information" },
        { id: "family", label: "Family Information" },
        { id: "history", label: "Medical History" },
    ];

    const statusOptions = [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
    ];

    useEffect(() => {
        fetchDonorData();
    }, [donorId]);

    const fetchDonorData = async () => {
        try {
            const res = await axiosInstance.get(`getDonorById/${donorId}`);
            const d = res.data;

            setFormData({
                // Personal
                name: d.name || "",
                age: d.age || "",
                dob: d.dateOfBirth || "",
                address: d.address || "",
                city: d.city||"",
                pincode: d.pincode || "",
                phone: d.phoneNumber || "",
                adharCardNo: d.adharCardNo || "",
                marriedStatus: d.marriedStatus || "",
                kidsMale: d.maleKidsCount || "",
                kidsFemale: d.femaleKidsCount || "",
                height: d.height || "",
                weight: d.weight || "",
                region: d.religion || "",
                bloodGroup: d.bloodGroup || "",
                skinColor:d.skinColor || "",

                // Medical
                bsl: d.bsl || "",
                hiv: d.hiv || "",
                hbsag: d.hbsag || "",
                vdrl: d.vdrl || "",
                hcv: d.hcv || "",
                hbElectrophoresis: d.hbelectrophoresis || "",
                srCreatinine: d.srcreatinine || "",
                cmv: d.cmv || "",

                // Family Info
                brotherAge: d.brotherAge || "",
                brotherProfession: d.brotherProfession || "",
                brotherKids: d.brotherKidsCount || "",
                brotherIllness: d.brotherIllness || "",
                sisterAge: d.sisterAge || "",
                sisterProfession: d.sisterProfession || "",
                sisterKids: d.sisterKidsCount || "",
                sisterIllness: d.sisterIllness || "",

                // Medical History
                hospitalAdmissionStatus: d.hospitalAdmissionStatus || false,
                hospitalAdmissionReason: d.hospitalAdmissionReason || "",
                surgeryStatus: d.surgeryStatus || false,
                surgeryReason: d.surgeryReason || "",
                bloodDonationStatus: d.bloodDonationStatus || false,
                bloodDonationReason: d.bloodDonationReason || "",
                prolongedIllnessStatus: d.prolongedIllnessStatus || false,
                prolongedIllnessReason: d.prolongedIllnessReason || "",

                status: d.status || ""
            });

        } catch (err) {
            console.error("Failed to fetch donor data", err);
            toast.error("Failed to fetch donor data");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : "",
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim())
            newErrors.name = "Name is required";

       

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const submitData = {
                donorId: donorId,
                adminId: formData.adminId, // You might want to get this dynamically
                name: formData.name,
                age: formData.age,
                dateOfBirth: formData.dob,
                address: formData.address,
                phoneNumber: formData.phone,
                adharCardNo: formData.adharCardNo,
                marriedStatus: formData.marriedStatus,
                maleKidsCount: formData.kidsMale,
                femaleKidsCount: formData.kidsFemale,
                height: formData.height,
                weight: formData.weight,
                religion: formData.religion,
                booldGroup: formData.bloodGroup,
                skinColor:formData.skinColor,
                bsl: formData.bsl,
                hiv: formData.hiv,
                hbsag: formData.hbsag,
                vdrl: formData.vdrl,
                hcv: formData.hcv,
                hbelectrophoresis: formData.hbElectrophoresis,
                srcreatinine: formData.srCreatinine,
                cmv: formData.cmv,
                brotherAge: formData.brotherAge,
                brotherProfession: formData.brotherProfession,
                brotherKidsCount: formData.brotherKids,
                brotherIllness: formData.brotherIllness,
                sisterAge: formData.sisterAge,
                sisterProfession: formData.sisterProfession,
                sisterKidsCount: formData.sisterKids,
                sisterIllness: formData.sisterIllness,
                hospitalAdmissionStatus: formData.hospitalAdmissionStatus,
                hospitalAdmissionReason: formData.hospitalAdmissionReason,
                surgeryStatus: formData.surgeryStatus,
                surgeryReason: formData.surgeryReason,
                bloodDonationStatus: formData.bloodDonationStatus,
                bloodDonationReason: formData.bloodDonationReason,
                prolongedIllnessStatus: formData.prolongedIllnessStatus,
                prolongedIllnessReason: formData.prolongedIllnessReason,
                status: formData.status,
                city: formData.city, // You might want to make this dynamic
                pincode: formData.pincode // You might want to make this dynamic
            };

            await axiosInstance.put("updateDonor", submitData);
            toast.success("Donor updated successfully!");

            if (role === "ROLE_ADMIN") {
                navigate("/Admin/DonarList");
            } else if (role === "ROLE_EMPLOYEE") {
                navigate("/Employee/DonarList");
            }
        } catch (error) {
            console.error("Error updating donor:", error);
            if (error.response?.data?.message) {
                toast.error(`Failed to update donor: ${error.response.data.message}`);
            } else {
                toast.error("Failed to update donor. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (
            window.confirm(
                "Are you sure you want to cancel? Any unsaved changes will be lost."
            )
        ) {
            if (role === "ROLE_ADMIN") {
                navigate("/Admin/DonarList");
            } else if (role === "ROLE_EMPLOYEE") {
                navigate("/Employee/DonarList");
            }
        }
    };

    const renderPersonalInformation = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                required
                error={errors.name}
            />

            <FormInput
                label="Age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                type="number"
                required
                error={errors.age}
            />

            <FormInput
                label="Date of Birth"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                type="date"
                error={errors.dob}
            />

            

            <FormInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                type="text"
                error={errors.address}
            />

              <FormInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                type="text"
                error={errors.pincode}
            />

                <FormInput
                label="Pin Code"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                type="text"
                error={errors.pincode}
            />

            <FormInput
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="text"
                error={errors.phone}
            />

            <FormInput
                label="Adhar Card No"
                name="adharCardNo"
                value={formData.adharCardNo}
                onChange={handleChange}
                type="text"
                error={errors.adharCardNo}
            />

            <FormInput
                label="Married Status"
                name="marriedStatus"
                value={formData.marriedStatus}
                onChange={handleChange}
                type="text"
                error={errors.marriedStatus}
            />

            <FormInput
                label="Kids Male"
                name="kidsMale"
                value={formData.kidsMale}
                onChange={handleChange}
                type="number"
                error={errors.kidsMale}
            />

            <FormInput
                label="Kids Female"
                name="kidsFemale"
                value={formData.kidsFemale}
                onChange={handleChange}
                type="number"
                error={errors.kidsFemale}
            />

            <FormInput
                label="Height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                type="number"
                step="0.1"
                error={errors.height}
            />

            <FormInput
                label="Weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                type="number"
                step="0.1"
                error={errors.weight}
            />

               <FormInput
                label="Skin Color"
                name="skinColor"
                value={formData.skinColor}
                onChange={handleChange}
                type="text"
                error={errors.skinColor}
            />

            <FormInput
                label="Religion"
                name="region"
                value={formData.region}
                onChange={handleChange}
                type="text"
                error={errors.region}
            />

            <FormInput
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                type="text"
                error={errors.bloodGroup}
            />

            <FormInput
                label="BSL"
                name="bsl"
                value={formData.bsl}
                onChange={handleChange}
                type="text"
                error={errors.bsl}
            />

            <FormInput
                label="HIV 1 & 2"
                name="hiv"
                value={formData.hiv}
                onChange={handleChange}
                type="text"
                error={errors.hiv}
            />

            <FormInput
                label="HBSAG"
                name="hbsag"
                value={formData.hbsag}
                onChange={handleChange}
                type="text"
                error={errors.hbsag}
            />

            <FormInput
                label="VDRL"
                name="vdrl"
                value={formData.vdrl}
                onChange={handleChange}
                type="text"
                error={errors.vdrl}
            />

            <FormInput
                label="HCV"
                name="hcv"
                value={formData.hcv}
                onChange={handleChange}
                type="text"
                error={errors.hcv}
            />

            <FormInput
                label="HB Electrophoresis"
                name="hbElectrophoresis"
                value={formData.hbElectrophoresis}
                onChange={handleChange}
                type="text"
                error={errors.hbElectrophoresis}
            />

            <FormInput
                label="SR. Creatinine"
                name="srCreatinine"
                value={formData.srCreatinine}
                onChange={handleChange}
                type="text"
                error={errors.srCreatinine}
            />

            <FormInput
                label="CMV"
                name="cmv"
                value={formData.cmv}
                onChange={handleChange}
                type="text"
                error={errors.cmv}
            />
        </div>
    );

    const renderFamilyInformation = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <h3 className="text-lg font-semibold text-gray-900 md:col-span-4">Brother Information</h3>
                <FormInput
                    label="Age"
                    name="brotherAge"
                    value={formData.brotherAge}
                    onChange={handleChange}
                    type="number"
                    error={errors.brotherAge}
                />
                <FormInput
                    label="Profession"
                    name="brotherProfession"
                    value={formData.brotherProfession}
                    onChange={handleChange}
                    type="text"
                    error={errors.brotherProfession}
                />
                <FormInput
                    label="Kids"
                    name="brotherKids"
                    value={formData.brotherKids}
                    onChange={handleChange}
                    type="number"
                    error={errors.brotherKids}
                />
                <FormInput
                    label="Any Illness DM/HTN/Any Other"
                    name="brotherIllness"
                    value={formData.brotherIllness}
                    onChange={handleChange}
                    type="text"
                    error={errors.brotherIllness}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <h3 className="text-lg font-semibold text-gray-900 md:col-span-4">Sister Information</h3>
                <FormInput
                    label="Age"
                    name="sisterAge"
                    value={formData.sisterAge}
                    onChange={handleChange}
                    type="number"
                    error={errors.sisterAge}
                />
                <FormInput
                    label="Profession"
                    name="sisterProfession"
                    value={formData.sisterProfession}
                    onChange={handleChange}
                    type="text"
                    error={errors.sisterProfession}
                />
                <FormInput
                    label="Kids"
                    name="sisterKids"
                    value={formData.sisterKids}
                    onChange={handleChange}
                    type="number"
                    error={errors.sisterKids}
                />
                <FormInput
                    label="Any Illness DM/HTN/Any Other"
                    name="sisterIllness"
                    value={formData.sisterIllness}
                    onChange={handleChange}
                    type="text"
                    error={errors.sisterIllness}
                />
            </div>
        </div>
    );

    const renderMedicalHistory = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="text-lg font-semibold text-gray-900 md:col-span-2">
                Hospital Admission
            </h3>

            <FormSelect
                label="Hospital Admission Yes/No"
                name="hospitalAdmissionStatus"
                value={statusOptions.find(
                    (o) => o.value === formData.hospitalAdmissionStatus
                )}
                onChange={(option) =>
                    handleSelectChange(option, { name: "hospitalAdmissionStatus" })
                }
                options={statusOptions}
            />

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                </label>
                <textarea
                    name="hospitalAdmissionReason"
                    value={formData.hospitalAdmissionReason}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    placeholder="Enter hospital admission reason"
                />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 md:col-span-2">
                Surgery
            </h3>

            <FormSelect
                label="Surgery Status"
                name="surgeryStatus"
                value={statusOptions.find(o => o.value === formData.surgeryStatus)}
                options={statusOptions}
                onChange={(option) =>
                    handleSelectChange(option, { name: "surgeryStatus" })
                }
            />

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                </label>
                <textarea
                    name="surgeryReason"
                    value={formData.surgeryReason}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    placeholder="Enter surgery reason"
                />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 md:col-span-2">
                H/O Blood Donation/Transfusion
            </h3>

            <FormSelect
                label="H/O Blood Donation/Transfusion"
                name="bloodDonationStatus"
                value={statusOptions.find(o => o.value === formData.bloodDonationStatus)}
                options={statusOptions}
                onChange={(option) =>
                    handleSelectChange(option, { name: "bloodDonationStatus" })
                }
            />

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                </label>
                <textarea
                    name="bloodDonationReason"
                    value={formData.bloodDonationReason}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    placeholder="Enter blood donation reason"
                />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 md:col-span-2">
                H/O Prolonged Illness
            </h3>

            <FormSelect
                label="Prolonged Illness Status"
                name="prolongedIllnessStatus"
                value={statusOptions.find(o => o.value === formData.prolongedIllnessStatus)}
                options={statusOptions}
                onChange={(option) =>
                    handleSelectChange(option, { name: "prolongedIllnessStatus" })
                }
            />

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                </label>
                <textarea
                    name="prolongedIllnessReason"
                    value={formData.prolongedIllnessReason}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    placeholder="Enter prolonged illness reason"
                />
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "personal":
                return renderPersonalInformation();
            case "family":
                return renderFamilyInformation();
            case "history":
                return renderMedicalHistory();
            default:
                return renderPersonalInformation();
        }
    };

    return (
        <LayoutComponent>
            <div className="p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto h-[90vh] overflow-y-auto CRM-scroll-width-none">
                <div className="">
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={() => {
                                if (role === "ROLE_ADMIN") {
                                    navigate("/Admin/donarList");
                                } else if (role === "ROLE_EMPLOYEE") {
                                    navigate("/Employee/donarList");
                                }
                            }}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
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
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back to Donor List
                        </button>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Edit Donor</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="editDonorForm"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    "Updating..."
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
                                        Update Donor
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto h-[72vh] overflow-y-auto CRM-scroll-width-none">
                    <div className="p-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {/* Tabs Navigation */}
                            <div className="border-b border-gray-200">
                                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500">
                                    {tabs.map((tab) => (
                                        <li key={tab.id} className="me-2">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`inline-block p-4 rounded-t-lg transition-colors duration-200 ${activeTab === tab.id
                                                    ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                                                    : "hover:text-gray-700 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <form
                                id="editDonorForm"
                                onSubmit={handleSubmit}
                                className="p-6"
                            >
                                <div className="space-y-6">
                                    {renderTabContent()}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutComponent>
    );
}

export default EditDonar;