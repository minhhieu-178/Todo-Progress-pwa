import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock } from 'lucide-react';

const isOverdue = (dateString, isCompleted) => {
  if (!dateString || isCompleted) return false;
  
  const deadline = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  return deadline < today; 
};

function Card({ card, index, onClick }) {
  const overdue = isOverdue(card.dueDate, card.isCompleted);

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
             <div className={`mt-2 text-xs flex items-center gap-1 w-fit rounded px-1.5 py-0.5 ${
                overdue 
                  ? 'text-red-600 bg-red-100 font-medium' 
                  : 'text-gray-500 dark:text-gray-400'
             }`}>
                <Clock className="w-3 h-3" /> 
                {new Date(card.dueDate).toLocaleDateString('vi-VN')}
             </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default Card;