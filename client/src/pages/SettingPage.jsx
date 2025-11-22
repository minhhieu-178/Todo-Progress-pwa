import React from 'react';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { deleteAccount } from '../services/authApi';
import { Moon, Sun, Trash2 } from 'lucide-react';

function SettingPage() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Xử lý xóa tài khoản
  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "CẢNH BÁO: Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!"
    );

    if (confirm) {
      try {
        await deleteAccount();
        alert("Tài khoản đã xóa thành công.");
        logout(); // Đăng xuất ngay lập tức
      } catch (err) {
        alert("Lỗi: " + err.toString());
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Cài đặt" showSearch={false} />

      <div className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Giao diện</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chuyển đổi giữa giao diện sáng và tối.
                </p>
              </div>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 transition-colors"
              >
                {theme === 'light' ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Moon className="w-6 h-6" />
                    <span className="text-sm font-medium hidden sm:inline">Chế độ tối</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Sun className="w-6 h-6" />
                    <span className="text-sm font-medium hidden sm:inline">Chế độ sáng</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-red-200 dark:border-red-900/30">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Vùng nguy hiểm</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Khi bạn xóa tài khoản, mọi dữ liệu liên quan (Bảng công việc, Thẻ task) sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </p>
            
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Xóa tài khoản vĩnh viễn
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SettingPage;