import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBoards, createBoard, deleteBoard, updateBoard } from '../services/boardApi'; // Import thêm delete, update
import PageHeader from '../components/layout/PageHeader';
import { Plus, Loader, Trash2, Edit2, X, Check } from 'lucide-react'; // Import thêm icon

function BoardListPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State cho tạo bảng mới
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // State cho chức năng Đổi tên (Rename)
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

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

  // --- 1. TẠO BẢNG ---
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    setIsCreating(true);
    try {
      const newBoard = await createBoard(newBoardTitle);
      setBoards([newBoard, ...boards]);
      setNewBoardTitle('');
    } catch (err) {
      alert(err.toString());
    } finally {
      setIsCreating(false);
    }
  };

  // --- 2. XÓA BẢNG ---
  const handleDeleteBoard = async (e, boardId) => {
    e.preventDefault(); // Chặn Link chuyển trang
    e.stopPropagation(); // Chặn sự kiện nổi bọt

    if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa bảng này? Mọi danh sách và thẻ bên trong sẽ bị xóa vĩnh viễn!")) {
      try {
        await deleteBoard(boardId);
        // Cập nhật UI: Loại bỏ bảng vừa xóa khỏi danh sách
        setBoards(boards.filter(b => b._id !== boardId));
      } catch (err) {
        alert("Lỗi xóa bảng: " + err.toString());
      }
    }
  };

  // --- 3. ĐỔI TÊN BẢNG ---
  const startEditing = (e, board) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(board._id);
    setEditTitle(board.title);
  };

  const cancelEditing = (e) => {
    if(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    setEditingId(null);
    setEditTitle('');
  };

  const saveTitle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editTitle.trim()) return;

    try {
      await updateBoard(editingId, { title: editTitle });
      // Cập nhật UI
      setBoards(boards.map(b => b._id === editingId ? { ...b, title: editTitle } : b));
      setEditingId(null);
    } catch (err) {
      alert("Lỗi đổi tên: " + err.toString());
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-200">
      <PageHeader title="Danh sách Bảng" />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.length > 0 ? (
                boards.map((board) => (
                  <div key={board._id} className="relative group">
                    {editingId === board._id ? (
                        // --- GIAO DIỆN CHỈNH SỬA ---
                        <div className="p-6 bg-white dark:bg-gray-800 border-2 border-pro-blue rounded-xl shadow-lg">
                            <input 
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={cancelEditing}
                                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={saveTitle}
                                    className="p-2 bg-pro-blue text-white hover:bg-blue-600 rounded"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- GIAO DIỆN HIỂN THỊ (LINK) ---
                        <Link
                            to={`/board/${board._id}`}
                            className="block h-full p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-pro-blue dark:hover:border-pro-blue transition-all duration-200"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 truncate pr-16">
                                {board.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {board.lists?.length || 0} danh sách
                            </p>

                            {/* Nút thao tác (Chỉ hiện khi hover chuột vào bảng) */}
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={(e) => startEditing(e, board)}
                                    className="p-1.5 text-gray-500 hover:text-pro-blue hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                                    title="Đổi tên"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteBoard(e, board._id)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                                    title="Xóa bảng"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </Link>
                    )}
                  </div>
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