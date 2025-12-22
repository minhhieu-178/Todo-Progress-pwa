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

    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      setLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/'); 
      } else {
        setError('Email hoặc mật khẩu không chính xác');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // SỬA: Nền chính #1d2125
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1d2125] transition-colors duration-200">
      
      {/* SỬA: Form nền #22272b, Viền white/10 */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#22272b] rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
        
        <div className="flex items-center justify-center gap-3 mb-4">
          {/* SỬA: Tiêu đề chính #b6c2cf */}
          <span className="text-2xl font-bold text-gray-900 dark:text-[#b6c2cf]">Task Management</span>
        </div>
        {/* SỬA: Tiêu đề phụ #9fadbc */}
        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-[#9fadbc] mb-6">Welcome back!</h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
            {error}
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
            <div className="flex justify-between items-baseline mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-[#b6c2cf]">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Forgot password?</Link>
            </div>
            {/* SỬA: Input nền #1d2125 */}
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
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
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-[#9fadbc] mt-6">
          Don't have an account? 
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline ml-1 dark:text-indigo-400">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;