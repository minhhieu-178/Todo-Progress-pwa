import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const NetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showBackOnline) return null;

  return (
    <div 
      className={`
        fixed bottom-4 left-4 right-4 md:right-auto z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm font-medium transition-all duration-300 transform translate-y-0 max-w-sm md:max-w-md backdrop-blur-md
        ${isOffline 
          ? 'bg-red-600/95 dark:bg-red-700/95 text-white border border-red-400 dark:border-red-500' 
          : 'bg-green-600/95 dark:bg-green-700/95 text-white border border-green-400 dark:border-green-500'
        }
      `}
    >
      {isOffline ? (
        <>
          <div className="bg-white/20 p-2 rounded-full animate-pulse flex-shrink-0">
            <WifiOff className="w-5 h-5 text-white drop-shadow-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">Không có kết nối</p>
            <p className="text-xs text-white/90 font-normal truncate">Chế độ ngoại tuyến</p>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
            <Wifi className="w-5 h-5 text-white drop-shadow-lg" />
          </div>
          <p className="font-semibold text-white truncate flex-1 min-w-0">Đã khôi phục kết nối</p>
        </>
      )}
    </div>
  );
};

export default NetworkStatus;