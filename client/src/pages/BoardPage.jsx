import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { getBoardById, addMemberToBoard, removeMemberFromBoard } from '../services/boardApi';
import { createList, updateList, deleteList, moveList } from '../services/listApi';
import { moveCard } from '../services/cardApi';
import List from '../components/board/List';
import CardDetailModal from '../components/board/CardDetailModal';
import MembersModal from '../components/board/MembersModal';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Users, ChevronLeft, X } from 'lucide-react';

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

  const isOwner =
    board?.ownerId?._id === user?._id || board?.ownerId === user?._id;

  /* ================== HELPERS ================== */
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

  /* ================== FETCH ================== */
  const fetchBoard = async (bg = false) => {
    try {
      if (!bg) setLoading(true);
      const data = await getBoardById(id);

      data.lists?.sort((a, b) => a.position - b.position);
      data.lists?.forEach(l =>
        l.cards?.sort((a, b) => a.position - b.position)
      );

      setBoard(data);
    } catch (e) {
      setError(e.toString());
    } finally {
      if (!bg) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_board_room', id);
    socket.on('BOARD_UPDATED', () => fetchBoard(true));
    socket.on('BOARD_DELETED', d => {
      alert(d.message);
      navigate('/');
    });

    return () => {
      socket.emit('leave_board_room', id);
      socket.off('BOARD_UPDATED');
      socket.off('BOARD_DELETED');
    };
  }, [socket, id, navigate]);

  useEffect(() => {
    if (board && activeCardId) {
      const card = findCardInBoard(board, activeCardId);
      if (!card) return;
      const list = board.lists.find(l =>
        l.cards.some(c => c._id === activeCardId)
      );
      if (list) handleCardClick(card, list._id);
    }
  }, [board, activeCardId]);

  /* ================== DND ================== */
  const onDragEnd = async ({ source, destination, draggableId, type }) => {
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === 'LIST') {
      const lists = [...board.lists];
      const [moved] = lists.splice(source.index, 1);
      lists.splice(destination.index, 0, moved);
      setBoard({ ...board, lists });
      await moveList(board._id, draggableId, destination.index);
      return;
    }

    const lists = [...board.lists];
    const srcIdx = lists.findIndex(l => l._id === source.droppableId);
    const dstIdx = lists.findIndex(l => l._id === destination.droppableId);
    const src = { ...lists[srcIdx], cards: [...lists[srcIdx].cards] };
    const dst =
      srcIdx === dstIdx
        ? src
        : { ...lists[dstIdx], cards: [...lists[dstIdx].cards] };

    const [card] = src.cards.splice(source.index, 1);
    dst.cards.splice(destination.index, 0, card);

    lists[srcIdx] = src;
    lists[dstIdx] = dst;
    setBoard({ ...board, lists });

    await moveCard(draggableId, {
      boardId: board._id,
      sourceListId: source.droppableId,
      destListId: destination.droppableId,
      newPosition: destination.index
    });
  };

  /* ================== CRUD ================== */
  const handleCreateList = async e => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    const list = await createList(newListTitle, id);
    setBoard({ ...board, lists: [...board.lists, list] });
    setNewListTitle('');
  };

  const handleInvite = async email => {
    const updated = await addMemberToBoard(board._id, email);
    setBoard(updated);
  };

  const handleRemoveMember = async id => {
    const updated = await removeMemberFromBoard(board._id, id);
    setBoard(updated);
  };

  /* ================== RENDER ================== */
  if (loading) return <div className="p-8 text-center">Đang tải…</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!board) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Link to="/boards">
            <ChevronLeft />
          </Link>
          <h1 className="text-xl font-bold">{board.title}</h1>
          {isOwner && (
            <span className="text-xs px-2 py-1 bg-yellow-200 rounded">
              Owner
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsMembersModalOpen(true)}
        >
          {board.members?.slice(0, 5).map(m => (
            <div
              key={m._id}
              className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm"
            >
              {m.fullName?.charAt(0) || '?'}
            </div>
          ))}
          <Users />
        </div>
      </header>

      {/* BOARD */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" direction="horizontal" type="LIST">
          {p => (
            <div
              ref={p.innerRef}
              {...p.droppableProps}
              className="flex gap-4 p-4 overflow-x-auto"
            >
              {board.lists.map((l, i) => (
                <List
                  key={l._id}
                  list={l}
                  index={i}
                  boardId={board._id}
                  onCardClick={handleCardClick}
                />
              ))}
              {p.placeholder}

              <form onSubmit={handleCreateList} className="w-72">
                <input
                  value={newListTitle}
                  onChange={e => setNewListTitle(e.target.value)}
                  placeholder="+ Thêm danh sách"
                  className="w-full p-3 border rounded"
                />
              </form>
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
