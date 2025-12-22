import React, { useState } from 'react';
import Sidebar from './Sidebar';
<<<<<<< Updated upstream
import ProtectedRoute from '../../router/ProtectedRoute'; 
import NetworkStatus from '../NetworkStatus';
=======
import ProtectedRoute from '../../router/ProtectedRoute';
import { Menu } from 'lucide-react';
>>>>>>> Stashed changes

function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex w-screen h-screen bg-gray-50 dark:bg-[#1d2125] dark:text-[#9fadbc] transition-colors duration-200">
        
        <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
        />
        
<<<<<<< Updated upstream
        <main className="flex-1 h-screen overflow-hidden relative">
          {children} 
        </main>
        <NetworkStatus />
=======
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
            
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1d2125] border-b border-gray-200 dark:border-white/10 shadow-sm z-20">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-[#9fadbc]"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <span className="font-bold text-lg text-gray-800 dark:text-[#b6c2cf]">Task Manager</span>
                <div className="w-8"></div>
            </div>

            <main className="flex-1 overflow-hidden relative w-full h-full">
                {children} 
            </main>
        </div>

>>>>>>> Stashed changes
      </div>
    </ProtectedRoute>
  );
}

export default MainLayout;