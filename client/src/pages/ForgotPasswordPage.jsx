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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1d2125] p-4 transition-colors">
      <div className="w-full max-w-md p-6 md:p-8 bg-white dark:bg-[#22272b] rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-[#b6c2cf] mb-2">Quên mật khẩu</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Nhập email để lấy lại mật khẩu</p>
        {message.text && <div className={`p-3 mb-4 text-sm rounded-lg ${message.type==='success'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{message.text}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-[#1d2125] dark:text-white" required />
          <button type="submit" disabled={loading} className="w-full py-3 text-white bg-indigo-600 rounded-lg font-medium">{loading ? '...' : 'Gửi yêu cầu'}</button>
        </form>
        <p className="text-center text-sm mt-6"><Link to="/login" className="text-indigo-600 font-semibold">Quay lại đăng nhập</Link></p>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;