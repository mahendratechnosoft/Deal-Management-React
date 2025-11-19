import React, { useState, useEffect } from "react";
import { FormInput, FormTextarea } from "../../BaseComponet/CustomeFormComponents";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";

const EditFamily = ({ isOpen, onClose, onSuccess, donorId }) => {
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        referHospital: "",
        referDoctor: "",
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
                name: "",
                mobile: "",
                email: "",
                referHospital: "",
                referDoctor: "",
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
        
        if (!donorId) {
            toast.error("Donor ID is required");
            return;
        }

        setIsSubmitting(true);

        try {
            const apiData = {
                donorId: donorId,
                ...formData
            };

            const response = await axiosInstance.post("updateFamily", apiData);

            console.log("Family updated successfully:", response.data);
            toast.success("Family information updated successfully!");

            // Reset form
            setFormData({
                name: "",
                mobile: "",
                email: "",
                referHospital: "",
                referDoctor: "",
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

            // Call success callback
            onSuccess && onSuccess(response.data);
            
            // Close modal
            onClose();

        } catch (error) {
            console.error("Error updating family:", error);
            toast.error("Error updating family information. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Reset form when closing
        setFormData({
            name: "",
            mobile: "",
            email: "",
            referHospital: "",
            referDoctor: "",
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
        onClose && onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-[90%] max-w-6xl p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[95vh]">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Edit Family Information
                    </h2>
                    {donorId && (
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            Donor ID: {donorId}
                        </span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter full name"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                type="tel"
                                placeholder="Enter mobile number"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="Enter email address"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Referral Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Referral Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Referral Hospital"
                                name="referHospital"
                                value={formData.referHospital}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter hospital name"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Referral Doctor"
                                name="referDoctor"
                                value={formData.referDoctor}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter doctor name"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Husband Information */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Husband Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput
                                label="Height"
                                name="husbandHeight"
                                value={formData.husbandHeight}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter height"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Weight"
                                name="husbandWeight"
                                value={formData.husbandWeight}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter weight"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Blood Group"
                                name="husbandBloodGroup"
                                value={formData.husbandBloodGroup}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter blood group"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Skin Color"
                                name="husbandSkinColor"
                                value={formData.husbandSkinColor}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter skin color"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Eye Color"
                                name="husbandEyeColor"
                                value={formData.husbandEyeColor}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter eye color"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Religion"
                                name="husbandReligion"
                                value={formData.husbandReligion}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter religion"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Education"
                                name="husbandEducation"
                                value={formData.husbandEducation}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter education"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="District"
                                name="husbandDistrict"
                                value={formData.husbandDistrict}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter district"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Country"
                                name="husbandCountry"
                                value={formData.husbandCountry}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter country"
                                disabled={isSubmitting}
                            />

                            <div className="md:col-span-3">
                                <FormTextarea
                                    label="Genetic Illness"
                                    name="husbandGenticIllness"
                                    value={formData.husbandGenticIllness}
                                    onChange={handleChange}
                                    placeholder="Enter any genetic illness details"
                                    rows={3}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Wife Information */}
                    <div className="bg-pink-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Wife Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput
                                label="Height"
                                name="wifeHeight"
                                value={formData.wifeHeight}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter height"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Weight"
                                name="wifeWeight"
                                value={formData.wifeWeight}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter weight"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Blood Group"
                                name="wifeBloodGroup"
                                value={formData.wifeBloodGroup}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter blood group"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Skin Color"
                                name="wifeSkinColor"
                                value={formData.wifeSkinColor}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter skin color"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Eye Color"
                                name="wifeEyeColor"
                                value={formData.wifeEyeColor}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter eye color"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Religion"
                                name="wifeReligion"
                                value={formData.wifeReligion}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter religion"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Education"
                                name="wifeEducation"
                                value={formData.wifeEducation}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter education"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="District"
                                name="wifeDistrict"
                                value={formData.wifeDistrict}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter district"
                                disabled={isSubmitting}
                            />

                            <FormInput
                                label="Country"
                                name="wifeCountry"
                                value={formData.wifeCountry}
                                onChange={handleChange}
                                type="text"
                                placeholder="Enter country"
                                disabled={isSubmitting}
                            />

                            <div className="md:col-span-3">
                                <FormTextarea
                                    label="Genetic Illness"
                                    name="wifeGenticIllness"
                                    value={formData.wifeGenticIllness}
                                    onChange={handleChange}
                                    placeholder="Enter any genetic illness details"
                                    rows={3}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button Row */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Updating...
                                </div>
                            ) : (
                                "Update Family"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditFamily;