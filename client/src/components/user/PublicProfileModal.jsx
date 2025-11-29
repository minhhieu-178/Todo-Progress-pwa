import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Mail, Phone, MapPin, Calendar, User, Briefcase } from 'lucide-react'; // Import thêm icon

function PublicProfileModal({ isOpen, onClose, user }) {
  if (!user) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                
                {/* Header: Avatar & Close */}
                <div className="relative flex flex-col items-center mb-6">
                    <button 
                        onClick={onClose} 
                        className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3 ring-4 ring-white dark:ring-gray-700">
                        {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    
                    <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                        {user.fullName}
                    </Dialog.Title>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full mt-1">
                        Thành viên
                    </p>
                </div>

                {/* Body: Info List */}
                <div className="space-y-3">
                    
                    {/* Email */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Số điện thoại */}
                    {user.phone ? (
                        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Điện thoại</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.phone}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-xs text-gray-400 italic py-1">Chưa cập nhật số điện thoại</div>
                    )}

                    {/* Tuổi & Địa chỉ (Gộp chung row nếu muốn hoặc tách riêng) */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Tuổi */}
                        {user.age && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-lg">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tuổi</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.age}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Placeholder nếu không có tuổi để layout đẹp hơn */}
                        {!user.age && <div className="hidden"></div>}
                    </div>

                    {/* Địa chỉ */}
                    {user.address && (
                        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Địa chỉ</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{user.address}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-transparent bg-gray-900 dark:bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 dark:hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all shadow-lg shadow-indigo-500/20"
                      onClick={onClose}
                    >
                      Đóng
                    </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default PublicProfileModal;