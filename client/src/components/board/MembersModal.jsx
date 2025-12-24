import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, UserPlus, Trash2, Search, Loader, Crown } from 'lucide-react';
import { searchUsersApi } from '../../services/searchApi'; // Đảm bảo đường dẫn import đúng

const MembersModal = ({ isOpen, onClose, members, ownerId, currentUser, onInvite, onRemove }) => {
  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Xác định quyền Owner
  // Kiểm tra cả trường hợp ownerId là string hoặc object
  const ownerIdString = typeof ownerId === 'object' ? ownerId._id : ownerId;
  const currentUserIdString = typeof currentUser === 'object' ? currentUser._id : currentUser;
  const isOwner = currentUserIdString === ownerIdString;

  // Debounce tìm kiếm
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        try {
            const users = await searchUsersApi(searchTerm);
            // Lọc bỏ những người đã là thành viên
            const filteredUsers = users.filter(u => !members.some(m => m._id === u._id));
            setSearchResults(filteredUsers);
            setShowResults(true);
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
        } finally {
            setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, members]);

  const handleSelectUser = (user) => {
    // Gọi hàm invite với email của user được chọn
    onInvite(user.email); 
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#323940] p-6 text-left align-middle shadow-xl transition-all border border-gray-100 dark:border-white/10 overflow-visible">
                
                <div className="flex justify-between items-center mb-6">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 dark:text-[#b6c2cf] flex items-center gap-2">
                        Quản lý thành viên
                        <span className="bg-gray-100 dark:bg-[#22272b] text-gray-600 dark:text-[#9fadbc] text-xs px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">
                            {members?.length || 0}
                        </span>
                    </Dialog.Title>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* --- TÌM KIẾM NGƯỜI DÙNG ĐỂ MỜI (Chỉ Owner mới thấy) --- */}
                {/* Nếu muốn cho phép mọi người mời, bỏ điều kiện isOwner && đi */}
                <div className="mb-6 relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-[#9fadbc] mb-2">
                        Thêm thành viên mới
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#9fadbc]" />
                        {/* Input tìm kiếm*/}
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm bằng tên hoặc email..."
                            className="w-full pl-9 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#22272b] text-gray-900 dark:text-[#b6c2cf] text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors dark:placeholder-[#9fadbc]"
                        />
                        {isSearching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-500" />}
                    </div>

                    {/* Dropdown Kết quả tìm kiếm */}
                    {showResults && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#22272b] border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                            {searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <div 
                                        key={user._id} 
                                        onClick={() => handleSelectUser(user)}
                                        className="p-3 hover:bg-indigo-50 dark:hover:bg-[#2c333a] cursor-pointer transition-colors flex items-center gap-3 border-b border-gray-50 dark:border-white/5 last:border-0"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-[#1d2125] text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-200 dark:border-white/10 overflow-hidden flex-shrink-0">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="" className="w-full h-full object-cover"/>
                                            ) : (
                                                user.fullName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-[#b6c2cf] truncate">{user.fullName}</p>
                                            <p className="text-xs text-gray-500 dark:text-[#9fadbc] truncate">{user.email}</p>
                                        </div>
                                        <UserPlus className="w-4 h-4 text-gray-400 dark:text-[#9fadbc]" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-gray-500 dark:text-[#9fadbc] text-center">
                                    Không tìm thấy người dùng phù hợp.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Danh sách thành viên hiện tại */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    <p className="text-xs font-bold text-gray-400 dark:text-[#9fadbc] uppercase mb-2">Thành viên hiện tại</p>
                    {members && members.map((member) => {
                        const isMemberOwner = (member._id === ownerIdString);
                        
                        return (
                            <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#22272b] rounded-xl border border-gray-100 dark:border-white/5 transition-colors group hover:border-indigo-200 dark:hover:border-indigo-500/30">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-[#1d2125] text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border-2 border-white dark:border-[#323940] shadow-sm flex-shrink-0 overflow-hidden">
                                        {member.avatar ? (
                                            <img src={member.avatar} alt="" className="w-full h-full object-cover"/>
                                        ) : (
                                            member.fullName?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-[#b6c2cf] flex items-center gap-2 truncate">
                                            {member.fullName}
                                            {isMemberOwner && (
                                                <span className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800">
                                                    <Crown className="w-3 h-3" /> Owner
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-[#9fadbc] truncate">{member.email}</p>
                                    </div>
                                </div>

                                {/* Nút xóa thành viên (Chỉ Owner thấy và không xóa chính mình) */}
                                {isOwner && !isMemberOwner && (
                                    <button 
                                        onClick={() => onRemove(member._id, member.fullName)} 
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
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
};

export default MembersModal;