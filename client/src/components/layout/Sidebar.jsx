import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BarChart3, Settings, LogOut, ClipboardList, X, User } from 'lucide-react'; 

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Board', icon: ClipboardList, path: '/boards' }, 
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

function Sidebar({ isOpen, onClose, isMobile = false }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            onClose();
        }
    };
    
    // Mobile Sidebar - Simplified
    if (isMobile) {
        return (
            <>
                {/* Mobile Overlay */}
                {isOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                    />
                )}

                {/* Mobile Sidebar */}
                <div className={`
                    fixed top-0 left-0 bottom-0 z-50 w-80 bg-white dark:bg-gray-900 transform transition-transform duration-300
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    flex flex-col h-full shadow-xl
                `}>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            Task Manager
                        </h1>
                        
                        <button 
                            onClick={onClose} 
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-6 space-y-2">
                        <button
                            onClick={() => handleNavigation('/')}
                            className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        >
                            <LayoutDashboard className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>Dashboard</span>
                        </button>
                        
                        <button
                            onClick={() => handleNavigation('/boards')}
                            className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        >
                            <ClipboardList className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>Board</span>
                        </button>
                        
                        <button
                            onClick={() => handleNavigation('/analytics')}
                            className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        >
                            <BarChart3 className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>Analytics</span>
                        </button>
                        
                        <button
                            onClick={() => handleNavigation('/settings')}
                            className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                        >
                            <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>Settings</span>
                        </button>
                    </nav>

                    {/* User Profile Section */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        {/* Profile Link */}
                        <button 
                            onClick={() => handleNavigation('/profile')}
                            className="w-full flex items-center gap-4 mb-4 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-3 -mx-4 rounded-lg transition-colors text-left"
                        >
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt="Avatar" 
                                    className="w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.name || user?.fullName || 'User'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email || 'user@example.com'}
                                </p>
                            </div>
                        </button>
                        
                        {/* Logout Button */}
                        <button
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium"
                        >
                            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </>
        );
    }
    
    // Desktop Sidebar
    return (
        <aside className="flex flex-col h-full glass-effect adaptive-border border-r w-64 lg:w-72">
            {/* Header */}
            <div className="p-6">
                <h1 className="text-xl font-bold adaptive-text truncate">
                    Task Manager
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex items-center px-4 py-3 adaptive-text-muted hover:adaptive-text rounded-lg group transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10 ${isActive ? 'bg-white/30 dark:bg-white/10 adaptive-text font-semibold shadow-sm' : ''}`
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="text-base truncate">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile Section */}
            <div className="p-6 adaptive-border border-t mt-auto">
                {/* Profile Link */}
                <Link 
                    to="/profile" 
                    className="flex items-center gap-4 mb-4 hover:bg-white/20 dark:hover:bg-white/10 px-4 py-3 -mx-4 rounded-lg transition-colors cursor-pointer group"
                >
                    {user?.avatar ? (
                        <img 
                            src={user.avatar} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0 ring-2 ring-white/30"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                            <User className="w-5 h-5" />
                        </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium adaptive-text truncate">
                            {user?.name || user?.fullName || 'User'}
                        </p>
                        <p className="text-sm adaptive-text-muted truncate">
                            {user?.email || 'user@example.com'}
                        </p>
                    </div>
                </Link>
                
                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group font-medium"
                >
                    <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-base">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;