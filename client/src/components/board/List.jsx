import React, { useState, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Trash2, Plus, Pencil, X, Check } from 'lucide-react';
import Card from './Card';
import { createCard } from '../../services/cardApi';

function List({ list, boardId, onCardCreated, onCardClick, onUpdateTitle, onDeleteList }) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);

  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      const newCard = await createCard(newCardTitle, boardId, list._id);
      onCardCreated(list._id, newCard);
      setNewCardTitle('');
      setShowAddCard(false);
    } catch (error) {
      console.error(error);
    }
  };

  const saveTitle = () => {
    setIsEditingTitle(false);
    if (title.trim() !== list.title && title.trim() !== "") {
        onUpdateTitle(list._id, title);
    } else {
        setTitle(list.title);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') saveTitle();
    if (e.key === 'Escape') {
        setIsEditingTitle(false);
        setTitle(list.title);
    }
  };

  return (
    <div className="flex-shrink-0 w-72 mx-2 h-full">
      <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 flex flex-col max-h-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm group relative transition-colors duration-200">
        
        {/* --- HEADER LIST --- */}
        <div className="flex justify-between items-start mb-2 gap-2 min-h-[36px] px-1 pt-1">
            {isEditingTitle ? (
                <div className="flex items-center gap-1 w-full relative">
                    <input 
                        autoFocus
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={saveTitle}
                        onKeyDown={handleTitleKeyDown}
                        className="w-full px-2 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border-2 border-indigo-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all"
                    />
                    <button 
                        onMouseDown={saveTitle} 
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700 p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                    >
                        <Check className="w-4 h-4" strokeWidth={3}/>
                    </button>
                </div>
            ) : (
                <>
                    <h3 
                        onClick={() => setIsEditingTitle(true)}
                        className="font-bold text-gray-700 dark:text-gray-200 px-2 py-1.5 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700 rounded-md transition-all flex-grow break-words text-sm tracking-tight"
                    >
                        {list.title}
                    </h3>
                    
                    {/* --- ACTION ICONS --- */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                        <button 
                            onClick={() => setIsEditingTitle(true)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all"
                            title="Đổi tên"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onDeleteList(list._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all"
                            title="Xóa danh sách"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}
        </div>

        {/* --- CARDS LIST --- */}
        <Droppable droppableId={list._id} type="CARD">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-grow overflow-y-auto px-1 -mx-1 custom-scrollbar space-y-2.5 py-0.5"
              style={{ maxHeight: 'calc(100vh - 230px)' }}
            >
              {list.cards.map((card, index) => (
                <Card 
                    key={card._id} 
                    card={card} 
                    index={index} 
                    onClick={() => onCardClick(card, list._id)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* --- ADD CARD FOOTER --- */}
        {showAddCard ? (
          <form onSubmit={handleCreateCard} className="mt-3 px-1 pb-1">
            <div className="relative">
                <textarea
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Nhập tiêu đề thẻ..."
                className="w-full p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm resize-none transition-shadow"
                rows="3"
                autoFocus
                onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateCard(e);
                    }
                }}
                />
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 shadow-sm active:scale-95 transition-all"
              >
                Thêm thẻ
              </button>
              <button
                type="button"
                onClick={() => setShowAddCard(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddCard(true)}
            className="group/btn flex items-center mt-2 mx-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700 p-2 rounded-lg transition-all text-sm font-semibold"
          >
            <div className="p-0.5 rounded mr-2 group-hover/btn:bg-gray-300 dark:group-hover/btn:bg-gray-600 transition-colors">
                 <Plus className="w-4 h-4" />
            </div>
            Thêm thẻ mới
          </button>
        )}
      </div>
    </div>
  );
}

export default List;