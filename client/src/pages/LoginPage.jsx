import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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
        
        {error && (
            {error}
          </div>
        )}

          <div>
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-sm font-medium text-pro-blue hover:underline">Forgot password?</a>
            </div>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="••••••••"
              value={password} // Kết nối state
              onChange={(e) => setPassword(e.target.value)} // Kết nối state
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-blue"
              required
            />
          </div>

          <div>
            <button 
              type="submit"
              disabled={loading} // Kết nối state
              className="w-full px-4 py-3 text-white bg-pro-blue rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account? 
          {/* Dùng <Link> của React Router */}
          <Link to="/register" className="font-semibold text-pro-blue hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;