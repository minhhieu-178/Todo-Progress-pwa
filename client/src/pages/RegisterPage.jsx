import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "", age: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const validate = (name, value) => {
    if (name === "fullName" && value.trim().length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
    
    if (name === "age" && value) {
      const ageNum = parseInt(value);
      if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) return "Tuổi phải từ 10 đến 100";
    }

    if (name === "phone" && value) {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
      if (!phoneRegex.test(value)) return "Số điện thoại không đúng định dạng VN";
    }

    if (name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Email không hợp lệ";
    }

    if (name === "password" && value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    
    if (name === "confirmPassword" && value !== formData.password) return "Mật khẩu không khớp!";
    
    return "";
  };

  const handleBlur = (e) => {
    const err = validate(e.target.name, e.target.value);
    if (err) setError(err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(""); 

    const fields = ["fullName", "age", "phone", "email", "password", "confirmPassword"];
    for (const field of fields) {
        const err = validate(field, formData[field]);
        if (err) {
            setError(err);
            return;
        }
    }

    try { 
      setLoading(true); 
      await register(formData.fullName, formData.email, formData.password, formData.age, formData.phone, formData.address); 
      // After registering, navigate user to OTP verification page with email prefilled
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      return;
    } catch (err) { 
      setError(err.toString()); 
    } finally { 
      setLoading(false); 
    }
  };
  
  
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 dark:from-gray-900 dark:via-teal-900 dark:to-blue-900 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-teal-300 dark:bg-teal-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-green-300 dark:bg-green-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 my-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform overflow-hidden">
            <img src="/icons/icon-192x192.png" alt="Task Manager Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Đăng ký tài khoản</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Tạo tài khoản mới để bắt đầu</p>
        </div>
        
        {error && <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800/50 flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="fullName" placeholder="Họ và tên" onChange={handleChange} onBlur={handleBlur} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
          
          <div className="grid grid-cols-2 gap-3">
             <input type="text" name="age" placeholder="Tuổi" onChange={handleChange} onBlur={handleBlur} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
             <input type="text" name="phone" placeholder="Số điện thoại" onChange={handleChange} onBlur={handleBlur} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
          </div>
          
          <input type="text" name="address" placeholder="Địa chỉ" onChange={handleChange} onBlur={handleBlur} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
          
          <input type="email" name="email" placeholder="Email" onChange={handleChange} onBlur={handleBlur} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
          
          <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} onBlur={handleBlur} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
          
          <input type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu" onChange={handleChange} onBlur={handleBlur} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" required />
          
          <button type="submit" disabled={loading} className="w-full py-3.5 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed mt-6">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang xử lý...
              </span>
            ) : 'Đăng ký'}
          </button>
        </form>
        
        <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
          Đã có tài khoản? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;