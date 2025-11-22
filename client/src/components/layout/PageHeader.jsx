import React from 'react';
import { Search, Clock, Bell } from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom'; 

function PageHeader({ title, showSearch = true }) {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-200">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
            
            <div className="flex items-center space-x-6">
                
                {showSearch && (
                    <div className="relative hidden sm:block"> 
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-72 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                )}
                
                <div className="flex items-center space-x-4">
                    <button className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">
                        <Bell className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1">
                        <Clock className="w-4 h-4 mr-1.5" />
                        This week
                    </div>

                    <Link to="/profile">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer ring-2 ring-white dark:ring-gray-700 shadow hover:ring-indigo-300 transition-all">
                            {user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default PageHeader;