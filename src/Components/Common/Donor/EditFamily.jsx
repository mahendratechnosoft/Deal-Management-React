import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { useLayout } from "../../Layout/useLayout";
import { FormInput, FormSelect, FormTextarea } from "../../BaseComponet/CustomeFormComponents";

function EditFamily() {
    const navigate = useNavigate();
    const { donorId } = useParams();
    const [loading, setLoading] = useState(false);
    const { LayoutComponent, role } = useLayout();
    const [activeTab, setActiveTab] = useState("family");

    // Mock data for the Donor List - Replace this with actual API data later
    const [donorsList, setDonorsList] = useState([
        { id: 101, name: "Rahul Kumar", age: 28, gender: "Male", sampleReceivedDate: "2023-10-15", status: "Processed" },
        { id: 102, name: "Priya Singh", age: 26, gender: "Female", sampleReceivedDate: "2023-10-20", status: "Pending" },
        { id: 103, name: "Amit Sharma", age: 30, gender: "Male", sampleReceivedDate: "2023-11-01", status: "Rejected" },
    ]);

    const [formData, setFormData] = useState({
        // Family Information
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
        wifeGenticIllness: "",
        
        status: ""
    });

    const [errors, setErrors] = useState({});

    // Updated Tabs configuration
    const tabs = [
        { id: "family", label: "Family Information" },
        { id: "donorList", label: "Donor List" }, // Changed from Medical History
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : "",
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        // Add validation logic if needed
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success("Family details updated successfully!");

            if (role === "ROLE_ADMIN") {
                navigate("/Admin/DonarList");
            } else if (role === "ROLE_EMPLOYEE") {
                navigate("/Employee/DonarList");
            }
        } catch (error) {
            console.error("Error updating donor:", error);
            toast.error("Failed to update. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
            if (role === "ROLE_ADMIN") {
                navigate("/Admin/DonarList");
            } else if (role === "ROLE_EMPLOYEE") {
                navigate("/Employee/DonarList");
            }
        }
    };

    const renderFamilyInformation = () => (
        <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput label="Name" name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Enter full name" />
                    <FormInput label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} type="tel" placeholder="Enter mobile number" />
                    <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Enter email address" />
                </div>
            </div>

            {/* Referral Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Referral Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Referral Hospital" name="referHospital" value={formData.referHospital} onChange={handleChange} type="text" placeholder="Enter hospital name" />
                    <FormInput label="Referral Doctor" name="referDoctor" value={formData.referDoctor} onChange={handleChange} type="text" placeholder="Enter doctor name" />
                </div>
            </div>

            {/* Husband Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Husband Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput label="Height" name="husbandHeight" value={formData.husbandHeight} onChange={handleChange} type="text" placeholder="Enter height" />
                    <FormInput label="Weight" name="husbandWeight" value={formData.husbandWeight} onChange={handleChange} type="text" placeholder="Enter weight" />
                    <FormInput label="Blood Group" name="husbandBloodGroup" value={formData.husbandBloodGroup} onChange={handleChange} type="text" placeholder="Enter blood group" />
                    <FormInput label="Skin Color" name="husbandSkinColor" value={formData.husbandSkinColor} onChange={handleChange} type="text" placeholder="Enter skin color" />
                    <FormInput label="Eye Color" name="husbandEyeColor" value={formData.husbandEyeColor} onChange={handleChange} type="text" placeholder="Enter eye color" />
                    <FormInput label="Religion" name="husbandReligion" value={formData.husbandReligion} onChange={handleChange} type="text" placeholder="Enter religion" />
                    <FormInput label="Education" name="husbandEducation" value={formData.husbandEducation} onChange={handleChange} type="text" placeholder="Enter education" />
                    <FormInput label="District" name="husbandDistrict" value={formData.husbandDistrict} onChange={handleChange} type="text" placeholder="Enter district" />
                    <FormInput label="Country" name="husbandCountry" value={formData.husbandCountry} onChange={handleChange} type="text" placeholder="Enter country" />
                    <div className="md:col-span-3">
                        <FormTextarea label="Genetic Illness" name="husbandGenticIllness" value={formData.husbandGenticIllness} onChange={handleChange} placeholder="Enter any genetic illness details" rows={3} />
                    </div>
                </div>
            </div>

            {/* Wife Information */}
            <div className="bg-pink-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Wife Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput label="Height" name="wifeHeight" value={formData.wifeHeight} onChange={handleChange} type="text" placeholder="Enter height" />
                    <FormInput label="Weight" name="wifeWeight" value={formData.wifeWeight} onChange={handleChange} type="text" placeholder="Enter weight" />
                    <FormInput label="Blood Group" name="wifeBloodGroup" value={formData.wifeBloodGroup} onChange={handleChange} type="text" placeholder="Enter blood group" />
                    <FormInput label="Skin Color" name="wifeSkinColor" value={formData.wifeSkinColor} onChange={handleChange} type="text" placeholder="Enter skin color" />
                    <FormInput label="Eye Color" name="wifeEyeColor" value={formData.wifeEyeColor} onChange={handleChange} type="text" placeholder="Enter eye color" />
                    <FormInput label="Religion" name="wifeReligion" value={formData.wifeReligion} onChange={handleChange} type="text" placeholder="Enter religion" />
                    <FormInput label="Education" name="wifeEducation" value={formData.wifeEducation} onChange={handleChange} type="text" placeholder="Enter education" />
                    <FormInput label="District" name="wifeDistrict" value={formData.wifeDistrict} onChange={handleChange} type="text" placeholder="Enter district" />
                    <FormInput label="Country" name="wifeCountry" value={formData.wifeCountry} onChange={handleChange} type="text" placeholder="Enter country" />
                    <div className="md:col-span-3">
                        <FormTextarea label="Genetic Illness" name="wifeGenticIllness" value={formData.wifeGenticIllness} onChange={handleChange} placeholder="Enter any genetic illness details" rows={3} />
                    </div>
                </div>
            </div>
        </div>
    );

    // NEW: Render Donor List Table
    const renderDonorList = () => (
        <div className="bg-white rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Linked Donors</h3>
                {/* Optional: Add button to create new donor */}
                <button 
                    type="button"
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium"
                    onClick={() => console.log("Add new donor logic")}
                >
                    + Add Donor
                </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age / Gender</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Received Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {donorsList.length > 0 ? (
                            donorsList.map((donor) => (
                                <tr key={donor.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{donor.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{donor.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donor.age} / {donor.gender}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {/* Sample Received Date Column */}
                                        {donor.sampleReceivedDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${donor.status === 'Processed' ? 'bg-green-100 text-green-800' : 
                                              donor.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {donor.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer hover:underline">
                                        View
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No donors found for this family.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "family":
                return renderFamilyInformation();
            case "donorList":
                return renderDonorList();
            default:
                return renderFamilyInformation();
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
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Donor List
                        </button>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Edit Family Details</h1>
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
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Update Details
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

                            <form id="editDonorForm" onSubmit={handleSubmit} className="p-6">
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

export default EditFamily;