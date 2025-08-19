import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Filter, 
  RefreshCw, 
  FileText,
  Monitor,
  Tag,
  GitBranch,
  Search,
  PlayCircle,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const TestExecution = ({ projects, screens, scripts, tags, onRefresh }) => {
  const [filters, setFilters] = useState({
    projectId: '',
    screenId: '',
    tag: '',
    search: ''
  });
  
  const [selectedScript, setSelectedScript] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runAllMode, setRunAllMode] = useState(false);
  const [filteredScripts, setFilteredScripts] = useState([]);
  const [testProgress, setTestProgress] = useState(null);

  useEffect(() => {
    filterScripts();
  }, [filters, scripts]);

  useEffect(() => {
    // Setup test execution listeners
    const progressUnsubscribe = window.electronAPI.testExecution.onTestProgress((event, data) => {
      setTestProgress(data);
    });

    const completeUnsubscribe = window.electronAPI.testExecution.onTestComplete((event, results) => {
      setIsRunning(false);
      setTestProgress(null);
      toast.success(`Test hoàn thành! ${results.passedTests}/${results.totalTests} kịch bản thành công`);
    });

    const errorUnsubscribe = window.electronAPI.testExecution.onTestError((event, error) => {
      setIsRunning(false);
      setTestProgress(null);
      toast.error(`Lỗi khi chạy test: ${error.message}`);
    });

    return () => {
      progressUnsubscribe();
      completeUnsubscribe();
      errorUnsubscribe();
    };
  }, []);

  const filterScripts = () => {
    let filtered = [...scripts];

    // Filter by project
    if (filters.projectId) {
      filtered = filtered.filter(script => script.projectId === filters.projectId);
    }

    // Filter by screen
    if (filters.screenId) {
      filtered = filtered.filter(script => script.screenId === filters.screenId);
    }

    // Filter by tag
    if (filters.tag) {
      filtered = filtered.filter(script => script.tagId === filters.tag);
    }

    // Filter by search text
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(script => 
        script.name.toLowerCase().includes(searchLower) ||
        script.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredScripts(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRunSingleScript = async (script) => {
    if (isRunning) {
      toast.error('Test đang chạy, vui lòng đợi hoàn thành');
      return;
    }

    try {
      setIsRunning(true);
      setSelectedScript(script);
      setRunAllMode(false);

      await window.electronAPI.testExecution.startTest({
        id: script.id,
        name: script.name,
        fileName: script.fileName,
        fileContent: script.fileContent,
        runAll: false
      });

    } catch (error) {
      setIsRunning(false);
      setSelectedScript(null);
      toast.error(`Không thể chạy test: ${error.message}`);
    }
  };

  const handleRunAllScripts = async () => {
    if (isRunning) {
      toast.error('Test đang chạy, vui lòng đợi hoàn thành');
      return;
    }

    if (filteredScripts.length === 0) {
      toast.error('Không có kịch bản nào để chạy');
      return;
    }

    const result = await window.electronAPI.dialog.showMessageBox({
      type: 'question',
      buttons: ['Chạy tất cả', 'Hủy'],
      defaultId: 0,
      message: 'Chạy tất cả kịch bản',
      detail: `Bạn có muốn chạy tất cả ${filteredScripts.length} kịch bản đã lọc không?`
    });

    if (result.response !== 0) return;

    try {
      setIsRunning(true);
      setRunAllMode(true);
      setSelectedScript(null);

      await window.electronAPI.testExecution.startTest({
        runAll: true,
        scripts: filteredScripts.map(script => ({
          id: script.id,
          name: script.name,
          fileName: script.fileName,
          fileContent: script.fileContent
        }))
      });

    } catch (error) {
      setIsRunning(false);
      setRunAllMode(false);
      toast.error(`Không thể chạy test: ${error.message}`);
    }
  };

  const handleStopTest = async () => {
    try {
      await window.electronAPI.testExecution.stopTest();
      setIsRunning(false);
      setSelectedScript(null);
      setRunAllMode(false);
      setTestProgress(null);
      toast.success('Đã dừng test');
    } catch (error) {
      toast.error(`Không thể dừng test: ${error.message}`);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  };

  const getScreenName = (screenId) => {
    const screen = screens.find(s => s.id === screenId);
    return screen ? screen.name : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Thực thi Test
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Chọn và chạy các kịch bản test Chrome Recorder
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={isRunning}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </button>

          {filteredScripts.length > 0 && !isRunning && (
            <button
              onClick={handleRunAllScripts}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Chạy tất cả ({filteredScripts.length})
            </button>
          )}

          {isRunning && (
            <button
              onClick={handleStopTest}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4 mr-2" />
              Dừng Test
            </button>
          )}
        </div>
      </div>

      {/* Test Progress */}
      {testProgress && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {runAllMode ? 'Chạy nhiều kịch bản' : 'Chạy kịch bản đơn lẻ'}
              </span>
            </div>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {testProgress.progress?.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${testProgress.progress || 0}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {testProgress.message}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="font-medium text-gray-900 dark:text-white">Bộ lọc kịch bản</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Project filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <GitBranch className="w-4 h-4 inline mr-1" />
              Dự án
            </label>
            <select
              value={filters.projectId}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả dự án</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Screen filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Monitor className="w-4 h-4 inline mr-1" />
              Màn hình
            </label>
            <select
              value={filters.screenId}
              onChange={(e) => handleFilterChange('screenId', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả màn hình</option>
              {screens
                .filter(screen => !filters.projectId || screen.projectId === filters.projectId)
                .map(screen => (
                  <option key={screen.id} value={screen.id}>
                    {screen.name}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Tag filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tag
            </label>
            <select
              value={filters.tag}
              onChange={(e) => handleFilterChange('tag', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả tag</option>
              {tags
                .filter(tag => !filters.projectId || tag.projectId === filters.projectId)
                .map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tên kịch bản..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Scripts List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Danh sách kịch bản ({filteredScripts.length})
            </h3>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredScripts.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Không tìm thấy kịch bản
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Không có kịch bản nào phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          ) : (
            filteredScripts.map((script) => (
              <div key={script.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {script.name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <GitBranch className="w-4 h-4 mr-1" />
                            {getProjectName(script.projectId)}
                          </span>
                          <span className="flex items-center">
                            <Monitor className="w-4 h-4 mr-1" />
                            {getScreenName(script.screenId)}
                          </span>
                          {script.version && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                              v{script.version}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {script.description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {script.description}
                      </p>
                    )}

                    {script.tagId && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                          <Tag className="w-3 h-3 mr-1" />
                          {tags.find(t => t.id === script.tagId)?.name || 'Unknown'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex-shrink-0">
                    <button
                      onClick={() => handleRunSingleScript(script)}
                      disabled={isRunning}
                      className={clsx(
                        'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                        isRunning
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : selectedScript?.id === script.id
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {isRunning && selectedScript?.id === script.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang chạy...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Chạy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Script file info */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">File:</span> {script.fileName || 'N/A'}
                  </div>
                  {script.createdAt && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">Tạo lúc:</span> {new Date(script.createdAt).toLocaleString('vi-VN')}
                    </div>
                  )}
                  {script.version && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">Version:</span> {script.version}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TestExecution;