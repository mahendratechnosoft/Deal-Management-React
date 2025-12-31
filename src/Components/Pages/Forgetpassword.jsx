import React, { useState, useEffect } from "react";
import axiosInstance from "../BaseComponet/axiosInstance";
import Mtech_logo from "../../assets/Images/xpertbixlogo.png";
import { useNavigate } from "react-router-dom";

function ForgetPassword1() {
  const navigate = useNavigate();
  
  // State for different steps
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  
  // Form states
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});

  // Handle countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    // Clear general errors
    if (error) setError("");
    if (success) setSuccess("");
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password) => {
    // At least 6 characters
    return password.length >= 6;
  };

  // Validate form based on step
  const validateForm = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else if (step === 2) {
      if (!formData.otp.trim()) {
        newErrors.otp = "OTP is required";
      } else if (formData.otp.length < 6) {
        newErrors.otp = "OTP must be 6 digits";
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required";
      } else if (!validatePassword(formData.newPassword)) {
        newErrors.newPassword = "Password must be at least 6 characters long";
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("Sending OTP request for email:", formData.email);
      
      // Call API with email as query parameter
      const response = await axiosInstance.post(
        `/forgot-password?email=${encodeURIComponent(formData.email)}`
      );
      
      console.log("OTP API Response:", response);
      console.log("Response data:", response.data);
      
      // Handle different response formats
      if (response.data) {
        // Check for success property
        if (response.data.success === true) {
          setSuccess("OTP has been sent to your email");
          setStep(2);
          setCountdown(60);
        } 
        // Check if response is a string like "OTP sent"
        else if (typeof response.data === 'string' && response.data.toLowerCase().includes('otp')) {
          setSuccess("OTP has been sent to your email");
          setStep(2);
          setCountdown(60);
        }
        // Check for response.data.message
        else if (response.data.message) {
          setSuccess(response.data.message);
          setStep(2);
          setCountdown(60);
        }
        // Check if response.data itself is the success message
        else {
          setSuccess("OTP sent successfully");
          setStep(2);
          setCountdown(60);
        }
      } else {
        // If response.data is empty but request was successful
        setSuccess("OTP has been sent to your email");
        setStep(2);
        setCountdown(60);
      }
      
    } catch (err) {
      console.error("Send OTP error details:", err);
      console.error("Error response:", err.response);
      
      // Check for specific error responses
      if (err.response?.status === 404) {
        setError("Email not found. Please check your email address.");
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || "Invalid request");
      } else if (err.response?.data) {
        // If backend returns an error message in response.data
        const errorData = err.response.data;
        setError(
          typeof errorData === 'string' 
            ? errorData 
            : errorData.message || "Failed to send OTP"
        );
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("Reset password request:", {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      // Construct query parameters as per your API requirement
      const queryParams = new URLSearchParams({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      }).toString();
      
      // Call the API endpoint you specified
      const response = await axiosInstance.post(
        `/verify-otp-and-reset?${queryParams}`
      );
      
      console.log("Reset password response:", response);
      
      // Handle different response formats
      if (response.data) {
        if (response.data.success === true || response.data.message) {
          const successMsg = response.data.message || "Password reset successful!";
          setSuccess(successMsg);
          
          // Clear form
          setFormData({
            email: "",
            otp: "",
            newPassword: "",
            confirmPassword: ""
          });
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else if (typeof response.data === 'string') {
          setSuccess(response.data);
          setTimeout(() => navigate("/login"), 2000);
        } else {
          // Assume success if we get any response
          setSuccess("Password reset successful! Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
        }
      } else {
        setError("No response received from server");
      }
      
    } catch (err) {
      console.error("Reset password error:", err);
      
      // Check for specific error responses
      if (err.response?.status === 400) {
        const errorMsg = err.response.data?.message || "Invalid request";
        if (errorMsg.toLowerCase().includes('otp')) {
          setError("Invalid or expired OTP. Please try again.");
        } else {
          setError(errorMsg);
        }
      } else if (err.response?.status === 404) {
        setError("User not found. Please try again.");
      } else if (err.response?.data) {
        setError(err.response.data?.message || "Failed to reset password");
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function - also uses query parameter
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await axiosInstance.get(
        `/forgot-password?email=${encodeURIComponent(formData.email)}`
      );
      
      console.log("Resend OTP response:", response);
      
      if (response.data) {
        // Similar logic as handleSendOTP
        if (response.data.success === true || 
            typeof response.data === 'string' ||
            response.data.message) {
          setSuccess("OTP has been resent to your email");
          setCountdown(60);
        } else {
          setSuccess("OTP resent successfully");
          setCountdown(60);
        }
      } else {
        setSuccess("OTP has been resent to your email");
        setCountdown(60);
      }
      
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(
        err.response?.data?.message || 
        "Failed to resend OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Back to previous step
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setError("");
      setSuccess("");
    } else {
      navigate("/login");
    }
  };

  // Show password toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Animated Background similar to login page */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          ></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={Mtech_logo}
            alt="Mahendra Technosoft"
            className="h-20 w-auto"
          />
        </div>

        {/* Form Container */}
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <button
              onClick={handleBack}
              className="absolute left-6 text-gray-400 hover:text-white transition-colors duration-200"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-white">
              {step === 1 ? "Reset Password" : "Create New Password"}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              {step === 1 
                ? "Enter your email to receive OTP" 
                : "Enter OTP and new password"}
            </p>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-4 p-3 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-green-300 text-sm font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.email 
                      ? "border-red-500/50 focus:ring-red-500/30" 
                      : "border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/30"
                  }`}
                  placeholder="Enter your registered email"
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP and New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Email Display (Read-only) */}
              <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Email address</p>
                <p className="text-white font-medium">{formData.email}</p>
              </div>

              {/* OTP Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || loading}
                    className={`text-sm ${countdown > 0 ? 'text-gray-500' : 'text-cyan-400 hover:text-cyan-300'} transition-colors duration-200`}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength="6"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                    errors.otp 
                      ? "border-red-500/50 focus:ring-red-500/30" 
                      : "border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/30"
                  }`}
                  placeholder="Enter 6-digit OTP"
                  autoFocus
                />
                {errors.otp && (
                  <p className="text-red-400 text-xs mt-1">{errors.otp}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-digit OTP sent to your email
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-10 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.newPassword 
                        ? "border-red-500/50 focus:ring-red-500/30" 
                        : "border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/30"
                    }`}
                    placeholder="Enter new password (min. 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-10 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.confirmPassword 
                        ? "border-red-500/50 focus:ring-red-500/30" 
                        : "border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/30"
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default ForgetPassword1;