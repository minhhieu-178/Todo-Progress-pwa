import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { getBoardById } from '../services/boardApi';
import { createList } from '../services/listApi';
import { moveCard } from '../services/cardApi';
import List from '../components/board/List';

function BoardPage() {
  const { id: boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newListTitle, setNewListTitle] = useState('');

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

  if (loading) return <div>Đang tải Bảng...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!board) return <div>Không tìm thấy Bảng.</div>;

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-blue-600 text-white">
        <Link to="/" className="text-sm hover:underline">&larr; Về Dashboard</Link>
        <h1 className="text-2xl font-bold">{board.title}</h1>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-grow p-4 overflow-x-auto"
            >
              {board.lists.map((list, index) => (
                <List
                  key={list._id}
                  list={list}
                  boardId={board._id}
                  onCardCreated={handleCardCreated}
                />
              ))}
              {provided.placeholder}

              <div className="flex-shrink-0 w-72 p-2">
                <form onSubmit={handleCreateList} className="p-2 bg-gray-200 rounded-md">
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="+ Thêm danh sách mới"
                    className="w-full px-2 py-1 text-sm border-gray-300 rounded-md"
                  />
                </form>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default BoardPage;