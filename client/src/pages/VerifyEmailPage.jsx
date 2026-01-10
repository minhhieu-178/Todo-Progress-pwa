import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { verifyEmailOtp } from '../services/authApi';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const prefilledEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (prefilledEmail) setEmail(prefilledEmail);
  }, [prefilledEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('Đang xác thực...');
    try {
      await verifyEmailOtp(email, otp);
      setStatus('success');
      setMessage('Xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setStatus('error');
      setMessage(typeof err === 'string' ? err : 'Xác thực thất bại.');
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {status === 'idle' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Xác thực email bằng OTP</h2>
            <p className="text-gray-600 mb-4">Nhập email và mã OTP bạn nhận được để kích hoạt tài khoản.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-3 border rounded" />
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6 chữ số OTP" required className="w-full px-4 py-3 border rounded" />
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded">Xác thực</button>
            </form>
            <p className="text-sm mt-4">Nếu bạn chưa nhận được email, kiểm tra mục spam hoặc thử đăng ký lại.</p>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold">Đang xử lý...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thành công!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded">Đăng nhập</Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Lỗi xác thực</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/login" className="text-blue-500 hover:underline">Quay lại đăng nhập</Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;