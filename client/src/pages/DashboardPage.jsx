import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBoards, createBoard, getDashboardStats } from '../services/boardApi';
import { Link } from 'react-router-dom'; 
import PageHeader from '../components/layout/PageHeader';
import ScheduleModal from '../components/board/ScheduleModal';
import { 
  Layout, CheckCircle, Clock, AlertCircle, 
  Plus, ArrowRight, Calendar, Activity 
} from 'lucide-react';

function DashboardPage() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // State chứa thống kê
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    upcomingDeadlines: []
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [boardsData, statsData] = await Promise.all([
          getMyBoards(),
          getDashboardStats()
        ]);
        setBoards(boardsData);
        setStats(statsData); 
        setError('');
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Xử lý tạo bảng mới
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

  // Tính toán phần trăm hoàn thành cho mỗi Board
  const calculateProgress = (board) => {
    if (!board.lists || board.lists.length === 0) return 0;
    let total = 0;
    let completed = 0;
    
    board.lists.forEach(list => {
        if (list.cards) {
            total += list.cards.length;
            completed += list.cards.filter(c => c.isCompleted).length;
        }
    });
    
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  // Cấu hình thẻ thống kê (Stat Cards) - Update màu Trello Matte
  const statCards = [
    { 
        title: "Tổng Task", 
        value: stats.totalTasks, 
        icon: Layout,
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-[#22272b]', // Nền thẻ tối màu
        border: 'border-blue-100 dark:border-blue-500/20' // Viền màu nhẹ
    },
    { 
        title: "Đang làm", 
        value: stats.inProgressTasks, 
        icon: Activity,
        color: 'text-orange-500', 
        bg: 'bg-orange-50 dark:bg-[#22272b]',
        border: 'border-orange-100 dark:border-orange-500/20'
    },
    { 
        title: "Hoàn thành", 
        value: stats.completedTasks, 
        icon: CheckCircle,
        color: 'text-green-500', 
        bg: 'bg-green-50 dark:bg-[#22272b]',
        border: 'border-green-100 dark:border-green-500/20'
    },
    { 
        title: "Quá hạn", 
        value: stats.overdueTasks, 
        icon: AlertCircle,
        color: 'text-pink-500', 
        bg: 'bg-pink-50 dark:bg-[#22272b]',
        border: 'border-pink-100 dark:border-pink-500/20'
    },
  ];

  return (
    // SỬA: Nền chính #1d2125
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#1d2125] transition-colors duration-200">
      <PageHeader title="Tổng quan" showSearch={true} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* --- WELCOME BANNER --- */}
        <div className="mb-8">
            {/* SỬA: Tiêu đề #b6c2cf */}
            <h2 className="text-2xl font-bold text-gray-800 dark:text-[#b6c2cf]">
                Chào mừng trở lại, {user?.fullName || 'bạn'}! 👋
            </h2>
            {/* SỬA: Chữ phụ #9fadbc */}
            <p className="text-gray-500 dark:text-[#9fadbc] mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
                // SỬA: Card stat nền #22272b (lớp dark:bg-[#22272b] sẽ đè lên stat.bg nếu cần)
                <div key={stat.title} className={`p-6 rounded-xl shadow-sm border transition-transform hover:-translate-y-1 dark:bg-[#22272b] dark:border-white/10 ${stat.bg} ${stat.border}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            {/* SỬA: Chữ #9fadbc */}
                            <span className="text-sm font-medium text-gray-500 dark:text-[#9fadbc]">{stat.title}</span>
                            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                        </div>
                        {/* Icon nền tối nhẹ */}
                        <div className={`p-2 rounded-lg bg-white/60 dark:bg-[#1d2125] ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN: BOARDS --- */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* Create Board Input */}
                {/* SỬA: Nền #22272b, Viền white/10 */}
                <div className="bg-white dark:bg-[#22272b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-[#b6c2cf] mb-4">Tạo Bảng Mới</h3>
                    <form onSubmit={handleCreateBoard} className="flex gap-3">
                        {/* SỬA: Input nền #1d2125 */}
                        <input
                            type="text"
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                            placeholder="Nhập tên dự án..."
                            className="flex-grow px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-gray-50 dark:bg-[#1d2125] text-gray-900 dark:text-[#b6c2cf] transition-all outline-none dark:placeholder-[#9fadbc]"
                        />
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isCreating ? '...' : <><Plus className="w-5 h-5" /> Tạo</>}
                        </button>
                    </form>
                    {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
                </div>

                {/* Board List */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-[#b6c2cf] mb-4">Dự án của bạn</h3>
                    {loading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-[#22272b] rounded-xl animate-pulse"></div>)}
                         </div>
                    ) : boards.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-[#22272b] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-[#9fadbc]">Chưa có bảng nào. Hãy tạo bảng đầu tiên!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {boards.map((board) => {
                                const progress = calculateProgress(board);
                                return (
                                    <Link
                                        key={board._id}
                                        to={`/board/${board._id}`} 
                                        // SỬA: Card dự án nền #22272b, viền white/5
                                        className="group block p-5 bg-white dark:bg-[#22272b] rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-white/5 transition-all hover:border-indigo-300 dark:hover:border-blue-500/50"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            {/* SỬA: Tiêu đề #b6c2cf */}
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-[#b6c2cf] group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                {board.title}
                                            </h3>
                                            {/* SỬA: Icon nền tối #1d2125 */}
                                            <div className="p-2 bg-gray-100 dark:bg-[#1d2125] rounded-full group-hover:bg-indigo-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-blue-400" />
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mt-auto">
                                            <div className="flex justify-between text-xs text-gray-500 dark:text-[#9fadbc] mb-1.5">
                                                <span>Tiến độ</span>
                                                <span className="font-medium">{progress}%</span>
                                            </div>
                                            {/* SỬA: Thanh progress nền tối #1d2125 */}
                                            <div className="w-full h-2 bg-gray-100 dark:bg-[#1d2125] rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1">
                                                {board.lists?.reduce((acc, l) => acc + (l.cards?.length || 0), 0) || 0} tasks
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* --- RIGHT COLUMN: UPCOMING --- */}
            {/* SỬA: Nền #22272b, Viền white/10 */}
            <div className="bg-white dark:bg-[#22272b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 h-fit sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-indigo-600 dark:text-blue-400" />
                    <h2 className="font-semibold text-gray-800 dark:text-[#b6c2cf]">Sắp đến hạn</h2>
                </div>
                
                {stats.upcomingDeadlines.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-500 dark:text-[#9fadbc]">Tuyệt vời! Không có task nào gấp.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {stats.upcomingDeadlines.map((task) => {
                            const dateObj = new Date(task.deadline);
                            const now = new Date();
                            const diffTime = dateObj - now;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                            
                            const isUrgent = diffDays <= 1;

                            return (
                                <Link 
                                    key={task.taskId} 
                                    to={`/board/${task.boardId}?cardId=${task.taskId}`}
                                    // SỬA: Hover nền #2c333a
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c333a] transition-colors group"
                                >
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center border ${isUrgent ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-800' : 'bg-indigo-50 dark:bg-blue-900/20 text-indigo-600 dark:text-blue-400 border-indigo-100 dark:border-blue-800'}`}>
                                        <span className="text-[10px] font-bold uppercase">{dateObj.toLocaleString('en-US', { month: 'short' })}</span>
                                        <span className="text-lg font-bold leading-none">{dateObj.getDate()}</span>
                                    </div>
                                    <div className="overflow-hidden min-w-0 flex-1">
                                        {/* SỬA: Title #b6c2cf */}
                                        <p className="font-medium text-sm text-gray-800 dark:text-[#b6c2cf] truncate group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors">
                                            {task.taskTitle}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-[#9fadbc] truncate mb-1">
                                            trong {task.projectName}
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${isUrgent ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                                            {diffDays <= 0 ? 'Hôm nay' : `Còn ${diffDays} ngày`}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                    <button 
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="w-full py-2 text-sm text-gray-500 hover:text-indigo-600 dark:text-[#9fadbc] dark:hover:text-blue-400 font-medium transition-colors">
                        Xem tất cả lịch trình →
                     </button>
                </div>
            </div>
        </div>
      </div>
      
      <ScheduleModal 
          isOpen={isScheduleModalOpen} 
          onClose={() => setIsScheduleModalOpen(false)} 
      />
    </div>
  );
}

export default DashboardPage;