import React from 'react';
import { BarChart3, FolderOpen, Monitor, FileCode, Tag, CheckCircle, XCircle, Clock } from 'lucide-react';
import { TestAutomationAPI } from '../utils/api';

const Dashboard: React.FC = () => {
  const projects = TestAutomationAPI.getProjects();
  const screens = TestAutomationAPI.getScreens();
  const scripts = TestAutomationAPI.getTestScripts();
  const results = TestAutomationAPI.getTestResults();

  const stats = [
    {
      name: 'Projects',
      value: projects.length,
      icon: FolderOpen,
      color: 'bg-blue-500',
      description: 'Active projects'
    },
    {
      name: 'Screens',
      value: screens.length,
      icon: Monitor,
      color: 'bg-emerald-500',
      description: 'Configured screens'
    },
    {
      name: 'Test Scripts',
      value: scripts.length,
      icon: FileCode,
      color: 'bg-orange-500',
      description: 'Automated tests'
    },
    {
      name: 'Test Results',
      value: results.length,
      icon: BarChart3,
      color: 'bg-purple-500',
      description: 'Total test runs'
    }
  ];

  const successfulTests = results.filter(r => r.status === 'success').length;
  const failedTests = results.filter(r => r.status === 'failed').length;
  const runningTests = results.filter(r => r.status === 'running').length;

  const recentResults = results
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your test automation system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Results Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Test Results Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Successful</span>
              </div>
              <span className="text-green-900 font-bold">{successfulTests}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Failed</span>
              </div>
              <span className="text-red-900 font-bold">{failedTests}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Running</span>
              </div>
              <span className="text-yellow-900 font-bold">{runningTests}</span>
            </div>
          </div>
        </div>

        {/* Recent Test Results */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Test Results</h3>
          {recentResults.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No test results yet</p>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result) => {
                const script = scripts.find(s => s.id === result.testScriptId);
                const statusColors = {
                  success: 'bg-green-100 text-green-800',
                  failed: 'bg-red-100 text-red-800',
                  running: 'bg-yellow-100 text-yellow-800'
                };

                return (
                  <div key={result.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {script ? script.name : 'Unknown Script'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(result.createdAt).toLocaleDateString()} at{' '}
                        {new Date(result.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[result.status]}`}>
                      {result.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;