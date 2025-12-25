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
    e.preventDefault(); setError(''); setLoading(true);
    try { const success = await login(email, password); if (success) navigate('/'); else setError('Sai tài khoản hoặc mật khẩu'); } 
    catch (err) { setError('Lỗi hệ thống'); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen transition-colors p-0 md:p-4 relative">
      
      {/* Glass Card Container */}
      <div className="w-full max-w-md p-6 md:p-8 glass-effect md:rounded-xl relative z-10">
        <h2 className="text-xl font-bold text-center text-white mb-6">Đăng nhập</h2>
        
        {error && <div className="p-3 mb-4 text-sm text-red-300 bg-red-900/30 rounded-lg border border-red-700/50">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" 
            required 
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" 
            required 
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-blue-300 hover:text-blue-200 hover:underline">Quên mật khẩu?</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 text-white bg-blue-600/80 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-70 backdrop-blur-sm">
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
        
        <p className="text-center text-sm mt-6 text-white/80">
          Chưa có tài khoản? <Link to="/register" className="text-blue-300 font-semibold hover:text-blue-200 hover:underline">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
export default LoginPage;