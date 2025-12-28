import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ProtectedRoute from '../../router/ProtectedRoute';
import NetworkStatus from '../NetworkStatus';
import { Menu } from 'lucide-react';

function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const isMobileSize = window.innerWidth < 768;
      setIsMobile(isMobileSize);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isSidebarOpen && !event.target.closest('.sidebar-container')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <ProtectedRoute>
      <div className="flex w-full h-screen transition-colors duration-200 overflow-hidden relative">
        
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="relative z-10">
            <Sidebar 
              isOpen={true} 
              onClose={() => {}} 
              isMobile={false}
            />
          </div>
        )}
        
        {/* Mobile Sidebar */}
        {isMobile && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            isMobile={true}
          />
        )}
        
        {/* Main Content Container */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0 z-10">
            
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center justify-between px-4 py-3 glass-effect shadow-sm z-20 border-b adaptive-border">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center justify-center p-2 rounded-lg adaptive-hover adaptive-text transition-colors"
                aria-label="Mở menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <h1 className="text-lg font-bold adaptive-text absolute left-1/2 transform -translate-x-1/2">
                Task Manager
              </h1>
              
              <div className="w-10"></div> {/* Spacer for alignment */}
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-hidden relative w-full h-full">
            <div className="h-full w-full">
              {children}
            </div>
          </main>
        </div>

        <NetworkStatus />
      </div>
    </ProtectedRoute>
  );
}

export default MainLayout;