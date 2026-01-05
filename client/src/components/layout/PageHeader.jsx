import React, { useState, useEffect, useRef } from 'react'; 
import { Search, Bell, Loader, CheckCheck, MessageSquare, Calendar, UserPlus, Trash2, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { searchUsersApi } from '../../services/searchApi';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationApi'; 
import PublicProfileModal from '../user/PublicProfileModal';
import { useSocket } from '../../context/SocketContext'; 

function PageHeader({ title, showSearch = true }) {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const socket = useSocket();

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // State cho Mobile Search
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [notifications, setNotifications] = useState([]);
    const [showNotiDropdown, setShowNotiDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const searchRef = useRef(null);
    const notiRef = useRef(null); 

    const fetchNotis = async () => {
        try {
            const data = await getNotifications();
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            }
        } catch (err) {
            console.error("Lỗi tải thông báo:", err);
        }
    };

    useEffect(() => { fetchNotis(); }, []);

    useEffect(() => {
        if (!socket) return;
        const handleNewNotification = (newNoti) => {
            setNotifications((prev) => [newNoti, ...prev]);
            setUnreadCount((prev) => prev + 1);
        };
        socket.on('NEW_NOTIFICATION', handleNewNotification);
        return () => socket.off('NEW_NOTIFICATION', handleNewNotification);
    }, [socket]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) setShowDropdown(false);
            if (notiRef.current && !notiRef.current.contains(event.target)) setShowNotiDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length >= 2) {
                setIsSearching(true);
                setShowDropdown(true);
                try {
                    const results = await searchUsersApi(searchTerm);
                    setSearchResults(results);
                } catch (error) { console.error(error); } 
                finally { setIsSearching(false); }
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
        setShowMobileSearch(false); // Đóng search mobile khi chọn
    };

    const handleNotificationClick = async (noti) => {
        try {
            if (!noti.read) {
                await markNotificationRead(noti._id);
                setNotifications(prev => prev.map(n => n._id === noti._id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setShowNotiDropdown(false);
            if (noti.targetUrl) navigate(noti.targetUrl);
        } catch (error) { console.error(error); }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) { console.error(error); }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((new Date() - date) / 1000);
        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'COMMENT': case 'REPLY_COMMENT': return <MessageSquare className="w-4 h-4" />;
            case 'DEADLINE': case 'DEADLINE_APPROACHING': return <Calendar className="w-4 h-4" />;
            case 'ASSIGN': case 'ADDED_TO_BOARD': case 'ADDED_TO_CARD': return <UserPlus className="w-4 h-4" />;
            case 'DELETED_FROM_BOARD': case 'REMOVE_MEMBER_FROM_CARD': return <Trash2 className="w-4 h-4" />;
            default: return <Bell className="w-4 h-4" />; 
        }
    };

    return (
    <>
        <header className="flex items-center justify-between px-0 py-6 glass-effect shadow-sm sticky top-0 z-10 transition-all duration-150">
            
            {/* Page Title - Hidden on mobile when search is active */}
            <h1 className={`text-xl md:text-3xl font-bold adaptive-text px-4 md:px-8 min-w-0 flex-shrink ${showMobileSearch ? 'hidden md:block' : 'block'}`}>
                {title}
            </h1>
            
            {/* Mobile Search Bar - Expandable */}
            {showMobileSearch && showSearch && (
                <div className="flex-1 gap-3 md:hidden relative animate-fadeIn mx-2" ref={searchRef}>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 dark:text-gray-300" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Tìm thành viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all shadow-sm"
                        />
                        <button 
                            onClick={() => {
                                setShowMobileSearch(false);
                                setSearchTerm('');
                                setShowDropdown(false);
                            }} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white touch-target"
                            aria-label="Đóng tìm kiếm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {isSearching && (
                            <div className="absolute right-11 top-1/2 -translate-y-1/2">
                                <Loader className="w-5 h-5 animate-spin text-blue-500" />
                            </div>
                        )}
                     </div>
                     
                    {/* Mobile Search Dropdown */}
                    {showDropdown && (
                         <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#22272b] rounded-lg shadow-xl border border-gray-200 dark:border-white/10 max-h-60 overflow-y-auto custom-scrollbar z-50">
                            {searchResults.length > 0 ? (
                                <ul>
                                    {searchResults.map((u) => (
                                        <li 
                                            key={u._id} 
                                            onClick={() => handleUserClick(u)} 
                                            className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0 flex items-center responsive-gap hover:bg-gray-50 dark:hover:bg-[#2c333a] cursor-pointer transition-colors touch-target"
                                        >
                                             <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center responsive-text-sm font-bold flex-shrink-0">
                                                {u.fullName?.charAt(0) || '?'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="responsive-text-sm font-medium dark:text-[#b6c2cf] truncate">{u.fullName}</p>
                                                <p className="text-xs text-gray-500 dark:text-[#9fadbc] truncate">{u.email}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 responsive-text-sm text-center text-gray-500 dark:text-gray-400">
                                    {isSearching ? 'Đang tìm kiếm...' : 'Không tìm thấy kết quả'}
                                </div>
                            )}
                         </div>
                    )}
                </div>
            )}

            {/* Right Side Controls */}
            <div className="flex items-center gap-3 md:gap-6 px-4 md:px-8 flex-shrink-0">
                
                {/* Desktop Search */}
                {showSearch && (
                    <div className="relative hidden md:block w-64 lg:w-80" ref={searchRef}> 
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 dark:text-gray-300" />
                            <input
                                type="text"
                                placeholder="Tìm thành viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                                className="w-full pl-11 pr-11 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none transition-all shadow-sm"
                            />
                            {isSearching && (
                                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-blue-500" />
                            )}
                        </div>
                        
                        {/* Desktop Search Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full mt-2 w-full glass-effect rounded-lg shadow-xl adaptive-border border max-h-80 overflow-y-auto custom-scrollbar z-50">
                                {searchResults.length > 0 ? (
                                    <ul>
                                        {searchResults.map((u) => (
                                            <li 
                                                key={u._id} 
                                                onMouseDown={(e) => { e.preventDefault(); handleUserClick(u); }}
                                                className="px-4 py-3 adaptive-hover cursor-pointer flex items-center gap-3 transition-colors adaptive-border border-b last:border-0"
                                            >
                                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                    {u.fullName?.charAt(0) || '?'}
                                                </div>
                                                <div className="overflow-hidden min-w-0 flex-1">
                                                    <p className="text-sm font-medium adaptive-text truncate">{u.fullName}</p>
                                                    <p className="text-xs adaptive-text-muted truncate">{u.email}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-4 text-sm text-center adaptive-text-muted">
                                        {isSearching ? 'Đang tìm kiếm...' : 'Không tìm thấy kết quả'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile Search Toggle Button */}
                {showSearch && !showMobileSearch && (
                    <button 
                        onClick={() => setShowMobileSearch(true)} 
                        className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg adaptive-hover transition-colors"
                        aria-label="Mở tìm kiếm"
                    >
                        <Search className="w-6 h-6" />
                    </button>
                )}

                {/* Theme Toggle Button */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg adaptive-hover transition-colors"
                    aria-label={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
                >
                    {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                </button>
                
                {/* Notifications */}
                <div className="relative" ref={notiRef}>
                    <button 
                        onClick={() => setShowNotiDropdown(!showNotiDropdown)} 
                        className="relative touch-target p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg adaptive-hover transition-colors"
                        aria-label="Thông báo"
                    >
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    
                    {/* Notification Dropdown - Responsive */}
                    {showNotiDropdown && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#22272b] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50 
                                       fixed md:absolute top-16 md:top-auto right-4 md:right-0 left-4 md:left-auto max-w-[calc(100vw-2rem)] md:max-w-none">
                            
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-[#1d2125]">
                                <h3 className="text-base font-bold text-gray-900 dark:text-[#b6c2cf]">Thông báo</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllRead} 
                                        className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:underline touch-target"
                                    >
                                        <CheckCheck className="w-4 h-4" /> 
                                        Đọc tất cả
                                    </button>
                                )}
                            </div>
                            
                            {/* Notifications List */}
                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-white dark:bg-[#22272b]">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-[#1d2125] rounded-full flex items-center justify-center">
                                            <Bell className="w-6 h-6 text-gray-400 dark:text-[#9fadbc]" />
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-[#9fadbc]">Chưa có thông báo nào</p>
                                    </div>
                                ) : (
                                    notifications.map(noti => (
                                        <div 
                                            key={noti._id} 
                                            onClick={() => handleNotificationClick(noti)} 
                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-[#1d2125] cursor-pointer flex gap-3 border-b border-gray-100 dark:border-white/10 last:border-0 transition-colors touch-target ${
                                                !noti.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                        >
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                                                ['DELETED_FROM_BOARD', 'REMOVE_MEMBER_FROM_CARD'].includes(noti.type) ? 'bg-red-500 dark:bg-red-600' : 'bg-blue-500 dark:bg-blue-600'
                                            }`}>
                                                {getNotificationIcon(noti.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm break-words leading-relaxed ${
                                                    !noti.read ? 'font-semibold text-gray-900 dark:text-[#b6c2cf]' : 'text-gray-600 dark:text-[#9fadbc]'
                                                }`}>
                                                    {noti.message}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-[#9fadbc] mt-1">
                                                    {formatTime(noti.createdAt)}
                                                </p>
                                            </div>
                                            {!noti.read && (
                                                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                <Link to="/profile" className="flex-shrink-0">
                    {user?.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt="Avatar" 
                                className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover ring-2 ring-white/20 shadow-sm hover:ring-blue-300 transition-all duration-200 hover:scale-105" 
                            />
                        ) : (
                            <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white/20 shadow-sm hover:ring-blue-300 transition-all duration-200 hover:scale-105 text-sm">
                                {user?.fullName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                    </Link>
            </div>
        </header>
        
        {/* Modals */}
        {selectedUser && (
            <PublicProfileModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                user={selectedUser} 
            />
        )}
    </>
    );
}
export default PageHeader;