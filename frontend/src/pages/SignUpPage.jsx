import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Validation
  const validateForm = () => {
    if (!data.name.trim()) {
      toast.error("Name is required");
      return false;
    }
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
    if(data.cnfpassword!=data.password){
      toast.error("Password and Confirm Password should be same");
      return false
    }
    return true;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const success = await signup(data);
      if (success) {
        navigate("/"); // redirect to homepage after signup
      }
    }
  };

  return (
    <div className="flex items-center mt-[-17px] justify-center min-h-screen bg-[#ECE5DD] px-4 py-4 overflow-hidden">
      <div className="w-full max-w-md bg-white mt-[-50px] shadow-lg rounded-2xl p-4 sm:p-6 max-h-[95vh] flex flex-col">
        {/* Logo / Heading */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp Logo"
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            Create Account
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Sign up to join WhatsApp Clone
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 flex-1">
          {/* Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full mt-1 text-gray-600 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#25D366] focus:outline-none text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full mt-1 text-gray-600 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#25D366] focus:outline-none text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full mt-1 text-gray-600 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#25D366] focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>


          {/* Confirm Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showCPassword ? "text" : "password"}
                name="cnfpassword"
                value={data.cnfpassword}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full mt-1 text-gray-600 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#25D366] focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCPassword(!showCPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
              >
                {showCPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-2 rounded-lg transition text-sm mt-4"
          >
            {isSigningUp ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs sm:text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-[#25D366] hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;