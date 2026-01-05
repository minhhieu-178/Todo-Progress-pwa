import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Users, ChevronLeft } from 'lucide-react';
import { getBoardById, addMemberToBoard, removeMemberFromBoard } from '../services/boardApi';
import { createList, updateList, deleteList, moveList } from '../services/listApi';
import { moveCard } from '../services/cardApi';
import List from '../components/board/List';
import CardDetailModal from '../components/board/CardDetailModal';
import MembersModal from '../components/board/MembersModal';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

function BoardPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const activeCardId = searchParams.get('cardId');

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const findCardInBoard = (boardData, cardId) => {
    if (!boardData?.lists) return null;
    for (const list of boardData.lists) {
      const card = list.cards.find(c => c._id === cardId);
      if (card) return card;
    }
    return null;
  };

  const handleCardClick = (card, listId) => {
    setSelectedCard(card);
    setSelectedListId(listId);
    setIsModalOpen(true);
  };

  const handleUpdateCardInBoard = (listId, updatedCard) => {
    setBoard(prev => {
      const newLists = prev.lists.map(l => {
        if (l._id === listId) {
          return {
            ...l,
            cards: l.cards.map(c => c._id === updatedCard._id ? updatedCard : c)
          };
        }
        return l;
      });
      return { ...prev, lists: newLists };
    });
  };

  const handleDeleteCardInBoard = (listId, cardId) => {
    setBoard(prev => {
      const newLists = prev.lists.map(l => {
        if (l._id === listId) {
          return { ...l, cards: l.cards.filter(c => c._id !== cardId) };
        }
        return l;
      });
      return { ...prev, lists: newLists };
    });
  };

  const fetchBoard = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const data = await getBoardById(id);
      if (data.lists) {
        data.lists.sort((a, b) => a.position - b.position);
        data.lists.forEach(l => l.cards?.sort((a, b) => a.position - b.position));
      }
      setBoard(data);
    } catch (err) {
      setError(err.toString());
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_board_room', id);
    socket.on('BOARD_UPDATED', () => fetchBoard(true));
    socket.on('BOARD_DELETED', (data) => {
      alert(data.message);
      navigate('/');
    });
    return () => {
      socket.emit('leave_board_room', id);
      socket.off('BOARD_UPDATED');
      socket.off('BOARD_DELETED');
    };
  }, [socket, id]);

  useEffect(() => {
    if (selectedCard && board) {
      const updatedCard = findCardInBoard(board, selectedCard._id);
      
      if (updatedCard) {

        if (JSON.stringify(updatedCard) !== JSON.stringify(selectedCard)) {
            setSelectedCard(updatedCard);
        }
      } else {
        setIsModalOpen(false);
        setSelectedCard(null);
        alert("Thẻ này vừa bị xóa bởi thành viên khác.");
      }
    }
  }, [board]); 

  useEffect(() => {
    if (board && activeCardId) {
      const card = findCardInBoard(board, activeCardId);
      if (card) {
        const list = board.lists.find(l => l.cards.some(c => c._id === activeCardId));
        handleCardClick(card, list?._id);
      }
    }
  }, [board, activeCardId]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'LIST') {
      const newLists = [...board.lists];
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      setBoard({ ...board, lists: newLists });
      try {
        await moveList(board._id, draggableId, destination.index);
      } catch (err) {
        fetchBoard(true);
      }
      return;
    }

    const newLists = [...board.lists];
    const sIdx = newLists.findIndex(l => l._id === source.droppableId);
    const dIdx = newLists.findIndex(l => l._id === destination.droppableId);
    
    const sourceList = { ...newLists[sIdx], cards: [...newLists[sIdx].cards] };
    const destList = sIdx === dIdx ? sourceList : { ...newLists[dIdx], cards: [...newLists[dIdx].cards] };

    const [card] = sourceList.cards.splice(source.index, 1);
    destList.cards.splice(destination.index, 0, card);

    newLists[sIdx] = sourceList;
    if (sIdx !== dIdx) newLists[dIdx] = destList;
    setBoard({ ...board, lists: newLists });

    try {
      await moveCard(draggableId, {
        boardId: board._id,
        sourceListId: source.droppableId,
        destListId: destination.droppableId,
        newPosition: destination.index,
      });
    } catch (err) {
      fetchBoard(true);
    }
  };

  const handleCardCreated = (listId, newCard) => {
    setBoard(prev => {
      const newLists = prev.lists.map(l => {
        if (l._id === listId) {
          return { ...l, cards: [...l.cards, newCard] };
        }
        return l;
      });
      return { ...prev, lists: newLists };
    });
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const newList = await createList(newListTitle, id);
      setBoard({ ...board, lists: [...board.lists, newList] });
      setNewListTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateListTitle = async (listId, newTitle) => {
    setBoard(prev => ({
      ...prev,
      lists: prev.lists.map(l => l._id === listId ? { ...l, title: newTitle } : l)
    }));
    try {
      await updateList(board._id, listId, { title: newTitle });
    } catch (err) {
      fetchBoard(true);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh sách này?")) return;
    setBoard(prev => ({ ...prev, lists: prev.lists.filter(l => l._id !== listId) }));
    try {
      await deleteList(board._id, listId);
    } catch (err) {
      fetchBoard(true);
    }
  };

  const handleInvite = async (email) => {
    try {
      const updated = await addMemberToBoard(board._id, email);
      setBoard(updated);
      alert('Thêm thành viên thành công!');
    } catch (err) {
      alert(err);
    }
  };

  const handleRemoveMember = async (mId, mName) => {
    if (window.confirm(`Xóa ${mName} khỏi bảng?`)) {
      try {
        const updated = await removeMemberFromBoard(board._id, mId);
        setBoard(updated);
      } catch (err) {
        alert(err);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-900 dark:text-white">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-red-500 dark:text-red-400">Lỗi: {error}</div>;
  if (!board) return <div className="p-8 text-center text-gray-900 dark:text-white">Không tìm thấy Bảng.</div>;

  const isOwner = board?.ownerId?._id === user?._id || board?.ownerId === user?._id;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-150">
      <header className="p-4 bg-white dark:bg-gray-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <Link to="/boards" className="text-sm text-gray-500 dark:text-gray-400 hover:underline mb-1 block flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Danh sách bảng
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{board.title}</h1>
            {isOwner && <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs px-2 py-1 rounded-full flex-shrink-0">Owner</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex -space-x-2 cursor-pointer" onClick={() => setIsMembersModalOpen(true)}>
            {board.members?.slice(0, 5).map((m) => (
              <div key={m._id} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-indigo-500 text-white flex items-center justify-center text-xs font-bold uppercase overflow-hidden">
                {m.avatar ? <img src={m.avatar} alt="avt" className="w-full h-full object-cover" /> : <span>{m.fullName?.charAt(0)}</span>}
              </div>
            ))}
            {board.members?.length > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-bold">
                +{board.members.length - 5}
              </div>
            )}
          </div>
          <button onClick={() => setIsMembersModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Thành viên</span>
          </button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex grow p-4 overflow-x-auto bg-gray-100 dark:bg-gray-900">
              {board.lists.map((list, index) => (
                <List
                  key={list._id}
                  list={list}
                  boardId={board._id}
                  index={index}
                  onCardCreated={handleCardCreated}
                  onCardClick={handleCardClick}
                  onUpdateTitle={handleUpdateListTitle}
                  onDeleteList={handleDeleteList}
                />
              ))}
              {provided.placeholder}
              <div className="shrink-0 w-72 p-2">
                <form onSubmit={handleCreateList} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-md">
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="+ Thêm danh sách mới"
                    className="w-full px-2 py-1 text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </form>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedCard && (
        <CardDetailModal 
          key={selectedCard._id}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          card={selectedCard}
          listId={selectedListId}
          boardId={board._id}
          boardMembers={board.members}
          onUpdateCard={handleUpdateCardInBoard}
          onDeleteCard={handleDeleteCardInBoard}
        />
      )}

      <MembersModal 
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={board.members}
        ownerId={board.ownerId}
        currentUser={user}
        onInvite={handleInvite}
        onRemove={handleRemoveMember}
      />
    </div>
  );
}

export default BoardPage;