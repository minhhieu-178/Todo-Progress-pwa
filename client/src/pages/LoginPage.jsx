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
    // Thêm dark:bg-gray-900
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      
      {/* Thẻ Card: dark:bg-gray-800 dark:border-gray-700 */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Task Management</span>
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-6">Welcome back!</h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="you@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              // Input: dark:bg-gray-700 dark:border-gray-600 dark:text-white
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-pro-blue hover:underline">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <button 
              type="submit"
              disabled={loading} 
              className="w-full px-4 py-3 text-white bg-pro-blue rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don't have an account? 
          <Link to="/register" className="font-semibold text-pro-blue hover:underline ml-1">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;