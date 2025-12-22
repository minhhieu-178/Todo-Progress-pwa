import React, { useState, useEffect, useRef } from 'react'; 
import { Search, Bell, Loader, CheckCheck, MessageSquare, Calendar, UserPlus, Trash2, Menu, X } from 'lucide-react'; // Thêm icon X
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { searchUsersApi } from '../../services/searchApi';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationApi'; 
import PublicProfileModal from '../user/PublicProfileModal';
import { useSocket } from '../../context/SocketContext'; 

function PageHeader({ title, showSearch = true }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { socket } = useSocket();

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
        <header className="flex items-center justify-between px-4 py-3 md:p-6 bg-white dark:bg-[#161a1d] shadow-sm border-b border-gray-100 dark:border-white/10 sticky top-0 z-10 transition-colors duration-200">
            
            {/* Mobile: Ẩn title khi đang search để nhường chỗ */}
            <h1 className={`text-xl md:text-2xl font-semibold text-gray-900 dark:text-[#b6c2cf] ${showMobileSearch ? 'hidden md:block' : 'block'}`}>
                {title}
            </h1>
            
            {/* Mobile Search Bar Expand */}
            {showMobileSearch && showSearch && (
                <div className="flex-1 mx-2 md:hidden relative animate-in fade-in zoom-in duration-200" ref={searchRef}>
                     <input
                        type="text"
                        autoFocus
                        placeholder="Tìm thành viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-[#22272b] text-gray-900 dark:text-[#b6c2cf] outline-none"
                    />
                    <button onClick={() => setShowMobileSearch(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                        <X className="w-4 h-4" />
                    </button>
                    {/* Dropdown Mobile */}
                    {showDropdown && searchResults.length > 0 && (
                         <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#22272b] rounded-lg shadow-lg border border-gray-200 dark:border-white/10 max-h-60 overflow-y-auto z-50">
                            <ul>
                                {searchResults.map((u) => (
                                    <li key={u._id} onClick={() => handleUserClick(u)} className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {u.fullName?.charAt(0)}
                                        </div>
                                        <div><p className="text-sm font-medium dark:text-[#b6c2cf]">{u.fullName}</p></div>
                                    </li>
                                ))}
                            </ul>
                         </div>
                    )}
                </div>
            )}

            <div className="flex items-center space-x-2 md:space-x-6">
                
                {/* Desktop Search */}
                {showSearch && (
                    <div className="relative hidden md:block w-72" ref={searchRef}> 
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#9fadbc]" />
                            <input
                                type="text"
                                placeholder="Tìm thành viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500 bg-white dark:bg-[#22272b] text-gray-900 dark:text-[#b6c2cf] outline-none transition-all"
                            />
                            {isSearching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-500" />}
                        </div>
                        {/* Dropdown Desktop (Giữ nguyên logic cũ) */}
                        {showDropdown && (
                            <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#22272b] rounded-lg shadow-lg border border-gray-200 dark:border-white/10 max-h-80 overflow-y-auto z-50">
                                {searchResults.length > 0 ? (
                                    <ul>
                                        {searchResults.map((u) => (
                                            <li key={u._id} onMouseDown={(e) => { e.preventDefault(); handleUserClick(u); }}
                                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2c333a] cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {u.fullName?.charAt(0)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-[#b6c2cf] truncate">{u.fullName}</p>
                                                    <p className="text-xs text-gray-500 dark:text-[#9fadbc] truncate">{u.email}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <div className="p-4 text-sm text-center text-gray-500">Không tìm thấy kết quả.</div>}
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile Search Icon */}
                {showSearch && !showMobileSearch && (
                    <button onClick={() => setShowMobileSearch(true)} className="md:hidden p-2 text-gray-500 dark:text-[#9fadbc]">
                        <Search className="w-5 h-5" />
                    </button>
                )}
                
                {/* Notification & Avatar */}
                <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="relative" ref={notiRef}>
                        <button onClick={() => setShowNotiDropdown(!showNotiDropdown)} className="relative text-gray-500 dark:text-[#9fadbc] hover:text-indigo-600 p-1">
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#161a1d] animate-pulse" />}
                        </button>
                        {/* Notification Dropdown (Responsive Width) */}
                        {showNotiDropdown && (
                            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#22272b] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 fixed md:absolute top-16 md:top-auto right-4 md:right-0 left-4 md:left-auto">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#161a1d]">
                                    <h3 className="font-semibold text-gray-900 dark:text-[#b6c2cf]">Thông báo</h3>
                                    {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs font-medium text-indigo-600 flex items-center gap-1"><CheckCheck className="w-3 h-3" /> Đọc tất cả</button>}
                                </div>
                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? <div className="p-8 text-center text-gray-500">Chưa có thông báo.</div> : notifications.map(noti => (
                                        <div key={noti._id} onClick={() => handleNotificationClick(noti)} className={`p-4 hover:bg-gray-50 dark:hover:bg-[#2c333a] cursor-pointer flex gap-3 border-b border-gray-50 dark:border-gray-700/50 ${!noti.read ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${['DELETED_FROM_BOARD', 'REMOVE_MEMBER_FROM_CARD'].includes(noti.type) ? 'bg-red-500' : 'bg-indigo-500'}`}>{getNotificationIcon(noti.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm break-words ${!noti.read ? 'font-semibold text-gray-900 dark:text-[#b6c2cf]' : 'text-gray-600 dark:text-[#9fadbc]'}`}>{noti.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{formatTime(noti.createdAt)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/profile">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-white dark:ring-[#161a1d] shadow" />
                        ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-[#161a1d] shadow">
                                {user?.fullName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Link>
                </div>
            </div>
        </header>
        <PublicProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} />
    </>
    );
}
export default PageHeader;