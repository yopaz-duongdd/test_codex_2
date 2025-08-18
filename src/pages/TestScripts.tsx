import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileCode, Upload, Download, Eye } from 'lucide-react';
import { TestScript, Project, Screen, Tag } from '../types';
import { TestAutomationAPI } from '../utils/api';
import Modal from '../components/Common/Modal';
import SearchBar from '../components/Common/SearchBar';

const TestScripts: React.FC = () => {
  const [scripts, setScripts] = useState<TestScript[]>(TestAutomationAPI.getTestScripts());
  const [projects] = useState<Project[]>(TestAutomationAPI.getProjects());
  const [screens] = useState<Screen[]>(TestAutomationAPI.getScreens());
  const [tags] = useState<Tag[]>(TestAutomationAPI.getTags());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterScreen, setFilterScreen] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<TestScript | null>(null);
  const [viewingScript, setViewingScript] = useState<TestScript | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    screenId: '',
    tagId: '',
    fileName: '',
    fileContent: ''
  });

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = !filterProject || script.projectId === filterProject;
    const matchesTag = !filterTag || script.tagId === filterTag;
    const matchesScreen = !filterScreen || script.screenId === filterScreen;
    
    return matchesSearch && matchesProject && matchesTag && matchesScreen;
  });

  const handleOpenModal = (script?: TestScript) => {
    if (script) {
      setEditingScript(script);
      setFormData({
        name: script.name,
        projectId: script.projectId,
        screenId: script.screenId,
        tagId: script.tagId,
        fileName: script.fileName,
        fileContent: script.fileContent
      });
    } else {
      setEditingScript(null);
      setFormData({
        name: '',
        projectId: projects[0]?.id || '',
        screenId: '',
        tagId: '',
        fileName: '',
        fileContent: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScript(null);
    setFormData({
      name: '',
      projectId: '',
      screenId: '',
      tagId: '',
      fileName: '',
      fileContent: ''
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.js')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          fileName: file.name,
          fileContent: event.target?.result as string
        });
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingScript) {
      const updated = TestAutomationAPI.updateTestScript(editingScript.id, formData);
      if (updated) {
        setScripts(scripts.map(s => s.id === editingScript.id ? updated : s));
      }
    } else {
      const newScript = TestAutomationAPI.createTestScript(formData);
      setScripts([...scripts, newScript]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test script?')) {
      TestAutomationAPI.deleteTestScript(id);
      setScripts(scripts.filter(s => s.id !== id));
    }
  };

  const handleDownload = (script: TestScript) => {
    const blob = new Blob([script.fileContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = script.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const getScreenName = (screenId: string) => {
    return screens.find(s => s.id === screenId)?.name || 'Unknown Screen';
  };

  const getTagName = (tagId: string) => {
    return tags.find(t => t.id === tagId)?.name || 'No Tag';
  };

  const getAvailableScreens = (projectId: string) => {
    return screens.filter(s => s.projectId === projectId);
  };

  const getAvailableTags = (projectId: string) => {
    return tags.filter(t => t.projectId === projectId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Scripts</h1>
          <p className="text-slate-600 mt-1">Manage your automated test scripts</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={projects.length === 0 || screens.length === 0}
        >
          <Plus className="w-4 h-4" />
          <span>New Script</span>
        </button>
      </div>

      {(projects.length === 0 || screens.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You need to create at least one project and one screen before adding test scripts.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SearchBar
          placeholder="Search scripts..."
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScripts.map((script) => (
          <div key={script.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileCode className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{script.name}</h3>
                  <p className="text-sm text-slate-500">v{script.version}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setViewingScript(script);
                    setIsViewModalOpen(true);
                  }}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Code"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(script)}
                  className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenModal(script)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(script.id)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Project:</span>
                <p className="text-slate-700">{getProjectName(script.projectId)}</p>
              </div>
              <div>
                <span className="text-slate-500">Screen:</span>
                <p className="text-slate-700">{getScreenName(script.screenId)}</p>
              </div>
              <div>
                <span className="text-slate-500">Tag:</span>
                <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs">
                  {getTagName(script.tagId)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">File:</span>
                <p className="font-mono text-slate-700">{script.fileName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredScripts.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <FileCode className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No test scripts found matching your filters.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingScript ? 'Edit Test Script' : 'Create New Test Script'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Script Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter script name"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project
              </label>
              <select
                required
                value={formData.projectId}
                onChange={(e) => setFormData({
                  ...formData, 
                  projectId: e.target.value,
                  screenId: '',
                  tagId: ''
                })}
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
                Screen
              </label>
              <select
                required
                value={formData.screenId}
                onChange={(e) => setFormData({...formData, screenId: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.projectId}
              >
                <option value="">Select a screen</option>
                {getAvailableScreens(formData.projectId).map((screen) => (
                  <option key={screen.id} value={screen.id}>
                    {screen.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tag
            </label>
            <select
              required
              value={formData.tagId}
              onChange={(e) => setFormData({...formData, tagId: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.projectId}
            >
              <option value="">Select a tag</option>
              {getAvailableTags(formData.projectId).map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload JS File
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".js"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Choose File</span>
              </label>
              {formData.fileName && (
                <span className="text-sm text-slate-600">{formData.fileName}</span>
              )}
            </div>
          </div>
          {formData.fileContent && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Script Content Preview
              </label>
              <pre className="bg-slate-50 p-4 rounded-lg text-sm font-mono overflow-x-auto max-h-40">
                {formData.fileContent.slice(0, 500)}
                {formData.fileContent.length > 500 && '...'}
              </pre>
            </div>
          )}
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
              disabled={!formData.fileContent}
            >
              {editingScript ? 'Update Script' : 'Create Script'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingScript(null);
        }}
        title={`View Script: ${viewingScript?.name}`}
        size="xl"
      >
        {viewingScript && (
          <div>
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Project:</span>
                  <p className="text-slate-700">{getProjectName(viewingScript.projectId)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Screen:</span>
                  <p className="text-slate-700">{getScreenName(viewingScript.screenId)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Tag:</span>
                  <p className="text-slate-700">{getTagName(viewingScript.tagId)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Version:</span>
                  <p className="text-slate-700">v{viewingScript.version}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Script Content ({viewingScript.fileName})
              </label>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm font-mono overflow-x-auto max-h-96">
                {viewingScript.fileContent}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TestScripts;