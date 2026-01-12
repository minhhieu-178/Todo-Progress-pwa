import api from './api';
import { updateBoardInCache } from './cacheService';

export const createList = async (title, boardId, listId) => {
  // Optimistic Cache Update
  updateBoardInCache(boardId, (board) => {
      if (!board.lists) board.lists = [];
      const newList = { _id: listId, title, boardId, cards: [] };
      board.lists.push(newList);
      return board;
  });

  try {
    const { data } = await api.post(`/boards/${boardId}/lists`, { title, _id: listId });
    return data;
  } catch (error) {
    if (!navigator.onLine || error.message?.includes('no-response')) {
        return { _id: listId, title, boardId, cards: [] };
    }
    throw error.response?.data?.message || error.message;
  }
};

export const updateList = async (boardId, listId, updateData) => {
    // Optimistic Cache Update
    updateBoardInCache(boardId, (board) => {
        const list = board.lists.find(l => l._id === listId);
        if (list) {
            Object.assign(list, updateData);
        }
        return board;
    });

    try {
        const { data } = await api.put(`/boards/${boardId}/lists/${listId}`, updateData);
        return data;
    } catch (error) {
         if (!navigator.onLine || error.message?.includes('no-response')) {
             return { _id: listId, ...updateData };
         }
        throw error.response?.data?.message || error.message;
    }
};

export const deleteList = async (boardId, listId) => {
  // Optimistic Cache Update
  updateBoardInCache(boardId, (board) => {
      if (board.lists) {
          board.lists = board.lists.filter(l => l._id !== listId);
      }
      return board;
  });

  try {
    const { data } = await api.delete(`/boards/${boardId}/lists/${listId}`);
    return data;
  } catch (error) {
    if (!navigator.onLine || error.message?.includes('no-response')) {
        return { message: 'Deleted offline' };
    }
    throw error.response?.data?.message || error.message;
  }
};

export const moveList = async (boardId, listId, newPosition) => {
  // Optimistic Cache Update
  updateBoardInCache(boardId, (board) => {
      if (board.lists) {
          const currentIndex = board.lists.findIndex(l => l._id === listId);
          if (currentIndex !== -1) {
              const [movedList] = board.lists.splice(currentIndex, 1);
              board.lists.splice(newPosition, 0, movedList);
          }
      }
      return board;
  });

  try {
    const { data } = await api.put(`/boards/${boardId}/lists/${listId}/move`, { newPosition });
    return data;
  } catch (error) {
     if (!navigator.onLine || error.message?.includes('no-response')) {
         return { message: 'Moved offline' };
     }
    throw error.response?.data?.message || error.message;
  }
};