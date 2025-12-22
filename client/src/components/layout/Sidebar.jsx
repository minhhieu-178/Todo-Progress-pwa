import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BarChart3, Settings, LogOut, ClipboardList } from 'lucide-react'; 

const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Board', icon: ClipboardList, path: '/boards' }, 
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

function Sidebar() {
    const { user, logout } = useAuth();
    
    const linkClasses = "flex items-center px-4 py-2 text-gray-700 dark:text-trello-text rounded-lg group transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-white/10";
    
    const activeClasses = "bg-indigo-50 dark:bg-blue-500/10 text-indigo-700 dark:text-blue-400 font-semibold"; 
    
    return (
        <div className="flex flex-col h-screen w-60 bg-white dark:bg-[#161a1d] border-r border-gray-200 dark:border-white/10 transition-colors duration-200">
    
            <div className="p-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-[#b6c2cf]">Task Manager</h1>
        
            <input className="mt-4 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#22272b] text-gray-900 dark:text-[#b6c2cf] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Search" />
        </div>

            <nav className="flex-1 px-4 py-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => 
                            `${linkClasses} ${isActive ? activeClasses : ''}`
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-gray-200 dark:border-trello-border">
                <Link to="/profile" className="flex items-center gap-3 mb-4 hover:bg-gray-100 dark:hover:bg-white/10 p-2 -mx-2 rounded-lg transition-colors cursor-pointer group">
                    {user?.avatar ? (
                        <img 
                            src={user.avatar} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full object-cover shadow-sm"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {user?.fullName?.charAt(0).toUpperCase()} 
                        </div>
                    )}                    
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-900 dark:text-trello-subtext truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-trello-text truncate">{user?.email}</p>
                    </div>
                </Link>
                
                <button onClick={logout} className="flex items-center text-red-600 hover:text-red-700 dark:text-red-400 transition-colors w-full px-2">
                    <LogOut className="w-5 h-5 mr-2" />
                    Log out
                </button>
            </div>
        </div>
    );
}

export default Sidebar;