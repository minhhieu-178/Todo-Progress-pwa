import React, { useState, useEffect, Fragment,useRef } from 'react';
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

  // State cho Date
  const dateInputRef = useRef(null);
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
      setIsCompleted(card.isCompleted || false);
      loadComments();
    }
  }, [card._id]); 

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

const currentDueDate = card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '';
if (
    title === card.title && 
    description === (card.description || '') && 
    dueDate === currentDueDate &&
    isCompleted === card.isCompleted
) {
    return;
}

    console.log("Đang lưu Card:", { title, description, dueDate }); // Debug log

    try {
      const updatedCard = await updateCard(boardId, listId, card._id, { 
        title, description, dueDate, isCompleted 
      });
      onUpdateCard(listId, updatedCard); 
    } catch (error) {
      console.error("Lỗi lưu card:", error);
    }
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setDueDate(newDate); 
    try {
        const updatedCard = await updateCard(boardId, listId, card._id, { 
            title, description, dueDate: newDate, isCompleted 
        });
        onUpdateCard(listId, updatedCard);
    } catch (error) {
        console.error("Lỗi lưu ngày:", error);
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
                  <div className="md:col-span-3 space-y-6">
                    
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

                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Thêm vào thẻ</div>
                    
                    <div className="relative">
                        <div 
                            onClick={() => {
                                if (dateInputRef.current) {
                                    dateInputRef.current.showPicker(); 
                                }
                            }}
                            className={`flex items-center gap-2 w-full p-2 rounded cursor-pointer transition-colors border border-transparent hover:border-pro-blue/50 ${
                                dueDate 
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200'
                            }`}
                        >
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium flex-1 truncate select-none">
                                {dueDate 
                                    ? new Date(dueDate).toLocaleDateString('vi-VN') 
                                    : 'Deadline'
                                }
                            </span>
                            <input 
                                ref={dateInputRef} 
                                type="date" 
                                value={dueDate}
                                onChange={handleDateChange} 
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer -z-10"
                            />
                            {dueDate && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDateChange({ target: { value: '' } });
                                    }}
                                    className="p-1 hover:bg-white/50 rounded-full text-current opacity-60 hover:opacity-100 z-20"
                                    title="Delete deadline"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
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