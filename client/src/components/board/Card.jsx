import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

function Card({ card, index, onClick }) {
  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}

          onClick={onClick}
          className={`p-3 mb-2 bg-white dark:bg-gray-700 rounded-md shadow-sm ${
            snapshot.isDragging ? 'shadow-lg' : ''
          } transition-colors cursor-pointer hover:ring-2 hover:ring-pro-blue/50`}
        >
          <p className="text-sm text-gray-800 dark:text-gray-200">{card.title}</p>
          {card.dueDate && (
             <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                🕒 {new Date(card.dueDate).toLocaleDateString('vi-VN')}
             </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default Card;