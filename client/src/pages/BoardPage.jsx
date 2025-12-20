import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { getBoardById, addMemberToBoard, removeMemberFromBoard } from '../services/boardApi';
import { createList, updateList, deleteList } from '../services/listApi';
import { moveCard } from '../services/cardApi';
import List from '../components/board/List';
import CardDetailModal from '../components/board/CardDetailModal';
import MembersModal from '../components/board/MembersModal'; 
import { useAuth } from '../context/AuthContext';
import { Users } from 'lucide-react'; 
import { useSocket } from '../context/SocketContext';

function BoardPage() {
  const { user } = useAuth();
  const { id } = useParams(); 
  const navigate = useNavigate();
  const socket = useSocket();
  
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const activeCardId = searchParams.get('cardId');


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
    const newBoard = { ...board };
    const list = newBoard.lists.find(l => l._id === listId);
    const cardIndex = list.cards.findIndex(c => c._id === updatedCard._id);
    if (cardIndex !== -1) {
        list.cards[cardIndex] = updatedCard;
        setBoard(newBoard);
    }
  };

  const handleDeleteCardInBoard = (listId, cardId) => {
    const newBoard = { ...board };
    const list = newBoard.lists.find(l => l._id === listId);
    list.cards = list.cards.filter(c => c._id !== cardId);
    setBoard(newBoard);
  };

  const handleInvite = async (email) => {
    try {
      const updatedBoard = await addMemberToBoard(board._id, email);
      setBoard(updatedBoard);
      alert('Đã thêm thành viên thành công!');
    } catch (err) {
      alert(err);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (window.confirm(`Bạn có chắc muốn xóa thành viên "${memberName}" khỏi bảng này?`)) {
      try {
        const updatedBoard = await removeMemberFromBoard(board._id, memberId);
        setBoard(updatedBoard);
      } catch (err) {
        alert(err);
      }
    }
  };

  const fetchBoard = async (isBackground = false) => {
    try {
        if (!isBackground) setLoading(true);
        
        const data = await getBoardById(id); 
        
        if (data.lists) {
            data.lists.sort((a, b) => a.position - b.position);
            data.lists.forEach((list) => {
                if (list.cards) {
                    list.cards.sort((a, b) => a.position - b.position);
                }
            });
        }
        setBoard(data);
    } catch (err) {
        setError(err.toString());
    } finally {
        if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard(false); 
  }, [id]);

  useEffect(() => {
    if (board && selectedCard) {
      const updatedCard = findCardInBoard(board, selectedCard._id);
      if (updatedCard && updatedCard !== selectedCard) {
        setSelectedCard(updatedCard);
      }
    }
  }, [board]);

  useEffect(() => {
    if (board && activeCardId) {
      let foundCard = null;
      let foundListId = null;

      for (const list of board.lists) {
        const card = list.cards.find(c => c._id === activeCardId);
        if (card) {
          foundCard = card;
          foundListId = list._id;
          break;
        }
      }
      if (foundCard) {
        handleCardClick(foundCard, foundListId);
      }
    }
  }, [board, activeCardId]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_board_room', id);
    socket.on('BOARD_UPDATED', (data) => {
        console.log("Update:", data);
        fetchBoard(true); 
    });

    socket.on('BOARD_DELETED', (data) => {
        alert(data.message); 
        navigate('/'); 
    });

    return () => {
        socket.emit('leave_board_room', id);
        socket.off('BOARD_UPDATED');  
        socket.off('BOARD_DELETED'); 
    };
  }, [socket, id, navigate]);



  const onDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;
    
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'CARD') {
      const newLists = [...board.lists];
      
      const sourceListIndex = newLists.findIndex(l => String(l._id) === String(source.droppableId));
      const destListIndex = newLists.findIndex(l => String(l._id) === String(destination.droppableId));

      if (sourceListIndex === -1 || destListIndex === -1) {
        console.error("Không tìm thấy danh sách nguồn hoặc đích");
        return;
      }

      const sourceList = { ...newLists[sourceListIndex], cards: [...newLists[sourceListIndex].cards] };
      const destList = sourceListIndex === destListIndex 
        ? sourceList 
        : { ...newLists[destListIndex], cards: [...newLists[destListIndex].cards] };

      const [movedCard] = sourceList.cards.splice(source.index, 1);
      destList.cards.splice(destination.index, 0, movedCard);

      newLists[sourceListIndex] = sourceList;
      if (sourceListIndex !== destListIndex) newLists[destListIndex] = destList;

      setBoard({ ...board, lists: newLists });
      
      try {
        await moveCard(draggableId, {
          boardId: board._id,
          sourceListId: source.droppableId,
          destListId: destination.droppableId,
          newPosition: destination.index,
        });
      } catch (error) {
        console.error('Lỗi di chuyển thẻ:', error);
        fetchBoard(); // Revert lại nếu lỗi
        alert("Có lỗi khi di chuyển thẻ, vui lòng thử lại.");
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
      const newList = await createList(newListTitle, id);
      setBoard({ ...board, lists: [...board.lists, newList] });
      setNewListTitle('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateListTitle = async (listId, newTitle) => {
    const newLists = board.lists.map(list => 
      list._id === listId ? { ...list, title: newTitle } : list
    );
    setBoard({ ...board, lists: newLists });

    try {
      await updateList(board._id, listId, { title: newTitle });
    } catch (error) {
      console.error("Lỗi cập nhật tên list:", error);
      fetchBoard(); 
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh sách này?")) return;

    const newLists = board.lists.filter(list => list._id !== listId);
    setBoard({ ...board, lists: newLists });

    try {
      await deleteList(board._id, listId);
    } catch (error) {
      console.error("Lỗi xóa list:", error);
      alert("Không thể xóa: " + error);
      fetchBoard();
    }
  };


  if (loading) return <div className="p-8 text-center dark:text-white">Đang tải dữ liệu Bảng...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
  if (!board) return <div className="p-8 text-center dark:text-white">Không tìm thấy Bảng.</div>;

  const isOwner = board?.ownerId?._id === user?._id || board?.ownerId === user?._id;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      
      <header className="p-4 bg-white dark:bg-gray-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 transition-colors">
        
        <div>
          <Link to="/boards" className="text-sm text-gray-500 hover:underline mb-1 block">
             &larr; Danh sách bảng
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{board.title}</h1>
            {isOwner && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Owner</span>}
          </div>
        </div>

        <div className="flex items-center gap-4">
            
            <div 
              className="flex -space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsMembersModalOpen(true)}
              title="Quản lý thành viên"
            >
                {board.members?.slice(0, 5).map((member) => (
                    <div 
                        key={member._id} 
                        className="relative inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-indigo-500 text-white text-xs font-bold uppercase overflow-hidden"
                    >
                        {member.avatar ? (
                            <img 
                                src={member.avatar} 
                                alt="avatar" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <span>
                                {member.fullName ? member.fullName.charAt(0) : member.email?.charAt(0)}
                            </span>
                        )}
                    </div>
                ))}

                {board.members?.length > 5 && (
                    <div className="relative inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-xs font-bold z-10">
                        +{board.members.length - 5}
                    </div>
                )}
            </div>

            <button 
                onClick={() => setIsMembersModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-colors font-medium"
            >
                <Users className="w-4 h-4" />
                <span>Thành viên</span>
            </button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-grow p-4 overflow-x-auto bg-gray-100 dark:bg-gray-900 transition-colors"
            >
              {board.lists.map((list, index) => (
                <List
                  key={list._id}
                  list={list}
                  boardId={board._id}
                  onCardCreated={handleCardCreated}
                  onCardClick={handleCardClick}
                  onUpdateTitle={handleUpdateListTitle} 
                  onDeleteList={handleDeleteList}  
                  index={index}    
                />
              ))}
              {provided.placeholder}

              <div className="flex-shrink-0 w-72 p-2">
                <form onSubmit={handleCreateList} className="p-2 bg-gray-200 dark:bg-gray-800 rounded-md border border-transparent dark:border-gray-700 transition-colors">
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="+ Thêm danh sách mới"
                    className="w-full px-2 py-1 text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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