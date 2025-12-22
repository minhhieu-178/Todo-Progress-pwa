import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authApi"; 

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMessage({ type: "", text: "" });
    try { await forgotPassword(email); setMessage({ type: "success", text: "Đã gửi mail khôi phục!" }); } 
    catch (err) { setMessage({ type: "error", text: err.toString() }); } finally { setLoading(false); }
  };

  return (
<<<<<<< Updated upstream
    // SỬA: Nền chính #1d2125
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1d2125] transition-colors duration-200">
      
      {/* SỬA: Form nền #22272b, Viền white/10 */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#22272b] rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
        
        <div className="flex items-center justify-center gap-3 mb-4">
          {/* SỬA: Tiêu đề chính #b6c2cf */}
          <span className="text-2xl font-bold text-gray-900 dark:text-[#b6c2cf]">Task Management</span>
        </div>
        {/* SỬA: Tiêu đề phụ #9fadbc */}
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
            {/* SỬA: Input nền #1d2125, Placeholder #9fadbc */}
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
=======
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1d2125] p-4 transition-colors">
      <div className="w-full max-w-md p-6 md:p-8 bg-white dark:bg-[#22272b] rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-[#b6c2cf] mb-2">Quên mật khẩu</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Nhập email để lấy lại mật khẩu</p>
        {message.text && <div className={`p-3 mb-4 text-sm rounded-lg ${message.type==='success'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{message.text}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-[#1d2125] dark:text-white" required />
          <button type="submit" disabled={loading} className="w-full py-3 text-white bg-indigo-600 rounded-lg font-medium">{loading ? '...' : 'Gửi yêu cầu'}</button>
>>>>>>> Stashed changes
        </form>
        <p className="text-center text-sm mt-6"><Link to="/login" className="text-indigo-600 font-semibold">Quay lại đăng nhập</Link></p>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;