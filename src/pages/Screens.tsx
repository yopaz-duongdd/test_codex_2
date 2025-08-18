import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Monitor, ExternalLink } from 'lucide-react';
import { Screen, Project } from '../types';
import { TestAutomationAPI } from '../utils/api';
import Modal from '../components/Common/Modal';
import SearchBar from '../components/Common/SearchBar';

const Screens: React.FC = () => {
  const [screens, setScreens] = useState<Screen[]>(TestAutomationAPI.getScreens());
  const [projects] = useState<Project[]>(TestAutomationAPI.getProjects());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    urlPath: '',
    projectId: '',
    description: ''
  });

  const filteredScreens = screens.filter(screen =>
    screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screen.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screen.urlPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screen.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (screen?: Screen) => {
    if (screen) {
      setEditingScreen(screen);
      setFormData({
        name: screen.name,
        domain: screen.domain,
        urlPath: screen.urlPath,
        projectId: screen.projectId,
        description: screen.description
      });
    } else {
      setEditingScreen(null);
      setFormData({
        name: '',
        domain: '',
        urlPath: '',
        projectId: projects[0]?.id || '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScreen(null);
    setFormData({
      name: '',
      domain: '',
      urlPath: '',
      projectId: '',
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingScreen) {
      const updated = TestAutomationAPI.updateScreen(editingScreen.id, formData);
      if (updated) {
        setScreens(screens.map(s => s.id === editingScreen.id ? updated : s));
      }
    } else {
      const newScreen = TestAutomationAPI.createScreen(formData);
      setScreens([...screens, newScreen]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure? This will also delete all related test scripts.')) {
      TestAutomationAPI.deleteScreen(id);
      setScreens(screens.filter(s => s.id !== id));
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Screens</h1>
          <p className="text-slate-600 mt-1">Manage your application screens</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={projects.length === 0}
        >
          <Plus className="w-4 h-4" />
          <span>New Screen</span>
        </button>
      </div>

      {projects.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You need to create at least one project before adding screens.
          </p>
        </div>
      )}

      <SearchBar
        placeholder="Search screens..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScreens.map((screen) => (
          <div key={screen.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Monitor className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{screen.name}</h3>
                  <p className="text-sm text-slate-500">{getProjectName(screen.projectId)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <a
                  href={`${screen.domain}${screen.urlPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Open URL"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleOpenModal(screen)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(screen.id)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">URL:</span>
                <p className="font-mono text-slate-700 break-all">
                  {screen.domain}{screen.urlPath}
                </p>
              </div>
              <p className="text-slate-600">{screen.description}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredScreens.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Monitor className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No screens found matching your search.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingScreen ? 'Edit Screen' : 'Create New Screen'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project
            </label>
            <select
              required
              value={formData.projectId}
              onChange={(e) => setFormData({...formData, projectId: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Screen Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter screen name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Domain
            </label>
            <input
              type="url"
              required
              value={formData.domain}
              onChange={(e) => setFormData({...formData, domain: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              URL Path
            </label>
            <input
              type="text"
              required
              value={formData.urlPath}
              onChange={(e) => setFormData({...formData, urlPath: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="/login"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter screen description"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingScreen ? 'Update Screen' : 'Create Screen'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Screens;