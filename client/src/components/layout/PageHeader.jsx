<<<<<<< Updated upstream
import React, { useState, useEffect, useRef, Fragment, useCallback } from 'react'; 
import { Search, Clock, Bell, Loader, CheckCheck, MessageSquare, Calendar, UserPlus, Trash2 } from 'lucide-react'; 
=======
import React, { useState, useEffect, useRef } from 'react'; 
import { Search, Bell, Loader, CheckCheck, MessageSquare, Calendar, UserPlus, Trash2, X } from 'lucide-react'; 
>>>>>>> Stashed changes
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { searchUsersApi } from '../../services/searchApi';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationApi'; 
import PublicProfileModal from '../user/PublicProfileModal';
import { useSocket } from '../../context/SocketContext'; 

function PageHeader({ title, showSearch = true }) {
    const { user } = useAuth();
    const navigate = useNavigate();
<<<<<<< Updated upstream
    
    const socket = useSocket(); 
=======
    const { socket } = useSocket();
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream

        socket.on('NEW_NOTIFICATION', (newNoti) => {
            console.log("Đã nhận thông báo mới từ Socket:", newNoti); 

            setNotifications((prevNotifications) => [newNoti, ...prevNotifications]);
            setUnreadCount((prevCount) => prevCount + 1);
        });

        return () => socket.off('NEW_NOTIFICATION');
=======
        const handleNewNotification = (newNoti) => {
            setNotifications((prev) => [newNoti, ...prev]);
            setUnreadCount((prev) => prev + 1);
        };
        socket.on('NEW_NOTIFICATION', handleNewNotification);
        return () => socket.off('NEW_NOTIFICATION', handleNewNotification);
>>>>>>> Stashed changes
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
        setShowMobileSearch(false);
    };

    const handleNotificationClick = async (noti) => {
        try {
            if (!noti.read) {
                await markNotificationRead(noti._id);
<<<<<<< Updated upstream
                // Cập nhật state cục bộ để giao diện phản hồi ngay
                const newNotis = notifications.map(n => 
                    n._id === noti._id ? { ...n, read: true } : n
                );
                setNotifications(newNotis);
=======
                setNotifications(prev => prev.map(n => n._id === noti._id ? { ...n, read: true } : n));
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        {/* SỬA: Nền Header #1d2125, Viền mờ white/10 */}
        <header className="flex items-center justify-between p-6 bg-white dark:bg-[#1d2125] shadow-sm border-b border-gray-100 dark:border-white/10 sticky top-0 z-10 transition-colors duration-200">
            {/* SỬA: Màu tiêu đề #b6c2cf */}
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#b6c2cf]">{title}</h1>
=======
        {/* HEADER CONTAINER: Fixed height h-14 (56px) mobile, h-16 (64px) desktop */}
        <header className="flex items-center justify-between px-4 h-14 md:h-16 bg-white dark:bg-[#161a1d] shadow-sm border-b border-gray-100 dark:border-white/10 sticky top-0 z-20 transition-colors duration-200">
>>>>>>> Stashed changes
            
            {/* Title: Text-lg cho gọn */}
            <h1 className={`text-lg md:text-xl font-bold text-gray-900 dark:text-[#b6c2cf] truncate max-w-[50%] ${showMobileSearch ? 'hidden md:block' : 'block'}`}>
                {title}
            </h1>
            
            {/* Mobile Search Input (Expand) */}
            {showMobileSearch && showSearch && (
                <div className="flex-1 mx-2 md:hidden relative animate-in fade-in zoom-in duration-200" ref={searchRef}>
                     <input
                        type="text"
                        autoFocus
                        placeholder="Tìm thành viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        // Input gọn hơn: py-1.5
                        className="w-full pl-3 pr-8 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-[#22272b] text-gray-900 dark:text-[#b6c2cf] outline-none"
                    />
                    <button onClick={() => setShowMobileSearch(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                        <X className="w-4 h-4" />
                    </button>
                    {/* Dropdown Mobile Results */}
                    {showDropdown && searchResults.length > 0 && (
                         <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#22272b] rounded-lg shadow-lg border border-gray-200 dark:border-white/10 max-h-60 overflow-y-auto z-50">
                            <ul>
                                {searchResults.map((u) => (
                                    <li key={u._id} onClick={() => handleUserClick(u)} className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-3 active:bg-gray-100">
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

            <div className="flex items-center space-x-2 md:space-x-4">
                
                {/* Desktop Search: Width nhỏ hơn w-64 */}
                {showSearch && (
                    <div className="relative hidden md:block w-64" ref={searchRef}> 
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#9fadbc]" />
                            {/* SỬA: Nền input tối #22272b */}
                            <input
                                type="text"
                                placeholder="Tìm thành viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                                // Input gọn hơn: py-1.5
                                className="w-full pl-9 pr-8 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-indigo-500 bg-white dark:bg-[#22272b] text-gray-900 dark:text-[#b6c2cf] outline-none transition-all"
                            />
                            {isSearching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-indigo-500" />}
                        </div>
                        {/* Dropdown Desktop */}
                        {showDropdown && (
                            // SỬA: Nền dropdown kết quả tìm kiếm #22272b
                            <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#22272b] rounded-lg shadow-lg border border-gray-200 dark:border-white/10 max-h-80 overflow-y-auto z-50">
                                {searchResults.length > 0 ? (
                                    <ul>
                                        {searchResults.map((u) => (
<<<<<<< Updated upstream
                                            <li 
                                                key={u._id}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleUserClick(u);
                                                }}
                                                // SỬA: Hover item #2c333a
                                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2c333a] cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {u.fullName ? u.fullName.charAt(0).toUpperCase() : '?'}
=======
                                            <li key={u._id} onMouseDown={(e) => { e.preventDefault(); handleUserClick(u); }}
                                                className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#2c333a] cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                                                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {u.fullName?.charAt(0)}
>>>>>>> Stashed changes
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-[#b6c2cf] truncate">{u.fullName}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <div className="p-3 text-xs text-center text-gray-500">Không tìm thấy kết quả.</div>}
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile Search Icon */}
                {showSearch && !showMobileSearch && (
                    <button onClick={() => setShowMobileSearch(true)} className="md:hidden p-2 text-gray-500 dark:text-[#9fadbc] active:bg-gray-100 rounded-full">
                        <Search className="w-5 h-5" />
                    </button>
                )}
                
                {/* Notification & Avatar */}
                <div className="flex items-center space-x-3">
                    <div className="relative" ref={notiRef}>
<<<<<<< Updated upstream
                        <button 
                            onClick={() => setShowNotiDropdown(!showNotiDropdown)}
                            className="relative text-gray-500 dark:text-[#9fadbc] hover:text-indigo-600 dark:hover:text-[#b6c2cf] transition-colors p-1"
                        >
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#1d2125] animate-pulse" />
                            )}
=======
                        <button onClick={() => setShowNotiDropdown(!showNotiDropdown)} className="relative text-gray-500 dark:text-[#9fadbc] hover:text-indigo-600 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <Bell className="w-5 h-5 md:w-5 md:h-5" />
                            {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#161a1d]" />}
>>>>>>> Stashed changes
                        </button>
                        
                        {/* Notification Dropdown */}
                        {showNotiDropdown && (
<<<<<<< Updated upstream
                            // SỬA: Nền dropdown thông báo #22272b
                            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#22272b] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-50">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#1d2125]">
                                    <h3 className="font-semibold text-gray-900 dark:text-[#b6c2cf]">Thông báo</h3>
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
                                        <div className="p-8 text-center text-gray-500 dark:text-[#9fadbc]">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">Bạn chưa có thông báo nào.</p>
                                        </div>
                                    ) : (
                                        notifications.map(noti => (
                                            <div 
                                                key={noti._id} 
                                                onClick={() => handleNotificationClick(noti)}
                                                // SỬA: Hover thông báo #2c333a
                                                className={`p-4 hover:bg-gray-50 dark:hover:bg-[#2c333a] cursor-pointer flex gap-3 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${!noti.read ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}
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
                                                    <p className={`text-sm ${!noti.read ? 'text-gray-900 dark:text-[#b6c2cf] font-semibold' : 'text-gray-600 dark:text-[#9fadbc]'}`}>
                                                        {noti.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                                        {formatTime(noti.createdAt)}
                                                        {!noti.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block ml-1"></span>}
                                                    </p>
                                                </div>
=======
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#22272b] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 fixed md:absolute top-14 md:top-auto right-2 md:right-0 left-2 md:left-auto">
                                <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#161a1d]">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-[#b6c2cf]">Thông báo</h3>
                                    {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-[10px] font-medium text-indigo-600 flex items-center gap-1 uppercase tracking-wide"><CheckCheck className="w-3 h-3" /> Đọc hết</button>}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? <div className="p-6 text-center text-xs text-gray-500">Chưa có thông báo.</div> : notifications.map(noti => (
                                        <div key={noti._id} onClick={() => handleNotificationClick(noti)} className={`p-3 hover:bg-gray-50 dark:hover:bg-[#2c333a] cursor-pointer flex gap-3 border-b border-gray-50 dark:border-gray-700/50 ${!noti.read ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}>
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 ${['DELETED_FROM_BOARD', 'REMOVE_MEMBER_FROM_CARD'].includes(noti.type) ? 'bg-red-500' : 'bg-indigo-500'}`}>{getNotificationIcon(noti.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs md:text-sm break-words ${!noti.read ? 'font-semibold text-gray-900 dark:text-[#b6c2cf]' : 'text-gray-600 dark:text-[#9fadbc]'}`}>{noti.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">{formatTime(noti.createdAt)}</p>
>>>>>>> Stashed changes
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/profile">
                        {user?.avatar ? (
<<<<<<< Updated upstream
                            <img 
                                src={user.avatar} 
                                alt="Avatar" 
                                // SỬA: Ring avatar tối màu
                                className="w-10 h-10 rounded-full object-cover cursor-pointer ring-2 ring-white dark:ring-[#22272b] shadow hover:ring-indigo-300 transition-all"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer ring-2 ring-white dark:ring-[#22272b] shadow hover:ring-indigo-300 transition-all">
=======
                            // Avatar nhỏ gọn: w-8 h-8
                            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-[#161a1d] shadow-sm hover:ring-indigo-200 transition-all" />
                        ) : (
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold ring-2 ring-white dark:ring-[#161a1d] shadow-sm">
>>>>>>> Stashed changes
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