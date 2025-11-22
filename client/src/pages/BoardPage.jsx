import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { getBoardById } from '../services/boardApi';
import { createList } from '../services/listApi';
import { moveCard } from '../services/cardApi';
import List from '../components/board/List';
import CardDetailModal from '../components/board/CardDetailModal';

function BoardPage() {
  const { id: boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Hàm mở modal (truyền xuống Card)
  const handleCardClick = (card, listId) => {
    setSelectedCard(card);
    setSelectedListId(listId);
    setIsModalOpen(true);
  };
  // Hàm cập nhật lại UI sau khi sửa Card trong modal
  const handleUpdateCardInBoard = (listId, updatedCard) => {
    const newBoard = { ...board };
    const list = newBoard.lists.find(l => l._id === listId);
    const cardIndex = list.cards.findIndex(c => c._id === updatedCard._id);
    if (cardIndex !== -1) {
        list.cards[cardIndex] = updatedCard;
        setBoard(newBoard);
    }
  };
  // Hàm xóa Card khỏi UI
  const handleDeleteCardInBoard = (listId, cardId) => {
    const newBoard = { ...board };
    const list = newBoard.lists.find(l => l._id === listId);
    list.cards = list.cards.filter(c => c._id !== cardId);
    setBoard(newBoard);
  };

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const data = await getBoardById(boardId);

      data.lists.sort((a, b) => a.position - b.position);
      data.lists.forEach((list) => {
        list.cards.sort((a, b) => a.position - b.position);
      });
      setBoard(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === 'CARD') {
      const sourceList = board.lists.find(l => l._id === source.droppableId);
      const destList = board.lists.find(l => l._id === destination.droppableId);
      
      const [movedCard] = sourceList.cards.splice(source.index, 1);
      destList.cards.splice(destination.index, 0, movedCard);

      setBoard({ ...board }); 
      
      try {
        await moveCard(draggableId, {
          boardId: board._id,
          sourceListId: source.droppableId,
          destListId: destination.droppableId,
          newPosition: destination.index,
        });
        fetchBoard(); 
      } catch (error) {
        console.error('Lỗi khi di chuyển Card:', error);
        fetchBoard();
      }
    }
    
  };

  const handleCardCreated = (listId, newCard) => {
    const newBoard = { ...board };
    const list = newBoard.lists.find(l => l._id === listId);
    list.cards.push(newCard);
    setBoard(newBoard);
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const newList = await createList(newListTitle, boardId);
      setBoard({ ...board, lists: [...board.lists, newList] });
      setNewListTitle('');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-4 dark:text-white">Đang tải Bảng...</div>;
  if (error) return <div className="p-4 text-red-500">Lỗi: {error}</div>;
  if (!board) return <div className="p-4 dark:text-white">Không tìm thấy Bảng.</div>;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Header: Xanh mặc định, Xám đậm khi Dark Mode */}
      <header className="p-4 bg-blue-600 dark:bg-gray-800 text-white shadow-md transition-colors duration-200">
        <Link to="/" className="text-sm hover:underline opacity-90">&larr; Về Dashboard</Link>
        <h1 className="text-2xl font-bold mt-1">{board.title}</h1>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-grow p-4 overflow-x-auto bg-gray-100 dark:bg-gray-900"
            >
              {board.lists.map((list, index) => (
                <List
                  key={list._id}
                  list={list}
                  boardId={board._id}
                  onCardCreated={handleCardCreated}
                  onCardClick={handleCardClick}
                />
              ))}
              {provided.placeholder}

              {/* Ô tạo List mới */}
              <div className="flex-shrink-0 w-72 p-2">
                <form onSubmit={handleCreateList} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-md border border-transparent dark:border-gray-700 transition-colors">
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="+ Thêm danh sách mới"
                    className="w-full px-2 py-1 text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </form>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedCard && (
        <CardDetailModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            card={selectedCard}
            listId={selectedListId}
            boardId={board._id}
            onUpdateCard={handleUpdateCardInBoard}
            onDeleteCard={handleDeleteCardInBoard}
        />
      )}
    </div>
  );
}

export default BoardPage;