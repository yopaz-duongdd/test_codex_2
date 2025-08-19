import React, { useState } from 'react';
import { Key, Chrome, Play, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('http://localhost:3001');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error('Vui lòng nhập API Key');
      return;
    }

    if (!apiUrl.trim()) {
      toast.error('Vui lòng nhập API URL');
      return;
    }

    setIsLoading(true);

    try {
      // Cập nhật cấu hình API
      await apiService.updateConfig(apiUrl.trim(), apiKey.trim());
      
      // Validate API key với server
      const validation = await apiService.validateApiKey(apiKey.trim());
      
      if (validation.isValid) {
        await onLogin(apiKey.trim());
        toast.success('Đăng nhập thành công!');
      } else {
        toast.error('API Key không hợp lệ');
      }
    } catch (error) {
      toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại API Key và URL.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo và tiêu đề */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-3">
              <Chrome className="w-8 h-8 text-white" />
            </div>
            <div className="bg-green-600 p-3 rounded-full">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Chrome Recorder Manager
          </h1>
          <p className="text-gray-300 text-lg">
            Hệ thống quản lý & thực thi kịch bản test tự động
          </p>
        </div>

        {/* Form đăng nhập */}
        <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Đăng nhập</h2>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {showSettings && (
              <div>
                <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-200 mb-2">
                  API URL
                </label>
                <input
                  id="apiUrl"
                  name="apiUrl"
                  type="url"
                  required
                  className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="http://localhost:3001"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-200 mb-2">
                API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="apiKey"
                  name="apiKey"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nhập API Key của bạn"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang xác thực...
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-700 bg-opacity-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-200 mb-2">Hướng dẫn sử dụng:</h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Nhập API Key được cấp từ hệ thống Web Admin</li>
              <li>• API Key sẽ được lưu trữ an toàn trên thiết bị</li>
              <li>• Có thể đăng xuất và đổi API Key bất kỳ lúc nào</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-400 text-sm">
          Chrome Recorder Manager v1.0.0
        </div>
      </div>
    </div>
  );
};

export default LoginPage;