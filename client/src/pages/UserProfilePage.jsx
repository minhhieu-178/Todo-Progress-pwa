import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authApi';

function UserProfilePage() {
  const { user, updateUser } = useAuth(); 
  
  // State cho form
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    phone: '',
    address: ''
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        age: user.age || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      setEmail(user.email || '');
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Gọi API updateProfile với object data
      const updatedData = await updateProfile(formData);
      updateUser(updatedData); 
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.toString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header của trang */}
      <PageHeader title="Thông Tin Người Dùng" showSearch={false} />

      <div className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md mb-4">
                {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.fullName}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>

          {message.text && (
            <div className={`p-4 mb-6 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Họ tên */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
              <input 
                type="text" 
                id="fullName" 
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Không thể thay đổi)</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                disabled
              />
            </div>

            {/* Tuổi & Số điện thoại */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tuổi</label>
                    <input 
                        type="number" 
                        id="age" 
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                    <input 
                        type="text" 
                        id="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ</label>
              <input 
                type="text" 
                id="address" 
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors disabled:opacity-70"
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;