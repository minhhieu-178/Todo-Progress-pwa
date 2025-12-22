import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Layout, CheckCircle, AlertCircle, BarChart2, Filter, ChevronDown } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { getAnalyticsData } from '../services/analyticsApi';

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boardsList, setBoardsList] = useState([]); 
  const [selectedBoard, setSelectedBoard] = useState('all');

  const fetchAnalytics = async (boardId) => {
    setLoading(true);
    try {
      const res = await getAnalyticsData(boardId);
      setData(res);
      
      // Nếu đang ở chế độ "Tất cả", cập nhật danh sách bảng cho dropdown
      if (boardId === 'all' && res.availableBoards) {
        setBoardsList(res.availableBoards);
      }
    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount hoặc selectedBoard thay đổi
  useEffect(() => {
    fetchAnalytics(selectedBoard);
  }, [selectedBoard]);

  // Xử lý khi chọn bảng
  const handleBoardChange = (e) => {
    setSelectedBoard(e.target.value);
  };

  if (loading && !data) return (
    <div className="flex justify-center items-center h-full bg-gray-50 dark:bg-[#1d2125]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!data) return <div className="p-8 text-center text-red-500">Không thể tải dữ liệu.</div>;

  const { summary, taskDistribution, memberPerformance } = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#1d2125] p-3 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 dark:text-[#b6c2cf] mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color || entry.fill }} className="text-sm">
              {entry.name}: <span className="font-bold ml-1">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#1d2125] transition-colors duration-200">
      <PageHeader title="Thống kê dự án" showSearch={false} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* --- TOOLBAR: SELECT BOARD --- */}
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-8 gap-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-[#b6c2cf]">
                    {selectedBoard === 'all' ? 'Tổng quan toàn bộ' : summary.boardName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-[#9fadbc]">
                    {selectedBoard === 'all' ? 'Số liệu tổng hợp từ tất cả các dự án' : 'Chi tiết hiệu suất của dự án này'}
                </p>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-500 dark:text-[#9fadbc]" />
                </div>
                {/* SELECT DROPDOWN - Dark Mode Style */}
                <select
                    value={selectedBoard}
                    onChange={handleBoardChange}
                    className="appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-[#22272b] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-[#b6c2cf] focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm min-w-[200px]"
                >
                    <option value="all">Tất cả dự án</option>
                    {boardsList.map(board => (
                        <option key={board._id} value={board._id}>
                            {board.title}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-[#9fadbc]" />
                </div>
            </div>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Tổng Task" value={summary.totalTasks} icon={Layout} color="blue" />
            <StatCard title="Hoàn thành" value={summary.completedTasks} icon={CheckCircle} color="green" />
            <StatCard title="Quá hạn" value={summary.overdueTasks} icon={AlertCircle} color="red" />
            <StatCard title="Số bảng" value={summary.boardsCount} icon={BarChart2} color="indigo" />
        </div>

        {/* --- CHARTS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* PIE CHART */}
            <div className="bg-white dark:bg-[#22272b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-800 dark:text-[#b6c2cf] mb-4">Trạng thái công việc</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={taskDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {taskDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-gray-600 dark:text-[#9fadbc] ml-2">{value}</span>}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* BAR CHART */}
            <div className="bg-white dark:bg-[#22272b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-800 dark:text-[#b6c2cf] mb-4">Hiệu suất thành viên</h3>
                <div className="h-72 w-full">
                    {memberPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={memberPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9fadbc' }} />
                                <YAxis stroke="#9ca3af" tick={{ fill: '#9fadbc' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                <Legend formatter={(value) => <span className="text-gray-600 dark:text-[#9fadbc] ml-2">{value}</span>}/>
                                <Bar dataKey="tasks" name="Tổng việc" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="completed" name="Đã xong" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 dark:text-[#9fadbc] text-sm italic">
                            Chưa có dữ liệu thành viên
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// Component phụ cho thẻ Stat để code gọn hơn
function StatCard({ title, value, icon: Icon, color }) {
    // Mapping màu sắc động
    const colorMap = {
        blue: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        green: { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        red: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
        indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    };
    const theme = colorMap[color];

    return (
        <div className="p-6 rounded-xl shadow-sm bg-white dark:bg-[#22272b] border border-gray-100 dark:border-white/10">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 dark:text-[#9fadbc]">{title}</p>
                    <h3 className={`text-3xl font-bold mt-2 ${theme.text}`}>{value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;