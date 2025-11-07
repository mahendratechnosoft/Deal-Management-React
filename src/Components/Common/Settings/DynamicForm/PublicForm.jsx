// Components/Public/PublicForm.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../BaseComponet/axiosInstance";

const PublicForm = () => {
  const { adminId, formId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientName: "",
    companyName: "",
    email: "",
    mobileNumber: "",
    phoneNumber: "",
    website: "",
    industry: "",
    revenue: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare the data according to API structure
      const leadData = {
        columns: [
          { name: "Client Name", sequence: 1 },
          { name: "Company Name", sequence: 2 },
          { name: "Email", sequence: 3 },
          { name: "Mobile Number", sequence: 4 },
          { name: "Phone Number", sequence: 5 },
          { name: "Website", sequence: 6 },
        ],
        fields: {
          "Client Name": formData.clientName || "",
          "Company Name": formData.companyName || "",
          Email: formData.email || "",
          "Mobile Number": formData.mobileNumber || "",
          "Phone Number": formData.phoneNumber || "",
          Website: formData.website || "",
        },
        adminId: adminId || "",
        employeeId: "", // Leave empty if not available
        assignTo: "", // Leave empty if not available
        status: "New", // Default status
        source: "Website Form", // Default source
        clientName: formData.clientName || "",
        companyName: formData.companyName || "",
        customerId: `cust_${Date.now()}`,
        revenue: formData.revenue ? parseFloat(formData.revenue) : null,
        mobileNumber: formData.mobileNumber || "",
        phoneNumber: formData.phoneNumber || "",
        email: formData.email || "",
        website: formData.website || "",
        industry: formData.industry || "",
        priority: "Medium", // Default priority
        street: formData.street || "",
        country: formData.country || "",
        state: formData.state || "",
        city: formData.city || "",
        zipCode: formData.zipCode || "",
        description: formData.description || "",
      };

      console.log("Submitting lead data:", leadData);

      // Use POST request with axiosInstance
    //    const response = await fetch(
    //      `https://api.mtechnosoft.xpertbizsolutions.com/generateLeads`,
    //      {
    //        method: "POST",
    //        headers: {
    //          "Content-Type": "application/json",
    //        },
    //        body: leadData,
    //      }
    //    );

       const response = await axiosInstance.post(
         "/generateLeads",
         leadData,
         {
           headers: {
             "Content-Type": "application/json",
           },
         }
       );

      console.log("Success:", response.data);
      alert("Form submitted successfully! We will contact you soon.");

      // Reset form
      setFormData({
        clientName: "",
        companyName: "",
        email: "",
        mobileNumber: "",
        phoneNumber: "",
        website: "",
        industry: "",
        revenue: "",
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        description: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      console.error("Error response:", error.response);

      if (error.response) {
        alert(
          `Error submitting form: ${
            error.response.data.message || "Please try again."
          }`
        );
      } else {
        alert(
          "Error submitting form. Please check your connection and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Enquiry Form
            </h1>
            <p className="text-gray-600">
              Please fill out the form below and we'll get back to you soon
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter client name"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mobile number"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter website URL"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select industry</option>
                <option value="IT">IT</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Revenue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Revenue ($)
              </label>
              <input
                type="number"
                name="revenue"
                value={formData.revenue}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter revenue"
              />
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicForm;
