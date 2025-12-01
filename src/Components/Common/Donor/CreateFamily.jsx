import React, { useState, useEffect } from "react";
import { FormInput, FormSelect, FormTextarea } from "../../BaseComponet/CustomeFormComponents";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";

const CreateFamily = ({ isOpen, onClose, onSuccess, donorId }) => {
    const [formData, setFormData] = useState({
        referHospital: "",
        referHospitalAddress: "",
        referDoctor: "",
        referDoctorContactNumber: "",
        husbandName: "",
        husbandMobile: "",
        husbandHeight: "",
        husbandWeight: "",
        husbandBloodGroup: "",
        husbandSkinColor: "",
        husbandEyeColor: "",
        husbandReligion: "",
        husbandEducation: "",
        husbandDistrict: "",
        husbandCountry: "",
        husbandGenticIllness: "",
        wifeName: "",
        wifeMobile: "",
        wifeHeight: "",
        wifeWeight: "",
        wifeBloodGroup: "",
        wifeSkinColor: "",
        wifeEyeColor: "",
        wifeReligion: "",
        wifeEducation: "",
        wifeDistrict: "",
        wifeCountry: "",
        wifeGenticIllness: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                referHospital: "",
                referHospitalAddress: "",
                referDoctor: "",
                referDoctorContactNumber: "",
                husbandName: "",
                husbandMobile: "",
                husbandHeight: "",
                husbandWeight: "",
                husbandBloodGroup: "",
                husbandSkinColor: "",
                husbandEyeColor: "",
                husbandReligion: "",
                husbandEducation: "",
                husbandDistrict: "",
                husbandCountry: "",
                husbandGenticIllness: "",
                wifeName: "",
                wifeMobile: "",
                wifeHeight: "",
                wifeWeight: "",
                wifeBloodGroup: "",
                wifeSkinColor: "",
                wifeEyeColor: "",
                wifeReligion: "",
                wifeEducation: "",
                wifeDistrict: "",
                wifeCountry: "",
                wifeGenticIllness: ""
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Note: If backend needs donorId, include it here: { donorId, ...formData }
            // Based on your JSON payload, it seems only form data is sent.
            const apiData = {
                ...formData
            };

            // Call Create API
            const response = await axiosInstance.post("createFamilyInfo", apiData);

            console.log("Family created successfully:", response.data);
            toast.success("Family information created successfully!");

            // Call success callback
            onSuccess && onSuccess(response.data);

            // Close modal
            onClose();

        } catch (error) {
            console.error("Error creating family:", error);
            const msg = error.response?.data?.message || "Error creating family information.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose && onClose();
    };

    const skinColorOptions = [{ value: "Fair", label: "Fair" }, { value: "Wheatish", label: "Wheatish" }, { value: "Dark", label: "Dark" }];
    const eyeColorOptions = [{ value: "Brown", label: "Brown" }, { value: "Black", label: "Black" }, { value: "Gray", label: "Gray" }, { value: "Blue", label: "Blue" }, { value: "Green", label: "Green" }, { value: "Hazel", label: "Hazel" }, { value: "Amber", label: "Amber" }];
    const educationOptions = [{ value: "UnderGraduation", label: "Under Graduation" }, { value: "PostGraduation", label: "Post Graduation" }, { value: "Masters", label: "Masters" }, { value: "Graduated", label: "Graduated" }];
    const bloodGroupOptions = [{ value: "O+", label: "O+" }, { value: "O-", label: "O-" }, { value: "A+", label: "A+" }, { value: "A-", label: "A-" }, { value: "B-", label: "B-" }, { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },];

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : "",
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Sticky Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Create New Family</h2>
                        {/* Only show Donor ID if relevant for creation context */}
                        {donorId && (
                            <span className="text-sm text-gray-500 mt-1 inline-block">
                                Linking to Donor ID: <span className="font-medium text-gray-700">{donorId}</span>
                            </span>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-all text-sm font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                "Save Family"
                            )}
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="overflow-y-auto p-6 flex-grow bg-gray-50">
                    <form id="createFamilyForm" onSubmit={handleSubmit} className="space-y-6">

                        {/* Referral Information */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Referral Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Referral Hospital" name="referHospital" value={formData.referHospital} onChange={handleChange} type="text" placeholder="Enter hospital name" disabled={isSubmitting} />
                                <FormInput label="Hospital Address" name="referHospitalAddress" value={formData.referHospitalAddress} onChange={handleChange} type="text" placeholder="Enter hospital Address" disabled={isSubmitting} />
                                <FormInput label="Referral Doctor" name="referDoctor" value={formData.referDoctor} onChange={handleChange} type="text" placeholder="Enter doctor name" disabled={isSubmitting} />
                                <FormInput label="Doctor Contact No." name="referDoctorContactNumber" value={formData.referDoctorContactNumber} onChange={handleChange} type="text" placeholder="Enter doctor contact" disabled={isSubmitting} />
                            </div>
                        </div>

                        {/* Husband Information */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">Husband Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormInput label="Name" name="husbandName" value={formData.husbandName} onChange={handleChange} type="text" placeholder="Enter Name" disabled={isSubmitting} />
                                <FormInput label="Contact Number" name="husbandMobile" value={formData.husbandMobile} onChange={handleChange} type="text" placeholder="Enter Contact Number" disabled={isSubmitting} />
                                <FormInput label="Height" name="husbandHeight" value={formData.husbandHeight} onChange={handleChange} type="text" placeholder="Enter height" disabled={isSubmitting} />

                                <FormInput label="Weight" name="husbandWeight" value={formData.husbandWeight} onChange={handleChange} type="text" placeholder="Enter weight" disabled={isSubmitting} />
                                <FormSelect label="Blood Group" name="husbandBloodGroup" value={bloodGroupOptions.find((o) => o.value === formData.husbandBloodGroup)} onChange={(option) =>
                                    handleSelectChange(option, { name: "husbandBloodGroup" })} options={bloodGroupOptions} placeholder="Select Blood Group" />
                                <FormSelect label="Skin Color" name="husbandSkinColor" value={skinColorOptions.find((o) => o.value === formData.husbandSkinColor)} onChange={(option) =>
                                    handleSelectChange(option, { name: "husbandSkinColor" })} options={skinColorOptions} placeholder="Select Skin Color" />


                                <FormSelect label="Eye Color" name="husbandEyeColor" value={eyeColorOptions.find((o) => o.value === formData.husbandEyeColor)} onChange={(option) =>
                                    handleSelectChange(option, { name: "husbandEyeColor" })} options={eyeColorOptions} placeholder="Select Eye Color" />
                                <FormInput label="Religion" name="husbandReligion" value={formData.husbandReligion} onChange={handleChange} type="text" placeholder="Enter religion" disabled={isSubmitting} />
                                <FormSelect label="Education" name="husbandEducation" value={educationOptions.find((o) => o.value === formData.husbandEducation)} onChange={(option) =>
                                    handleSelectChange(option, { name: "husbandEducation" })} options={educationOptions} />

                                <FormInput label="District" name="husbandDistrict" value={formData.husbandDistrict} onChange={handleChange} type="text" placeholder="Enter district" disabled={isSubmitting} />
                                <FormInput label="Country" name="husbandCountry" value={formData.husbandCountry} onChange={handleChange} type="text" placeholder="Enter country" disabled={isSubmitting} />

                                <div className="md:col-span-3">
                                    <FormTextarea label="Genetic Illness" name="husbandGenticIllness" value={formData.husbandGenticIllness} onChange={handleChange} placeholder="Enter any genetic illness details" rows={3} disabled={isSubmitting} />
                                </div>
                            </div>
                        </div>

                        {/* Wife Information */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-pink-800 mb-4 border-b pb-2">Wife Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormInput label="Name" name="wifeName" value={formData.wifeName} onChange={handleChange} type="text" placeholder="Enter Name" disabled={isSubmitting} />
                                <FormInput label="Contact Number" name="wifeMobile" value={formData.wifeMobile} onChange={handleChange} type="text" placeholder="Enter Contact Number" disabled={isSubmitting} />
                                <FormInput label="Height" name="wifeHeight" value={formData.wifeHeight} onChange={handleChange} type="text" placeholder="Enter height" disabled={isSubmitting} />

                                <FormInput label="Weight" name="wifeWeight" value={formData.wifeWeight} onChange={handleChange} type="text" placeholder="Enter weight" disabled={isSubmitting} />
                                <FormSelect label="Blood Group" name="wifeBloodGroup" value={bloodGroupOptions.find((o) => o.value === formData.wifeBloodGroup)} onChange={(option) =>
                                    handleSelectChange(option, { name: "wifeBloodGroup" })} options={bloodGroupOptions} />
                                <FormSelect label="Skin Color" name="wifeSkinColor" value={skinColorOptions.find((o) => o.value === formData.wifeSkinColor)} onChange={(option) =>
                                    handleSelectChange(option, { name: "wifeSkinColor" })} options={skinColorOptions} />

                                <FormSelect label="Eye Color" name="wifeEyeColor" value={eyeColorOptions.find((o) => o.value === formData.wifeEyeColor)} onChange={(option) =>
                                    handleSelectChange(option, { name: "wifeEyeColor" })} options={eyeColorOptions} placeholder="Select Eye Color" />
                                <FormInput label="Religion" name="wifeReligion" value={formData.wifeReligion} onChange={handleChange} type="text" placeholder="Enter religion" disabled={isSubmitting} />
                                <FormSelect label="Education" name="wifeEducation" value={educationOptions.find((o) => o.value === formData.wifeEducation)} onChange={(option) =>
                                    handleSelectChange(option, { name: "wifeEducation" })} options={educationOptions} />

                                <FormInput label="District" name="wifeDistrict" value={formData.wifeDistrict} onChange={handleChange} type="text" placeholder="Enter district" disabled={isSubmitting} />
                                <FormInput label="Country" name="wifeCountry" value={formData.wifeCountry} onChange={handleChange} type="text" placeholder="Enter country" disabled={isSubmitting} />

                                <div className="md:col-span-3">
                                    <FormTextarea label="Genetic Illness" name="wifeGenticIllness" value={formData.wifeGenticIllness} onChange={handleChange} placeholder="Enter any genetic illness details" rows={3} disabled={isSubmitting} />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateFamily;