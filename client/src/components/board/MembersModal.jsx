import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, UserPlus, Trash2, Crown, Search, Loader } from 'lucide-react';
import { searchUsersApi } from '../../services/searchApi';

function MembersModal({ isOpen, onClose, members, ownerId, currentUser, onInvite, onRemove }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const isOwner = currentUser?._id === ownerId?._id || currentUser?._id === ownerId;

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        const users = await searchUsersApi(searchTerm);
        const filteredUsers = users.filter(u => !members.some(m => m._id === u._id));
        setSearchResults(filteredUsers);
        setIsSearching(false);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, members]);

  const handleSelectUser = (user) => {
    onInvite(user.email);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-2xl transition-all overflow-visible border border-gray-200 dark:border-slate-700">
                
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Quản lý thành viên
                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">{members.length}</span>
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
                </div>

                {isOwner && (
                  <div className="mb-6 relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Thêm thành viên</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Tìm bằng tên hoặc email..."
                          className="w-full pl-9 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-pro-blue outline-none dark:text-white dark:placeholder-gray-500"
                        />
                        {isSearching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-pro-blue" />}
                    </div>

                    {showResults && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <div 
                                        key={user._id} 
                                        onClick={() => handleSelectUser(user)}
                                        className="p-3 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer transition-colors flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                                            {user.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.fullName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <UserPlus className="w-4 h-4 text-gray-400 ml-auto" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-gray-500 dark:text-slate-400 text-center">Không tìm thấy người dùng.</div>
                            )}
                        </div>
                    )}
                  </div>
                )}

                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  <div className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase mb-2">Thành viên hiện tại</div>
                  {members.map((member) => {
                    const isMemberOwner = (member._id === (ownerId?._id || ownerId));
                    return (
                      <div key={member._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm border-2 border-white dark:border-slate-700 shadow-sm">
                            {member.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {member.fullName}
                              {isMemberOwner && <span className="flex items-center gap-1 text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-900/50"><Crown className="w-3 h-3" /> Owner</span>}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{member.email}</p>
                            {(member.phone || member.age) && (
                                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                    {member.age ? `${member.age} tuổi` : ''} 
                                    {member.age && member.phone ? ' • ' : ''} 
                                    {member.phone}
                                </p>
                            )}
                          </div>
                        </div>
                        {isOwner && !isMemberOwner && (
                          <button onClick={() => onRemove(member._id, member.fullName)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
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