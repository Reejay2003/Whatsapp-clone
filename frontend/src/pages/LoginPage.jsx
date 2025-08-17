import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Validation
  const validateForm = () => {
    if (!data.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      toast.error("Enter a valid email address");
      return false;
    }
    if (data.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const success = await login(data);
      if (success) {
        navigate("/"); // redirect to homepage after login
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#ECE5DD] px-4 overflow-hidden">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
        {/* Logo / Heading */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp Logo"
              className="w-12 h-12 sm:w-14 sm:h-14"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Log in to continue to WhatsApp Clone
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full mt-1 text-gray-600 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#25D366] focus:outline-none text-sm sm:text-base"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full mt-1 text-gray-600 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#25D366] focus:outline-none text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs sm:text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-2 sm:py-2.5 rounded-lg transition text-sm sm:text-base"
          >
            {isLoggingIn ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm sm:text-base text-center text-gray-600 mt-6">
          Don’t have an account?{" "}
          <a href="/signup" className="text-[#25D366] hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
