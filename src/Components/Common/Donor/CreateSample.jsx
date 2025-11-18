import React, { useState, useEffect } from "react";
import { FormInput, FormTextarea } from "../../BaseComponet/CustomeFormComponents";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";

const CreateSample = ({ isOpen, onClose, onSuccess, donorId }) => {
    const [formData, setFormData] = useState({
        tankNo: "",
        caneNo: "",
        canisterNo: "",
        numberOfVials: "",
        remarks: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                tankNo: "",
                caneNo: "",
                canisterNo: "",
                numberOfVials: "",
                remarks: "",
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
                tankNo: formData.tankNo,
                caneNo: formData.caneNo,
                canisterNo: formData.canisterNo,
                numberOfVials: parseInt(formData.numberOfVials),
                remarks: formData.remarks,
            };

            const response = await axiosInstance.post("createSample", apiData);

            console.log("Sample created successfully:", response.data);
            toast.success("Sample created successfully!");

            // Reset form
            setFormData({
                tankNo: "",
                caneNo: "",
                canisterNo: "",
                numberOfVials: "",
                remarks: "",
            });

            // Call success callback
            onSuccess && onSuccess(response.data);
            
            // Close modal
            onClose();

        } catch (error) {
            console.error("Error creating sample:", error);
            toast.error("Error creating sample. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Reset form when closing
        setFormData({
            tankNo: "",
            caneNo: "",
            canisterNo: "",
            numberOfVials: "",
            remarks: "",
        });
        onClose && onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-[80%] max-w-5xl p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Create Sample For Delivery
                    </h2>
                    {donorId && (
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            Donor ID: {donorId}
                        </span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormInput
                            label="Tank No"
                            name="tankNo"
                            value={formData.tankNo}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter tank number"
                            required
                            disabled={isSubmitting}
                        />

                        <FormInput
                            label="Cane No"
                            name="caneNo"
                            value={formData.caneNo}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter cane number"
                            required
                            disabled={isSubmitting}
                        />

                        <FormInput
                            label="Canister No"
                            name="canisterNo"
                            value={formData.canisterNo}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter canister number"
                            required
                            disabled={isSubmitting}
                        />

                        <FormInput
                            label="No. of Vials"
                            name="numberOfVials"
                            value={formData.numberOfVials}
                            onChange={handleChange}
                            type="number"
                            min="1"
                            placeholder="Enter number of vials"
                            required
                            disabled={isSubmitting}
                        />

                        <div className="md:col-span-2">
                            <FormTextarea
                                label="Remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="Enter any remarks or notes"
                                rows={4}
                                disabled={isSubmitting}
                            />
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
                                    Creating...
                                </div>
                            ) : (
                                "Create Sample"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSample;