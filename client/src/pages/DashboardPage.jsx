import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBoards, getDashboardStats } from '../services/boardApi';
import { Link } from 'react-router-dom'; 
import PageHeader from '../components/layout/PageHeader';
import ScheduleModal from '../components/board/ScheduleModal';
import { 
    Layout, CheckCircle, Clock, AlertCircle, 
    ArrowRight, Calendar, Activity, Plus, BarChart3, Clock4
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
        icon: BarChart3,
        iconClass: 'stats-icon-blue',
        valueClass: 'stats-value-blue',
        bg: 'bg-blue-50 dark:bg-[#22272b]', 
        border: 'border-blue-100 dark:border-blue-500/20' 
    },
    { 
        title: "Đang làm", 
        value: stats.inProgressTasks, 
        icon: Activity,
        iconClass: 'stats-icon-orange',
        valueClass: 'stats-value-orange',
        bg: 'bg-orange-50 dark:bg-[#22272b]',
        border: 'border-orange-100 dark:border-orange-500/20'
    },
    { 
        title: "Hoàn thành", 
        value: stats.completedTasks, 
        icon: CheckCircle,
        iconClass: 'stats-icon-green',
        valueClass: 'stats-value-green',
        bg: 'bg-green-50 dark:bg-[#22272b]',
        border: 'border-green-100 dark:border-green-500/20'
    },
    { 
        title: "Quá hạn", 
        value: stats.overdueTasks, 
        icon: Clock4,
        iconClass: 'stats-icon-pink',
        valueClass: 'stats-value-pink',
        bg: 'bg-pink-50 dark:bg-[#22272b]',
        border: 'border-pink-100 dark:border-pink-500/20'
    },
  ];

  return (
    <div className="flex flex-col h-full transition-colors duration-200">
      <PageHeader title="Tổng quan" showSearch={true} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="container w-full max-w-full px-4 md:px-8 py-4 md:py-8 max-w-7xl mx-auto">
        
          {/* Welcome Banner */}
          <div className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 md:gap-6">
              <div className="min-w-0 flex-1">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold adaptive-text mb-2 md:mb-3">
                      Chào, {user?.fullName?.split(' ').pop() || 'bạn'}! 👋
                  </h2>
                  <p className="text-base md:text-lg adaptive-text-muted">
                      Hôm nay bạn thế nào?
                  </p>
              </div>
              
              {/* Date - Hidden on mobile for cleaner look */}
              <div className="hidden sm:flex text-base adaptive-text-muted items-center gap-4 flex-shrink-0">
                  <Calendar className="w-6 h-6" />
                  <span className="whitespace-nowrap">
                    {new Date().toLocaleDateString('vi-VN', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
              </div>
          </div>

          {/* Stats Cards - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {statCards.map((stat) => (
                  <div key={stat.title} className="glass-effect p-4 md:p-6 lg:p-8 rounded-xl shadow-sm adaptive-border border transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                      {/* Header với title và icon */}
                      <div className="flex justify-between items-start mb-4">
                          <span className="text-xs md:text-sm font-medium adaptive-text-muted uppercase tracking-wide">
                            {stat.title}
                          </span>
                          <div className={stat.iconClass}>
                              <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                      </div>
                      
                      {/* Số lớn ở dưới */}
                      <div>
                          <p className={`text-2xl md:text-3xl lg:text-4xl font-bold ${stat.valueClass}`}>
                            {stat.value}
                          </p>
                      </div>
                  </div>
              ))}
          </div>

          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex p-1 glass-effect rounded-lg mb-4 adaptive-border border">
              <button 
                  onClick={() => setActiveTab('projects')}
                  className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-md transition-all ${
                      activeTab === 'projects' 
                      ? 'bg-white/20 adaptive-text shadow-sm' 
                      : 'adaptive-text-muted hover:adaptive-text adaptive-hover'
                  }`}
              >
                  DỰ ÁN
              </button>
              <button 
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-md transition-all ${
                      activeTab === 'upcoming' 
                      ? 'bg-white/20 adaptive-text shadow-sm' 
                      : 'adaptive-text-muted hover:adaptive-text adaptive-hover'
                  }`}
              >
                  SẮP ĐẾN HẠN
              </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
              
              {/* Projects Section */}
              <div className={`xl:col-span-2 ${activeTab === 'projects' ? 'block' : 'hidden lg:block'}`}>
                  
                  {/* Section Header */}
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                      <h3 className="text-base md:text-lg font-bold adaptive-text">
                        Dự án của bạn
                      </h3>
                      <Link 
                        to="/boards" 
                        className="text-sm text-blue-400 font-medium hover:text-blue-300 hover:underline transition-colors"
                      >
                        Xem tất cả
                      </Link>
                  </div>

                  {loading ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-40 glass-effect rounded-xl animate-pulse adaptive-border border" />
                          ))}
                       </div>
                  ) : error ? (
                      <div className="text-center py-8 glass-effect rounded-xl adaptive-border border">
                          <p className="text-sm text-red-600">{error}</p>
                      </div>
                  ) : boards.length === 0 ? (
                      <div className="text-center py-12 glass-effect rounded-xl border border-dashed adaptive-border">
                          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <Plus className="w-8 h-8 text-blue-600" />
                          </div>
                          <p className="text-base font-medium adaptive-text mb-2">
                            Chưa có dự án nào
                          </p>
                          <p className="text-sm adaptive-text-muted mb-4">
                            Tạo dự án đầu tiên để bắt đầu quản lý công việc
                          </p>
                          <Link 
                            to="/boards" 
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo dự án mới
                          </Link>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {boards.map((board) => {
                              const progress = calculateProgress(board);
                              const totalTasks = board.lists?.reduce((acc, l) => acc + (l.cards?.length || 0), 0) || 0;
                              
                              return (
                                  <Link
                                      key={board._id}
                                      to={`/board/${board._id}`} 
                                      className="group block p-6 glass-effect rounded-xl shadow-sm hover:shadow-lg adaptive-border border transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02]"
                                  >
                                      <div className="flex justify-between items-start mb-4">
                                          <h3 className="text-base font-bold adaptive-text group-hover:text-blue-600 transition-colors truncate pr-2">
                                              {board.title}
                                          </h3>
                                          <ArrowRight className="w-5 h-5 adaptive-text-muted group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                      </div>
                                      
                                      {/* Progress Section */}
                                      <div className="space-y-3">
                                          <div className="flex justify-between items-center">
                                              <span className="text-sm adaptive-text-muted">
                                                Tiến độ
                                              </span>
                                              <span className="text-sm font-bold adaptive-text">
                                                {progress}%
                                              </span>
                                          </div>
                                          
                                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                              <div 
                                                  className={`h-full rounded-full transition-all duration-500 ${
                                                    progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                                                  }`} 
                                                  style={{ width: `${progress}%` }}
                                              />
                                          </div>
                                          
                                          <div className="flex justify-between items-center pt-1">
                                              <span className="text-sm adaptive-text-muted">
                                                  {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
                                              </span>
                                              {board.members && board.members.length > 0 && (
                                                <span className="text-sm adaptive-text-muted">
                                                  {board.members.length} thành viên
                                                </span>
                                              )}
                                          </div>
                                      </div>
                                  </Link>
                              );
                          })}
                      </div>
                  )}
              </div>

              {/* Upcoming Deadlines Section */}
              <div className={`glass-effect p-6 rounded-xl shadow-sm adaptive-border border h-fit xl:sticky xl:top-6 ${activeTab === 'upcoming' ? 'block' : 'hidden lg:block'}`}>
                  <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <h2 className="text-lg font-bold adaptive-text">
                        Sắp đến hạn
                      </h2>
                  </div>
                  
                  {stats.upcomingDeadlines.length === 0 ? (
                      <div className="text-center py-8">
                          <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-sm font-medium adaptive-text mb-1">
                            Tuyệt vời!
                          </p>
                          <p className="text-sm adaptive-text-muted">
                            Không có task nào gấp
                          </p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {stats.upcomingDeadlines.slice(0, 5).map((task) => {
                              const dateObj = new Date(task.deadline);
                              const now = new Date();
                              const diffDays = Math.ceil((dateObj - now) / (1000 * 60 * 60 * 24)); 
                              const isUrgent = diffDays <= 1;

                              return (
                                  <Link 
                                      key={task.taskId} 
                                      to={`/board/${task.boardId}?cardId=${task.taskId}`}
                                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors group adaptive-border border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30"
                                  >
                                      {/* Date Badge */}
                                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center border ${
                                        isUrgent 
                                          ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30' 
                                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                                      }`}>
                                          <span className="text-xs font-bold uppercase leading-none">
                                            {dateObj.toLocaleString('en-US', { month: 'short' })}
                                          </span>
                                          <span className="text-base font-bold leading-none">
                                            {dateObj.getDate()}
                                          </span>
                                      </div>
                                      
                                      {/* Task Info */}
                                      <div className="overflow-hidden min-w-0 flex-1">
                                          <p className="text-sm font-medium adaptive-text truncate group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-colors">
                                              {task.taskTitle}
                                          </p>
                                          <div className="flex items-center gap-3 mt-1">
                                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                isUrgent 
                                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                                                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                              }`}>
                                                  {diffDays <= 0 ? 'Hôm nay' : `${diffDays} ngày`}
                                              </span>
                                              <p className="text-sm adaptive-text-muted truncate">
                                                  {task.projectName}
                                              </p>
                                          </div>
                                      </div>
                                  </Link>
                              );
                          })}
                          
                          {stats.upcomingDeadlines.length > 5 && (
                            <div className="text-center pt-2">
                              <p className="text-sm adaptive-text-muted">
                                +{stats.upcomingDeadlines.length - 5} task khác
                              </p>
                            </div>
                          )}
                      </div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t adaptive-border text-center">
                      <button 
                          onClick={() => setIsScheduleModalOpen(true)}
                          className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline transition-colors"
                      >
                          Xem lịch trình đầy đủ
                       </button>
                  </div>
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