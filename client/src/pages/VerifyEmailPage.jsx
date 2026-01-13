import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { verifyEmailOtp, resendEmailOtp } from '../services/authApi';
import { CheckCircle } from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const prefilledEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (prefilledEmail) setEmail(prefilledEmail);
  }, [prefilledEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('Đang xác thực...');
    setError('');
    try {
      await verifyEmailOtp(email, otp);
      setStatus('success');
      setMessage('Xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setStatus('idle');
      setError(typeof err === 'string' ? err : 'Xác thực thất bại.');
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email để gửi lại mã OTP.');
      return;
    }
    setResendLoading(true);
    setError('');
    try {
      await resendEmailOtp(email);
      setMessage('Mã OTP mới đã được gửi tới email của bạn.');
      setError('');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Gửi lại mã thất bại.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 dark:bg-pink-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 dark:bg-indigo-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform overflow-hidden bg-white dark:bg-gray-700">
             <img src="/icons/icon-192x192.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Xác thực Email</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Nhập mã OTP được gửi tới email của bạn</p>
        </div>

        {status === 'idle' && (
          <div>
            {message && !error && (
               <div className="p-4 mb-6 text-sm text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800/50 flex items-start gap-2">
                 <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                 <span>{message}</span>
               </div>
            )}
            
            {error && (
              <div className="p-4 mb-6 text-sm text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800/50 flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="your@email.com" 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mã OTP</label>
                 <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="6 chữ số" 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-center tracking-widest text-lg font-bold" 
                 />
              </div>
              
              <button 
                type="submit" 
                className="w-full py-3.5 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Xác thực ngay
              </button>
            </form>
            
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Chưa nhận được mã?</p>
                <button 
                  type="button" 
                  onClick={handleResendOtp} 
                  disabled={resendLoading}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {resendLoading ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
                </button>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center py-8">
            <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Đang xác thực...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Thành công!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{message}</p>
            <Link to="/login" className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-lg">
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;