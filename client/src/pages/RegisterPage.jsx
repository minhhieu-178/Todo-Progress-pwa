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
        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-[#9fadbc] mb-6">Create your account</h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-[#b6c2cf] mb-1">Full name</label>
            {/* SỬA: Input nền #1d2125 */}
            <input 
              type="text" 
              id="fullName" 
              name="fullName" 
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc]"
              required
            />
=======
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
>>>>>>> Stashed changes
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