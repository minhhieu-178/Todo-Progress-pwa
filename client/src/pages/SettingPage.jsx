import React, { useState, Fragment } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { deleteAccount, requestChangePassword, confirmChangePassword } from '../services/authApi';
import { Moon, Sun, Trash2, Lock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

function SettingPage() {
  // (Logic giữ nguyên)
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault(); if (!currentPassword) return;
    setLoadingPwd(true); setPwdMessage({ type: '', text: '' });
    try { await requestChangePassword(currentPassword); setStep(2); setPwdMessage({ type: 'success', text: 'Đã gửi mã OTP đến email.' }); } 
    catch (err) { setPwdMessage({ type: 'error', text: err.toString() }); } finally { setLoadingPwd(false); }
  };

  const handleConfirmChange = async (e) => {
    e.preventDefault(); if (!otp || !newPassword) return;
    setLoadingPwd(true); setPwdMessage({ type: '', text: '' });
    try { await confirmChangePassword(otp, newPassword); setPwdMessage({ type: 'success', text: 'Thành công!' }); setStep(1); setCurrentPassword(''); setNewPassword(''); setOtp(''); } 
    catch (err) { setPwdMessage({ type: 'error', text: err.toString() }); } finally { setLoadingPwd(false); }
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault(); if (!deletePassword) { setDeleteError('Vui lòng nhập mật khẩu.'); return; }
    setLoadingDelete(true); setDeleteError('');
    try { await deleteAccount(deletePassword); setIsDeleteModalOpen(false); logout(); } catch (err) { setDeleteError(err.toString()); } finally { setLoadingDelete(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Cài đặt" showSearch={false} />

      <div className="flex-1 overflow-auto p-4 md:p-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
          
          {/* Theme */}
          <div className="glass-effect p-4 md:p-6 rounded-xl shadow-sm border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-white">Giao diện</h3>
                <p className="text-xs md:text-sm text-white/70">Chuyển đổi Sáng / Tối.</p>
              </div>
              <button onClick={toggleTheme} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                {theme === 'light' ? <Moon className="w-5 h-5 text-white/80" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="glass-effect p-4 md:p-6 rounded-xl shadow-sm border border-white/10">
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Lock className="w-5 h-5" /></div>
                <div>
                    <h3 className="text-base md:text-lg font-semibold text-white">Đổi mật khẩu</h3>
                </div>
            </div>

            {pwdMessage.text && <div className={`p-3 mb-4 text-sm rounded-lg border ${pwdMessage.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>{pwdMessage.text}</div>}

            {step === 1 ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                    <input type="password" placeholder="Mật khẩu hiện tại" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" required />
                    <button type="submit" disabled={loadingPwd} className="w-full md:w-auto px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-sm font-medium backdrop-blur-sm">Tiếp tục</button>
                </form>
            ) : (
                <form onSubmit={handleConfirmChange} className="space-y-4">
                    <input type="text" placeholder="Mã OTP (6 số)" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" required />
                    <input type="password" placeholder="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" required />
                    <div className="flex gap-3">
                        <button type="submit" disabled={loadingPwd} className="flex-1 px-4 py-2.5 bg-green-600/80 text-white rounded-lg text-sm font-medium hover:bg-green-600 backdrop-blur-sm">Xác nhận</button>
                        <button type="button" onClick={() => { setStep(1); setPwdMessage({type:'', text:''}); }} className="px-4 py-2.5 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 backdrop-blur-sm">Hủy</button>
                    </div>
                </form>
            )}
          </div>

          {/* Danger Zone */}
          <div className="glass-effect p-4 md:p-6 rounded-xl shadow-sm border border-red-500/30">
            <h3 className="text-base md:text-lg font-semibold text-red-400 mb-2">Xóa tài khoản</h3>
            <p className="text-xs md:text-sm text-white/70 mb-4">Hành động này không thể hoàn tác.</p>
            <button onClick={() => setIsDeleteModalOpen(true)} className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600 text-sm backdrop-blur-sm">
              <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
            </button>
          </div>
        </div>
      </div>

      {/* Modal Delete */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl glass-effect p-6 text-left shadow-xl transition-all border border-red-500/30">
                        <Dialog.Title as="h3" className="text-lg font-bold text-red-400 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> Xác nhận xóa</Dialog.Title>
                        <form onSubmit={handleConfirmDelete} className="mt-4 space-y-4">
                            <input type="password" className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all backdrop-blur-sm" placeholder="Nhập mật khẩu" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoFocus />
                            {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" className="px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}>Hủy</button>
                                <button type="submit" disabled={loadingDelete} className="px-4 py-2 text-sm bg-red-600/80 text-white rounded-lg hover:bg-red-600 backdrop-blur-sm">{loadingDelete ? '...' : 'Xóa'}</button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
      </Transition>
    </div>
  );
}
export default SettingPage;