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
          className="w-80 flex-shrink-0 px-3 h-full"
        >
          <div 
            className={`glass-effect rounded-xl p-4 shadow-lg adaptive-border border max-h-full flex flex-col group transition-all duration-200 ${
              snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-blue-500/50 scale-105' : ''
            }`}
          >
            
            {/* List Header */}
            <div 
              {...provided.dragHandleProps} 
              className="flex justify-between items-start gap-3 mb-4 min-h-[44px] cursor-grab active:cursor-grabbing relative"
            >
              {isEditingTitle ? (
                <div className="flex items-center gap-2 w-full animate-fadeIn">
                    <input 
                      autoFocus
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={handleTitleKeyDown}
                      className="w-full px-3 py-2 text-sm font-bold border-2 border-blue-500 rounded-lg glass-effect adaptive-text focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button 
                      onMouseDown={handleSaveTitle} 
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      aria-label="Lưu"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onMouseDown={() => { setIsEditingTitle(false); setTitle(list.title); }} 
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      aria-label="Hủy"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
              ) : (
                <>
                    <h3 
                      onClick={() => setIsEditingTitle(true)}
                      className="text-base font-bold adaptive-text flex-grow py-2 px-3 cursor-pointer hover:bg-white/20 rounded-lg transition-colors break-words leading-tight"
                    >
                      {list.title}
                    </h3>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                            onClick={() => setIsEditingTitle(true)}
                            className="p-2 adaptive-text-muted hover:adaptive-text hover:bg-white/20 rounded-lg transition-colors"
                            title="Đổi tên danh sách"
                            aria-label="Đổi tên danh sách"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onDeleteList(list._id)}
                            className="p-2 adaptive-text-muted hover:text-red-600 hover:bg-white/20 rounded-lg transition-colors"
                            title="Xóa danh sách"
                            aria-label="Xóa danh sách"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </>
              )}
            </div>

            {/* Cards Container */}
            <Droppable droppableId={list._id} type="CARD">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto custom-scrollbar px-2 min-h-[80px] transition-all duration-200 rounded-lg ${
                    snapshot.isDraggingOver ? 'bg-blue-100/50 ring-2 ring-blue-300/50' : ''
                  }`}
                  style={{ 
                    maxHeight: 'calc(100vh - 300px)',
                    minHeight: '80px'
                  }}
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
                  
                  {/* Empty state */}
                  {list.cards.length === 0 && !snapshot.isDraggingOver && (
                    <div className="text-center py-8 adaptive-text-muted">
                      <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                        <Plus className="w-6 h-6" />
                      </div>
                      <p className="text-sm">Chưa có thẻ nào</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>

            {/* Add Card Section */}
            <div className="mt-4 px-2">
              {showAddCard ? (
                <form onSubmit={handleAddCard} className="space-y-3">
                  <textarea
                    autoFocus
                    placeholder="Nhập tiêu đề thẻ..."
                    className="w-full p-3 text-sm rounded-lg adaptive-border border glass-effect adaptive-text focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm resize-none transition-colors"
                    rows="3"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddCard(e);
                        }
                        if(e.key === 'Escape') {
                            setShowAddCard(false);
                            setCardTitle('');
                        }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <button 
                      type="submit" 
                      disabled={!cardTitle.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                    >
                      Thêm thẻ
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowAddCard(false);
                        setCardTitle('');
                      }} 
                      className="p-2 adaptive-text-muted hover:adaptive-text rounded-lg hover:bg-white/20 transition-colors"
                      aria-label="Hủy"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddCard(true)}
                  className="flex items-center gap-2 w-full p-3 adaptive-text-muted hover:adaptive-text hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
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