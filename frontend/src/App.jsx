import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster} from "react-hot-toast";


const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  // Run checkAuth once on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Debug log
  console.log("Auth state:", { authUser, isCheckingAuth });

  // Show loading spinner while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Routes>
        {/* Home page is protected */}
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />

        {/* Public routes */}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Example extra route */}
        <Route path="/settings" element={<Settings />} />

        {/* Profile page is protected */}
        <Route
          path="/profile"
          element={authUser ? <Profile /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster/>
    </div>
  );
};

export default App;
