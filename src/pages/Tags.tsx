import React, { useState } from 'react';
import { Plus, Trash2, Tag as TagIcon } from 'lucide-react';
import { Tag, Project } from '../types';
import { TestAutomationAPI } from '../utils/api';
import Modal from '../components/Common/Modal';
import SearchBar from '../components/Common/SearchBar';

const Tags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>(TestAutomationAPI.getTags());
  const [projects] = useState<Project[]>(TestAutomationAPI.getProjects());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    projectId: ''
  });

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = !filterProject || tag.projectId === filterProject;
    return matchesSearch && matchesProject;
  });

  const handleOpenModal = () => {
    setFormData({
      name: '',
      projectId: projects[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      projectId: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newTag = TestAutomationAPI.createTag(formData);
      setTags([...tags, newTag]);
      handleCloseModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create tag');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      TestAutomationAPI.deleteTag(id);
      setTags(tags.filter(t => t.id !== id));
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const groupedTags = filteredTags.reduce((acc, tag) => {
    const projectName = getProjectName(tag.projectId);
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tags</h1>
          <p className="text-slate-600 mt-1">Manage tags for organizing your test scripts</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={projects.length === 0}
        >
          <Plus className="w-4 h-4" />
          <span>New Tag</span>
        </button>
      </div>

      {projects.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You need to create at least one project before adding tags.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SearchBar
          placeholder="Search tags..."
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
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTags).map(([projectName, projectTags]) => (
          <div key={projectName} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{projectName}</h3>
            <div className="flex flex-wrap gap-3">
              {projectTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors group"
                >
                  <TagIcon className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-700 font-medium">{tag.name}</span>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {projectTags.length === 0 && (
              <p className="text-slate-500 italic">No tags in this project</p>
            )}
          </div>
        ))}
      </div>

      {filteredTags.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <TagIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No tags found matching your search.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create New Tag"
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
              Tag Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tag name"
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
              Create Tag
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tags;