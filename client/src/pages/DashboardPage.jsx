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
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    upcomingDeadlines: []
  });
  
<<<<<<< HEAD
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


=======
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
>>>>>>> duchieu

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

<<<<<<< HEAD
 const statCards = [
    { title: "Total Tasks", value: stats.totalTasks, color: 'text-gray-900 dark:text-white', bg: 'bg-white dark:bg-gray-800' },
    { title: "In Progress", value: stats.inProgressTasks, color: 'text-[--color-pro-orange]', bg: 'bg-white dark:bg-gray-800' },
    { title: "Completed", value: stats.completedTasks, color: 'text-[--color-pro-green]', bg: 'bg-white dark:bg-gray-800' },
    { title: "Overdue", value: stats.overdueTasks, color: 'text-[--color-pro-pink]', bg: 'bg-white dark:bg-gray-800' },
=======
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

  const statCards = [
    { 
        title: "Tổng Task", 
        value: stats.totalTasks, 
        icon: Layout,
        color: 'text-blue-600', 
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-100 dark:border-blue-800'
    },
    { 
        title: "Đang làm", 
        value: stats.inProgressTasks, 
        icon: Activity,
        color: 'text-orange-600', 
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-100 dark:border-orange-800'
    },
    { 
        title: "Hoàn thành", 
        value: stats.completedTasks, 
        icon: CheckCircle,
        color: 'text-green-600', 
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-100 dark:border-green-800'
    },
    { 
        title: "Quá hạn", 
        value: stats.overdueTasks, 
        icon: AlertCircle,
        color: 'text-pink-600', 
        bg: 'bg-pink-50 dark:bg-pink-900/20',
        border: 'border-pink-100 dark:border-pink-800'
    },
>>>>>>> duchieu
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Tổng quan" showSearch={true} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        
<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
                <div key={stat.title} className={`p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${stat.bg}`}>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stat.title}</span>
                    <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
=======
        {/* --- WELCOME BANNER --- */}
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Chào mừng trở lại, {user?.fullName || 'bạn'}! 👋
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
                <div key={stat.title} className={`p-6 rounded-xl shadow-sm border transition-transform hover:-translate-y-1 ${stat.bg} ${stat.border}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</span>
                            <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                        </div>
                        <div className={`p-2 rounded-lg bg-white/60 dark:bg-gray-800/50 ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
>>>>>>> duchieu
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN: BOARDS --- */}
            <div className="xl:col-span-2 space-y-6">
                
                {/* Create Board Input */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tạo Bảng Mới</h3>
                    <form onSubmit={handleCreateBoard} className="flex gap-3">
                        <input
                            type="text"
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                            placeholder="Nhập tên dự án..."
                            className="flex-grow px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all outline-none"
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
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Dự án của bạn</h3>
                    {loading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>)}
                         </div>
                    ) : boards.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                            <p className="text-gray-500">Chưa có bảng nào. Hãy tạo bảng đầu tiên!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {boards.map((board) => {
                                const progress = calculateProgress(board);
                                return (
                                    <Link
                                        key={board._id}
                                        to={`/board/${board._id}`} 
                                        className="group block p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:border-indigo-300 dark:hover:border-indigo-500"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                                                {board.title}
                                            </h3>
                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mt-auto">
                                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                                <span>Tiến độ</span>
                                                <span className="font-medium">{progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
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

<<<<<<< HEAD
                {loading ? (
                    <p className="dark:text-gray-300">Đang tải...</p>
=======
            {/* --- RIGHT COLUMN: UPCOMING --- */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-semibold text-gray-800 dark:text-white">Sắp đến hạn</h2>
                </div>
                
                {stats.upcomingDeadlines.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tuyệt vời! Không có task nào gấp.</p>
                    </div>
>>>>>>> duchieu
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
                                    to={`/board/${task.boardId}`}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                                >
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center border ${isUrgent ? 'bg-red-50 text-red-600 border-red-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                        <span className="text-[10px] font-bold uppercase">{dateObj.toLocaleString('en-US', { month: 'short' })}</span>
                                        <span className="text-lg font-bold leading-none">{dateObj.getDate()}</span>
                                    </div>
                                    <div className="overflow-hidden min-w-0 flex-1">
                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 transition-colors">
                                            {task.taskTitle}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                                            trong {task.projectName}
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {diffDays <= 0 ? 'Hôm nay' : `Còn ${diffDays} ngày`}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button 
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="w-full py-2 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 font-medium transition-colors">
                        Xem tất cả lịch trình →
                     </button>
                </div>
            </div>
<<<<<<< HEAD

            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Sắp Đến Hạn (Deadline)</h2>
                
                {stats.upcomingDeadlines.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Không có task nào sắp đến hạn.</p>
                ) : (
                    <ul className="space-y-4">
                        {stats.upcomingDeadlines.map((task) => {
                            const dateObj = new Date(task.deadline);
                            const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                            const day = dateObj.getDate();

                            return (
                                <li key={task.taskId} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex flex-col items-center justify-center">
                                        <span className="text-xs font-bold">{month}</span>
                                        <span className="font-bold">{day}</span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <Link to={`/board/${task.boardId}`} className="hover:underline">
                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{task.taskTitle}</p>
                                        </Link>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Board: {task.projectName}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
=======
            <ScheduleModal 
                isOpen={isScheduleModalOpen} 
                onClose={() => setIsScheduleModalOpen(false)} 
            />
>>>>>>> duchieu
        </div>
      </div>
    </div>
  );
}


export default DashboardPage;