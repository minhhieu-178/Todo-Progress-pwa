import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, ArrowRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function ScheduleModal({ isOpen, onClose }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchTasks = async () => {
                setLoading(true);
                try {
                    const { data } = await api.get('/boards/deadlines/all');
                    setTasks(data);
                } catch (error) {
                    console.error("Lỗi tải lịch trình:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchTasks();
        }
    }, [isOpen]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', { 
            weekday: 'long', day: 'numeric', month: 'numeric' 
        });
    };

    const groupedTasks = tasks.reduce((groups, task) => {
        const dateKey = new Date(task.deadline).toDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(task);
        return groups;
    }, {});

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-2xl transition-all border border-gray-200 dark:border-slate-700">
                                
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
                                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        Toàn bộ lịch trình
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {loading ? (
                                        <div className="text-center py-8 text-gray-500 dark:text-slate-400">Đang tải dữ liệu...</div>
                                    ) : tasks.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 dark:text-slate-400">Không có công việc nào sắp tới hạn.</div>
                                    ) : (
                                        <div className="space-y-6">
                                            {Object.keys(groupedTasks).map((dateKey) => (
                                                <div key={dateKey}>
                                                    <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 py-2 mb-2 border-b border-gray-100 dark:border-slate-700/50">
                                                        <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-sm uppercase">
                                                            {formatDate(dateKey)}
                                                        </h4>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        {groupedTasks[dateKey].map(task => (
                                                            <Link 
                                                                key={task.taskId}
                                                                to={`/board/${task.boardId}`}
                                                                onClick={onClose} 
                                                                className={`block p-3 rounded-xl border transition-all hover:shadow-md 
                                                                    ${task.isOverdue 
                                                                        ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-500/30' 
                                                                        : 'border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div className="overflow-hidden">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-semibold text-gray-800 dark:text-slate-200 truncate">{task.taskTitle}</span>
                                                                            {task.isOverdue && (
                                                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-1">
                                                                            Dự án: {task.boardTitle}
                                                                        </p>
                                                                    </div>
                                                                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-200 focus:outline-none dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700 transition-colors"
                                        onClick={onClose}
                                    >
                                        Đóng
                                    </button>
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default ScheduleModal;