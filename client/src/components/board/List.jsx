import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd'; // Import thư viện
import Card from './Card';
import { MoreHorizontal, Plus } from 'lucide-react';
import { createCard } from '../../services/cardApi'; // Giả sử bạn có import này

function List({ list, boardId, onCardCreated, onCardClick, index }) { // Nhận thêm prop index
  const [cardTitle, setCardTitle] = React.useState('');
  const [showAddCard, setShowAddCard] = React.useState(false);

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

  // 1. List cũng là Draggable (để kéo thả vị trí List)
  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-72 flex-shrink-0 px-2"
        >
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-200 dark:border-gray-700 max-h-full flex flex-col">
            
            {/* Header List - Nơi nắm để kéo List */}
            <div 
              {...provided.dragHandleProps} 
              className="flex justify-between items-center p-2 mb-1 cursor-grab active:cursor-grabbing"
            >
              <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">{list.title}</h3>
              <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-700" />
            </div>

            {/* 2. Vùng thả Card (Droppable) */}
            <Droppable droppableId={list._id} type="CARD">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto custom-scrollbar p-1 min-h-[10px] transition-colors rounded-lg ${
                    snapshot.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                  style={{ maxHeight: 'calc(100vh - 220px)' }}
                >
                  {list.cards.map((card, index) => (
                    <Card 
                        key={card._id} 
                        card={card} 
                        index={index} // Truyền index cho Card
                        onClick={() => onCardClick(card, list._id)} 
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Footer: Add Card */}
            <div className="mt-2">
              {showAddCard ? (
                <form onSubmit={handleAddCard} className="p-1">
                  <textarea
                    autoFocus
                    placeholder="Nhập tiêu đề thẻ..."
                    className="w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 mb-2 resize-none"
                    rows="2"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddCard(e);
                        }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-indigo-700">Thêm thẻ</button>
                    <button type="button" onClick={() => setShowAddCard(false)} className="text-gray-500 hover:text-gray-700 p-1"><Plus className="w-4 h-4 rotate-45" /></button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddCard(true)}
                  className="flex items-center gap-2 w-full p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm transition-colors"
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