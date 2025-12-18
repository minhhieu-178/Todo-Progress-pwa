import React, { useState, Fragment, useEffect } from 'react'; // <-- Đã thêm useEffect
import { Dialog, Transition } from '@headlessui/react';
import { X, UserPlus, Trash2, Crown, Search, Loader } from 'lucide-react';
import { searchUsersApi } from '../../services/searchApi'; // Import API tìm kiếm

function MembersModal({ isOpen, onClose, members, ownerId, currentUser, onInvite, onRemove }) {
  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const isOwner = currentUser?._id === ownerId?._id || currentUser?._id === ownerId;

  // Debounce tìm kiếm (chỉ gọi API khi ngừng gõ 500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) { // Chỉ tìm khi có ít nhất 2 ký tự
        setIsSearching(true);
        const users = await searchUsersApi(searchTerm);
        // Lọc những người đã là thành viên rồi để không hiện lại
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
    onInvite(user.email); // Gọi hàm invite gốc của BoardPage
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all overflow-visible">
                
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Quản lý thành viên
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">{members.length}</span>
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
                </div>

                {/* --- TÌM KIẾM NGƯỜI DÙNG ĐỂ MỜI --- */}
                {isOwner && (
                  <div className="mb-6 relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thêm thành viên</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Tìm bằng tên hoặc email..."
                          className="w-full pl-9 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-pro-blue outline-none dark:text-white"
                        />
                        {isSearching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-pro-blue" />}
                    </div>

                    {/* Dropdown Kết quả tìm kiếm */}
                    {showResults && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <div 
                                        key={user._id} 
                                        onClick={() => handleSelectUser(user)}
                                        className="p-3 hover:bg-indigo-50 dark:hover:bg-gray-600 cursor-pointer transition-colors flex items-center gap-3"
                                    >
                                        {user.avatar ? (
                                            <img 
                                                src={user.avatar} 
                                                alt={user.fullName} 
                                                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-500 flex-shrink-0"
                                            />
                                        ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">                                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.fullName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <UserPlus className="w-4 h-4 text-gray-400 ml-auto" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-gray-500 text-center">Không tìm thấy người dùng.</div>
                            )}
                        </div>
                    )}
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
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.fullName} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-bold text-sm border-2 border-white dark:border-gray-800 shadow-sm flex-shrink-0">
                              {member.fullName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {member.fullName}
                              {isMemberOwner && <span className="flex items-center gap-1 text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200"><Crown className="w-3 h-3" /> Owner</span>}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                            {/* Hiển thị thêm thông tin nếu có */}
                            {(member.phone || member.age) && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    {member.age ? `${member.age} tuổi` : ''} 
                                    {member.age && member.phone ? ' • ' : ''} 
                                    {member.phone}
                                </p>
                            )}
                          </div>
                        </div>
                        {isOwner && !isMemberOwner && (
                          <button onClick={() => onRemove(member._id, member.fullName)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
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