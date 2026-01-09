import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../services/authApi';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('Đang xác thực email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Đường dẫn không hợp lệ.');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.');
      } catch (err) {
        setStatus('error');
        setMessage(typeof err === 'string' ? err : 'Xác thực thất bại.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Đang xử lý...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Thành công!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <Link 
              to="/login" 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Lỗi xác thực</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <Link 
              to="/login" 
              className="text-blue-500 hover:underline"
            >
              Quay lại trang đăng nhập
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;