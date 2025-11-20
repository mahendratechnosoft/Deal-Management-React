// Components/Public/PublicForm.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import Swal from 'sweetalert2';
import MtechLOGO from "../../../../../public/Images/Mtech_Logo.jpg";
const PublicForm = () => {
  const { adminId, formId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

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

  const [errors, setErrors] = useState({});

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries');
      const data = await response.json();
      if (data.data) {
        setCountries(data.data.sort((a, b) => a.country.localeCompare(b.country)));
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadStates = async (country) => {
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country })
      });
      const data = await response.json();
      if (data.data && data.data.states) {
        setStates(data.data.states.sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        setStates([]);
      }
      setCities([]);
    } catch (error) {
      console.error('Error loading states:', error);
      setStates([]);
      setCities([]);
    }
  };

  const loadCities = async (country, state) => {
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country, state })
      });
      const data = await response.json();
      if (data.data) {
        setCities(data.data.sort((a, b) => a.localeCompare(b)));
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    }
  };

  const validateWebsite = (url) => {
    if (!url) return true;
    const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return pattern.test(url);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Handle country change
    if (name === "country" && value) {
      loadStates(value);
      setFormData(prev => ({
        ...prev,
        state: "",
        city: ""
      }));
      setStates([]);
      setCities([]);
    }

    // Handle state change
    if (name === "state" && value && formData.country) {
      loadCities(formData.country, value);
      setFormData(prev => ({
        ...prev,
        city: ""
      }));
    }
  };

  const formatWebsiteUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    // Website validation
    if (formData.website && !validateWebsite(formData.website)) {
      newErrors.website = "Please enter a valid website URL (e.g., example.com or https://example.com)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format website URL before submission
      const formattedWebsite = formatWebsiteUrl(formData.website);

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
          Website: formattedWebsite || "",
        },
        adminId: adminId || "",
        employeeId: "",
        assignTo: "",
        status: "New",
        source: "Website Form",
        clientName: formData.clientName || "",
        companyName: formData.companyName || "",
        customerId: `cust_${Date.now()}`,
        revenue: formData.revenue ? parseFloat(formData.revenue) : null,
        mobileNumber: formData.mobileNumber || "",
        phoneNumber: formData.phoneNumber || "",
        email: formData.email || "",
        website: formattedWebsite || "",
        industry: formData.industry || "",
        priority: "Medium",
        street: formData.street || "",
        country: formData.country || "",
        state: formData.state || "",
        city: formData.city || "",
        zipCode: formData.zipCode || "",
        description: formData.description || "",
      };

      console.log("Submitting lead data:", leadData);

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

      // Show SweetAlert2 success popup
      await Swal.fire({
        title: 'Success!',
        text: 'Form submitted successfully! We will contact you soon.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-6 py-2 rounded-lg'
        }
      });

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

      // Reset location data
      setStates([]);
      setCities([]);

    } catch (error) {
      console.error("Error submitting form:", error);
      console.error("Error response:", error.response);

      // Show SweetAlert2 error popup
      let errorMessage = "Error submitting form. Please check your connection and try again.";

      if (error.response) {
        errorMessage = error.response.data.message || "Please try again.";
      }

      await Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'px-6 py-2 rounded-lg'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 relative overflow-hidden">
      {/* Moving Dots Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 relative z-10">
        {/* Header with Company Logo */}
        <div className="text-center mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center mb-2">
              <img
                src={MtechLOGO}
                alt="Mahendra Technosoft Pvt. Ltd."
                className="h-12 w-auto"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Mahendra Technosoft Pvt. Ltd.
            </h2>
            <p className="text-gray-600 text-sm mb-2">
              Get In Touch With Us
            </p>
            <a
              href="https://www.mahendratechnosoft.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              www.mahendratechnosoft.com
            </a>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Business Enquiry Form
            </h2>
            {/* <p className="text-blue-100 text-center mt-2">
              All fields marked with * are required
            </p> */}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Client Name 
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.clientName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your full name"
                  />
                  {errors.clientName && (
                    <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Company Name 
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Email Address 
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Mobile Number 
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Optional phone number"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.website ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="example.com or https://example.com"
                  />
                  {errors.website && (
                    <p className="text-red-500 text-xs mt-1">{errors.website}</p>
                  )}

                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Business Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Select your industry</option>
                    <option value="IT">Information Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance & Banking</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Revenue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Revenue ($)
                  </label>
                  <input
                    type="number"
                    name="revenue"
                    value={formData.revenue}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter annual revenue"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Address Information
              </h3>

              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Country 
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select Country</option>
                    {countries.map((countryData) => (
                      <option key={countryData.country} value={countryData.country}>
                        {countryData.country}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    State/Province 
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    disabled={!formData.country}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.state ? 'border-red-500' : 'border-gray-300'
                      } ${!formData.country ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select State</option>
                    {states.map((stateData) => (
                      <option key={stateData.name} value={stateData.name}>
                        {stateData.name}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    City 
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    disabled={!formData.state}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.city ? 'border-red-500' : 'border-gray-300'
                      } ${!formData.state ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select City</option>
                    {cities.map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              {/* ZIP Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter ZIP or postal code"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Information
              </label>
              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-vertical"
                placeholder="Tell us about your requirements or any additional information..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 duration-300 shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Your Enquiry"
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            We respect your privacy and will never share your information with third parties.
          </p>
        </div>
      </div>

      {/* Add CSS for moving dots animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
};

export default PublicForm;