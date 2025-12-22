import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authApi';
import { uploadImage } from '../services/api';
import { Camera } from 'lucide-react';

function UserProfilePage() {
  const { user, updateUser } = useAuth(); 
  
  // State cho form
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        age: user.age || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || ''
      });
      setEmail(user.email || '');
    }
  }, [user]);

const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
      
    } catch (error) {
      alert("Lỗi upload ảnh: " + error);
    } finally {
      setUploading(false);
    }
  };

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

      {/* SỬA: Nền chính #1d2125 */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-[#1d2125] transition-colors duration-200">
        {/* SỬA: Nền Card #22272b, Viền white/10 */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#22272b] p-8 rounded-lg shadow-sm border border-gray-100 dark:border-white/10">

          <div className="flex flex-col items-center mb-8 relative">
            <div className="relative">
                {formData.avatar ? (
                    <img 
                        src={formData.avatar} 
                        alt="Avatar" 
                        // SỬA: Viền avatar trùng màu nền card
                        className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-white dark:border-[#22272b]"
                    />
                ) : (
                    <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md">
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Nút Upload đè lên góc */}
                {/* SỬA: Nền nút upload tối #1d2125 */}
                <label className="absolute bottom-0 right-0 p-2 bg-white dark:bg-[#1d2125] rounded-full shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2c333a] transition-colors border border-gray-200 dark:border-gray-700">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={uploading}
                    />
                    <Camera className={`w-4 h-4 text-gray-600 dark:text-[#9fadbc] ${uploading ? 'animate-spin' : ''}`} />
                </label>
            </div>
            {/* SỬA: Màu chữ tiêu đề #b6c2cf */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#b6c2cf] mt-4">{user?.fullName}</h2>
            {/* SỬA: Màu chữ phụ #9fadbc */}
            <p className="text-gray-500 dark:text-[#9fadbc]">{user?.email}</p>
          </div>

          {message.text && (
            <div className={`p-4 mb-6 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Họ tên */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-[#b6c2cf] mb-1">Họ và tên</label>
              <input 
                type="text" 
                id="fullName" 
                value={formData.fullName}
                onChange={handleChange}
                // SỬA: Input nền tối inset #1d2125, chữ sáng #b6c2cf
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf]"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-[#b6c2cf] mb-1">Email (Không thể thay đổi)</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                // SỬA: Input disabled nền tối hơn chút #161a1d
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100 dark:bg-[#161a1d] text-gray-500 dark:text-[#9fadbc] cursor-not-allowed"
                disabled
              />
            </div>

            {/* Tuổi & Số điện thoại */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-[#b6c2cf] mb-1">Tuổi</label>
                    <input 
                        type="text" 
                        id="age" 
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, age: value });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf]"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-[#b6c2cf] mb-1">Số điện thoại</label>
                    <input 
                        type="text" 
                        id="phone" 
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf]"
                    />
                </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-[#b6c2cf] mb-1">Địa chỉ</label>
              <input 
                type="text" 
                id="address" 
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf]"
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