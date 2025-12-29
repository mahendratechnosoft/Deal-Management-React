// Components/Common/Settings/DynamicForm/DynamicFormBase.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../BaseComponet/axiosInstance";
import MtechLOGO from "../../../../assets/Images/Mtech_Logo.jpg";
import { showAutoCloseSuccess, showSuccessAlert } from "../../../BaseComponet/alertUtils";
const DynamicFormBase = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const [generatedLink, setGeneratedLink] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Fetch admin info
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await axiosInstance.get("/admin/getAdminInfo");
        setAdminInfo(response.data);
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };
    fetchAdminInfo();
  }, []);

  // Generate form link
  const generateFormLink = () => {
    if (!adminInfo?.adminId) {
      alert("Admin information not available");
      return;
    }

    const formId = `form_${Date.now()}`;
    const link = `${window.location.origin}/public-form/${adminInfo.adminId}/${formId}`;
    setGeneratedLink(link);
  };

  // Copy to clipboard
const copyToClipboard = async () => {
  if (!generatedLink) {
    showErrorAlert("Nothing to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(generatedLink);
    showAutoCloseSuccess("Link copied to clipboard!");
  } catch (err) {
    console.error("Clipboard write failed:", err);
    showErrorAlert("Failed to copy link. Please try again.");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">

            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lead Capture Form Builder
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create beautiful, shareable lead capture forms to grow your business
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Action Section - Moved to Top */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-2">Ready to Generate Leads?</h2>
                <p className="text-blue-100 opacity-90 text-lg">
                  Create a professional form and share it with potential clients
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Preview Button */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {showPreview ? 'Hide Preview' : 'Preview Form'}
                </button>

                {/* Generate Button */}
                <button
                  onClick={generateFormLink}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Form Link
                </button>
              </div>
            </div>

            {/* Generated Link Section - Moved to Top */}
            {generatedLink && (
              <div className="mt-6 p-4 bg-blue-500 bg-opacity-20 rounded-lg border border-blue-300 border-opacity-50">
                <h4 className="font-semibold text-white mb-2 text-lg">
                  🎉 Form Link Generated!
                </h4>
                <p className="text-blue-100 mb-3">
                  Copy this link and share it with your clients to start collecting leads
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-mono text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Form Preview - Conditionally Rendered */}
          {showPreview && (
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Form Preview</h3>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Live Preview
                </span>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50">
                <div className="max-w-2xl mx-auto">
                  {/* Preview Header with Company Logo */}
                  <div className="text-center mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <img
                          src={MtechLOGO}
                          alt="Mahendra Technosoft Pvt. Ltd."
                          className="h-16 w-auto"
                        />
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Mahendra Technosoft Pvt. Ltd.
                      </h1>
                      <p className="text-gray-600 mb-3">
                        Get In Touch With Us
                      </p>
                      <a
                        href="https://www.mahendratechnosoft.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        www.mahendratechnosoft.com
                      </a>
                    </div>
                  </div>

                  {/* Preview Form */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                      <h2 className="text-xl font-bold text-white text-center">
                        Business Enquiry Form
                      </h2>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Sample form fields for preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Name *
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-50">
                            John Doe
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name *
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-50">
                            Example Corp
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-50">
                            john@example.com
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-50">
                            example.com
                          </div>

                        </div>
                      </div>

                      {/* Country, State, City Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country *
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-50">
                            United States
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State *
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-50">
                            California
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 opacity-50">
                            Los Angeles
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-center font-semibold opacity-50">
                          Submit Your Enquiry
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions Section */}
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Generate Link</h4>
                <p className="text-gray-600 text-sm">
                  Click the "Generate Form Link" button to create your unique form URL
                </p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Share with Clients</h4>
                <p className="text-gray-600 text-sm">
                  Copy the generated link and share it via email, social media, or your website
                </p>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Collect Leads</h4>
                <p className="text-gray-600 text-sm">
                  Receive leads directly in your system when clients fill out the form
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicFormBase;