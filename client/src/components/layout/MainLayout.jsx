import React from 'react';
import Sidebar from './Sidebar';
import ProtectedRoute from '../../router/ProtectedRoute'; 

function MainLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex w-screen h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-200">
        
        <Sidebar />
        
        <main className="flex-1 h-screen overflow-hidden">
          {children} 
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default MainLayout;