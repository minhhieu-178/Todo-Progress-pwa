import React, { useState, useEffect, useRef, Fragment, useCallback } from 'react'; 
import { Search, Clock, Bell, Loader, CheckCheck, MessageSquare, Calendar, UserPlus, Trash2 } from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { searchUsersApi } from '../../services/searchApi';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationApi'; 
import PublicProfileModal from '../user/PublicProfileModal';
import { useSocket } from '../../context/SocketContext'; 

function PageHeader({ title, showSearch = true }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const socket = useSocket(); 

    // --- STATE TÌM KIẾM ---
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // --- STATE MODAL PROFILE ---
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- STATE THÔNG BÁO ---
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

    useEffect(() => {
        fetchNotis(); 
    }, []);


    useEffect(() => {
        if (!socket) return;

        socket.on('NEW_NOTIFICATION', (newNoti) => {
            console.log("Đã nhận thông báo mới từ Socket:", newNoti); 

            setNotifications((prevNotifications) => [newNoti, ...prevNotifications]);
            setUnreadCount((prevCount) => prevCount + 1);
        });

        return () => socket.off('NEW_NOTIFICATION');
    }, [socket]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (notiRef.current && !notiRef.current.contains(event.target)) {
                setShowNotiDropdown(false);
            }
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

    const handleNotificationClick = async (noti) => {
        try {
            if (!noti.read) {
                await markNotificationRead(noti._id);
                // Cập nhật state cục bộ để giao diện phản hồi ngay
                const newNotis = notifications.map(n => 
                    n._id === noti._id ? { ...n, read: true } : n
                );
                setNotifications(newNotis);
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            
            setShowNotiDropdown(false);

            if (noti.targetUrl) {
                navigate(noti.targetUrl);
            }
        } catch (error) {
            console.error("Lỗi xử lý thông báo:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            const newNotis = notifications.map(n => ({ ...n, read: true }));
            setNotifications(newNotis);
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'COMMENT': 
            case 'REPLY_COMMENT':
                return <MessageSquare className="w-4 h-4" />;
            case 'DEADLINE': 
            case 'DEADLINE_APPROACHING':
                return <Calendar className="w-4 h-4" />;
            case 'ASSIGN':
            case 'ADDED_TO_BOARD': 
            case 'ADDED_TO_CARD':
                return <UserPlus className="w-4 h-4" />;
            case 'DELETED_FROM_BOARD': 
            case 'REMOVE_MEMBER_FROM_CARD':
                return <Trash2 className="w-4 h-4" />;
            default: 
                return <Bell className="w-4 h-4" />; 
        }
    };

    return (
        <>
            <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-200">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
                
                <div className="flex items-center space-x-6">
                    
                    {showSearch && (
                        <div className="relative hidden sm:block w-72" ref={searchRef}> 
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm thành viên (tên, email)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-all"
                                />
                                {isSearching && (
                                    <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-500" />
                                )}
                            </div>

                            {showDropdown && (
                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-80 overflow-y-auto z-50">
                                    {searchResults.length > 0 ? (
                                        <ul>
                                            {searchResults.map((u) => (
                                                <li 
                                                    key={u._id}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleUserClick(u);
                                                    }}
                                                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-0">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                {u.fullName ? u.fullName.charAt(0).toUpperCase() : '?'}
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
                        
                        <div className="relative" ref={notiRef}>
                            <button 
                                onClick={() => setShowNotiDropdown(!showNotiDropdown)}
                                className="relative text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800 animate-pulse" />
                                )}
                            </button>

                            {showNotiDropdown && (
                                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Thông báo</h3>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={handleMarkAllRead}
                                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                                            >
                                                <CheckCheck className="w-3 h-3" /> Đọc tất cả
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                <p className="text-sm">Bạn chưa có thông báo nào.</p>
                                            </div>
                                        ) : (
                                            notifications.map(noti => (
                                                <div 
                                                    key={noti._id} 
                                                    onClick={() => handleNotificationClick(noti)}
                                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex gap-3 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 ${!noti.read ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}
                                                >
                                                    <div className="mt-1">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${
                                                            ['DELETED_FROM_BOARD', 'REMOVE_MEMBER_FROM_CARD'].includes(noti.type) 
                                                                ? 'bg-red-500' 
                                                                : 'bg-gradient-to-br from-purple-500 to-indigo-500'}`}>
                                                            {getNotificationIcon(noti.type)}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1">
                                                        <p className={`text-sm ${!noti.read ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                                                            {noti.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                            {formatTime(noti.createdAt)}
                                                            {!noti.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block ml-1"></span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
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