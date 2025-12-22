import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBoards, createBoard, deleteBoard, updateBoard } from '../services/boardApi';
import PageHeader from '../components/layout/PageHeader';
import { Plus, Loader, Trash2, Edit2, X, Check, Search } from 'lucide-react'; 

function BoardListPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  // (State tạo bảng, chỉnh sửa giữ nguyên)
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
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

  // (Các hàm handleCreateBoard, handleDeleteBoard, Edit giữ nguyên)
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

  const handleDeleteBoard = async (e, boardId) => {
      e.preventDefault(); e.stopPropagation();
      if (window.confirm("CẢNH BÁO: Xóa bảng này?")) {
        try {
          await deleteBoard(boardId);
          setBoards(boards.filter(b => b._id !== boardId));
        } catch (err) { alert(err.toString()); }
      }
  };

  const startEditing = (e, board) => { e.preventDefault(); e.stopPropagation(); setEditingId(board._id); setEditTitle(board.title); };
  const cancelEditing = (e) => { if(e) { e.preventDefault(); e.stopPropagation(); } setEditingId(null); setEditTitle(''); };
  const saveTitle = async (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!editTitle.trim()) return;
      try {
        await updateBoard(editingId, { title: editTitle });
        setBoards(boards.map(b => b._id === editingId ? { ...b, title: editTitle } : b));
        setEditingId(null);
      } catch (err) { alert(err.toString()); }
  };

  // --- LOGIC LỌC BẢNG ---
  const filteredBoards = boards.filter(board => 
    board.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // SỬA: Nền chính #1d2125
    <div className="flex flex-col h-full bg-white dark:bg-[#1d2125] transition-colors duration-200">
      <PageHeader title="Danh sách Bảng" showSearch={false} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* --- THANH CÔNG CỤ: TÌM KIẾM & TẠO MỚI --- */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
            
            {/* Ô Tìm kiếm Bảng */}
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#9fadbc]" />
                {/* SỬA: Input nền #22272b */}
                <input 
                    type="text" 
                    placeholder="Tìm kiếm bảng..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#22272b] text-gray-900 dark:text-[#b6c2cf] focus:ring-2 focus:ring-pro-blue outline-none transition-all shadow-sm dark:placeholder-[#9fadbc]"
                />
            </div>

            {/* Form Tạo Bảng */}
            <form onSubmit={handleCreateBoard} className="flex gap-2 w-full md:w-auto">
                {/* SỬA: Input nền #22272b */}
                <input
                    type="text"
                    placeholder="Tên bảng mới..."
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    className="flex-1 md:w-64 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#22272b] text-gray-900 dark:text-[#b6c2cf] focus:ring-2 focus:ring-pro-blue outline-none dark:placeholder-[#9fadbc]"
                />
                <button 
                    type="submit" 
                    disabled={isCreating || !newBoardTitle}
                    className="px-6 py-3 bg-pro-blue hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 whitespace-nowrap"
                >
                    {isCreating ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                </button>
            </form>
          </div>

          {/* Danh sách bảng */}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {loading ? (
            <div className="flex justify-center py-10"><Loader className="w-8 h-8 text-pro-blue animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBoards.length > 0 ? (
                filteredBoards.map((board) => (
                  <div key={board._id} className="relative group">
                    {editingId === board._id ? (
                        // Form sửa (Edit Mode)
                        // SỬA: Nền edit form #22272b
                        <div className="p-6 bg-white dark:bg-[#22272b] border-2 border-pro-blue rounded-xl shadow-lg">
                            {/* SỬA: Input bên trong edit mode nền #1d2125 */}
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full mb-4 p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf]" autoFocus />
                            <div className="flex justify-end gap-2">
                                <button onClick={cancelEditing} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2c333a] rounded text-gray-500 dark:text-[#9fadbc]"><X className="w-5 h-5" /></button>
                                <button onClick={saveTitle} className="p-2 bg-pro-blue text-white rounded"><Check className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ) : (
                        // Card hiển thị
                        // SỬA: Nền card #22272b, Viền white/10
                        <Link to={`/board/${board._id}`} className="block h-full p-6 bg-gray-50 dark:bg-[#22272b] border border-gray-200 dark:border-white/10 rounded-xl hover:shadow-lg hover:border-pro-blue transition-all duration-200">
                            {/* SỬA: Tiêu đề #b6c2cf */}
                            <h3 className="text-lg font-bold text-gray-900 dark:text-[#b6c2cf] mb-2 truncate pr-8">{board.title}</h3>
                            {/* SỬA: Chữ phụ #9fadbc */}
                            <p className="text-sm text-gray-500 dark:text-[#9fadbc]">{board.lists?.length || 0} danh sách</p>
                            
                            {/* Nút thao tác (Hiện khi hover) */}
                            {/* SỬA: Nền nút thao tác #1d2125 để nổi lên trên nền card */}
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#1d2125] p-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                <button onClick={(e) => startEditing(e, board)} className="p-1.5 text-gray-500 dark:text-[#9fadbc] hover:text-pro-blue rounded-md"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={(e) => handleDeleteBoard(e, board._id)} className="p-1.5 text-gray-500 dark:text-[#9fadbc] hover:text-red-600 rounded-md"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 dark:text-[#9fadbc]">
                        {searchTerm ? `Không tìm thấy bảng nào khớp với "${searchTerm}"` : 'Bạn chưa có bảng nào.'}
                    </p>
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