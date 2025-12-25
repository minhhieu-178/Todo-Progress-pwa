import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getMyBoards, createBoard, deleteBoard, updateBoard } from '../services/boardApi';
import PageHeader from '../components/layout/PageHeader';
import { 
    Plus, Loader, Trash2, Edit2, X, Check, Search, 
    MoreVertical, Layout, CalendarClock 
} from 'lucide-react'; 

function BoardListPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  // State tạo bảng
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // State chỉnh sửa & Menu
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null); // ID của bảng đang mở menu 3 chấm

  // Ref để click outside đóng menu
  const menuRef = useRef(null);

  useEffect(() => {
    fetchBoards();
    
    // Event listener để đóng menu khi click ra ngoài
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setOpenMenuId(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleCreateBoard = async (e) => {
      e.preventDefault();
      if (!newBoardTitle.trim()) return;
      
      // Optimistic update hoặc loading local
      const tempId = Date.now(); 
      setIsCreating(true); // Giữ loading state
      
      try {
        const newBoard = await createBoard(newBoardTitle);
        setBoards([newBoard, ...boards]);
        setNewBoardTitle('');
        setIsCreating(false); // Tắt form tạo
      } catch (err) {
        alert(err.toString());
        setIsCreating(false);
      }
  };

  const handleDeleteBoard = async (e, boardId) => {
      e.preventDefault(); e.stopPropagation();
      if (window.confirm("CẢNH BÁO: Bạn có chắc muốn xóa bảng này và toàn bộ thẻ bên trong?")) {
        try {
          await deleteBoard(boardId);
          setBoards(boards.filter(b => b._id !== boardId));
          setOpenMenuId(null);
        } catch (err) { alert(err.toString()); }
      }
  };

  const startEditing = (e, board) => {
      e.preventDefault(); e.stopPropagation();
      setEditingId(board._id);
      setEditTitle(board.title);
      setOpenMenuId(null); // Đóng menu sau khi chọn sửa
  };

  const saveTitle = async (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!editTitle.trim()) return;
      try {
        await updateBoard(editingId, { title: editTitle });
        setBoards(boards.map(b => b._id === editingId ? { ...b, title: editTitle } : b));
        setEditingId(null);
      } catch (err) { alert(err.toString()); }
  };

  const toggleMenu = (e, boardId) => {
      e.preventDefault(); e.stopPropagation();
      setOpenMenuId(openMenuId === boardId ? null : boardId);
  };

  const filteredBoards = boards.filter(board => 
    board.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full transition-colors duration-200">
      <PageHeader title="Không gian làm việc" showSearch={false} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* --- SEARCH BAR --- */}
          <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm dự án..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-sm text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 outline-none transition-all shadow-sm backdrop-blur-sm"
                />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/20 p-3 rounded-lg border border-red-500/30">{error}</p>}
          
          {loading ? (
            <div className="flex justify-center py-12"><Loader className="w-8 h-8 text-blue-400 animate-spin" /></div>
          ) : (
            // GRID LAYOUT: 2 cột mobile, 3 cột tablet, 4 cột desktop
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              
              {/* --- 1. CARD TẠO MỚI (Luôn nằm đầu) --- */}
              <div className={`relative group flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all duration-200 h-32 md:h-40
                  ${isCreating 
                    ? 'border-blue-400 glass-effect' 
                    : 'border-white/30 hover:border-blue-400 hover:bg-white/10 cursor-pointer'
                  }`}
              >
                  {isCreating ? (
                      <form onSubmit={handleCreateBoard} className="w-full h-full flex flex-col justify-center animate-in fade-in zoom-in duration-200">
                          <input
                            type="text"
                            placeholder="Nhập tên..."
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                            autoFocus
                            className="w-full px-3 py-2 mb-2 text-sm border-b-2 border-blue-400 bg-transparent text-white focus:outline-none placeholder-white/70 text-center"
                          />
                          <div className="flex justify-center gap-2 mt-1">
                              <button type="button" onClick={() => setIsCreating(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white/70">
                                <X className="w-4 h-4" />
                              </button>
                              <button type="submit" disabled={!newBoardTitle} className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50">
                                <Check className="w-4 h-4" />
                              </button>
                          </div>
                      </form>
                  ) : (
                      <button onClick={() => setIsCreating(true)} className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/70 group-hover:text-blue-300">
                          <div className="p-2 rounded-full bg-white/10 group-hover:bg-blue-500/20 transition-colors">
                            <Plus className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-medium">Tạo bảng mới</span>
                      </button>
                  )}
              </div>

              {/* --- 2. DANH SÁCH BẢNG --- */}
              {filteredBoards.map((board) => (
                  <div key={board._id} className="relative group h-32 md:h-40">
                    {editingId === board._id ? (
                        // Form Sửa Nhanh
                        <div className="absolute inset-0 p-4 glass-effect border-2 border-blue-400 rounded-xl shadow-xl z-10 flex flex-col justify-center">
                            <input 
                                type="text" 
                                value={editTitle} 
                                onChange={(e) => setEditTitle(e.target.value)} 
                                className="w-full p-2 text-sm border-b border-white/20 bg-transparent text-white focus:outline-none mb-3 font-semibold placeholder-white/70" 
                                autoFocus 
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={(e) => { e.preventDefault(); setEditingId(null); }} className="px-3 py-1.5 text-xs font-medium text-white/80 bg-white/10 rounded hover:bg-white/20">Hủy</button>
                                <button onClick={saveTitle} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm">Lưu</button>
                            </div>
                        </div>
                    ) : (
                        // Card Hiển Thị
                        <Link 
                            to={`/board/${board._id}`} 
                            className="block h-full glass-effect rounded-xl shadow-sm hover:shadow-md border border-white/10 hover:border-white/20 transition-all duration-200 overflow-hidden relative hover:bg-white/20"
                        >
                            {/* Dải màu trang trí ngẫu nhiên hoặc cố định */}
                            <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-80"></div>

                            <div className="p-4 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-base font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors">
                                        {board.title}
                                    </h3>
                                    
                                    {/* Menu Button */}
                                    <button 
                                        onClick={(e) => toggleMenu(e, board._id)}
                                        className="p-1 -mr-2 -mt-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mt-auto flex items-center gap-3 text-xs text-white/70">
                                    <div className="flex items-center gap-1">
                                        <Layout className="w-3.5 h-3.5" />
                                        <span>{board.lists?.length || 0} list</span>
                                    </div>
                                    {/* Giả lập ngày tạo nếu backend chưa có */}
                                    <div className="flex items-center gap-1">
                                        <CalendarClock className="w-3.5 h-3.5" />
                                        <span>Gần đây</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Dropdown Menu - Tuyệt đối so với Card cha */}
                    {openMenuId === board._id && (
                        <div 
                            ref={menuRef}
                            className="absolute top-8 right-2 w-32 glass-effect rounded-lg shadow-xl border border-white/20 py-1 z-20 animate-in fade-in zoom-in duration-100 origin-top-right"
                        >
                            <button 
                                onClick={(e) => startEditing(e, board)}
                                className="w-full text-left px-4 py-2 text-xs font-medium text-white hover:bg-white/10 flex items-center gap-2"
                            >
                                <Edit2 className="w-3.5 h-3.5" /> Đổi tên
                            </button>
                            <button 
                                onClick={(e) => handleDeleteBoard(e, board._id)}
                                className="w-full text-left px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 flex items-center gap-2 border-t border-white/20"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Xóa bảng
                            </button>
                        </div>
                    )}
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BoardListPage;