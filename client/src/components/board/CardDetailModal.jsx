import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Clock, AlignLeft, MessageSquare, Trash2, CheckSquare } from 'lucide-react';
import { updateCard, deleteCard } from '../../services/cardApi';
import { getComments, createComment } from '../../services/commentApi';
import { useAuth } from '../../context/AuthContext';

function CardDetailModal({ isOpen, onClose, card, listId, boardId, onUpdateCard, onDeleteCard }) {
  const { user } = useAuth();
  
  // State cho Card
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [dueDate, setDueDate] = useState(card?.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
  const [isCompleted, setIsCompleted] = useState(card?.isCompleted || false);

  // State cho Comment
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Update state khi card thay đổi (mở modal card khác)
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
      setIsCompleted(card.isCompleted || false);
      loadComments();
    }
  }, [card]);

  const loadComments = async () => {
    if (!card) return;
    try {
      const data = await getComments(boardId, card._id);
      setComments(data);
    } catch (error) {
      console.error("Lỗi tải comment:", error);
    }
  };

  // Tự động lưu khi blur ô Title hoặc Description
  const handleSaveCard = async () => {
    if (!title.trim()) return;
    // Chỉ gọi API nếu có thay đổi
    if (title === card.title && description === (card.description || '') && dueDate === (card.dueDate ? card.dueDate.split('T')[0] : '') && isCompleted === card.isCompleted) return;

    try {
      const updatedCard = await updateCard(boardId, listId, card._id, { 
        title, description, dueDate, isCompleted 
      });
      onUpdateCard(listId, updatedCard); // Cập nhật lại UI bên ngoài Board
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all p-6">
                
                {/* --- HEADER: TITLE --- */}
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div className="flex-1 flex items-start gap-3">
                    <CheckSquare className="w-6 h-6 mt-1 text-pro-blue" />
                    <div className="w-full">
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSaveCard}
                        className="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-2 focus:ring-pro-blue rounded w-full px-2 -ml-2"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">trong danh sách <span className="underline">Tasks</span></p>
                    </div>
                  </div>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* --- MAIN CONTENT (LEFT) --- */}
                  <div className="md:col-span-3 space-y-6">
                    
                    {/* Description */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-200 font-semibold">
                        <AlignLeft className="w-5 h-5" />
                        <h3>Mô tả</h3>
                      </div>
                      <textarea
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleSaveCard}
                        placeholder="Thêm mô tả chi tiết hơn..."
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pro-blue resize-none"
                      />
                    </div>

                    {/* Comments */}
                    <div>
                      <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-200 font-semibold">
                        <MessageSquare className="w-5 h-5" />
                        <h3>Bình luận</h3>
                      </div>
                      
                      {/* Input Comment */}
                      <div className="flex gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                          {user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <form onSubmit={handlePostComment} className="flex-1">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Viết bình luận..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pro-blue"
                          />
                          {newComment && (
                            <button 
                              type="submit" 
                              disabled={commentLoading}
                              className="mt-2 px-4 py-1.5 bg-pro-blue text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
                            >
                              Lưu
                            </button>
                          )}
                        </form>
                      </div>

                      {/* List Comments */}
                      <div className="space-y-4 max-h-60 overflow-y-auto">
                        {comments.map((cmt) => (
                          <div key={cmt._id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-white font-bold text-xs">
                              {cmt.userId?.fullName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {cmt.userId?.fullName || 'Người dùng ẩn'} 
                                <span className="ml-2 text-xs font-normal text-gray-500">{new Date(cmt.createdAt).toLocaleString('vi-VN')}</span>
                              </p>
                              <div className="p-2 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 shadow-sm">
                                {cmt.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* --- SIDEBAR (RIGHT) --- */}
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Thêm vào thẻ</div>
                    
                    {/* Date Picker */}
                    <div className="relative">
                        <label className="flex items-center gap-2 w-full p-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-200 text-sm transition-colors">
                            <Clock className="w-4 h-4" />
                            <span>Deadline</span>
                            <input 
                                type="date" 
                                value={dueDate}
                                onChange={(e) => {
                                    setDueDate(e.target.value);
                                    // Cần gọi save ngay ở đây vì onBlur input date đôi khi không chuẩn
                                    setTimeout(handleSaveCard, 100); 
                                }}
                                className="absolute inset-0 opacity-50 cursor-pointer"
                            />
                        </label>
                        {dueDate && <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 text-center">{new Date(dueDate).toLocaleDateString('vi-VN')}</div>}
                    </div>

                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-6 mb-2">Thao tác</div>
                    <button 
                        onClick={handleDelete}
                        className="flex items-center gap-2 w-full p-2 rounded bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-sm transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa thẻ</span>
                    </button>
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