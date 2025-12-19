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
        fixed bottom-4 left-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium transition-all duration-300 transform translate-y-0
        ${isOffline ? 'bg-gray-900 text-white border-l-4 border-red-500' : 'bg-green-600 text-white border-l-4 border-green-300'}
      `}
    >
      {isOffline ? (
        <>
          <div className="bg-red-500 p-1.5 rounded-full animate-pulse">
            <WifiOff className="w-4 h-4 text-white" />
          </div>
          <div>
            <p>No Internet</p>
            <p className="text-xs text-gray-400 font-normal">Offline Mode</p>
          </div>
        </>
      ) : (
        <>
          <div className="bg-green-400 p-1.5 rounded-full">
            <Wifi className="w-4 h-4 text-white" />
          </div>
          <p>Connection restored</p>
        </>
      )}
    </div>
  );
};

export default NetworkStatus;