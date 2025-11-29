import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TopbarSuperAdmin({ toggleSidebar, sidebarOpen, onSwitchToLogin }) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [userData, setUserData] = useState(null);
    const [notificationCount, setNotificationCount] = useState(5);
    const [systemStatus, setSystemStatus] = useState("healthy");
    const navigate = useNavigate();

    // Get superadmin data from localStorage
    useEffect(() => {
        const storedUserData = localStorage.getItem("superAdminData");
        if (storedUserData) {
            try {
                setUserData(JSON.parse(storedUserData));
            } catch (error) {
                console.error("Error parsing superadmin data:", error);
            }
        }

        // Simulate system status check
        checkSystemStatus();
    }, []);

    const checkSystemStatus = async () => {
        // Simulate API call for system status
        setTimeout(() => {
            const statuses = ["healthy", "degraded", "maintenance"];
            setSystemStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        }, 1000);
    };

    // Get initials from superadmin name
    const getUserInitials = () => {
        if (!userData?.name) return "SA";

        const name = userData.name.trim();
        if (name.length === 0) return "SA";

        const nameParts = name.split(" ");
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }
        return (
            nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
        ).toUpperCase();
    };

    // Navigation handlers
    const handleSystemSettings = () => {
        setShowUserMenu(false);
        navigate("/super-admin/system-settings");
    };

    const handleAdminManagement = () => {
        setShowUserMenu(false);
        navigate("/super-admin/admin-management");
    };

    const handleAuditLogs = () => {
        setShowUserMenu(false);
        navigate("/super-admin/audit-logs");
    };

    const handleProfile = () => {
        setShowUserMenu(false);
        navigate("/super-admin/profile");
    };

    const handleSignOut = () => {
        localStorage.removeItem("superAdminData");
        localStorage.removeItem("superAdminToken");
        setShowUserMenu(false);
        if (onSwitchToLogin) {
            onSwitchToLogin();
        }
    };

    // Toggle notifications
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        setShowQuickActions(false);
        if (!showNotifications && notificationCount > 0) {
            setNotificationCount(0);
        }
    };

    const handleLogout = () => {

        navigate("/login");
    };

    return (
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg z-40 border-b border-indigo-600">
            <div className="flex items-center justify-between px-4 py-2">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    {/* Sidebar Toggle */}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group"
                        title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        <svg
                            className={`w-5 h-5 text-white transform transition-transform duration-300 ${sidebarOpen ? "rotate-0" : "rotate-180"
                                } group-hover:scale-110`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>


                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-3">
                    {/* Quick Actions */}
                    <div className="flex items-center space-x-1">


                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={toggleNotifications}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group relative"
                                title="Notifications"
                            >
                                <svg
                                    className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>

                                {/* Notification Badge */}
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-800 text-sm">
                                            System Notifications
                                        </h3>
                                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                            {notificationCount} new
                                        </span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {/* SuperAdmin specific notifications */}
                                        <div className="px-4 py-3 hover:bg-purple-50 transition-colors duration-200 border-b border-gray-50">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-800 font-medium">
                                                        High System Load
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        CPU usage above 85% on server cluster-02.
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        5 minutes ago
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-4 py-3 hover:bg-purple-50 transition-colors duration-200 border-b border-gray-50">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-800 font-medium">
                                                        New Admin Registration
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        John Doe requested admin access. Requires approval.
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        1 hour ago
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-4 py-3 hover:bg-purple-50 transition-colors duration-200">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-800 font-medium">
                                                        Backup Completed
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Nightly database backup completed successfully.
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        3 hours ago
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 border-t border-gray-100">
                                        <button className="w-full text-center text-xs text-purple-600 hover:text-purple-800 font-medium py-2">
                                            View All Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm group"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-medium shadow group-hover:scale-105 transition-transform duration-300 text-xs border border-white/20">
                                {getUserInitials()}
                            </div>
                            <div className="text-left hidden lg:block">
                                <p className="text-white font-medium text-xs">
                                    {userData?.name || "Super Admin"}
                                </p>
                                <p className="text-indigo-200 text-xs">
                                    {userData?.email || "superadmin@system.com"}
                                </p>
                            </div>
                            <svg
                                className={`w-3 h-3 text-indigo-200 transform transition-transform duration-300 ${showUserMenu ? "rotate-180" : "rotate-0"
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* User Menu Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                                <div className="px-3 py-2 border-b border-gray-100">
                                    <p className="font-medium text-gray-800 text-sm">
                                        {userData?.name || "Super Admin"}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {userData?.email || "superadmin@system.com"}
                                    </p>
                                    <div className="mt-1">
                                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                            Super Administrator
                                        </span>
                                    </div>
                                </div>
                                <div className="py-1">
                                    <button

                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>My Profile</span>
                                    </button>
                                    <button

                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span>Admin Management</span>
                                    </button>
                                    <button

                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>System Settings</span>
                                    </button>
                                    <button

                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Audit Logs</span>
                                    </button>
                                </div>
                                <div className="border-t border-gray-100 pt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopbarSuperAdmin;