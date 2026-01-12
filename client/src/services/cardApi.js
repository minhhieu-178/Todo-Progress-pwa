
import api from './api';
import { updateBoardInCache } from './cacheService';

// API tạo thẻ mới
export const createCard = async (title, boardId, listId, cardId) => {
  // Optimistic Cache Update
  updateBoardInCache(boardId, (board) => {
      const list = board.lists.find(l => l._id === listId);
      if (list) {
          if (!list.cards) list.cards = [];
          const newCard = { 
              _id: cardId, 
              title, 
              boardId, 
              listId, 
              members: [], 
              label: 'low', 
              deadline: null, 
              isCompleted: false, 
              completed: false,
              comments: [], 
              attachments: [],
              checklist: [] 
          };
          list.cards.push(newCard);
      }
      return board;
  });

  try {
    const { data } = await api.post(`/boards/${boardId}/lists/${listId}/cards`, { title,_id: cardId });
    return data;
  } catch (error) {
    if (!navigator.onLine || error.message?.includes('no-response')) {
       return { 
           _id: cardId, 
           title, 
           boardId, 
           listId 
       };
    }
    throw error.response?.data?.message || error.message;
  }
};

// API cập nhật thẻ
export const updateCard = async (boardId, listId, cardId, updateData) => {
  // Optimistic Cache Update
  updateBoardInCache(boardId, (board) => {
      const list = board.lists.find(l => l._id === listId);
      if (list && list.cards) {
          const cardIndex = list.cards.findIndex(c => c._id === cardId);
          if (cardIndex !== -1) {
              list.cards[cardIndex] = { ...list.cards[cardIndex], ...updateData };
          }
      }
      return board;
  });

  try {
    const payload = { _id: cardId, ...updateData };
    const { data } = await api.put(`/boards/${boardId}/lists/${listId}/cards/${cardId}`, payload);
    return data;
  } catch (error) {
     if (!navigator.onLine || error.message?.includes('no-response')) {
         return {
             _id: cardId,
             ...updateData
         };
     }
    throw error.response?.data?.message || error.message;
  }
};

// API xóa thẻ
export const deleteCard = async (boardId, listId, cardId) => {
  // Optimistic Cache Update
  updateBoardInCache(boardId, (board) => {
      const list = board.lists.find(l => l._id === listId);
      if (list && list.cards) {
          list.cards = list.cards.filter(c => c._id !== cardId);
      }
      return board;
  });

  try {
    const { data } = await api.delete(`/boards/${boardId}/lists/${listId}/cards/${cardId}`);
    return data;
  } catch (error) {
    if (!navigator.onLine || error.message?.includes('no-response')) {
        return { message: 'Deleted offline' };
    }
    throw error.response?.data?.message || error.message;
  }
};

export const moveCard = async (cardId, moveData) => {
  const { boardId, sourceListId, destinationListId, destinationIndex } = moveData; 
  
  // Optimistic Cache Update for Move
  updateBoardInCache(boardId, (board) => {
      const sourceList = board.lists.find(l => l._id === sourceListId);
      const destList = board.lists.find(l => l._id === destinationListId);

      if (sourceList && destList && sourceList.cards) {
          const cardIndex = sourceList.cards.findIndex(c => c._id === cardId);
          if (cardIndex !== -1) {
              const [movedCard] = sourceList.cards.splice(cardIndex, 1);
              movedCard.listId = destinationListId; // Update listId reference
              
              if (!destList.cards) destList.cards = [];
              destList.cards.splice(destinationIndex, 0, movedCard);
          }
      }
      return board;
  });

  try {
    const { data } = await api.put(`/boards/${boardId}/cards/${cardId}/move`, moveData);
    return data;
  } catch (error) {
    if (!navigator.onLine || error.message?.includes('no-response')) {
        return { message: 'Moved offline' };
    }
    throw error.response?.data?.message || error.message;
  }
};

export const addMemberToCard = async (boardId, listId, cardId, userId) => {
  try {
    const { data } = await api.post(`/boards/${boardId}/lists/${listId}/cards/${cardId}/members`, { userId });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const removeMemberFromCard = async (boardId, listId, cardId, userId) => {
  try {
    const { data } = await api.delete(`/boards/${boardId}/lists/${listId}/cards/${cardId}/members`, { 
      data: { userId } 
    });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const uploadCardAttachment = async (boardId, listId, cardId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file); 

    const { data } = await api.post(
      `/boards/${boardId}/lists/${listId}/cards/${cardId}/attachments`, 
      formData, 
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteCardAttachment = async (boardId, listId, cardId, attachmentId) => {
  try {
    const { data } = await api.delete(
      `/boards/${boardId}/lists/${listId}/cards/${cardId}/attachments/${attachmentId}`
    );
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};