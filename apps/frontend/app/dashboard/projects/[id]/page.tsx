'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../../services/auth.service';
import Conditions from './conditions';
import ScriptInfo from './script-info';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketing-saas.pankajpandey.dev/api';

interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
  });
  const [activeTab, setActiveTab] = useState<'details' | 'conditions' | 'script'>('details');

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/projects/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
      setEditForm({
        name: data.name,
        description: data.description || '',
      });
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update project');
      
      const updatedProject = await response.json();
      setProject(updatedProject);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/projects/${params.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete project');
      
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  if (loading) return <div>Loading project...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Project Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
          <p className="text-gray-500 mt-1">
            Created on {new Date(project?.createdAt || '').toLocaleDateString()}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['details', 'conditions', 'script'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4 border-2 p-4 border-gray-300 rounded-lg">
                <span className="text-lg font-semibold">Edit Details</span>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={3}
                    className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {project.name}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <p className="text-gray-700">{project.description}</p>
                </div>
              </div>
            )}
            {!isEditing && (
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Edit Project
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete Project
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'conditions' && <Conditions projectId={Number(params.id)} />}
        {activeTab === 'script' && <ScriptInfo projectId={Number(params.id)} />}
      </div>
    </div>
  );
} 