import React, { useState, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus, Trash2, X, Check, Pencil } from 'lucide-react';
import Card from './Card';
import { createCard } from '../../services/cardApi';

function List({ list, boardId, onCardCreated, onCardClick, index, onUpdateTitle, onDeleteList }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);

  const [cardTitle, setCardTitle] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  const handleSaveTitle = () => {
    if (title.trim() !== list.title && title.trim() !== '') {
        onUpdateTitle(list._id, title);
    } else {
        setTitle(list.title); 
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveTitle();
    if (e.key === 'Escape') {
        setIsEditingTitle(false);
        setTitle(list.title);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    try {
      const newCard = await createCard(cardTitle, boardId, list._id);
      onCardCreated(list._id, newCard);
      setCardTitle('');
      setShowAddCard(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-72 flex-shrink-0 px-2 h-full"
        >
          <div 
             className={`bg-gray-100 dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-200 dark:border-gray-700 max-h-full flex flex-col group transition-colors ${
                 snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-indigo-500/50' : ''
             }`}
          >
            
            <div 
              {...provided.dragHandleProps} 
              className="flex justify-between items-start p-2 mb-1 gap-2 min-h-[40px] cursor-grab active:cursor-grabbing relative"
            >
              {isEditingTitle ? (
                /* GIAO DIỆN SỬA TÊN */
                <div className="flex items-center gap-1 w-full animate-fadeIn">
                    <input 
                        autoFocus
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={handleTitleKeyDown}
                        className="w-full px-2 py-1 text-sm font-bold border-2 border-indigo-500 rounded bg-white dark:bg-gray-700 dark:text-white focus:outline-none"
                    />
                    <button onMouseDown={handleSaveTitle} className="text-green-600 hover:bg-green-100 p-1 rounded">
                        <Check className="w-4 h-4" />
                    </button>
                    <button onMouseDown={() => { setIsEditingTitle(false); setTitle(list.title); }} className="text-red-500 hover:bg-red-100 p-1 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>
              ) : (
                <>
                    <h3 
                        onClick={() => setIsEditingTitle(true)}
                        className="font-bold text-gray-700 dark:text-gray-200 text-sm flex-grow py-1 px-1 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors break-words"
                    >
                        {list.title}
                    </h3>
                    
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => setIsEditingTitle(true)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="Đổi tên danh sách"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                            onClick={() => onDeleteList(list._id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="Xóa danh sách"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </>
              )}
            </div>

            <Droppable droppableId={list._id} type="CARD">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto custom-scrollbar p-1 min-h-[10px] transition-colors rounded-lg ${
                    snapshot.isDraggingOver ? 'bg-indigo-100/50 dark:bg-indigo-900/30' : ''
                  }`}
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

            <div className="mt-2 px-1">
              {showAddCard ? (
                <form onSubmit={handleAddCard}>
                  <textarea
                    autoFocus
                    placeholder="Nhập tiêu đề thẻ..."
                    className="w-full p-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-sm resize-none"
                    rows="3"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddCard(e);
                        }
                    }}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 shadow-sm">Thêm thẻ</button>
                    <button type="button" onClick={() => setShowAddCard(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><X className="w-5 h-5" /></button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddCard(true)}
                  className="flex items-center gap-2 w-full p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm thẻ mới</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </Draggable>
  );
}

export default List;