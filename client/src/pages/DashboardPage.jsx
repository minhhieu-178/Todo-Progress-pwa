import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// Đã xóa createBoard
import { getMyBoards, getDashboardStats } from '../services/boardApi';
import { Link } from 'react-router-dom'; 
import PageHeader from '../components/layout/PageHeader';
import ScheduleModal from '../components/board/ScheduleModal';
import { 
    Layout, CheckCircle, Clock, AlertCircle, 
    ArrowRight, Calendar, Activity 
} from 'lucide-react'; 

function DashboardPage() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // State quản lý Tab trên mobile
  const [activeTab, setActiveTab] = useState('projects'); 

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

  const statCards = [
    { 
        title: "Tổng Task", 
        value: stats.totalTasks, 
        icon: Layout,
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-[#22272b]', 
        border: 'border-blue-100 dark:border-blue-500/20' 
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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#1d2125] transition-colors duration-200">
      <PageHeader title="Tổng quan" showSearch={true} />
      
      <div className="flex-1 overflow-y-auto p-3 md:p-8"> {/* Giảm padding tổng */}
        
        {/* --- WELCOME BANNER COMPACT --- */}
        <div className="mb-4 md:mb-8 flex justify-between items-end">
            <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-[#b6c2cf]">
                    Chào, {user?.fullName?.split(' ').pop() || 'bạn'}! 👋
                </h2>
                <p className="text-xs md:text-sm text-gray-500 dark:text-[#9fadbc] mt-0.5">
                    Hôm nay bạn thế nào?
                </p>
            </div>
            {/* Ẩn ngày tháng trên mobile để gọn hơn */}
            <div className="hidden md:flex text-sm text-gray-500 dark:text-[#9fadbc] items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
        </div>

        {/* --- STAT CARDS COMPACT (Gap nhỏ, Padding nhỏ) --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-8">
            {statCards.map((stat) => (
                <div key={stat.title} className={`p-3 md:p-6 rounded-xl shadow-sm border transition-transform hover:-translate-y-1 dark:bg-[#22272b] dark:border-white/10 ${stat.bg} ${stat.border}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] md:text-sm font-medium text-gray-500 dark:text-[#9fadbc] uppercase tracking-wide">{stat.title}</span>
                            <p className={`text-xl md:text-3xl font-bold mt-0.5 md:mt-2 ${stat.color}`}>{stat.value}</p>
                        </div>

                        <div className={`p-1.5 md:p-2 rounded-lg bg-white/60 dark:bg-[#1d2125] ${stat.color}`}>
                            <stat.icon className="w-4 h-4 md:w-6 md:h-6" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* --- TAB SWITCHER COMPACT --- */}
        <div className="lg:hidden flex p-1 bg-gray-200 dark:bg-[#22272b] rounded-lg mb-4">
            <button 
                onClick={() => setActiveTab('projects')}
                className={`flex-1 py-1.5 px-3 text-xs font-bold uppercase rounded-md transition-all ${
                    activeTab === 'projects' 
                    ? 'bg-white dark:bg-[#1d2125] text-indigo-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 dark:text-[#9fadbc] hover:text-gray-700'
                }`}
            >
                Dự án
            </button>
            <button 
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-1.5 px-3 text-xs font-bold uppercase rounded-md transition-all ${
                    activeTab === 'upcoming' 
                    ? 'bg-white dark:bg-[#1d2125] text-indigo-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 dark:text-[#9fadbc] hover:text-gray-700'
                }`}
            >
                Sắp đến hạn
            </button>
        </div>

        {/* Grid Layout chính */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* --- LEFT COLUMN: BOARDS --- */}
            <div className={`xl:col-span-2 ${activeTab === 'projects' ? 'block' : 'hidden lg:block'}`}>
                
                {/* Board List Header */}
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-gray-800 dark:text-[#b6c2cf]">Dự án của bạn</h3>
                    <Link to="/boards" className="text-xs text-indigo-600 dark:text-blue-400 font-medium hover:underline">Xem tất cả</Link>
                </div>

                {loading ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-[#22272b] rounded-xl animate-pulse"></div>)}
                     </div>
                ) : boards.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-[#22272b] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-[#9fadbc]">Chưa có bảng nào.</p>
                    </div>
                ) : (
                    // Grid Boards: Gap nhỏ hơn
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {boards.map((board) => {
                            const progress = calculateProgress(board);
                            return (
                                <Link
                                    key={board._id}
                                    to={`/board/${board._id}`} 
                                    // Card Compact: p-3 thay vì p-5
                                    className="group block p-3 bg-white dark:bg-[#22272b] rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-white/5 transition-all hover:border-indigo-300 dark:hover:border-blue-500/50"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-[#b6c2cf] group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                            {board.title}
                                        </h3>
                                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    
                                    {/* Progress Bar Compact */}
                                    <div>
                                        <div className="flex justify-between text-[10px] text-gray-500 dark:text-[#9fadbc] mb-1">
                                            <span>Tiến độ</span>
                                            <span className="font-bold">{progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-[#1d2125] rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                                            {board.lists?.reduce((acc, l) => acc + (l.cards?.length || 0), 0) || 0} tasks
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- RIGHT COLUMN: UPCOMING --- */}
            <div className={`bg-white dark:bg-[#22272b] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 h-fit sticky top-20 ${activeTab === 'upcoming' ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-blue-400" />
                    <h2 className="text-sm font-bold text-gray-800 dark:text-[#b6c2cf]">Sắp đến hạn</h2>
                </div>
                
                {stats.upcomingDeadlines.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-xs text-gray-500 dark:text-[#9fadbc]">Tuyệt vời! Không có task nào gấp.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stats.upcomingDeadlines.map((task) => {
                            const dateObj = new Date(task.deadline);
                            const now = new Date();
                            const diffDays = Math.ceil((dateObj - now) / (1000 * 60 * 60 * 24)); 
                            const isUrgent = diffDays <= 1;

                            return (
                                <Link 
                                    key={task.taskId} 
                                    to={`/board/${task.boardId}?cardId=${task.taskId}`}
                                    // Task Compact: p-2
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2c333a] transition-colors group border border-transparent hover:border-gray-100 dark:hover:border-white/5"
                                >
                                    {/* Date Box Compact: 10x10 */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center border ${isUrgent ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-800' : 'bg-indigo-50 dark:bg-blue-900/20 text-indigo-600 dark:text-blue-400 border-indigo-100 dark:border-blue-800'}`}>
                                        <span className="text-[8px] font-bold uppercase">{dateObj.toLocaleString('en-US', { month: 'short' })}</span>
                                        <span className="text-sm font-bold leading-none">{dateObj.getDate()}</span>
                                    </div>
                                    <div className="overflow-hidden min-w-0 flex-1">
                                        <p className="font-medium text-xs md:text-sm text-gray-800 dark:text-[#b6c2cf] truncate group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors">
                                            {task.taskTitle}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${isUrgent ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                                                {diffDays <= 0 ? 'Hôm nay' : `${diffDays} ngày`}
                                            </span>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                                {task.projectName}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10 text-center">
                    <button 
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="text-xs text-indigo-600 dark:text-blue-400 font-bold hover:underline">
                        Xem lịch trình
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