import React, { useEffect, useState } from 'react';
import { X, Activity, Clock } from 'lucide-react';
import { getBoardLogs } from '../../services/logApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

function ActivityLogSidebar({ isOpen, onClose, boardId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load logs mỗi khi mở Sidebar
  useEffect(() => {
    if (isOpen && boardId) {
      fetchLogs();
    }
  }, [isOpen, boardId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getBoardLogs(boardId);
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format thời gian hiển thị (VD: 10 phút trước hoặc 25 Th05, 14:30)
  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM, HH:mm", { locale: vi });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <>
      {/* 1. Backdrop (Lớp nền tối khi mở sidebar) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* 2. Sidebar Content */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-800 dark:text-white font-semibold text-lg">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3>Hoạt động</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body (List Logs) */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] p-4 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">Đang tải lịch sử...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">Chưa có hoạt động nào.</div>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="flex gap-3 items-start group">
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {log.userId?.avatar ? (
                    <img 
                      src={log.userId.avatar} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                      {log.userId?.fullName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {log.userId?.fullName || 'Người dùng ẩn'}
                    </span>{' '}
                    <span className="text-gray-600 dark:text-gray-300">
                      {log.content}
                    </span>
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(log.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default ActivityLogSidebar;