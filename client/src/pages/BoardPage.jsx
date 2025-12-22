import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { getBoardById, addMemberToBoard, removeMemberFromBoard } from '../services/boardApi';
import { createList, updateList, deleteList } from '../services/listApi';
import List from '../components/board/List';
import CardDetailModal from '../components/board/CardDetailModal';
import MembersModal from '../components/board/MembersModal'; 
import { useAuth } from '../context/AuthContext';
import { Users, ChevronLeft } from 'lucide-react'; // Thêm ChevronLeft
import { moveCard } from '../services/cardApi';
import { useSocket } from '../context/SocketContext';

function BoardPage() {
  const { user } = useAuth();
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
  const { id } = useParams();
  const socket = useSocket();
  const navigate = useNavigate();

  // (Các hàm logic findCardInBoard, handleCardClick, handleUpdateCard... GIỮ NGUYÊN)
  // ... (Code logic không thay đổi, chỉ paste lại phần render UI ở dưới)
  // Để tiết kiệm không gian, tôi sẽ focus vào phần render, logic JS giữ nguyên như cũ.
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
    if (cardIndex !== -1) { list.cards[cardIndex] = updatedCard; setBoard(newBoard); }
  };

  const handleDeleteCardInBoard = (listId, cardId) => {
    const newBoard = { ...board };
    const list = newBoard.lists.find(l => l._id === listId);
    list.cards = list.cards.filter(c => c._id !== cardId);
    setBoard(newBoard);
  };

  const handleInvite = async (email) => {
    try { const updatedBoard = await addMemberToBoard(board._id, email); setBoard(updatedBoard); alert('Thành công!'); } 
    catch (err) { alert(err); }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (window.confirm(`Xóa thành viên "${memberName}"?`)) {
      try { const updatedBoard = await removeMemberFromBoard(board._id, memberId); setBoard(updatedBoard); } 
      catch (err) { alert(err); }
    }
  };
  
  useEffect(() => {
    if (board && selectedCard) {
      const updatedCard = findCardInBoard(board, selectedCard._id);
      if (updatedCard && updatedCard !== selectedCard) setSelectedCard(updatedCard);
    }
  }, [board]);

  useEffect(() => {
    if (board && activeCardId) {
      const foundCard = findCardInBoard(board, activeCardId);
      if (foundCard) {
          const list = board.lists.find(l => l.cards.find(c => c._id === activeCardId));
          if(list) handleCardClick(foundCard, list._id);
      }
    }
  }, [board, activeCardId]);

  const fetchBoard = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const data = await getBoardById(id); 
            if (data.lists) {
                data.lists.sort((a, b) => a.position - b.position);
                data.lists.forEach((list) => { if (list.cards) list.cards.sort((a, b) => a.position - b.position); });
            }
            setBoard(data);
        } catch (err) { setError(err.toString()); } finally { if (!isBackground) setLoading(false); }
  };
  useEffect(() => { fetchBoard(false); }, [id]);
  
  useEffect(() => {
        if (!socket || !id) return;
        socket.emit('join_board_room', id);
        socket.on('BOARD_UPDATED', () => fetchBoard(true));
        socket.on('BOARD_DELETED', (data) => { alert(data.message); navigate('/'); });
        return () => { socket.emit('leave_board_room', id); socket.off('BOARD_UPDATED'); socket.off('BOARD_DELETED'); };
  }, [socket, id, navigate]);

  const onDragEnd = async (result) => {
    // (Giữ nguyên logic Drag & Drop cũ)
    const { source, destination, draggableId, type } = result;
<<<<<<< Updated upstream
    
    // Kiểm tra điểm đến hợp lệ
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

=======
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'LIST') {
      const newLists = [...board.lists];
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);
      setBoard({ ...board, lists: newLists });
      try { await moveList(board._id, draggableId, destination.index); } catch (error) { console.error(error); }
      return;
    }
>>>>>>> Stashed changes
    if (type === 'CARD') {
        // Logic Card drag (giữ nguyên)
        const newLists = [...board.lists];
        const sourceListIndex = newLists.findIndex(l => String(l._id) === String(source.droppableId));
        const destListIndex = newLists.findIndex(l => String(l._id) === String(destination.droppableId));
        if (sourceListIndex === -1 || destListIndex === -1) return;

        const sourceList = { ...newLists[sourceListIndex], cards: [...newLists[sourceListIndex].cards] };
        const destList = sourceListIndex === destListIndex ? sourceList : { ...newLists[destListIndex], cards: [...newLists[destListIndex].cards] };

        const [movedCard] = sourceList.cards.splice(source.index, 1);
        destList.cards.splice(destination.index, 0, movedCard);

<<<<<<< Updated upstream
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
        fetchBoard();
        alert("Có lỗi khi di chuyển thẻ, vui lòng thử lại.");
      }
=======
        newLists[sourceListIndex] = sourceList;
        if (sourceListIndex !== destListIndex) newLists[destListIndex] = destList;
        setBoard({ ...board, lists: newLists });
        
        try { await moveCard(draggableId, { boardId: board._id, sourceListId: source.droppableId, destListId: destination.droppableId, newPosition: destination.index }); } 
        catch (error) { console.error(error); fetchBoard(); }
>>>>>>> Stashed changes
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
    } catch (error) { console.error(error); }
  };

  const handleUpdateListTitle = async (listId, newTitle) => {
    const newLists = board.lists.map(list => list._id === listId ? { ...list, title: newTitle } : list);
    setBoard({ ...board, lists: newLists });
    try { await updateList(board._id, listId, { title: newTitle }); } catch (error) { fetchBoard(); }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm("Xóa danh sách này?")) return;
    const newLists = board.lists.filter(list => list._id !== listId);
    setBoard({ ...board, lists: newLists });
    try { await deleteList(board._id, listId); } catch (error) { fetchBoard(); }
  };

  if (loading) return <div className="p-8 text-center dark:text-white">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
  if (!board) return <div className="p-8 text-center dark:text-white">Không tìm thấy Bảng.</div>;
  const isOwner = board?.ownerId?._id === user?._id || board?.ownerId === user?._id;

  return (
    // SỬA: Nền chính #1d2125
    <div className="flex flex-col h-screen bg-white dark:bg-[#1d2125] transition-colors duration-200">
      
<<<<<<< Updated upstream
      {/* HEADER */}
      {/* SỬA: Header nền #1d2125, Viền white/10 */}
      <header className="p-4 bg-white dark:bg-[#1d2125] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-white/10 transition-colors">
        
        <div>
          {/* SỬA: Màu link quay lại #9fadbc */}
          <Link to="/boards" className="text-sm text-gray-500 dark:text-[#9fadbc] hover:underline mb-1 block">
             &larr; Danh sách bảng
          </Link>
          <div className="flex items-center gap-3">
            {/* SỬA: Tiêu đề bảng #b6c2cf */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#b6c2cf]">{board.title}</h1>
            {isOwner && <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs px-2 py-1 rounded-full font-medium">Owner</span>}
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
                        // SỬA: Ring trùng màu nền header #1d2125
                        className="relative inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#1d2125] bg-indigo-500 text-white text-xs font-bold uppercase overflow-hidden"
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

                {/* Bong bóng hiển thị số lượng còn lại (+3) */}
                {board.members?.length > 5 && (
                    // SỬA: Nền bong bóng #22272b, Ring #1d2125
                    <div className="relative inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white dark:ring-[#1d2125] bg-gray-200 dark:bg-[#22272b] text-gray-600 dark:text-[#b6c2cf] text-xs font-bold z-10">
                        +{board.members.length - 5}
                    </div>
                )}
            </div>

            {/* Nút Members */}
            {/* SỬA: Nền nút #22272b, Hover #2c333a */}
            <button 
                onClick={() => setIsMembersModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#22272b] text-gray-700 dark:text-[#b6c2cf] rounded-md hover:bg-gray-200 dark:hover:bg-[#2c333a] text-sm transition-colors font-medium"
            >
                <Users className="w-4 h-4" />
                <span>Thành viên</span>
=======
      {/* HEADER: Responsive layout */}
      <header className="p-3 md:p-4 bg-white dark:bg-[#1d2125] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-200 dark:border-white/10 shrink-0">
        
        <div className="flex items-center gap-2">
          <Link to="/boards" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2c333a] text-gray-500 dark:text-[#9fadbc]">
             <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-[#b6c2cf] leading-tight">{board.title}</h1>
            <div className="flex items-center gap-2">
                {isOwner && <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] px-1.5 py-0.5 rounded font-medium">Owner</span>}
                <span className="text-xs text-gray-500">{board.lists.length} lists</span>
            </div>
          </div>
        </div>

        {/* Member Controls */}
        <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="flex -space-x-2" onClick={() => setIsMembersModalOpen(true)}>
                {board.members?.slice(0, 4).map((member) => (
                    <div key={member._id} className="w-7 h-7 md:w-8 md:h-8 rounded-full ring-2 ring-white dark:ring-[#1d2125] bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                        {member.avatar ? <img src={member.avatar} alt="avt" className="w-full h-full object-cover" /> : member.fullName?.charAt(0)}
                    </div>
                ))}
                {board.members?.length > 4 && (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full ring-2 ring-white dark:ring-[#1d2125] bg-gray-200 dark:bg-[#22272b] flex items-center justify-center text-[10px] font-bold">+{board.members.length - 4}</div>
                )}
            </div>
            <button onClick={() => setIsMembersModalOpen(true)} className="p-2 bg-gray-100 dark:bg-[#22272b] rounded-md hover:bg-gray-200 dark:hover:bg-[#2c333a] transition-colors">
                <Users className="w-4 h-4 text-gray-700 dark:text-[#b6c2cf]" />
>>>>>>> Stashed changes
            </button>
        </div>
      </header>

<<<<<<< Updated upstream
=======
      {/* CONTENT: Cuộn ngang cho list */}
>>>>>>> Stashed changes
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
<<<<<<< Updated upstream
              // SỬA: Nền khu vực kéo thả #1d2125
              className="flex flex-grow p-4 overflow-x-auto bg-gray-100 dark:bg-[#1d2125] transition-colors items-start"
=======
              className="flex flex-grow p-3 md:p-4 overflow-x-auto bg-gray-100 dark:bg-[#1d2125] transition-colors items-start"
>>>>>>> Stashed changes
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

              {/* Form Add List: Kích thước cố định nhưng không đè content */}
              <div className="flex-shrink-0 w-72 p-2">
<<<<<<< Updated upstream
                {/* SỬA: Form thêm list mới nền đen #101204 (giống List.jsx) */}
                <form onSubmit={handleCreateList} className="p-2 bg-gray-200 dark:bg-[#101204] rounded-xl border border-transparent dark:border-white/5 transition-colors">
                  {/* SỬA: Input nền #22272b */}
=======
                <form onSubmit={handleCreateList} className="p-2 bg-white/50 dark:bg-[#22272b]/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-pro-blue transition-colors">
>>>>>>> Stashed changes
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="+ Thêm danh sách"
                    className="w-full px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-[#b6c2cf] focus:outline-none placeholder-gray-500 font-medium"
                  />
                </form>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

<<<<<<< Updated upstream
=======
      {/* MODALS GIỮ NGUYÊN */}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
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