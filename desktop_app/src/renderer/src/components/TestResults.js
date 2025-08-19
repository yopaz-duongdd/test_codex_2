import React, { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Monitor,
  AlertTriangle,
  Download,
  Image
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';

const TestResults = ({ apiKey }) => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    project: '',
    screen: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadTestResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [filters, results]);

  const loadTestResults = async () => {
    try {
      setIsLoading(true);
      apiService.setApiKey(apiKey);
      
      const response = await apiService.getTestResults();
      setResults(response.data || []);
    } catch (error) {
      console.error('Error loading test results:', error);
      toast.error('Không thể tải kết quả test');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...results];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(result => 
        result.scriptName?.toLowerCase().includes(searchLower) ||
        result.projectName?.toLowerCase().includes(searchLower) ||
        result.screenName?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(result => result.status === filters.status);
    }

    // Project filter
    if (filters.project) {
      filtered = filtered.filter(result => result.projectName === filters.project);
    }

    // Screen filter
    if (filters.screen) {
      filtered = filtered.filter(result => result.screenName === filters.screen);
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(result => new Date(result.startTime) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(result => new Date(result.startTime) <= toDate);
    }

    // Sort by start time (newest first)
    filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    setFilteredResults(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewDetail = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const handleDeleteResult = async (resultId) => {
    const result = await window.electronAPI.dialog.showMessageBox({
      type: 'question',
      buttons: ['Xóa', 'Hủy'],
      defaultId: 1,
      message: 'Xóa kết quả test',
      detail: 'Bạn có chắc chắn muốn xóa kết quả test này không? Hành động này không thể hoàn tác.'
    });

    if (result.response !== 0) return;

    try {
      await apiService.deleteTestResult(resultId);
      await loadTestResults();
      toast.success('Đã xóa kết quả test');
    } catch (error) {
      console.error('Error deleting test result:', error);
      toast.error('Không thể xóa kết quả test');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'passed':
        return 'Thành công';
      case 'failed':
        return 'Thất bại';
      case 'running':
        return 'Đang chạy';
      default:
        return 'Không xác định';
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const duration = new Date(endTime) - new Date(startTime);
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}p ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const uniqueProjects = [...new Set(results.map(r => r.projectName).filter(Boolean))];
  const uniqueScreens = [...new Set(results.map(r => r.screenName).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kết quả Test
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Lịch sử và chi tiết các lần thực thi test
          </p>
        </div>

        <button
          onClick={loadTestResults}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="font-medium text-gray-900 dark:text-white">Bộ lọc kết quả</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tên kịch bản, dự án..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="passed">Thành công</option>
              <option value="failed">Thất bại</option>
              <option value="running">Đang chạy</option>
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dự án
            </label>
            <select
              value={filters.project}
              onChange={(e) => handleFilterChange('project', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>

          {/* Screen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Màn hình
            </label>
            <select
              value={filters.screen}
              onChange={(e) => handleFilterChange('screen', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              {uniqueScreens.map(screen => (
                <option key={screen} value={screen}>
                  {screen}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white">
            Danh sách kết quả ({filteredResults.length})
          </h3>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Không có kết quả test
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {results.length === 0 ? 'Chưa có kết quả test nào được tạo.' : 'Không có kết quả nào phù hợp với bộ lọc.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kịch bản
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Dự án/Màn hình
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thời lượng
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.scriptName}
                          </div>
                          {result.version && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Version {result.version}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(result.status)}
                        <span className={clsx(
                          'ml-2 text-sm font-medium',
                          result.status === 'passed' && 'text-green-600 dark:text-green-400',
                          result.status === 'failed' && 'text-red-600 dark:text-red-400',
                          result.status === 'running' && 'text-blue-600 dark:text-blue-400'
                        )}>
                          {getStatusText(result.status)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(result.startTime), 'dd/MM/yyyy', { locale: vi })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(result.startTime), 'HH:mm:ss', { locale: vi })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {result.projectName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Monitor className="w-3 h-3 mr-1" />
                        {result.screenName || 'N/A'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDuration(result.startTime, result.endTime)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetail(result)}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResult(result.id)}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedResult && (
        <TestResultDetailModal
          result={selectedResult}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedResult(null);
          }}
        />
      )}
    </div>
  );
};

// Test Result Detail Modal Component
const TestResultDetailModal = ({ result, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Chi tiết kết quả test
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {result.scriptName} - {getStatusText(result.status)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Tổng quan' },
              { id: 'steps', label: 'Các bước' },
              { id: 'screenshots', label: 'Screenshots' },
              { id: 'logs', label: 'Console Logs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <TestResultOverview result={result} />
          )}
          
          {activeTab === 'steps' && (
            <TestResultSteps steps={result.steps || []} />
          )}
          
          {activeTab === 'screenshots' && (
            <TestResultScreenshots screenshots={result.screenshots || []} />
          )}
          
          {activeTab === 'logs' && (
            <TestResultLogs logs={result.consoleErrors || []} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-components for modal tabs
const TestResultOverview = ({ result }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Thông tin cơ bản</h4>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tên kịch bản:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{result.scriptName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Trạng thái:</span>
              <span className={clsx(
                'text-sm font-medium',
                result.status === 'passed' && 'text-green-600',
                result.status === 'failed' && 'text-red-600',
                result.status === 'running' && 'text-blue-600'
              )}>
                {getStatusText(result.status)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Dự án:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{result.projectName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Màn hình:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{result.screenName || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Thời gian thực hiện</h4>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bắt đầu:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {format(new Date(result.startTime), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
              </span>
            </div>
            {result.endTime && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Kết thúc:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {format(new Date(result.endTime), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Thời lượng:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDuration(result.startTime, result.endTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Thống kê</h4>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tổng số bước:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {result.steps ? result.steps.length : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bước thành công:</span>
              <span className="text-sm font-medium text-green-600">
                {result.steps ? result.steps.filter(s => s.status === 'passed').length : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bước thất bại:</span>
              <span className="text-sm font-medium text-red-600">
                {result.steps ? result.steps.filter(s => s.status === 'failed').length : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Console errors:</span>
              <span className="text-sm font-medium text-orange-600">
                {result.consoleErrors ? result.consoleErrors.length : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Screenshots:</span>
              <span className="text-sm font-medium text-blue-600">
                {result.screenshots ? result.screenshots.length : 0}
              </span>
            </div>
          </div>
        </div>

        {result.finalUrl && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">URL cuối cùng</h4>
            <div className="mt-2">
              <a 
                href={result.finalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {result.finalUrl}
              </a>
            </div>
          </div>
        )}

        {result.error && (
          <div>
            <h4 className="text-sm font-medium text-red-500">Lỗi</h4>
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                {result.error}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const TestResultSteps = ({ steps }) => (
  <div className="space-y-4">
    {steps.length === 0 ? (
      <div className="text-center py-8">
        <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400">Không có thông tin các bước thực hiện</p>
      </div>
    ) : (
      steps.map((step, index) => (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                {step.stepNumber || index + 1}
              </span>
              <h5 className="font-medium text-gray-900 dark:text-white">
                {step.description || step.type}
              </h5>
            </div>
            <div className="flex items-center">
              {step.status === 'passed' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {step.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
              {step.status === 'running' && <Clock className="w-5 h-5 text-blue-500" />}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Loại:</span>
              <div className="font-medium text-gray-900 dark:text-white capitalize">
                {step.type}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Thời gian bắt đầu:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {step.startTime ? format(new Date(step.startTime), 'HH:mm:ss') : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Thời lượng:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {formatDuration(step.startTime, step.endTime)}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Trạng thái:</span>
              <div className={clsx(
                'font-medium',
                step.status === 'passed' && 'text-green-600',
                step.status === 'failed' && 'text-red-600',
                step.status === 'running' && 'text-blue-600'
              )}>
                {getStatusText(step.status)}
              </div>
            </div>
          </div>

          {step.selector && (
            <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
              <span className="text-gray-500 dark:text-gray-400">Selector: </span>
              <code className="text-gray-700 dark:text-gray-300">{step.selector}</code>
            </div>
          )}

          {step.error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-700 dark:text-red-300">
                <strong>Lỗi:</strong> {step.error}
              </div>
            </div>
          )}
        </div>
      ))
    )}
  </div>
);

const TestResultScreenshots = ({ screenshots }) => (
  <div className="space-y-4">
    {screenshots.length === 0 ? (
      <div className="text-center py-8">
        <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400">Không có screenshot nào</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((screenshot, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
            <div className="p-3">
              <h6 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {screenshot.filename || `Screenshot ${index + 1}`}
              </h6>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {screenshot.timestamp ? format(new Date(screenshot.timestamp), 'HH:mm:ss dd/MM/yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const TestResultLogs = ({ logs }) => (
  <div className="space-y-4">
    {logs.length === 0 ? (
      <div className="text-center py-8">
        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400">Không có console log nào</p>
      </div>
    ) : (
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div key={index} className="border-l-4 border-red-400 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-red-700 dark:text-red-300">
                  {log.message}
                </div>
                {log.timestamp && (
                  <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {format(new Date(log.timestamp), 'HH:mm:ss dd/MM/yyyy')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default TestResults;