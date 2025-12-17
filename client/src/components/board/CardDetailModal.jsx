import React, { useState, useEffect, Fragment, useRef } from 'react'; 
import { Dialog, Transition, Popover } from '@headlessui/react';
import { X, Clock, AlignLeft, MessageSquare, Trash2, CheckSquare, Plus, User as UserIcon, Search, Paperclip, FileText, Download } from 'lucide-react';
import { updateCard, deleteCard, addMemberToCard, removeMemberFromCard, uploadCardAttachment } from '../../services/cardApi';
import { getComments, createComment } from '../../services/commentApi';
import { useAuth } from '../../context/AuthContext';

function CardDetailModal({ isOpen, onClose, card, listId, boardId, boardMembers = [], onUpdateCard, onDeleteCard }) {
  const { user } = useAuth();
  const dateInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- STATE ---
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [dueDate, setDueDate] = useState(card?.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
  const [isCompleted, setIsCompleted] = useState(card?.isCompleted || false);
  
  // State thành viên
  const [cardMembers, setCardMembers] = useState(card?.members || []);
  const [memberSearch, setMemberSearch] = useState('');

  // State comment
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const [attachments, setAttachments] = useState(card?.attachments || []);
  const [uploading, setUploading] = useState(false);
  // --- EFFECT ---
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
      setIsCompleted(card.isCompleted || false);
      setCardMembers(card.members || []);
      setAttachments(card.attachments || []);
      setMemberSearch('');
      loadComments();
    }
  }, [card]);

  const focusSearchInput = () => {
    setTimeout(() => {
        searchInputRef.current?.focus();
    }, 100);
  };

  // --- API HANDLERS ---
  const handleUpdateDate = async (newDateVal) => {
    setDueDate(newDateVal); 
    try {
      const updatedCard = await updateCard(boardId, listId, card._id, { 
        title, description, isCompleted, dueDate: newDateVal 
      });
      onUpdateCard(listId, updatedCard);
    } catch (error) {
      console.error("Lỗi lưu ngày:", error);
    }
  };

  const loadComments = async () => {
    if (!card) return;
    try {
      const data = await getComments(boardId, card._id);
      setComments(data);
    } catch (error) {
      console.error("Lỗi tải comment:", error);
    }
  };

  const handleSaveCard = async () => {
    if (!title.trim()) return;
    if (title === card.title && description === (card.description || '') && dueDate === (card.dueDate ? card.dueDate.split('T')[0] : '') && isCompleted === card.isCompleted) return;

    try {
      const updatedCard = await updateCard(boardId, listId, card._id, { 
        title, description, dueDate, isCompleted 
      });
      onUpdateCard(listId, updatedCard);
    } catch (error) {
      console.error("Lỗi lưu card:", error);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const savedComment = await createComment(newComment, boardId, card._id);
      setComments([...comments, savedComment]);
      setNewComment('');
    } catch (error) {
      alert(error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc muốn xóa thẻ này không?")) {
      try {
        await deleteCard(boardId, listId, card._id);
        onDeleteCard(listId, card._id);
        onClose();
      } catch (error) {
        alert("Lỗi xóa thẻ: " + error);
      }
    }
  };
   
  const toggleComplete = async () => {
    const newState = !isCompleted;
    setIsCompleted(newState); 
    try {
        const updatedCard = await updateCard(boardId, listId, card._id, { 
            title, description, dueDate, isCompleted: newState 
        });
        onUpdateCard(listId, updatedCard); 
    } catch (error) {
        setIsCompleted(!newState); 
    }
  };

  const handleAddMember = async (memberId) => {
    try {
      await addMemberToCard(boardId, listId, card._id, memberId);
      const memberInfo = boardMembers.find(m => m._id === memberId) || memberId;
      const newMembersList = [...cardMembers, memberInfo];
      setCardMembers(newMembersList);
      onUpdateCard(listId, { ...card, members: newMembersList });
      setMemberSearch('');
    } catch (error) {
      alert("Lỗi thêm thành viên: " + error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMemberFromCard(boardId, listId, card._id, memberId);
      const newMembersList = cardMembers.filter(m => (m._id || m) !== memberId);
      setCardMembers(newMembersList);
      onUpdateCard(listId, { ...card, members: newMembersList });
    } catch (error) {
      console.error("Lỗi xóa thành viên:", error);
    }
  };

  const availableMembers = boardMembers.filter(bm => {
    const notInCard = !cardMembers.some(cm => (cm._id || cm) === bm._id);
    const matchesSearch = bm.fullName.toLowerCase().includes(memberSearch.toLowerCase()) || 
                          bm.email.toLowerCase().includes(memberSearch.toLowerCase());
    return notInCard && matchesSearch;
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert("File quá lớn! Vui lòng chọn file dưới 5MB.");
        return;
    }

    setUploading(true);
    try {
        const newAttachment = await uploadCardAttachment(boardId, listId, card._id, file);
        
        const updatedAttachments = [...attachments, newAttachment];
        setAttachments(updatedAttachments);
        
        onUpdateCard(listId, { ...card, attachments: updatedAttachments });
        
    } catch (error) {
        alert("Lỗi upload file: " + error);
    } finally {
        setUploading(false);
        e.target.value = ''; // Reset input
    }
  };

  if (!card) return null;

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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-visible rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-2xl transition-all p-8 border border-gray-100 dark:border-gray-700">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col gap-5 mb-8">
                   <div className="flex justify-between items-start">
                    {/* Status Badge */}
                    <button
                      onClick={toggleComplete}
                      className={`
                        group flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border
                        ${isCompleted 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200
                        ${isCompleted ? 'bg-green-500 text-white' : 'border-2 border-gray-400 group-hover:border-gray-500'}
                      `}>
                        {isCompleted && <CheckSquare className="w-3 h-3" />}
                      </div>
                      <span>{isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
                    </button>

                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Title Input */}
                  <div className="w-full">
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleSaveCard}
                      className={`
                            text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 w-full transition-all duration-200
                            ${isCompleted ? 'text-gray-400 decoration-gray-400 opacity' : 'text-gray-900 dark:text-white'} 
                          `}
                      placeholder="Nhập tiêu đề thẻ..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                  {/* --- LEFT COLUMN (MAIN CONTENT) --- */}
                  <div className="md:col-span-3 space-y-10">
                    
                    {/* Description */}
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white font-semibold text-lg">
                        <AlignLeft className="w-5 h-5 text-gray-500" />
                        <h3>Mô tả</h3>
                      </div>
                      <textarea
                        rows="6"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleSaveCard}
                        placeholder="Thêm mô tả chi tiết hơn cho thẻ này..."
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all resize-none shadow-sm text-sm leading-relaxed hover:bg-white dark:hover:bg-gray-800"
                      />
                    </div>
                    
                    {attachments.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-gray-900 dark:text-white font-semibold text-lg">
                                <Paperclip className="w-5 h-5 text-gray-500" />
                                <h3>Tệp đính kèm ({attachments.length})</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {attachments.map((file) => (
                                    <div key={file._id || file.url} className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors group">
                                        {/* Preview file (nếu là ảnh) hoặc icon file */}
                                        <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                            {file.type?.startsWith('image/') ? (
                                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                                            </p>
                                            
                                            <div className="flex items-center gap-3">
                                                <a 
                                                    href={file.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    Tải xuống
                                                </a>
                                                {/* Nút xóa file (nếu cần làm thêm API xóa) */}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comments */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white font-semibold text-lg">
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                        <h3>Bình luận</h3>
                      </div>
                      
                      <div className="flex gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                          {user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <form onSubmit={handlePostComment} className="flex-1 relative group">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Viết bình luận..."
                            className="w-full pl-5 pr-14 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm transition-shadow"
                          />
                          <button 
                            type="submit" 
                            disabled={!newComment || commentLoading}
                            className={`absolute right-1.5 top-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all transform
                                ${newComment 
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-sm' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'}
                            `}
                          >
                            Gửi
                          </button>
                        </form>
                      </div>

                      <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {comments.length > 0 ? comments.map((cmt) => (
                          <div key={cmt._id} className="flex gap-4 group">
                             <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs flex-shrink-0 mt-1">
                              {cmt.userId?.fullName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {cmt.userId?.fullName || 'Người dùng ẩn'}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">{new Date(cmt.createdAt).toLocaleString('vi-VN')}</span>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700/50 rounded-2xl rounded-tl-none text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                                {cmt.content}
                              </div>
                            </div>
                          </div>
                        )) : (
                            <p className="text-sm text-gray-400 italic text-center py-4">Chưa có bình luận nào.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* --- RIGHT COLUMN (SIDEBAR) --- */}
                  <div className="space-y-6">
                    
                    {/* 1. MEMBERS SECTION (Moved here) */}
                    <div>
                        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Thành viên</div>
                        <div className="flex flex-wrap gap-2">
                            {/* Danh sách thành viên */}
                            {cardMembers.map((m) => {
                                const memberInfo = typeof m === 'string' ? boardMembers.find(bm => bm._id === m) : m;
                                if (!memberInfo) return null;
                                
                                return (
                                    <div key={memberInfo._id} className="group relative">
                                        <div 
                                            className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow-sm overflow-hidden"
                                            title={memberInfo.fullName}
                                        >
                                            {memberInfo.avatar ? (
                                                <img src={memberInfo.avatar} alt="avt" className="w-full h-full object-cover"/>
                                            ) : (
                                                memberInfo.fullName?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        {/* Hover để xóa */}
                                        <div 
                                            onClick={() => handleRemoveMember(memberInfo._id)}
                                            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                                            title="Xóa thành viên"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Nút Add Member (+ Button) */}
                            <Popover className="relative">
                                {({ open }) => (
                                    <>
                                        <Popover.Button 
                                            onClick={focusSearchInput}
                                            className={`w-8 h-8 rounded-full border border-dashed border-gray-400 dark:border-gray-500 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200 focus:outline-none ${open ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : ''}`}
                                            title="Thêm thành viên"
                                        >
                                            <Plus className="w-4 h-4" strokeWidth={2} />
                                        </Popover.Button>

                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-200"
                                            enterFrom="opacity-0 translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition ease-in duration-150"
                                            leaveFrom="opacity-100 translate-y-0"
                                            leaveTo="opacity-0 translate-y-1"
                                        >
                                            {/* Dropdown căn chỉnh phải để không bị tràn màn hình */}
                                            <Popover.Panel className="absolute right-0 top-full mt-3 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 overflow-hidden">
                                                <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                                    <div className="relative">
                                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input 
                                                            ref={searchInputRef}
                                                            type="text"
                                                            placeholder="Tìm thành viên..."
                                                            value={memberSearch}
                                                            onChange={(e) => setMemberSearch(e.target.value)}
                                                            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                                    <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Thành viên bảng</p>
                                                    
                                                    {availableMembers.length > 0 ? (
                                                        availableMembers.map((m) => (
                                                            <button
                                                                key={m._id}
                                                                onClick={() => handleAddMember(m._id)}
                                                                className="flex items-center gap-3 w-full p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors group text-left"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                                    {m.avatar ? (
                                                                        <img src={m.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                                                    ) : (
                                                                        m.fullName?.charAt(0).toUpperCase()
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 truncate">
                                                                        {m.fullName}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 truncate">{m.email}</p>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="py-6 text-center">
                                                            <p className="text-sm text-gray-500">
                                                                {memberSearch ? 'Không tìm thấy kết quả.' : 'Tất cả thành viên đã được thêm.'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Popover.Panel>
                                        </Transition>
                                    </>
                                )}
                            </Popover>
                        </div>
                    </div>

                    {/* 2. ADD TO CARD (Deadline) */}
                    <div>
                        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Thêm vào thẻ</div>


                        <div 
                            className="relative cursor-pointer group"
                            onClick={() => dateInputRef.current?.showPicker()}
                        >
                            <div className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-600">
                                <Clock className="w-4 h-4 text-gray-500 group-hover:text-indigo-500 transition-colors" />
                                <span>Deadline</span>
                            </div>
                            
                            <input 
                                ref={dateInputRef}
                                type="date" 
                                value={dueDate}
                                onChange={(e) => handleUpdateDate(e.target.value)} 
                                className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none" 
                            />

                            {dueDate && (
                                <div className="mt-2 text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-md border border-indigo-100 dark:border-indigo-800 text-center font-semibold shadow-sm">
                                    {new Date(dueDate).toLocaleDateString('vi-VN')}
                                </div>
                            )}
                        </div>

                    </div>
                      <div>
                       <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Thêm tệp</div>
                            
                        <div className="mt-2">
                             <input 
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                onChange={handleFileUpload}
                             />
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200 text-sm font-medium border border-gray-200 dark:border-gray-700 group hover:border-indigo-300 dark:hover:border-indigo-600 text-left"
                             >
                                <Paperclip className="w-4 h-4 text-gray-500 group-hover:text-indigo-500 transition-colors" />
                                <span>
                                    {uploading ? 'Đang tải lên...' : 'Đính kèm tệp'}
                                </span>
                             </button>
                        </div>
                    </div>
                    {/* 3. ACTIONS */}
                    <div>
                        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Thao tác</div>
                        <button 
                            onClick={handleDelete}
                            className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa thẻ</span>
                        </button>
                    </div>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default CardDetailModal;