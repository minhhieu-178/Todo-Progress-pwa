import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBoard } from '../services/boardApi';
import api from '../services/api'; // Import axios instance
import { Layout, Trello, Layers, ArrowRight, Loader } from 'lucide-react';

const TemplatesPage = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingId, setCreatingId] = useState(null);

    // Fetch templates từ Server khi vào trang
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const { data } = await api.get('/boards/templates');
                setTemplates(data);
            } catch (error) {
                console.error("Lỗi lấy mẫu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleCreateBoard = async (template) => {
        try {
            setCreatingId(template.id);
            const title = `${template.name} - ${new Date().toLocaleDateString('vi-VN')}`;
            // Gửi type (ví dụ 'MARKETING') lên server
            const newBoard = await createBoard(title, template.id); 
            navigate(`/board/${newBoard._id}`);
        } catch (error) {
            alert('Lỗi: ' + error);
        } finally {
            setCreatingId(null);
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader className="animate-spin w-8 h-8 mx-auto" /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thư viện Mẫu ({templates.length})</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {templates.map((template) => (
                    <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-md transition-all">
                        {/* Dùng màu từ config server hoặc mặc định */}
                        <div className="h-2 w-full rounded-t-xl" style={{ backgroundColor: template.color || '#3b82f6' }} />
                        
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">{template.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                                {template.lists.slice(0, 3).map((l, i) => (
                                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-gray-300">
                                        {l.title}
                                    </span>
                                ))}
                                {template.lists.length > 3 && <span className="text-xs px-2 py-1 text-gray-400">+{template.lists.length - 3}</span>}
                            </div>

                            <button
                                onClick={() => handleCreateBoard(template)}
                                disabled={creatingId === template.id}
                                className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 flex justify-center items-center gap-2"
                            >
                                {creatingId === template.id ? 'Đang tạo...' : 'Chọn mẫu này'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplatesPage;