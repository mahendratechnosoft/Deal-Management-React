import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../Pages/Admin/SidebarAdmin";
import TopBar from "../../Pages/Admin/TopBarAdmin";

function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mobile: "",
    title: "",
    company: "",
    website: "",
    industry: "",
    role: "",
    department: "",
    reportsTo: "",
    employeeSize: "",
    status: "New",
    source: "",
    priority: "Medium",
    budget: "",
    expectedClose: "",
    leadOwner: "",
    description: "",
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentTag, setCurrentTag] = useState("");

  // Mock data - in real app, this would come from API
  const mockLeads = [
    {
      id: 1,
      salutation: "Mr.",
      firstName: "Lindsay",
      lastName: "Walton",
      email: "lindsay.walton@example.com",
      phone: "+1-555-0101",
      mobile: "+1-555-0101",
      title: "Front-end Developer",
      company: "ABC Corp",
      website: "https://abccorp.com",
      industry: "Technology",
      role: "Developer",
      department: "Engineering",
      reportsTo: "Sarah Johnson",
      employeeSize: "51-200",
      status: "Contacted",
      source: "Website",
      priority: "High",
      budget: "$50,000",
      expectedClose: "2024-03-15",
      leadOwner: "user1",
      description: "Interested in product demo and pricing details.",
      tags: ["Frontend", "React", "UI/UX"],
    },
    {
      id: 2,
      salutation: "Ms.",
      firstName: "Courtney",
      lastName: "Henry",
      email: "courtney.henry@example.com",
      phone: "+1-555-0102",
      mobile: "+1-555-0102",
      title: "Design Director",
      company: "XYZ Inc",
      website: "https://xyzinc.com",
      industry: "Design",
      role: "Director",
      department: "Design",
      reportsTo: "Marketing Director",
      employeeSize: "11-50",
      status: "Qualified",
      source: "Referral",
      priority: "Medium",
      budget: "$75,000",
      expectedClose: "2024-04-20",
      leadOwner: "user2",
      description: "Looking for enterprise design solutions.",
      tags: ["Design", "Enterprise", "B2B"],
    },
  ];

  useEffect(() => {
    const fetchLeadData = () => {
      setIsLoading(true);
      setTimeout(() => {
        const lead = mockLeads.find((lead) => lead.id === parseInt(id));
        if (lead) {
          setFormData(lead);
        } else {
          alert("Lead not found!");
          navigate("/leads");
        }
        setIsLoading(false);
      }, 500);
    };

    if (id) {
      fetchLeadData();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.company.trim()) newErrors.company = "Company is required";
    if (!formData.source) newErrors.source = "Lead source is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Lead updated:", formData);
      alert("Lead updated successfully!");
      navigate("/leads");
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      navigate("/leads");
    }
  };

  const handleReset = () => {
    const originalLead = mockLeads.find((lead) => lead.id === parseInt(id));
    if (
      originalLead &&
      window.confirm("Are you sure you want to reset all changes?")
    ) {
      setFormData(originalLead);
      setErrors({});
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">
            Loading lead information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <TopBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "ml-0 lg:ml-5" : "ml-0"
          }`}
        >
          {/* Main Content Area with Vertical Scrolling */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Header - Compact */}
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-2">
                  <button
                    onClick={() => navigate("/leads")}
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to Leads
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-lg font-semibold text-gray-900">
                          Edit Lead
                        </h1>
                        <p className="text-gray-600 text-xs">
                          {formData.firstName} {formData.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      ID: #{id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Container */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
                {/* Main Form */}
                <div className="xl:col-span-3">
                  <div className="bg-white rounded-lg border border-gray-200">
                    <form onSubmit={handleSubmit} className="p-4">
                      <div className="space-y-4">
                        {/* Basic Information Section */}
                        <section className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center gap-2 mb-3">
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
                            <div>
                              <h2 className="text-sm font-semibold text-gray-900">
                                Basic Information
                              </h2>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Salutation
                              </label>
                              <select
                                name="salutation"
                                value={formData.salutation}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select</option>
                                <option value="Mr.">Mr.</option>
                                <option value="Ms.">Ms.</option>
                                <option value="Mrs.">Mrs.</option>
                                <option value="Dr.">Dr.</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                First Name *
                              </label>
                              <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.firstName
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="First name"
                              />
                              {errors.firstName && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors.firstName}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Last Name *
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.lastName
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="Last name"
                              />
                              {errors.lastName && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors.lastName}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Email Address *
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.email
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="Email address"
                              />
                              {errors.email && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors.email}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Phone
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Phone number"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Mobile
                              </label>
                              <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Mobile number"
                              />
                            </div>
                          </div>
                        </section>

                        {/* Company Information Section */}
                        <section className="bg-green-50 rounded-lg p-3 border border-green-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
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
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                            <div>
                              <h2 className="text-sm font-semibold text-gray-900">
                                Company Information
                              </h2>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Job Title
                              </label>
                              <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Job title"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Company *
                              </label>
                              <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.company
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="Company name"
                              />
                              {errors.company && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors.company}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Website
                              </label>
                              <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Website URL"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Industry
                              </label>
                              <select
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select Industry</option>
                                <option value="Technology">Technology</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Finance">Finance</option>
                                <option value="Education">Education</option>
                                <option value="Manufacturing">
                                  Manufacturing
                                </option>
                                <option value="Retail">Retail</option>
                              </select>
                            </div>
                          </div>
                        </section>

                        {/* Lead Details Section */}
                        <section className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
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
                            <div>
                              <h2 className="text-sm font-semibold text-gray-900">
                                Lead Details
                              </h2>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Proposal">Proposal</option>
                                <option value="Negotiation">Negotiation</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Lead Source *
                              </label>
                              <select
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                className={`w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                                  errors.source
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              >
                                <option value="">Select Source</option>
                                <option value="Website">Website</option>
                                <option value="Referral">Referral</option>
                                <option value="Social Media">
                                  Social Media
                                </option>
                                <option value="Trade Show">Trade Show</option>
                                <option value="Email Campaign">
                                  Email Campaign
                                </option>
                              </select>
                              {errors.source && (
                                <p className="mt-1 text-xs text-red-600">
                                  {errors.source}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Priority
                              </label>
                              <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Budget
                              </label>
                              <input
                                type="text"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Budget amount"
                              />
                            </div>
                          </div>
                        </section>

                        {/* Additional Information */}
                        <section className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                          <div className="flex items-center gap-2 mb-3">
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
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h2 className="text-sm font-semibold text-gray-900">
                                Additional Information
                              </h2>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Additional notes"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tags
                              </label>
                              <div className="flex gap-1 mb-2">
                                <input
                                  type="text"
                                  value={currentTag}
                                  onChange={(e) =>
                                    setCurrentTag(e.target.value)
                                  }
                                  onKeyPress={handleKeyPress}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter a tag"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddTag}
                                  className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700"
                                >
                                  Add
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {formData.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                                  >
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTag(tag)}
                                      className="text-blue-600 hover:text-blue-800 text-sm leading-none"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>

                      {/* Form Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Updated: {new Date().toLocaleDateString()}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-3 py-1 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-xs font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleReset}
                            className="px-3 py-1 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-xs font-medium"
                          >
                            Reset
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                          >
                            Update Lead
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Side Panel */}
                <div className="xl:col-span-1">
                  <div className="space-y-3">
                    {/* Lead Summary */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Lead Summary
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Status:</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                            {formData.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">
                            Priority:
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {formData.priority}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Source:</span>
                          <span className="text-xs text-gray-900 font-medium">
                            {formData.source}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Budget:</span>
                          <span className="text-xs text-gray-900 font-medium">
                            {formData.budget}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Quick Actions
                      </h3>
                      <div className="space-y-1">
                        <button className="w-full flex items-center gap-2 px-2 py-1 text-left text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors">
                          <svg
                            className="w-3 h-3 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                          </svg>
                          <span>Send Message</span>
                        </button>
                        <button className="w-full flex items-center gap-2 px-2 py-1 text-left text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors">
                          <svg
                            className="w-3 h-3 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Schedule Meeting</span>
                        </button>
                        <button className="w-full flex items-center gap-2 px-2 py-1 text-left text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors">
                          <svg
                            className="w-3 h-3 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Add Note</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditLead;
  