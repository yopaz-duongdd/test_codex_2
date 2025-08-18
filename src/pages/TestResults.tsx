import React, { useState } from 'react';
import { Trash2, BarChart3, CheckCircle, XCircle, Clock, Eye, Image } from 'lucide-react';
import { TestResult, TestScript, Project, Screen, Tag } from '../types';
import { TestAutomationAPI } from '../utils/api';
import Modal from '../components/Common/Modal';
import SearchBar from '../components/Common/SearchBar';

const TestResults: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>(TestAutomationAPI.getTestResults());
  const [scripts] = useState<TestScript[]>(TestAutomationAPI.getTestScripts());
  const [projects] = useState<Project[]>(TestAutomationAPI.getProjects());
  const [screens] = useState<Screen[]>(TestAutomationAPI.getScreens());
  const [tags] = useState<Tag[]>(TestAutomationAPI.getTags());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterScreen, setFilterScreen] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewingResult, setViewingResult] = useState<TestResult | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const getScript = (scriptId: string) => scripts.find(s => s.id === scriptId);
  const getProject = (projectId: string) => projects.find(p => p.id === projectId);
  const getScreen = (screenId: string) => screens.find(s => s.id === screenId);
  const getTag = (tagId: string) => tags.find(t => t.id === tagId);

  const filteredResults = results.filter(result => {
    const script = getScript(result.testScriptId);
    if (!script) return false;

    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = !filterProject || script.projectId === filterProject;
    const matchesScreen = !filterScreen || script.screenId === filterScreen;
    const matchesTag = !filterTag || script.tagId === filterTag;
    const matchesStatus = !filterStatus || result.status === filterStatus;

    return matchesSearch && matchesProject && matchesScreen && matchesTag && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test result?')) {
      TestAutomationAPI.deleteTestResult(id);
      setResults(results.filter(r => r.id !== id));
    }
  };

  const handleViewDetails = (result: TestResult) => {
    setViewingResult(result);
    setIsViewModalOpen(true);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <Clock className="w-5 h-5 text-yellow-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'Running...';
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    return `${Math.round(duration / 1000)}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Results</h1>
          <p className="text-slate-600 mt-1">View and manage test execution results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <SearchBar
          placeholder="Search by script name..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          value={filterScreen}
          onChange={(e) => setFilterScreen(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Screens</option>
          {screens.map((screen) => (
            <option key={screen.id} value={screen.id}>
              {screen.name}
            </option>
          ))}
        </select>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No test results found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Test Script
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Screen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Executed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredResults.map((result) => {
                  const script = getScript(result.testScriptId);
                  const project = getProject(script?.projectId || '');
                  const screen = getScreen(script?.screenId || '');
                  const tag = getTag(script?.tagId || '');

                  return (
                    <tr key={result.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {script?.name || 'Unknown Script'}
                          </div>
                          <div className="text-sm text-slate-500">
                            v{script?.version} • {tag?.name || 'No tag'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {project?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {screen?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(result.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDuration(result.startTime, result.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(result.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(result)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(result.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingResult(null);
        }}
        title="Test Result Details"
        size="xl"
      >
        {viewingResult && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Script:</span>
                  <p className="text-slate-700 font-medium">
                    {getScript(viewingResult.testScriptId)?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(viewingResult.status)}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingResult.status)}`}>
                      {viewingResult.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Duration:</span>
                  <p className="text-slate-700">{formatDuration(viewingResult.startTime, viewingResult.endTime)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Steps:</span>
                  <p className="text-slate-700">{viewingResult.steps.length}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {viewingResult.errorMessage && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                <pre className="text-sm text-red-800 whitespace-pre-wrap">{viewingResult.errorMessage}</pre>
              </div>
            )}

            {/* Console Errors */}
            {viewingResult.consoleErrors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Console Errors</h3>
                <div className="space-y-2">
                  {viewingResult.consoleErrors.map((error, index) => (
                    <pre key={index} className="text-sm text-yellow-800 bg-white p-2 rounded border">
                      {error}
                    </pre>
                  ))}
                </div>
              </div>
            )}

            {/* Test Steps */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Test Steps</h3>
              <div className="space-y-4">
                {viewingResult.steps.map((step) => (
                  <div key={step.id} className="border border-slate-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900">Step {step.stepNumber}</h4>
                      <span className="text-sm text-slate-500">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      <strong>URL:</strong> {step.url}
                    </div>
                    {step.consoleErrors.length > 0 && (
                      <div className="bg-red-50 p-2 rounded text-sm">
                        <strong className="text-red-800">Console Errors:</strong>
                        <ul className="mt-1 text-red-700">
                          {step.consoleErrors.map((error, errorIndex) => (
                            <li key={errorIndex} className="font-mono">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {step.screenshot && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Image className="w-4 h-4" />
                          <span>Screenshot available</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TestResults;