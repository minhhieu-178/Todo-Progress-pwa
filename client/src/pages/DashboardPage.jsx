import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBoards, createBoard } from '../services/boardApi'; 
import { Link } from 'react-router-dom'; 

function DashboardPage() {
  const { user, logout } = useAuth();
  const [boards, setBoards] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        const data = await getMyBoards(); 
        setBoards(data);
        setError('');
      } catch (err) {
        setError(err.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []); 

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) {
      setError('Vui lòng nhập tiêu đề Bảng');
      return;
    }

    setIsCreating(true);
    try {
      const newBoard = await createBoard(newBoardTitle);
      setBoards([newBoard, ...boards]);
      setNewBoardTitle('');
      setError('');
    } catch (err) {
      setError(err.toString());
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">
          Bảng của bạn
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            Xin chào, {user?.fullName}!
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="mt-6">
        <form onSubmit={handleCreateBoard} className="flex space-x-2">
          <input
            type="text"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            placeholder="Tạo Bảng mới..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? 'Đang tạo...' : 'Tạo'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <p>Đang tải Bảng...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {boards.length === 0 ? (
              <p>Bạn chưa có Bảng nào. Hãy tạo một Bảng mới!</p>
            ) : (
              boards.map((board) => (
                <Link
                  key={board._id}
                  to={`/board/${board._id}`} 
                  className="block p-4 bg-blue-500 rounded-md shadow-sm hover:bg-blue-600"
                >
                  <h3 className="font-bold text-white">{board.title}</h3>
                  <p className="text-sm text-blue-100">
                    {board.lists.length} danh sách
                  </p>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;