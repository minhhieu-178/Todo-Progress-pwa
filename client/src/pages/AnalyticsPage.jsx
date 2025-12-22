<<<<<<< Updated upstream
=======
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, Sector 
} from 'recharts';
import { Layout, CheckCircle, AlertCircle, Filter, ChevronDown, Activity, TrendingUp, Users, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { getAnalyticsData } from '../services/analyticsApi';

// --- 1. CÁC HÀM HELPER & HOOKS ---

// Hook kiểm tra kích thước màn hình
function useWindowSize() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
}

// Tooltip tùy chỉnh cho biểu đồ
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#2c333a] p-3 border border-gray-100 dark:border-white/10 rounded-xl shadow-xl z-50">
          <p className="font-semibold text-gray-800 dark:text-[#b6c2cf] mb-2 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs md:text-sm mb-1 last:mb-0">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                <span className="text-gray-600 dark:text-[#9fadbc]">{entry.name}:</span>
                <span className="font-bold dark:text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
};

// Hiệu ứng Pie Chart khi hover
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    return (
      <g>
        <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={fill} className="text-lg font-bold dark:fill-white">
            {value}
        </text>
        <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#999" className="text-[10px] font-medium uppercase tracking-wide">
            {payload.name}
        </text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 4} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 8} fill={fill} />
      </g>
    );
};

// --- 2. MAIN COMPONENT ---

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boardsList, setBoardsList] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartTab, setChartTab] = useState('status');
  
  const isDesktop = useWindowSize();

  const fetchAnalytics = async (boardId) => {
    setLoading(true);
    try {
      const res = await getAnalyticsData(boardId);
      setData(res);
      if (boardId === 'all' && res.availableBoards) setBoardsList(res.availableBoards);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(selectedBoard); }, [selectedBoard]);
  const handleBoardChange = (e) => setSelectedBoard(e.target.value);
  const onPieEnter = (_, index) => setActiveIndex(index);

  // Cấu hình kích thước biểu đồ động theo màn hình
  const chartConfig = {
    pieInner: isDesktop ? 80 : 50,
    pieOuter: isDesktop ? 110 : 70,
    barSize: isDesktop ? 40 : 16,
    chartHeight: isDesktop ? 350 : 220
  };

  if (loading && !data) return <div className="flex justify-center items-center h-full bg-gray-50 dark:bg-[#1d2125]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>;
  if (!data) return <div className="p-8 text-center text-red-500">Không thể tải dữ liệu.</div>;
  
  const { summary, taskDistribution, memberPerformance } = data;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#1d2125] transition-colors duration-200">
      <PageHeader title="Thống kê" showSearch={false} />

      <div className="flex-1 overflow-y-auto p-3 md:p-8">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6"> 
            
            {/* --- FILTER SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#22272b] p-4 md:p-5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                <div>
                    <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-[#b6c2cf]">
                        {selectedBoard === 'all' ? 'Tổng quan dự án' : summary.boardName}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[#9fadbc] mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" /> Cập nhật dữ liệu thời gian thực
                    </p>
                </div>

                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Filter className="h-4 w-4 text-indigo-500" /></div>
                    <select
                        value={selectedBoard}
                        onChange={handleBoardChange}
                        className="w-full appearance-none pl-10 pr-8 py-2 bg-gray-50 dark:bg-[#1d2125] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-[#b6c2cf] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    >
                        <option value="all">Tất cả dự án</option>
                        {boardsList.map(board => <option key={board._id} value={board._id}>{board.title}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><ChevronDown className="h-4 w-4 text-gray-400" /></div>
                </div>
            </div>

            {/* --- STAT CARDS (GRID 4x1 ALWAYS) --- */}
            <div className="grid grid-cols-4 gap-2 md:gap-6">
                <StatCard title="Tổng Task" value={summary.totalTasks} icon={Layout} color="indigo" />
                <StatCard title="Đang làm" value={summary.activeTasks} icon={Activity} color="blue" />
                <StatCard title="Hoàn thành" value={summary.completedTasks} icon={CheckCircle} color="emerald" />
                <StatCard title="Quá hạn" value={summary.overdueTasks} icon={AlertCircle} color="rose" />
            </div>

            {/* --- CHART TABS (MOBILE ONLY) --- */}
            <div className="lg:hidden flex p-1 bg-gray-200 dark:bg-[#22272b] rounded-lg mb-2">
                <button 
                    onClick={() => setChartTab('status')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                        chartTab === 'status' ? 'bg-white dark:bg-[#1d2125] text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-[#9fadbc]'
                    }`}
                >
                    <PieIcon className="w-4 h-4" /> Trạng thái
                </button>
                <button 
                    onClick={() => setChartTab('performance')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase rounded-md transition-all ${
                        chartTab === 'performance' ? 'bg-white dark:bg-[#1d2125] text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-[#9fadbc]'
                    }`}
                >
                    <BarChart3 className="w-4 h-4" /> Hiệu suất
                </button>
            </div>

            {/* --- CHARTS CONTENT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                
                {/* STATUS CHART */}
                <div className={`bg-white dark:bg-[#22272b] p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 lg:col-span-1 flex flex-col justify-between ${chartTab === 'status' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="mb-2">
                        <h3 className="font-bold text-gray-800 dark:text-[#b6c2cf] text-base">Trạng thái</h3>
                        <p className="text-xs text-gray-500 dark:text-[#9fadbc]">Tỉ lệ phân bố công việc</p>
                    </div>
                    
                    <div style={{ height: chartConfig.chartHeight }} className="w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={taskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={chartConfig.pieInner}
                                    outerRadius={chartConfig.pieOuter}
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                    paddingAngle={5}
                                >
                                    {taskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* PERFORMANCE CHART */}
                <div className={`bg-white dark:bg-[#22272b] p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 lg:col-span-2 flex flex-col justify-between ${chartTab === 'performance' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-[#b6c2cf] text-base">Hiệu suất thành viên</h3>
                            <p className="text-xs text-gray-500 dark:text-[#9fadbc]">Thống kê theo từng cá nhân</p>
                        </div>
                        {/* Legend giả lập cho đẹp trên Desktop */}
                        <div className="hidden md:flex gap-3 text-xs">
                           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đã xong</div>
                           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Đang làm</div>
                           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Quá hạn</div>
                        </div>
                    </div>
                    
                    <div style={{ height: chartConfig.chartHeight }} className="w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={memberPerformance} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={isDesktop ? 8 : 4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', opacity: 0.3 }} />
                                {!isDesktop && <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />}
                                
                                <Bar dataKey="completed" stackId="a" name="Đã xong" fill="#10b981" barSize={chartConfig.barSize} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="active" stackId="a" name="Đang làm" fill="#6366f1" barSize={chartConfig.barSize} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="overdue" stackId="a" name="Quá hạn" fill="#f43f5e" barSize={chartConfig.barSize} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- 3. SUB-COMPONENTS ---

function StatCard({ title, value, icon: Icon, color }) {
    const colorStyles = {
        indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
        emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
        rose: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20' },
        blue: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
    };
    const style = colorStyles[color] || colorStyles.indigo;

    return (
        <div className={`p-2 md:p-3 rounded-xl bg-white dark:bg-[#22272b] border ${style.border} shadow-sm flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-1">
                <div className={`p-1 md:p-1.5 rounded-lg ${style.bg} ${style.text}`}>
                    <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </div>
            </div>
            <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {value}
            </h3>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-[#9fadbc] mt-0.5 truncate leading-tight">
                {title}
            </p>
        </div>
    );
}

export default AnalyticsPage;
>>>>>>> Stashed changes
