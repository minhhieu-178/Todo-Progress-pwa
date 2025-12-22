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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1d2125] transition-colors duration-200">
      
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#22272b] rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-[#b6c2cf]">Task Management</span>
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-[#9fadbc] mb-2">Reset password</h2>
        <p className="text-center text-sm text-gray-600 dark:text-[#9fadbc] mb-6">
            Enter your email address and we'll send you a recovery password.
        </p>

        {message.text && (
          <div className={`p-3 mb-4 text-sm rounded-lg border ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-[#b6c2cf] mb-1">Email address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc]"
              required
            />
          </div>

          <div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? 'Sending...' : 'Send recovery Password'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-[#9fadbc] mt-6">
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Return to Log in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;