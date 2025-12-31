import React, { useState } from "react";
import Mtech_logo from "../../assets/Images/xpertbixlogo.png";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../BaseComponet/axiosInstance";

function Login({ onSwitchToRegister, onLogin }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Clear API error when user modifies credentials
    if (errors.api) {
      setErrors((prev) => ({
        ...prev,
        api: "",
      }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.username)) {
      newErrors.username = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        "/signin",
        {
          username: formData.username,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.data;

      // Store the token and user data
      if (data.jwtToken) {
        localStorage.setItem("authToken", data.jwtToken);

        // Store ALL user data in userData for consistency
        localStorage.setItem(
          "userData",
          JSON.stringify({
            userId: data.userId,
            loginEmail: data.loginEmail,
            role: data.role,
            expiryDate: data.expiryDate,
            loginUserName: data.loginUserName,
            employeeId: data.employeeId,
            adminId: data.adminId,
            customerId: data.customerId,
            contactId: data.contactId,
            logo: data.logo,
            moduleAccess: data.moduleAccess,
          })
        );

        // Store role separately for easy access
        localStorage.setItem("role", data.role);
        localStorage.setItem("moduleAccess", JSON.stringify(data.moduleAccess));

        // Store loginUserName separately for easy access
        if (data.loginUserName) {
          localStorage.setItem("loginUserName", data.loginUserName);
        }

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        // CRITICAL: Create new session key and clear old ones
        const sessionId = `session_${data.userId}_${Date.now()}`;

        // Clear ALL old session-related keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.includes("session_") || key.includes("_modal_shown")) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key);
        });

        // Store new session
        localStorage.setItem("currentSessionKey", sessionId);

        // Call onLogin with the correct data structure
        if (onLogin) {
          onLogin({
            user: {
              userId: data.userId,
              email: data.loginEmail,
              role: data.role,
              expiryDate: data.expiryDate,
              loginUserName: data.loginUserName,
            },
          });
        }

        // Navigate based on the role from API response (not from localStorage)
        if (data.role === "ROLE_ADMIN") {
          if (data.moduleAccess.donorAccess === true) {
            navigate("/Admin/donorList");
          } else {
            navigate("/Admin/LeadList");
          }
        } else if (data.role === "ROLE_EMPLOYEE") {
          if (data.moduleAccess.donorAccess === true) {
            navigate("/Employee/DonorList/UnderScreeningDonorList");
          } else {
            navigate("/Employee/LeadList");
          }
        } else if (data.role === "ROLE_SUPERADMIN") {
          navigate("/SuperAdmin/AdminList");
        } else if (data.role === "ROLE_CUSTOMER") {
          navigate("/Customer/dash");
        } else if (data.role === "ROLE_CONTACT") {
          navigate("/Contact/ComplianceList");
        } else {
          // Default fallback route
          navigate("/");
        }
      } else {
        throw new Error("No authentication token received");
      }
    } catch (error) {
      console.error("Sign in error:", error);

      // Handle different types of errors and set them in errors state
      if (error.response?.status === 401) {
        setErrors({ api: "Invalid email or password. Please try again." });
      } else if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        setErrors({
          api: "Cannot connect to server. Please check if the backend is running.",
        });
      } else {
        setErrors({
          api:
            error.message || "Sign in failed. Please check your credentials.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = (e) => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modern Gradient Background with Enhanced Animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
        {/* Animated Grid Pattern with Movement */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0 moving-grid"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          ></div>
        </div>
        
        {/* Animated Floating Particles */}
        <div className="absolute inset-0 particle-container">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                backgroundColor: i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#22d3ee' : '#818cf8',
              }}
            />
          ))}
        </div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl floating-orb orb-1"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl floating-orb orb-2"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-gradient-to-r from-teal-500/15 to-emerald-500/15 rounded-full blur-3xl floating-orb orb-3"></div>
        
        {/* Animated Light Beams */}
        <div className="absolute inset-0">
          <div className="light-beam beam-1"></div>
          <div className="light-beam beam-2"></div>
          <div className="light-beam beam-3"></div>
        </div>
      </div>

      {/* Main Login Container */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row items-center justify-center gap-6">
        
        {/* Left Panel - Reduced Content */}
        <div className="lg:w-2/5 w-full p-6 lg:p-8 flex flex-col items-center lg:items-start justify-center">
          <div className="max-w-md">
            {/* Company Logo - Compact */}
            <div className="mb-3 flex flex-col items-center lg:items-start">
              <div className="mb-1">
                <img
                  src={Mtech_logo}
                  alt="Mahendra Technosoft"
                  className="h-20 w-auto floating-logo"
                />
              </div>
            </div>

            {/* Reduced Welcome Text */}
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight text-center lg:text-left">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mt-1 animated-gradient">
                Leads Management
              </span>
            </h2>
            
            <p className="text-gray-300 text-base mb-6 leading-relaxed text-center lg:text-left">
              Streamline your business operations with our comprehensive leads management system.
            </p>

            {/* Single Line Features */}
            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-4 border border-blue-500/20 mb-6 hover-glow">
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center icon-hover">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm">Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center icon-hover">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm">Fast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center icon-hover">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm">Reliable</span>
                </div>
              </div>
            </div>

            {/* Minimal Footer Text */}
            <p className="text-gray-500 text-xs text-center lg:text-left fade-in-text">
              Trusted by 500+ businesses worldwide
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="lg:w-3/5 w-full">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 lg:p-8 max-w-md mx-auto form-float">
            
            {/* Form Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Sign In</h3>
              <p className="text-gray-400 text-sm">Enter your credentials to continue</p>
            </div>

            {/* API Error Message */}
            {errors.api && (
              <div className="mb-4 p-3 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-lg error-shake">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-300 text-sm font-medium">{errors.api}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="email"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 focus-effect ${errors.username
                      ? "border-red-500/50 focus:ring-red-500/30"
                      : "border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/30"
                      }`}
                    placeholder="you@company.com"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1 fade-in">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-10 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 focus-effect ${errors.password
                      ? "border-red-500/50 focus:ring-red-500/30"
                      : "border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/30"
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors duration-200 hover-scale"
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
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 fade-in">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded bg-gray-800/50 checkbox-animate"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    Remember me
                  </label> */}
                </div>
                <button
                  type="button"
                    onClick={() => navigate("/forgot-password")}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition duration-200 hover-scale"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed button-glow"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Create Account Button */}
              {/* <button
                onClick={handleCreateAccount}
                type="button"
                className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white py-3 px-6 rounded-lg font-semibold border border-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-300 mt-4 button-float"
              >
                Create New Account
              </button> */}
            </form>

          {/* Footer */}
<div className="mt-6 pt-4 border-t border-gray-800 text-center">
  <p 
    onClick={() => window.open("https://www.mahendratechnosoft.com/", "_blank")}
    className="text-xs text-gray-500 fade-in-text copyright-animate cursor-pointer hover:text-cyan-400 transition-all duration-300 group"
  >
    © 2025 Mahendra Technosoft Pvt. Ltd.
    <span className="block h-px w-0 group-hover:w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-all duration-500 mt-1 mx-auto"></span>
  </p>
</div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        /* Floating Orbs Animation */
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
            opacity: 0.25;
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
            opacity: 0.15;
          }
        }
        
        .floating-orb {
          animation: float 15s ease-in-out infinite;
        }
        
        .orb-1 {
          animation-delay: 0s;
        }
        
        .orb-2 {
          animation-delay: 5s;
        }
        
        .orb-3 {
          animation-delay: 10s;
        }
        
        /* Grid Movement Animation */
        @keyframes moveGrid {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        
        .moving-grid {
          animation: moveGrid 20s linear infinite;
        }
        
        /* Particle Animation */
        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-10px) translateX(-15px);
            opacity: 0.3;
          }
          75% {
            transform: translateY(10px) translateX(5px);
            opacity: 0.5;
          }
        }
        
        .particle {
          position: absolute;
          border-radius: 50%;
          animation: floatParticle 8s ease-in-out infinite;
        }
        
        /* Light Beam Animation */
        @keyframes beamSweep {
          0% {
            transform: translateX(-100%) rotate(45deg);
            opacity: 0;
          }
          50% {
            opacity: 0.1;
          }
          100% {
            transform: translateX(100vw) rotate(45deg);
            opacity: 0;
          }
        }
        
        .light-beam {
          position: absolute;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          opacity: 0;
        }
        
        .beam-1 {
          top: 20%;
          animation: beamSweep 8s ease-in-out infinite;
        }
        
        .beam-2 {
          top: 50%;
          animation: beamSweep 10s ease-in-out infinite 2s;
        }
        
        .beam-3 {
          top: 80%;
          animation: beamSweep 12s ease-in-out infinite 4s;
        }
        
        /* Logo Floating Animation */
        @keyframes floatLogo {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .floating-logo {
          animation: floatLogo 6s ease-in-out infinite;
        }
        
        /* Text Gradient Animation */
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animated-gradient {
          background-size: 200% auto;
          animation: gradientShift 3s ease-in-out infinite;
        }
        
        /* Form Floating Animation */
        @keyframes formFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .form-float {
          animation: formFloat 8s ease-in-out infinite;
        }
        
        /* Hover Effects */
        .icon-hover {
          transition: all 0.3s ease;
        }
        
        .icon-hover:hover {
          transform: translateY(-3px) scale(1.1);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .hover-glow {
          transition: all 0.3s ease;
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
        }
        
        .hover-scale {
          transition: transform 0.2s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        /* Focus Effect Animation */
        .focus-effect:focus {
          animation: pulseFocus 0.3s ease;
        }
        
        @keyframes pulseFocus {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.3);
          }
        }
        
        /* Button Glow Effect */
        .button-glow {
          position: relative;
          overflow: hidden;
        }
        
        .button-glow::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4);
          background-size: 400%;
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .button-glow:hover::before {
          opacity: 1;
          animation: buttonGlow 3s linear infinite;
        }
        
        @keyframes buttonGlow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 400% 50%;
          }
        }
        
        /* Button Float Animation */
        @keyframes buttonFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .button-float {
          animation: buttonFloat 4s ease-in-out infinite 1s;
        }
        
        /* Error Shake Animation */
        @keyframes shakeError {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        
        .error-shake {
          animation: shakeError 0.5s ease-in-out;
        }
        
        /* Checkbox Animation */
        .checkbox-animate:checked {
          animation: checkboxPop 0.3s ease;
        }
        
        @keyframes checkboxPop {
          0% {
            transform: scale(0.8);
          }
          70% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        
        /* Fade In Animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease;
        }
        
        .fade-in-text {
          animation: fadeIn 1s ease;
        }


        /* Copyright Animation */
@keyframes copyrightFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

@keyframes copyrightPulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
    text-shadow: 0 0 8px rgba(6, 182, 212, 0.3);
  }
}

.copyright-animate {
  display: inline-block;
  animation: copyrightFloat 6s ease-in-out infinite, copyrightPulse 4s ease-in-out infinite;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.copyright-animate:hover {
  animation-play-state: paused;
  background: rgba(6, 182, 212, 0.1);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
}
      `}</style>
    </div>
  );
}

export default Login;