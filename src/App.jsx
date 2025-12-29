import { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes"; // Import the router we made
import CustomToaster from "./Components/Common/Toaster";
import { TaskTimerProvider } from "./Components/BaseComponet/TaskTimerContext";
import NotificationListener from "./Components/BaseComponet/NotificationListener";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Recommendation: Move this logic to a custom hook or AuthContext later
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setUserRole(user.role || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
          handleLogout();
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setUserRole(data.user.role || "");
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole("");
  };

  return (
    <>
      <NotificationListener />
      <Router>
        <TaskTimerProvider>
          <AppRoutes 
            userRole={userRole} 
            isLoggedIn={isLoggedIn} 
            onLogin={handleLogin} 
          />
        </TaskTimerProvider>
      </Router>
      <CustomToaster />
    </>
  );
}

export default App;
