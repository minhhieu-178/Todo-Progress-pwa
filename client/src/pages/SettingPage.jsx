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

<<<<<<< Updated upstream
      {/* SỬA: Nền chính #1d2125 */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-[#1d2125] transition-colors duration-200">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* --- GIAO DIỆN --- */}
          {/* SỬA: Card nền #22272b, Viền white/10 */}
          <div className="bg-white dark:bg-[#22272b] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                {/* SỬA: Màu chữ tiêu đề #b6c2cf */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#b6c2cf]">Giao diện</h3>
                {/* SỬA: Màu chữ phụ #9fadbc */}
                <p className="text-sm text-gray-500 dark:text-[#9fadbc]">Chuyển đổi giữa giao diện sáng và tối.</p>
              </div>
              {/* SỬA: Nút toggle nền #1d2125 */}
              <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-[#1d2125] hover:bg-gray-200 dark:hover:bg-[#2c333a] transition-colors">
                {theme === 'light' ? <Moon className="w-6 h-6 text-gray-600" /> : <Sun className="w-6 h-6 text-yellow-400" />}
=======
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50 dark:bg-[#1d2125] transition-colors duration-200">
        <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
          
          {/* Theme */}
          <div className="bg-white dark:bg-[#22272b] p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#b6c2cf]">Giao diện</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-[#9fadbc]">Chuyển đổi Sáng / Tối.</p>
              </div>
              <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-[#1d2125] hover:bg-gray-200 transition-colors">
                {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
>>>>>>> Stashed changes
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white dark:bg-[#22272b] p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400"><Lock className="w-5 h-5" /></div>
                <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#b6c2cf]">Đổi mật khẩu</h3>
                </div>
            </div>

            {pwdMessage.text && <div className={`p-3 mb-4 text-sm rounded-lg ${pwdMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{pwdMessage.text}</div>}

            {step === 1 ? (
<<<<<<< Updated upstream
                <form onSubmit={handleRequestOtp} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#b6c2cf] mb-1">Mật khẩu hiện tại</label>
                        {/* SỬA: Input nền #1d2125 */}
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] focus:ring-2 focus:ring-pro-blue" required />
                    </div>
                    <button type="submit" disabled={loadingPwd} className="px-4 py-2 bg-pro-blue hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        {loadingPwd ? 'Đang kiểm tra...' : 'Tiếp tục (Gửi OTP)'}
                    </button>
=======
                <form onSubmit={handleRequestOtp} className="space-y-4">
                    <input type="password" placeholder="Mật khẩu hiện tại" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf]" required />
                    <button type="submit" disabled={loadingPwd} className="w-full md:w-auto px-4 py-2.5 bg-pro-blue hover:bg-blue-600 text-white rounded-lg text-sm font-medium">Tiếp tục</button>
>>>>>>> Stashed changes
                </form>
            ) : (
                <form onSubmit={handleConfirmChange} className="space-y-4">
                    <input type="text" placeholder="Mã OTP (6 số)" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf]" required />
                    <input type="password" placeholder="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf]" required />
                    <div className="flex gap-3">
                        <button type="submit" disabled={loadingPwd} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium">Xác nhận</button>
                        <button type="button" onClick={() => { setStep(1); setPwdMessage({type:'', text:''}); }} className="px-4 py-2.5 bg-gray-100 dark:bg-[#1d2125] text-gray-700 dark:text-[#b6c2cf] rounded-lg text-sm">Hủy</button>
                    </div>
                </form>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-[#22272b] p-4 md:p-6 rounded-xl shadow-sm border border-red-200 dark:border-red-900/30">
            <h3 className="text-base md:text-lg font-semibold text-red-600 mb-2">Xóa tài khoản</h3>
            <p className="text-xs md:text-sm text-gray-500 mb-4">Hành động này không thể hoàn tác.</p>
            <button onClick={() => setIsDeleteModalOpen(true)} className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
            </button>
          </div>
        </div>
      </div>

      {/* Modal Delete (Giữ nguyên logic, chỉ chỉnh CSS cho mobile nếu cần) */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
<<<<<<< Updated upstream
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                {/* SỬA: Modal Delete nền #22272b */}
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#22272b] p-6 text-left align-middle shadow-xl transition-all border border-red-200 dark:border-red-900/50">
                  
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-lg font-bold text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6" />
                      Xác nhận xóa tài khoản
                    </Dialog.Title>
                    <button onClick={closeDeleteModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#b6c2cf]">
                        <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-[#9fadbc]">
                      Hành động này <strong>không thể hoàn tác</strong>. Toàn bộ bảng công việc, danh sách và thẻ của bạn sẽ bị xóa vĩnh viễn.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-[#9fadbc] mt-2">
                      Vui lòng nhập mật khẩu của bạn để xác nhận:
                    </p>
                  </div>

                  <form onSubmit={handleConfirmDelete} className="mt-4 space-y-4">
                    <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        placeholder="Nhập mật khẩu của bạn"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        autoFocus
                    />
                    
                    {deleteError && (
                        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                            {deleteError}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#b6c2cf] bg-gray-100 dark:bg-[#1d2125] rounded-lg hover:bg-gray-200 dark:hover:bg-[#2c333a] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                            onClick={closeDeleteModal}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loadingDelete || !deletePassword}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loadingDelete ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                        </button>
                    </div>
                  </form>

                </Dialog.Panel>
              </Transition.Child>
=======
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#22272b] p-6 text-left shadow-xl transition-all border border-red-200">
                        <Dialog.Title as="h3" className="text-lg font-bold text-red-600 flex items-center gap-2"><AlertTriangle className="w-6 h-6" /> Xác nhận xóa</Dialog.Title>
                        <form onSubmit={handleConfirmDelete} className="mt-4 space-y-4">
                            <input type="password" className="w-full px-4 py-2 border rounded-lg dark:bg-[#1d2125] dark:text-white" placeholder="Nhập mật khẩu" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} autoFocus />
                            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" className="px-4 py-2 text-sm bg-gray-100 dark:bg-[#1d2125] dark:text-white rounded-lg" onClick={() => setIsDeleteModalOpen(false)}>Hủy</button>
                                <button type="submit" disabled={loadingDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">{loadingDelete ? '...' : 'Xóa'}</button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </div>
>>>>>>> Stashed changes
            </div>
        </Dialog>
      </Transition>
    </div>
  );
}
export default SettingPage;