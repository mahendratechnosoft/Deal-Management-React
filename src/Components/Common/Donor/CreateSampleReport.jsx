import React, { useState, useEffect } from "react";
import { FormInput, FormSelect, FormTextarea } from "../../BaseComponet/CustomeFormComponents";
import axiosInstance from "../../BaseComponet/axiosInstance";
import toast from "react-hot-toast";

const CreateSampleReport = ({ isOpen, onClose, onSuccess, sampleId }) => {
    const [formData, setFormData] = useState({
        dateAndTime: "",
        media: "",
        volumne: "",
        spermConcentration: "",
        million: "",
        progressiveMotility: "",
        morphology: "",
        abnormality: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            // Set current date and time as default
            const now = new Date();
            // Format to YYYY-MM-DDTHH:mm for datetime-local input
            const currentDateTime = now.toISOString().slice(0, 16);
            
            setFormData({
                dateAndTime: currentDateTime,
                media: "",
                volumne: "",
                spermConcentration: "",
                million: "",
                progressiveMotility: "",
                morphology: "",
                abnormality: ""
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!sampleId) {
            toast.error("Sample ID is required");
            return;
        }

        setIsSubmitting(true);

        try {
            // Format the date properly for LocalDateTime
            let formattedDateTime = "";
            if (formData.dateAndTime) {
                // Convert from "YYYY-MM-DDTHH:mm" to "YYYY-MM-DDTHH:mm:ss"
                formattedDateTime = `${formData.dateAndTime}:00`;
            }

            const apiData = {
                sampleId: sampleId,
                dateAndTime: formattedDateTime,
                media: formData.media,
                volumne: parseFloat(formData.volumne) || 0,
                spermConcentration: formData.spermConcentration,
                million: parseFloat(formData.million) || 0,
                progressiveMotility: formData.progressiveMotility,
                morphology: formData.morphology,
                abnormality: formData.abnormality
            };

            console.log("Sending API data:", apiData); // For debugging

            const response = await axiosInstance.post("createSampleReport", apiData);

            console.log("Sample report created successfully:", response.data);
            toast.success("Sample report created successfully!");

            // Reset form
            const now = new Date();
            const currentDateTime = now.toISOString().slice(0, 16);
            
            setFormData({
                dateAndTime: currentDateTime,
                media: "",
                volumne: "",
                spermConcentration: "",
                million: "",
                progressiveMotility: "",
                morphology: "",
                abnormality: ""
            });

            // Call success callback
            onSuccess && onSuccess(response.data);
            
            // Close modal
            onClose();

        } catch (error) {
            console.error("Error creating sample report:", error);
            if (error.response?.data?.message) {
                toast.error(`Error: ${error.response.data.message}`);
            } else {
                toast.error("Error creating sample report. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Reset form when closing
        const now = new Date();
        const currentDateTime = now.toISOString().slice(0, 16);
        
        setFormData({
            dateAndTime: currentDateTime,
            media: "",
            volumne: "",
            spermConcentration: "",
            million: "",
            progressiveMotility: "",
            morphology: "",
            abnormality: ""
        });
        onClose && onClose();
    };

    const progressiveMotilityOptions = [
        { value: "A", label: "A - Rapid Progressive" },
        { value: "B", label: "B - Slow Progressive" },
        { value: "C", label: "C - Non-Progressive" },
        { value: "D", label: "D - Immotile" }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-[80%] max-w-5xl p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Create Sample Report
                    </h2>
                    {sampleId && (
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            Sample ID: {sampleId}
                        </span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormInput
                            label="Date & Time"
                            name="dateAndTime"
                            value={formData.dateAndTime}
                            onChange={handleChange}
                            type="datetime-local"
                            required
                            disabled={isSubmitting}
                        />

                        <FormInput
                            label="Media"
                            name="media"
                            value={formData.media}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter media type"
                            required
                            disabled={isSubmitting}
                        />

                        <FormInput
                            label="Volume"
                            name="volumne"
                            value={formData.volumne}
                            onChange={handleChange}
                            type="number"
                            step="0.1"
                            placeholder="Enter volume"
                            required
                            disabled={isSubmitting}
                        />

                        <FormInput
                            label="Sperm Concentration"
                            name="spermConcentration"
                            value={formData.spermConcentration}
                            onChange={handleChange}
                            type="text"
                            placeholder="e.g., 15 million/mL"
                            required
                            disabled={isSubmitting}
                        />

                        <FormInput
                            label="Million / ML"
                            name="million"
                            value={formData.million}
                            onChange={handleChange}
                            type="number"
                            step="0.1"
                            placeholder="Enter million count"
                            required
                            disabled={isSubmitting}
                        />


                          <FormInput
                           label="Progressive Motility"
                             name="progressiveMotility"
                            value={formData.progressiveMotility}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter motility details"
                            required
                            disabled={isSubmitting}
                        />

                        <FormInput
                            label="Morphology"
                            name="morphology"
                            value={formData.morphology}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter morphology details"
                            required
                            disabled={isSubmitting}
                        />

                        <FormInput
                            label="Abnormality"
                            name="abnormality"
                            value={formData.abnormality}
                            onChange={handleChange}
                            type="text"
                            placeholder="Enter any abnormalities"
                            required
                            disabled={isSubmitting}
                        />
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
                                "Create Report"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSampleReport;