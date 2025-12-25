import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "", age: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); 
    if (formData.password !== formData.confirmPassword) return setError("Mật khẩu không khớp!");
    try { setLoading(true); await register(formData.fullName, formData.email, formData.password, formData.age, formData.phone, formData.address); navigate("/login"); } 
    catch (err) { setError(err.toString()); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen transition-colors p-0 md:p-4 relative">
      
      {/* Glass Card Container */}
      <div className="w-full max-w-md p-6 md:p-8 glass-effect md:rounded-xl relative z-10">
        <h2 className="text-xl font-bold text-center text-white mb-6">Đăng ký tài khoản</h2>
        
        {error && <div className="p-3 mb-4 text-sm text-red-300 bg-red-900/30 rounded-lg border border-red-700/50">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="fullName" placeholder="Họ tên" onChange={handleChange} className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" required />
          
          <div className="grid grid-cols-2 gap-3">
             <input type="text" name="age" placeholder="Tuổi" onChange={handleChange} className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" />
             <input type="text" name="phone" placeholder="SĐT" onChange={handleChange} className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" />
          </div>
          
          <input type="text" name="address" placeholder="Địa chỉ" onChange={handleChange} className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" />
          
          <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" required />
          
          <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" required />
          
          <input type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu" onChange={handleChange} className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" required />
          
          <button type="submit" disabled={loading} className="w-full py-3 text-white bg-blue-600/80 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-70 backdrop-blur-sm">
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
        
        <p className="text-center text-sm mt-6 text-white/80">
          Đã có tài khoản? <Link to="/login" className="text-blue-300 font-semibold hover:text-blue-200 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;