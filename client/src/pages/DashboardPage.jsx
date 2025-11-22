import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBoards, createBoard } from '../services/boardApi'; 
import { Link } from 'react-router-dom'; 
import PageHeader from '../components/layout/PageHeader';

function DashboardPage() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const dummyStats = [
    { title: "Total Tasks", value: 142, color: 'text-gray-900 dark:text-white', bg: 'bg-white dark:bg-gray-800' },
    { title: "In Progress", value: 12, color: 'text-[--color-pro-orange]', bg: 'bg-white dark:bg-gray-800' },
    { title: "Completed (This Week)", value: 35, color: 'text-[--color-pro-green]', bg: 'bg-white dark:bg-gray-800' },
    { title: "Overdue", value: 4, color: 'text-[--color-pro-pink]', bg: 'bg-white dark:bg-gray-800' },
  ];

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
    <div className="flex flex-col h-full">
      <PageHeader title="Dashboard" showSearch={true} />
      
      {/* Nền trang chính: Thêm dark:bg-gray-900 */}
      <div className="p-8 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        
        {/* Thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dummyStats.map((stat) => (
                <div key={stat.title} className={`p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${stat.bg}`}>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stat.title}</span>
                    <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Danh sách Boards */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Các Bảng Công Việc Của Bạn</h2>
                
                <form onSubmit={handleCreateBoard} className="flex space-x-2 mb-6 max-w-xl">
                    <input
                        type="text"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        placeholder="Tạo Bảng mới..."
                        className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isCreating ? 'Đang tạo...' : 'Tạo'}
                    </button>
                </form>

                {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

                {loading ? (
                    <p className="dark:text-gray-300">Đang tải Bảng...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {boards.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">Bạn chưa có Bảng nào.</p>
                        ) : (
                            boards.map((board) => (
                                <Link
                                    key={board._id}
                                    to={`/board/${board._id}`} 
                                    className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 transition-all"
                                >
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{board.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                                        {board.lists.length} danh sách
                                    </p>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Deadlines */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Upcoming Deadlines</h2>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-100 text-pink-700 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold">NOV</span>
                            <span className="font-bold">12</span>
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Responsive Design Check</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Project: Design System</p>
                        </div>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold">NOV</span>
                            <span className="font-bold">14</span>
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Proofread final text</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Project: Investigation</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;