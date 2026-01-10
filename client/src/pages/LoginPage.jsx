import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      navigate('/');
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    // CONTAINER NGOÀI: 
    // - Mobile: bg-white (trùng màu card), p-0 (full màn hình)
    // - Desktop (md): bg-gray-50 (như cũ), p-4
    <div className="flex items-center justify-center min-h-screen transition-colors bg-white md:bg-gray-50 dark:bg-[#22272b] md:dark:bg-[#1d2125] p-0 md:p-4">
      
      {/* CARD TRONG:
          - Mobile: Bỏ shadow, bỏ border, bỏ rounded (để phẳng hoàn toàn)
          - Desktop (md): Giữ nguyên shadow, border, rounded-xl
      */}
      <div className="w-full max-w-md p-6 md:p-8 bg-white dark:bg-[#22272b] md:rounded-xl md:shadow-sm md:border border-gray-200 dark:border-white/10">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-[#b6c2cf] mb-6">Đăng nhập</h2>
        
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
            required 
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] dark:placeholder-[#9fadbc] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
            required 
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">Quên mật khẩu?</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 text-white bg-indigo-600 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70">
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
        
        <p className="text-center text-sm mt-6 text-gray-600 dark:text-[#9fadbc]">
          Chưa có tài khoản? <Link to="/register" className="text-indigo-600 font-semibold hover:underline dark:text-indigo-400">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
export default LoginPage;