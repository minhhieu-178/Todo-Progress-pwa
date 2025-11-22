import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authApi"; 

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!email) {
        setMessage({ type: "error", text: "Vui lòng nhập email." });
        setLoading(false);
        return;
    }

    try {
      await forgotPassword(email);
      setMessage({ type: "success", text: "Yêu cầu thành công! Vui lòng kiểm tra email để lấy lại mật khẩu." });
    } catch (err) {
      setMessage({ type: "error", text: err.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Nền tối
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Card tối */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</span>
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-2">Reset password</h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enter your email address and we'll send you a recovery password.
        </p>

        {message.text && (
          <div className={`p-3 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-white bg-pro-blue rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send recovery Password'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          <Link to="/login" className="font-semibold text-pro-blue hover:underline">
            Return to Log in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;