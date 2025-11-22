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
      onCardCreated(list._id, newCard); // Báo cho BoardPage biết Card mới đã được tạo
      setNewCardTitle('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-shrink-0 w-72 p-2 mx-2 bg-gray-100 rounded-md">
      {/* Tiêu đề List */}
      <h3 className="px-2 py-1 text-sm font-semibold text-gray-700">
        {list.title}
      </h3>

      {/* Khu vực thả Card (Droppable) */}
      <Droppable droppableId={list._id} type="CARD">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[50px] pt-2"
          >
            {/* Render các Card */}
            {list.cards.map((card, index) => (
              <Card key={card._id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Form tạo Card mới */}
      <form onSubmit={handleCreateCard} className="mt-2">
        <input
          type="text"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
          placeholder="+ Thêm thẻ mới"
          className="w-full px-2 py-1 text-sm border-gray-300 rounded-md shadow-sm"
        />
      </form>
    </div>
  );
}

export default List;