import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import { createCard } from '../../services/cardApi';

function List({ list, boardId, onCardCreated }) {
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
    // Thêm dark:bg-gray-800
    <div className="flex-shrink-0 w-72 p-2 mx-2 bg-gray-100 dark:bg-gray-800 rounded-md transition-colors">
      {/* Tiêu đề List */}
      <h3 className="px-2 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
        {list.title}
      </h3>

      <Droppable droppableId={list._id} type="CARD">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[50px] pt-2"
          >
            {list.cards.map((card, index) => (
              <Card key={card._id} card={card} index={index} />
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