import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, Users } from 'lucide-react'; 

const isOverdue = (dateString, isCompleted) => {
  if (!dateString || isCompleted) return false;
  const deadline = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadline < today;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

function Card({ card, index, onClick }) {
  const overdue = isOverdue(card.dueDate, card.isCompleted);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    }); 
  };

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`group p-3 mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-transparent hover:border-indigo-500/30 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500/50 rotate-2' : ''
          } transition-all duration-200 cursor-pointer`}
        >
          {/* Tiêu đề Card */}
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">
            {card.title}
          </p>

          {/* Footer Card: Chứa Deadline và Members */}
          <div className="flex justify-between items-end mt-2">
            
            {/* Hiển thị Deadline */}
            <div className="flex items-center gap-2">
              {card.dueDate && (
                <div className={`text-xs flex items-center gap-1 px-1.5 py-0.5 rounded ${
                    card.isCompleted 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : overdue 
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-medium' 
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(card.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Hiển thị Members (Avatar Stack) */}
            {card.members && card.members.length > 0 && (
              <div className="flex -space-x-1.5 overflow-hidden pl-1 py-0.5">
                {card.members.slice(0, 3).map((member) => (
                  <div 
                    key={member._id} 
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-700 bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200 text-[10px] font-bold"
                    title={member.fullName || member.email}
                  >
                    {getInitials(member.fullName)}
                  </div>
                ))}
                
                {/* Nếu có nhiều hơn 3 người thì hiện số dư */}
                {card.members.length > 3 && (
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-700 bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 text-[10px] font-bold">
                    +{card.members.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default Card;