import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authApi';
import { uploadImage } from '../services/api';
import { Camera } from 'lucide-react';

function UserProfilePage() {
  const { user, updateUser } = useAuth(); 
  const [formData, setFormData] = useState({ fullName: '', age: '', phone: '', address: '', avatar: '' });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.fullName || '', age: user.age || '', phone: user.phone || '', address: user.address || '', avatar: user.avatar || '' });
      setEmail(user.email || '');
    }
  }, [user]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { const imageUrl = await uploadImage(file); setFormData(prev => ({ ...prev, avatar: imageUrl })); } 
    catch (error) { alert("Lỗi upload: " + error); } finally { setUploading(false); }
  };
  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMessage({ type: '', text: '' });
    try { const updatedData = await updateProfile(formData); updateUser(updatedData); setMessage({ type: 'success', text: 'Cập nhật thành công!' }); } 
    catch (err) { setMessage({ type: 'error', text: err.toString() }); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Hồ sơ" showSearch={false} />

      {/* Padding: p-3 cho mobile */}
      <div className="flex-1 overflow-auto p-3 md:p-8 transition-colors duration-200">
        
        {/* Card: p-4 cho mobile */}
        <div className="max-w-xl mx-auto glass-effect p-4 md:p-8 rounded-xl shadow-sm border border-white/10">

          <div className="flex flex-col items-center mb-5 relative">
            <div className="relative">
                {formData.avatar ? (
                    // Avatar: w-20 trên mobile
                    <img src={formData.avatar} alt="Avatar" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md border-4 border-white/20" />
                ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold border-4 border-white/20">
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                )}
                <label className="absolute bottom-0 right-0 p-2 bg-white/10 rounded-full shadow-lg cursor-pointer border border-white/20 hover:bg-white/20 backdrop-blur-sm">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                    <Camera className={`w-3.5 h-3.5 md:w-4 md:h-4 text-white ${uploading ? 'animate-spin' : ''}`} />
                </label>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white mt-3">{user?.fullName}</h2>
            <p className="text-xs md:text-sm text-white/70">{user?.email}</p>
          </div>

          {message.text && <div className={`p-3 mb-4 text-sm rounded-lg border ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>{message.text}</div>}

          {/* Form spacing: space-y-3 compact */}
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-white mb-1">Họ và tên</label>
              <input type="text" id="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 md:py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" required />
            </div>
            
            <div>
              <label className="block text-xs md:text-sm font-medium text-white mb-1">Email</label>
              <input type="email" value={email} className="w-full px-3 py-2 md:py-2.5 border border-white/10 rounded-lg bg-white/5 text-white/60 cursor-not-allowed text-sm" disabled />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs md:text-sm font-medium text-white mb-1">Tuổi</label>
                    <input type="text" id="age" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value.replace(/\D/g, '') })} className="w-full px-3 py-2 md:py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" />
                </div>
                <div>
                    <label className="block text-xs md:text-sm font-medium text-white mb-1">Số ĐT</label>
                    <input type="text" id="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 md:py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" />
                </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-white mb-1">Địa chỉ</label>
              <input type="text" id="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 md:py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" />
            </div>

            <button type="submit" disabled={loading} className="w-full mt-2 px-4 py-2.5 md:py-3 text-white bg-blue-600/80 rounded-lg hover:bg-blue-600 font-medium shadow-sm text-sm md:text-base transition-colors backdrop-blur-sm">
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default UserProfilePage;