import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }
    
    if (!formData.fullName || !formData.email || !formData.password) {
        setError('Vui lòng nhập đầy đủ thông tin.');
        return;
    }

    try {
      setLoading(true);
      await register(formData.fullName, formData.email, formData.password); 
      setSuccess("Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        navigate("/login"); 
      }, 2000);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</span>
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6">Create your account</h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name</label>
            <input 
              type="text" 
              id="fullName" 
              name="fullName" 
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <button 
              type="submit"
              disabled={loading || !!success}
              className="w-full px-4 py-3 text-white bg-pro-blue rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Already have an account? 
          <Link to="/login" className="font-semibold text-pro-blue hover:underline ml-1">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;