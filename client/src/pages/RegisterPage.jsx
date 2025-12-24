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
    // CONTAINER NGOÀI: 
    // - Mobile: Full màn hình, nền trắng/đen trùng card (p-0)
    // - Desktop: Có padding (p-4), nền xám phân biệt
    <div className="flex items-center justify-center min-h-screen transition-colors bg-white md:bg-gray-50 dark:bg-[#22272b] md:dark:bg-[#1d2125] p-0 md:p-4">
      
      {/* CARD FORM:
          - Mobile: Phẳng hoàn toàn (bỏ shadow, border, rounded)
          - Desktop: Có hiệu ứng nổi (shadow, border, rounded-xl)
      */}
      <div className="w-full max-w-md p-6 md:p-8 bg-white dark:bg-[#22272b] md:rounded-xl md:shadow-sm md:border border-gray-200 dark:border-white/10">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-[#b6c2cf] mb-6">Đăng ký tài khoản</h2>
        
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="fullName" placeholder="Họ tên" onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
          
          <div className="grid grid-cols-2 gap-3">
             <input type="text" name="age" placeholder="Tuổi" onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
             <input type="text" name="phone" placeholder="SĐT" onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
          </div>
          
          <input type="text" name="address" placeholder="Địa chỉ" onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
          
          <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
          
          <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
          
          <input type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu" onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
          
          <button type="submit" disabled={loading} className="w-full py-3 text-white bg-indigo-600 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70">
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
        
        <p className="text-center text-sm mt-6 text-gray-600 dark:text-[#9fadbc]">
          Đã có tài khoản? <Link to="/login" className="text-indigo-600 font-semibold hover:underline dark:text-indigo-400">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;