import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, UserPlus, Trash2, Crown, Mail } from 'lucide-react';

function MembersModal({ isOpen, onClose, members, ownerId, currentUser, onInvite, onRemove }) {
  const [inviteEmail, setInviteEmail] = useState('');

  const isOwner = currentUser?._id === ownerId?._id || currentUser?._id === ownerId;

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      onInvite(inviteEmail);
      setInviteEmail('');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
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

        {/* Modal Panel */}
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                
                {/* Header Modal */}
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Quản lý thành viên
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                      {members.length}
                    </span>
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Phần Mời thành viên (Chỉ hiện nếu là Chủ) */}
                {isOwner && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Thêm thành viên mới
                    </label>
                    <form onSubmit={handleInviteSubmit} className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="Nhập địa chỉ email..."
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-pro-blue outline-none dark:text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!inviteEmail}
                        className="bg-pro-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Mời</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* Danh sách thành viên */}
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Thành viên hiện tại</div>
                  
                  {members.map((member) => {
                    const isMemberOwner = (member._id === (ownerId?._id || ownerId));
                    return (
                      <div key={member._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm border-2 border-white dark:border-gray-800 shadow-sm">
                            {member.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {member.fullName}
                              {isMemberOwner && (
                                <span className="flex items-center gap-1 text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800">
                                  <Crown className="w-3 h-3" /> Owner
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                          </div>
                        </div>

                        {/* Nút Xóa (Chỉ hiện nếu mình là Chủ và không xóa chính mình) */}
                        {isOwner && !isMemberOwner && (
                          <button
                            onClick={() => onRemove(member._id, member.fullName)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Xóa khỏi bảng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default MembersModal;