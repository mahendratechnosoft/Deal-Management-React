import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./Components/Pages/Login";
import Register from "./Components/Pages/Register";
import PageNotFound from "./Components/Pages/PageNotFound";
import CreateLead from "./Components/Common/Lead/CreateLead";
import EditLead from "./Components/Common/Lead/EditLead";
import DealList from "./Components/Common/Deals/DealList.jsx";
import LeadListAdmin from "../src/Components/Pages/Admin/Lead/LeadListAdmin.jsx";
import CustomToaster from "./Components/Common/Toaster";
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUserRole(user.role || "admin");
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleLogout();
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUserRole(userData.user.role || "admin");
  };

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("rememberMe");

    setIsLoggedIn(false);
    setUserRole("");
  };

  // Dashboard Component
  const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogoutClick = () => {
      handleLogout();
      navigate("/login");
    };

    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Mtech CRM - {userRole.toUpperCase()} Dashboard
            </h1>
            <button
              onClick={handleLogoutClick}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Welcome to your dashboard!
            </h2>
            <p className="text-gray-600">
              You are logged in as{" "}
              <span className="font-medium">{userRole}</span>.
            </p>
            <p className="text-gray-600 mt-2">
              This is where your {userRole} panel will be displayed.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  // Public Route component (redirect to dashboard if already logged in)
  const PublicRoute = ({ children }) => {
    return !isLoggedIn ? children : <Navigate to="/Admin/LeadList" />;
  };

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login onLogin={handleLogin} />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register
                  onSwitchToLogin={() => (window.location.href = "/login")}
                />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Admin/LeadList"
            element={
              <ProtectedRoute>
                <LeadListAdmin onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* Fixed: These should be ProtectedRoute, not PublicRoute */}
          <Route
            path="/Admin/CreateLead"
            element={
              <ProtectedRoute>
                <CreateLead />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Admin/EditLead/:id"
            element={
              <ProtectedRoute>
                <EditLead />
              </ProtectedRoute>
            }
          />

          <Route
            path="/DealList"
            element={
              <ProtectedRoute>
                <DealList />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* 404 Page - Catch all route */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
      <CustomToaster />
    </>
  );
}

export default App;
