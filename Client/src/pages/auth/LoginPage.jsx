// client/src/pages/auth/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { gsap } from "gsap";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth(); // we don't need 'user' here
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    gsap.from(".login-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
    gsap.to(".login-card", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error("Please fill in all fields");
    }

    setIsLoading(true);

    try {
      const loggedInUser = await login(formData.email, formData.password);
      const role = loggedInUser?.userType;

      toast.success("Login successful!");

      // Debugging:
      console.log("User data:", loggedInUser);
      console.log("User role:", role);

      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname);
      } else {
        switch (role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "vendor":
            navigate("/vendor/dashboard");
            break;
          case "user":
          default:
            navigate("/user/dashboard");
            break;
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fef4ea] py-12 px-4 sm:px-6 lg:px-8">
      <div className="login-card max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#doa189] py-6">
          <h2 className="text-center text-2xl font-bold text-white">
            Login to Your Account
          </h2>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-gray-700 font-medium">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-[#doa189] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center bg-[#doa189] hover:bg-[#ecdfcf] text-[#896232] hover:text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#doa189] hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-500">
              By logging in, you agree to our{" "}
              <Link to="/terms" className="text-[#doa189] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-[#doa189] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
