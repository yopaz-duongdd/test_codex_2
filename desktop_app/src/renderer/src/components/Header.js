import React, { useState } from 'react';
import { Menu, Key, LogOut, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

const Header = ({ apiKey, onToggleSidebar, onLogout }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  
  const maskedApiKey = apiKey ? `${apiKey.substring(0, 8)}${'*'.repeat(Math.max(0, apiKey.length - 12))}${apiKey.substring(Math.max(0, apiKey.length - 4))}` : '';

  const handleLogout = async () => {
    const result = await window.electronAPI.dialog.showMessageBox({
      type: 'question',
      buttons: ['Đăng xuất', 'Hủy'],
      defaultId: 0,
      message: 'Đăng xuất',
      detail: 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?'
    });

    if (result.response === 0) {
      onLogout();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Chrome Recorder Manager
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Hệ thống quản lý và thực thi test tự động
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* API Key display */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <Key className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300 mr-2">
              {showApiKey ? apiKey : maskedApiKey}
            </span>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {showApiKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;