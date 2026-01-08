import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authApi';
import { uploadImage } from '../services/api';
import { getMyActivities } from '../services/logApi';
import { 
  Camera, Activity, User, Clock, FileText, Loader, 
  Mail, Phone, MapPin, Calendar, Shield, Save
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

function UserProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({ 
    fullName: '', age: '', phone: '', address: '', avatar: '' 
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
      alert("Lỗi upload: " + error); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
    setMessage({ type: '', text: '' });
    try { 
      const updatedData = await updateProfile(formData); 
      updateUser(updatedData); 
      setMessage({ type: 'success', text: 'Đã cập nhật hồ sơ thành công!' }); 
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) { 
      setMessage({ type: 'error', text: err.toString() }); 
    } finally { 
      setLoading(false); 
    }
  };

  const [activities, setActivities] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    if (activeTab === 'activity') {
      const fetchActivities = async () => {
        setLoadingActivity(true);
        try {
          const data = await getMyActivities();
          setActivities(data);
        } catch (error) {
          console.error("Lỗi tải log:", error);
        } finally {
          setLoadingActivity(false);
        }
      };
      fetchActivities();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <PageHeader title="Hồ sơ cá nhân" showSearch={false} />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          
          {/* 1. Header Card - Style Centered Modern */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
            {/* Cover Image */}
            <div className="h-32 md:h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
               {/* Giữ lại hiệu ứng vòng tròn trang trí cũ nếu muốn, hoặc để trơn cho sạch */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            </div>
            
            <div className="px-6 pb-6 text-center relative">
              {/* Avatar Section */}
              <div className="mx-auto -mt-16 w-32 h-32 relative mb-4 group">
                {/* Container tròn + Viền + Nền Gradient theo yêu cầu */}
                <div className={`w-full h-full rounded-full ring-4 ring-white dark:ring-gray-800 shadow-lg overflow-hidden flex items-center justify-center transition-all ${
                  formData.avatar 
                    ? 'bg-white dark:bg-gray-800' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-600' // <--- Đã sửa thành Gradient Xanh-Tím
                }`}>
                   {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      // Chữ chuyển sang màu Trắng để nổi bật trên nền Gradient đậm
                      <span className="text-4xl font-bold text-white drop-shadow-md select-none">
                         {user?.fullName?.charAt(0).toUpperCase()}
                      </span>
                    )}
                </div>

                 {/* Nút Upload Camera */}
                 <label className="absolute bottom-1 right-1 p-2.5 bg-gray-900/80 hover:bg-black text-white rounded-full cursor-pointer shadow-md border-2 border-white dark:border-gray-800 transition-transform hover:scale-110 backdrop-blur-sm group-hover:animate-bounce-short">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                    <Camera className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                 </label>
              </div>

              {/* Tên & Email */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.fullName || 'Chưa cập nhật tên'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center gap-2 mb-6">
                <Mail className="w-4 h-4" /> {user?.email}
              </p>

              {/* Tabs Navigation - Dạng line đơn giản, hiện đại */}
              <div className="flex justify-center border-b border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'profile'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Thông tin cá nhân
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'activity'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Lịch sử hoạt động
                </button>
              </div>
            </div>
          </div>

          {/* 2. Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Quick Stats or Greeting (Optional - giữ layout cân đối) */}
            <div className="lg:col-span-3">
               
               {/* TAB 1: PROFILE FORM */}
               {activeTab === 'profile' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 animate-fadeIn">
                     <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                           <Shield className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-gray-900 dark:text-white">Thông tin cơ bản</h3>
                           <p className="text-sm text-gray-500 dark:text-gray-400">Quản lý thông tin hiển thị của bạn</p>
                        </div>
                     </div>

                     {message.text && (
                        <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${
                           message.type === 'success' 
                           ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30' 
                           : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                        }`}>
                           <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                           <p className="text-sm font-medium">{message.text}</p>
                        </div>
                     )}

                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           
                           {/* Full Name */}
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên</label>
                              <div className="relative">
                                 <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                 <input 
                                    type="text" id="fullName" value={formData.fullName} onChange={handleChange} 
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                    placeholder="Nhập tên của bạn" required 
                                 />
                              </div>
                           </div>

                           {/* Email (Disabled) */}
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                              <div className="relative">
                                 <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                 <input 
                                    type="email" value={email} disabled 
                                    className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                 />
                              </div>
                           </div>

                           {/* Phone */}
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</label>
                              <div className="relative">
                                 <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                 <input 
                                    type="text" id="phone" value={formData.phone} onChange={handleChange} 
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                    placeholder="0912..." 
                                 />
                              </div>
                           </div>

                           {/* Age */}
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tuổi</label>
                              <div className="relative">
                                 <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                 <input 
                                    type="text" id="age" 
                                    value={formData.age} 
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value.replace(/\D/g, '') })} 
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                    placeholder="25" 
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                           <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ</label>
                           <div className="relative">
                              <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                              <textarea 
                                 id="address" rows="3" value={formData.address} onChange={handleChange} 
                                 className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white resize-none"
                                 placeholder="Nhập địa chỉ của bạn..." 
                              />
                           </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                           <button 
                              type="submit" disabled={loading} 
                              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all transform hover:translate-y-[-1px] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                           >
                              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                           </button>
                        </div>
                     </form>
                  </div>
               )}

               {/* TAB 2: ACTIVITY LOG (Timeline Design) */}
               {activeTab === 'activity' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn flex flex-col h-[600px]">
                     <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                        <div>
                           <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <Clock className="w-5 h-5 text-blue-500" />
                              Nhật ký hoạt động
                           </h3>
                           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Lịch sử các thao tác gần đây của bạn</p>
                        </div>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {loadingActivity ? (
                           <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                              <Loader className="w-8 h-8 animate-spin text-blue-500" />
                              <p className="text-sm font-medium">Đang tải dữ liệu...</p>
                           </div>
                        ) : activities.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center">
                                 <Activity className="w-10 h-10 opacity-50" />
                              </div>
                              <p>Chưa có hoạt động nào được ghi lại.</p>
                           </div>
                        ) : (
                           <div className="relative pl-4">
                              {/* Vertical Line */}
                              <div className="absolute left-6 top-2 bottom-6 w-0.5 bg-gray-100 dark:bg-gray-700"></div>

                              {activities.map((log) => (
                                 <div key={log._id} className="relative pl-10 pb-8 last:pb-0 group">
                                    {/* Timeline Dot */}
                                    <div className="absolute left-0 top-1 w-12 h-12 flex items-center justify-center">
                                       <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white dark:ring-gray-800 shadow-sm z-10 group-hover:scale-125 transition-transform"></div>
                                    </div>
                                    
                                    {/* Content Card */}
                                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md border border-transparent hover:border-gray-100 dark:hover:border-gray-600 transition-all duration-200">
                                       <div className="flex items-start justify-between gap-4">
                                          <div className="flex-1">
                                             <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                                                Bạn <span className="font-semibold text-gray-900 dark:text-white">{log.content}</span>
                                                {log.boardId && (
                                                   <span className="text-gray-500 dark:text-gray-400 ml-1">
                                                      trong bảng <span className="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded text-xs">{log.boardId.title}</span>
                                                   </span>
                                                )}
                                             </p>
                                          </div>
                                          <span className="text-xs text-gray-400 whitespace-nowrap bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-100 dark:border-gray-600">
                                             {(() => {
                                                try {
                                                   return format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: vi });
                                                } catch { return 'Vừa xong'; }
                                             })()}
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;