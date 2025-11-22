import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBoards, createBoard } from '../services/boardApi';
import PageHeader from '../components/layout/PageHeader';
import { Plus, Loader } from 'lucide-react';

function BoardListPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Lấy danh sách bảng khi vào trang
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoading(true);
        const data = await getMyBoards();
        setBoards(data);
      } catch (err) {
        setError('Không thể tải danh sách bảng.');
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  // Xử lý tạo bảng nhanh
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    setIsCreating(true);
    try {
      const newBoard = await createBoard(newBoardTitle);
      setBoards([newBoard, ...boards]); // Thêm bảng mới lên đầu
      setNewBoardTitle('');
    } catch (err) {
      alert(err.toString());
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-200">
      <PageHeader title="Danh sách Bảng" />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Form tạo bảng */}
          <div className="mb-8">
            <form onSubmit={handleCreateBoard} className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Nhập tên bảng mới..."
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pro-blue focus:border-transparent outline-none transition-all"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isCreating || !newBoardTitle}
                    className="flex items-center px-6 py-3 bg-pro-blue hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isCreating ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                    {isCreating ? 'Đang tạo...' : 'Tạo Bảng'}
                </button>
            </form>
          </div>

          {/* Danh sách bảng */}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {loading ? (
            <div className="flex justify-center py-10">
                <Loader className="w-8 h-8 text-pro-blue animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.length > 0 ? (
                boards.map((board) => (
                  <Link
                    key={board._id}
                    to={`/board/${board._id}`}
                    className="group block p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-pro-blue dark:hover:border-pro-blue transition-all duration-200"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-pro-blue transition-colors mb-2">
                        {board.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {board.lists?.length || 0} danh sách
                    </p>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Bạn chưa có bảng nào. Hãy tạo bảng đầu tiên nhé!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BoardListPage;