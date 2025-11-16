import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// BỎ import MainLayout vì nó đã được dùng ở app.jsx
import PageHeader from '../components/layout/PageHeader';
import { getBoardById, createList, createCard } from '../services/boardApi';

function BoardPage() {
  const { boardId } = useParams(); // Sẽ hoạt động vì bạn đã sửa app.jsx thành :boardId
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newListTitle, setNewListTitle] = useState('');
  const [newCardTitle, setNewCardTitle] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const data = await getBoardById(boardId);
        setBoard(data);
      } catch (err) {
        setError('Không thể tải board');
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [boardId]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const list = await createList(boardId, newListTitle);
      setBoard({ ...board, lists: [...board.lists, list] });
      setNewListTitle('');
    } catch (err) {
      setError('Không thể tạo danh sách mới');
    }
  };

  const handleCreateCard = async (e, listId) => {
    e.preventDefault();
    const title = newCardTitle[listId]?.trim();
    if (!title) return;
    try {
      const card = await createCard(boardId, listId, title);
      setBoard({
        ...board,
        lists: board.lists.map((list) =>
          list._id === listId ? { ...list, cards: [...list.cards, card] } : list
        ),
      });
      setNewCardTitle({ ...newCardTitle, [listId]: '' });
    } catch (err) {
      setError('Không thể tạo card mới');
    }
  };

  // Các trạng thái loading/error này sẽ hiển thị BÊN TRONG MainLayout (từ app.jsx)
  if (loading) return <p>Đang tải Board...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!board) return <p>Không tìm thấy Board</p>;

  // Bắt đầu component với React Fragment (<>) thay vì <MainLayout>
  return (
    <>
      <PageHeader title={board.title} showSearch={false} />

      <div className="p-6 overflow-x-auto">
        <div className="flex space-x-4">
          {board.lists?.map((list) => (
            <div key={list._id} className="bg-gray-100 rounded-md w-80 p-4 flex-shrink-0">
              <h3 className="font-semibold mb-2">{list.title}</h3>

              {/* Cards */}
              <div className="space-y-2">
                {list.cards?.map((card) => (
                  <div key={card._id} className="bg-white p-3 rounded-md shadow-sm">
                    {card.title}
                  </div>
                ))}
              </div>

              {/* Form tạo card */}
              <form
                onSubmit={(e) => handleCreateCard(e, list._id)}
                className="mt-2 flex space-x-2"
              >
                <input
                  type="text"
                  value={newCardTitle[list._id] || ''}
                  onChange={(e) =>
                    setNewCardTitle({ ...newCardTitle, [list._id]: e.target.value })
                  }
                  placeholder="Thêm thẻ mới..."
                  className="flex-1 px-2 py-1 border rounded-md"
                />
                <button type="submit" className="px-2 bg-blue-500 text-white rounded-md">
                  Thêm
                </button>
              </form>
            </div>
          ))}

          {/* Form tạo list mới */}
          <div className="bg-gray-50 p-4 rounded-md w-80 flex-shrink-0">
            <form onSubmit={handleCreateList} className="flex flex-col space-y-2">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Tên danh sách mới..."
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Thêm danh sách
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default BoardPage;