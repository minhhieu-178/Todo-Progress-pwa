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
          className={`p-3 mb-2 bg-white rounded-md shadow-sm ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <p className="text-sm text-gray-800">{card.title}</p>
        </div>
      )}
    </Draggable>
  );
}

export default Card;