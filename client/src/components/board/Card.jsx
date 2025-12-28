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
          className={`group p-4 mb-4 glass-effect rounded-xl shadow-sm adaptive-border border transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] ${
            snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/50 rotate-2 scale-105' : ''
          }`}
        >
          {/* Card Title */}
          <p className="text-sm font-semibold adaptive-text line-clamp-3 mb-4 leading-relaxed">
            {card.title}
          </p>

          {/* Card Footer */}
          <div className="flex justify-between items-end gap-2 sm:gap-3 lg:gap-4">
            
            {/* Due Date */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {card.dueDate && (
                <div className={`text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium ${
                    card.isCompleted 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30' 
                        : overdue 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30' 
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                }`}>
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{formatDate(card.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Members */}
            {card.members && card.members.length > 0 && (
              <div className="flex items-center -space-x-2 flex-shrink-0">
                {card.members.slice(0, 3).map((member, idx) => (
                  <div
                    key={member._id || idx}
                    className="relative group/member"
                    title={member.name || member.fullName || 'Unknown User'}
                  >
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name || 'User'} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md hover:scale-110 transition-transform">
                        {getInitials(member.name || member.fullName)}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Show count if more than 3 members */}
                {card.members.length > 3 && (
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-200 border-2 border-white dark:border-gray-700 shadow-md">
                    +{card.members.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Completion Status Indicator */}
          {card.isCompleted && (
            <div className="mt-3 pt-3 border-t adaptive-border">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                <span className="text-xs font-semibold">Hoàn thành</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export default Card;