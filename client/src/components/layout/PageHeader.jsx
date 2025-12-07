import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Search, Clock, Bell, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom'; 
import { searchUsersApi } from '../../services/searchApi';
import PublicProfileModal from '../user/PublicProfileModal';

function PageHeader({ title, showSearch = true }) {
    const { user } = useAuth();
    
    // State tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // State Modal
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const searchRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Logic tìm kiếm (Debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length >= 2) {
                console.log("Đang tìm kiếm:", searchTerm); // Debug log
                setIsSearching(true);
                setShowDropdown(true);
                
                try {
                    const results = await searchUsersApi(searchTerm);
                    console.log("Kết quả tìm kiếm:", results); // Debug log
                    setSearchResults(results);
                } catch (error) {
                    console.error("Lỗi tìm kiếm:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        setShowDropdown(false);
        setSearchTerm('');
    };

    return (
        <>
            <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-200">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
                
                <div className="flex items-center space-x-6">
                    
                    {/* THANH TÌM KIẾM */}
                    {showSearch && (
                        <div className="relative hidden sm:block w-72" ref={searchRef}> 
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm thành viên (nhập đúng dấu)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-all"
                                />
                                {isSearching && (
                                    <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-500" />
                                )}
                            </div>

                            {/* DROPDOWN KẾT QUẢ */}
                            {showDropdown && (
                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-80 overflow-y-auto z-50">
                                    {searchResults.length > 0 ? (
                                        <ul>
                                            {searchResults.map((u) => (
                                                <li 
                                                    key={u._id}
                                                    onClick={() => handleUserClick(u)}
                                                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-0"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {u.fullName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.fullName}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                                            {!isSearching && "Không tìm thấy kết quả."}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">
                            <Bell className="w-6 h-6" />
                        </button>
                        
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 hidden md:flex">
                            <Clock className="w-4 h-4 mr-1.5" />
                            This week
                        </div>

                        <Link to="/profile">
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt="Avatar" 
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer ring-2 ring-white dark:ring-gray-700 shadow hover:ring-indigo-300 transition-all"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer ring-2 ring-white dark:ring-gray-700 shadow hover:ring-indigo-300 transition-all">
                                    {user?.fullName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            <PublicProfileModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                user={selectedUser} 
            />
        </>
    );
}

export default PageHeader;