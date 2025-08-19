import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TestExecution from './TestExecution';
import TestResults from './TestResults';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const Dashboard = ({ apiKey, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projects, setProjects] = useState([]);
  const [screens, setScreens] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeData();
  }, [apiKey]);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      apiService.setApiKey(apiKey);
      
      // Load initial data
      await Promise.all([
        loadProjects(),
        loadScreens(), 
        loadScripts(),
        loadTags()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      toast.error('Không thể tải dữ liệu từ server');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await apiService.getProjects();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const loadScreens = async () => {
    try {
      const response = await apiService.getScreens();
      setScreens(response.data || []);
    } catch (error) {
      console.error('Error loading screens:', error);
      setScreens([]);
    }
  };

  const loadScripts = async () => {
    try {
      const response = await apiService.getScripts();
      setScripts(response.data || []);
    } catch (error) {
      console.error('Error loading scripts:', error);
      setScripts([]);
    }
  };

  const loadTags = async () => {
    try {
      const response = await apiService.getTags();
      setTags(response.data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
      setTags([]);
    }
  };

  const currentPath = location.pathname;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        currentPath={currentPath}
        onNavigate={navigate}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          apiKey={apiKey}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <Routes>
              <Route 
                path="/" 
                element={
                  <TestExecution
                    projects={projects}
                    screens={screens}
                    scripts={scripts}
                    tags={tags}
                    onRefresh={initializeData}
                  />
                } 
              />
              <Route 
                path="/results" 
                element={
                  <TestResults
                    apiKey={apiKey}
                  />
                } 
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;