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
    <div className="flex items-center justify-center min-h-screen p-0 md:p-4 transition-colors relative">
      
      {/* Glass Card Container */}
      <div className="w-full max-w-md p-6 md:p-8 glass-effect md:rounded-xl relative z-10">
        <h2 className="text-xl font-bold text-center text-white mb-2">Quên mật khẩu</h2>
        <p className="text-center text-sm text-white/80 mb-6">Nhập email để lấy lại mật khẩu</p>
        
        {message.text && (
          <div className={`p-3 mb-4 text-sm rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-900/30 text-green-300 border-green-700/50' 
              : 'bg-red-900/30 text-red-300 border-red-700/50'
          }`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email của bạn" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" 
            required 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3 text-white bg-blue-600/80 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-70 backdrop-blur-sm"
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </form>
        
        <p className="text-center text-sm mt-6 text-white/80">
          <Link to="/login" className="text-blue-300 font-semibold hover:text-blue-200 hover:underline">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;