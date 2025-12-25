import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { getBoardById, addMemberToBoard, removeMemberFromBoard } from '../services/boardApi';
import { createList, updateList, deleteList, moveList } from '../services/listApi';
import List from '../components/board/List';
import CardDetailModal from '../components/board/CardDetailModal';
import MembersModal from '../components/board/MembersModal'; 
import { useAuth } from '../context/AuthContext';
import { Users, ChevronLeft, X } from 'lucide-react';
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

        newLists[sourceListIndex] = sourceList;
        if (sourceListIndex !== destListIndex) newLists[destListIndex] = destList;
        setBoard({ ...board, lists: newLists });
        
        try { await moveCard(draggableId, { boardId: board._id, sourceListId: source.droppableId, destListId: destination.droppableId, newPosition: destination.index }); } 
        catch (error) { console.error(error); fetchBoard(); }
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
    <div className="flex flex-col h-screen transition-colors duration-200 relative">
      
      {/* Header - Responsive Layout */}
      <header className="responsive-px py-3 glass-effect shadow-sm border-b border-white/10 shrink-0 relative z-20">
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden mb-3">
          <div className="flex items-center responsive-gap">
            <Link 
              to="/boards" 
              className="touch-target p-2 -ml-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              aria-label="Quay lại danh sách board"
            >
               <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="responsive-text-lg font-bold text-white truncate">
                {board.title}
              </h1>
              <div className="flex items-center responsive-gap">
                  {isOwner && (
                    <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full font-medium border border-yellow-500/30">
                      Owner
                    </span>
                  )}
                  <span className="responsive-text-sm text-white/70">
                    {board.lists.length} danh sách
                  </span>
              </div>
            </div>
          </div>
          
          {/* Mobile Member Controls */}
          <div className="flex items-center responsive-gap flex-shrink-0">
              <div className="flex -space-x-2" onClick={() => setIsMembersModalOpen(true)}>
                  {board.members?.slice(0, 3).map((member) => (
                      <div key={member._id} className="w-8 h-8 rounded-full ring-2 ring-white/20 bg-indigo-500 text-white flex items-center justify-center text-xs font-bold overflow-hidden cursor-pointer">
                          {member.avatar ? (
                            <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            member.fullName?.charAt(0) || '?'
                          )}
                      </div>
                  ))}
                  {board.members?.length > 3 && (
                      <div className="w-8 h-8 rounded-full ring-2 ring-white/20 bg-white/20 flex items-center justify-center text-xs font-bold cursor-pointer">
                        +{board.members.length - 3}
                      </div>
                  )}
              </div>
              <button 
                onClick={() => setIsMembersModalOpen(true)} 
                className="touch-target p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Quản lý thành viên"
              >
                  <Users className="w-5 h-5 text-white" />
              </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center responsive-gap min-w-0 flex-1">
            <Link 
              to="/boards" 
              className="touch-target p-2 -ml-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              aria-label="Quay lại danh sách board"
            >
               <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="responsive-text-2xl font-bold text-white truncate">
                {board.title}
              </h1>
              <div className="flex items-center responsive-gap mt-1">
                  {isOwner && (
                    <span className="bg-yellow-500/20 text-yellow-300 responsive-text-sm px-2 py-1 rounded-full font-medium border border-yellow-500/30">
                      Owner
                    </span>
                  )}
                  <span className="responsive-text-sm text-white/70">
                    {board.lists.length} danh sách • {board.lists.reduce((acc, list) => acc + (list.cards?.length || 0), 0)} thẻ
                  </span>
              </div>
            </div>
          </div>

          {/* Desktop Member Controls */}
          <div className="flex items-center responsive-gap flex-shrink-0">
              <div className="flex -space-x-2" onClick={() => setIsMembersModalOpen(true)}>
                  {board.members?.slice(0, 5).map((member) => (
                      <div 
                        key={member._id} 
                        className="w-9 h-9 rounded-full ring-2 ring-white/20 bg-indigo-500 text-white flex items-center justify-center responsive-text-sm font-bold overflow-hidden cursor-pointer hover:scale-110 transition-transform"
                        title={member.fullName || member.name || 'Unknown User'}
                      >
                          {member.avatar ? (
                            <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            member.fullName?.charAt(0) || member.name?.charAt(0) || '?'
                          )}
                      </div>
                  ))}
                  {board.members?.length > 5 && (
                      <div className="w-9 h-9 rounded-full ring-2 ring-white/20 bg-white/20 flex items-center justify-center responsive-text-sm font-bold cursor-pointer hover:scale-110 transition-transform">
                        +{board.members.length - 5}
                      </div>
                  )}
              </div>
              <button 
                onClick={() => setIsMembersModalOpen(true)} 
                className="touch-target responsive-p bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Quản lý thành viên"
              >
                  <Users className="w-5 h-5 text-white" />
              </button>
          </div>
        </div>
      </header>

      {/* Board Content - Horizontal Scrolling Lists */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-grow px-6 pt-6 pb-4 overflow-x-auto custom-scrollbar transition-colors items-start gap-4 safe-area-bottom relative z-10"
              style={{ 
                minHeight: 'calc(100vh - 120px)',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
              }}
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

              {/* Add New List Form */}
              <div className="flex-shrink-0 w-80 px-3">
                <form onSubmit={handleCreateList} className="p-4 glass-effect rounded-xl border-2 border-dashed border-white/30 hover:border-blue-400/50 transition-all duration-200 group">
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="+ Thêm danh sách mới"
                    className="w-full p-3 text-sm bg-transparent text-white focus:outline-none placeholder-white/60 font-medium group-hover:placeholder-blue-300 transition-colors"
                  />
                  {newListTitle.trim() && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20">
                      <button 
                        type="submit"
                        className="bg-blue-600/80 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors backdrop-blur-sm"
                      >
                        Thêm danh sách
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewListTitle('')}
                        className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Hủy"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Modals */}
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