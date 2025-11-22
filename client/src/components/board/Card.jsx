import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

function Card({ card, index }) {
  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          // Thêm dark:bg-gray-700
          className={`p-3 mb-2 bg-white dark:bg-gray-700 rounded-md shadow-sm ${
            snapshot.isDragging ? 'shadow-lg' : ''
          } transition-colors`}
        >
          <p className="text-sm text-gray-800 dark:text-gray-200">{card.title}</p>
        </div>
      )}
    </Draggable>
  );
}

export default Card;