import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import { createCard } from '../../services/cardApi';
import { Trash2, MoreHorizontal } from 'lucide-react';
import { updateList } from '../../services/listApi';

function List({ list, boardId, onCardCreated, onCardClick, onDeleteList, onUpdateList }) {
  const [listTitle, setListTitle] = useState(list.title);
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleSave = async () => {
    setIsEditing(false);
    if (!listTitle.trim() || listTitle === list.title) {
        setListTitle(list.title);
        return;
    }

    try {
      const updatedList = await updateList(boardId, list._id, { title: listTitle });
      onUpdateList(updatedList); 
    } catch (error) {
      alert("Lỗi đổi tên: " + error);
      setListTitle(list.title); 
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        handleTitleSave();
    }
  };

  const [newCardTitle, setNewCardTitle] = useState('');

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    try {
      const newCard = await createCard(newCardTitle, boardId, list._id);
      onCardCreated(list._id, newCard);
      setNewCardTitle('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-shrink-0 w-72 p-2 mx-2 bg-gray-100 dark:bg-gray-800 rounded-md transition-colors group">      <div className="flex justify-between items-center px-2 py-1">
        <div className="flex justify-between items-center px-2 py-1 mb-1">
          {isEditing ? (
            <input 
              type="text"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-sm font-bold text-gray-700 dark:text-gray-200 w-full bg-white dark:bg-gray-700 border border-blue-500 rounded px-1 outline-none"
            />
          ) : (
            <h3 
              onClick={() => setIsEditing(true)} // Bấm vào để sửa
              className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate cursor-pointer flex-1 border border-transparent hover:border-gray-300 rounded px-1"
            >
              {list.title}
            </h3>
          )}
        
        {!list.isDefault && (
        <button 
          onClick={() => onDeleteList(list._id)}
          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
          title="Xóa danh sách"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        )}
        </div>
      </div>
      <Droppable droppableId={list._id} type="CARD">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[50px] pt-2"
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

      <form onSubmit={handleCreateCard} className="mt-2">
        <input
          type="text"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
          placeholder="+ Thêm thẻ mới"
          className="w-full px-2 py-1 text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
        />
      </form>
    </div>
  );
}

export default List;
