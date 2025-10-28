import React, { useState } from "react";
import Mtech_logo from "../../../public/Images/Mtech_Logo.jpg";
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
  const [toaster, setToaster] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showToaster = (message, type = "success") => {
    setToaster({ show: true, message, type });
    setTimeout(() => {
      setToaster({ show: false, message: "", type: "" });
    }, 4000);
  };

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
    }
  }
);

    //  if (!response.ok) {
    //    let errorMessage = "Sign in failed";

    //    try {
    //      const errorData = await response.json();
    //      errorMessage = errorData.message || errorMessage;
    //    } catch (parseError) {
    //      errorMessage = response.statusText || errorMessage;
    //    }

    //    throw new Error(errorMessage);
    //  }

     const data = await response.data;

     // Store the token and user data
     if (data.jwtToken) {
       localStorage.setItem("authToken", data.jwtToken);
       localStorage.setItem(
         "userData",
         JSON.stringify({
           userId: data.userId,
           loginEmail: data.loginEmail,
           role: data.role,
           expiryDate: data.expiryDate,
         })
       );

       if (rememberMe) {
         localStorage.setItem("rememberMe", "true");
       }

       showToaster("Sign in successful! Welcome back.", "success");

       // FIXED: Call onLogin with the correct data structure
       if (onLogin) {
         onLogin({
           user: {
             userId: data.userId,
             email: data.loginEmail,
             role: data.role,
             expiryDate: data.expiryDate,
           },
         });
       }
     } else {
       throw new Error("No authentication token received");
     }
   } catch (error) {
     console.error("Sign in error:", error);

     if (
       error.name === "TypeError" &&
       error.message.includes("Failed to fetch")
     ) {
       showToaster(
         "Cannot connect to server. Please check if the backend is running.",
         "error"
       );
     } else {
       showToaster(
         error.message || "Sign in failed. Please check your credentials.",
         "error"
       );
     }
   } finally {
     setIsLoading(false);
   }
 };

   const handleCreateAccount = (e) => {
     navigate("/register");
   };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float animation-delay-4000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(#000 1px, transparent 1px),
                              linear-gradient(90deg, #000 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>
      </div>

      {/* Toaster Notification */}
      {toaster.show && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border ${
            toaster.type === "error" ? "border-red-200" : "border-green-200"
          } transform transition-all duration-300 ${
            toaster.show
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div className="p-4">
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 ${
                  toaster.type === "error" ? "text-red-400" : "text-green-400"
                }`}
              >
                {toaster.type === "error" ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    toaster.type === "error" ? "text-red-800" : "text-green-800"
                  }`}
                >
                  {toaster.type === "error" ? "Error" : "Success"}
                </p>
                <p className="text-sm text-gray-600 mt-1">{toaster.message}</p>
              </div>
              <button
                onClick={() =>
                  setToaster({ show: false, message: "", type: "" })
                }
                className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600 transition duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:items-center lg:p-12 lg:bg-gradient-to-br lg:from-blue-600 lg:via-blue-700 lg:to-indigo-800 lg:relative lg:overflow-hidden">
          {/* Animated background elements for left side */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full animate-pulse animation-delay-1000"></div>
          </div>

          <div className="relative z-10 w-full">
            <div className="flex items-center justify-center mb-8">
              {/* Company Logo */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                <img
                  src={Mtech_logo}
                  alt="Mahendra Technosoft"
                  className="h-16 w-auto filter brightness-0 invert"
                />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                Welcome
                <span className="block text-blue-200">Back!</span>
              </h1>
              <p className="text-blue-100 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Sign in to continue managing your leads and growing your
                business
              </p>

              <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <p className="text-blue-100 text-sm">Secure Login</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <p className="text-blue-100 text-sm">Data Protected</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center">
            <p className="text-blue-200 text-sm font-medium">
              Join 500+ successful businesses
            </p>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Header with Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-blue-600 rounded-xl p-4 shadow-lg">
                  <img
                    src="/images/logo.png"
                    alt="Mahendra Technosoft"
                    className="h-12 w-auto filter brightness-0 invert"
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Leads Management
              </h1>
              <p className="text-gray-600">by Mahendra Technosoft Pvt. Ltd.</p>
            </div>

            {/* Form Container with Glass Effect */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transform hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Sign In
                </h2>
                <p className="text-gray-600 mt-3">
                  Welcome back! Please sign in to your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="email"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                      errors.username
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.username && (
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium transition duration-200"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-3"></div>
                      Signing In...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button onClick={handleCreateAccount}
                    className="text-blue-600 hover:text-blue-500 font-semibold
                    transition duration-200 hover:underline" > Create account
                  </button>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                © 2025 Leads Management by Mahendra Technosoft Pvt. Ltd. All
                rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations to CSS */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Login;
