'use client';

import { useState, useEffect } from 'react';
import { authService } from '../../../../services/auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketing-saas.pankajpandey.dev/api';

interface ScriptInfo {
  scriptUrl: string;
  embedCode: string;
  instructions: string;
  allowedUrls: string[];
}

interface ScriptInfoProps {
  projectId: number;
}

export default function ScriptInfo({ projectId }: ScriptInfoProps) {
  const [scriptInfo, setScriptInfo] = useState<ScriptInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'url' | 'code' | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    fetchScriptInfo();
  }, [projectId]);

  const fetchScriptInfo = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/scripts/${projectId}/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch script info');
      const data = await response.json();
      setScriptInfo(data);
    } catch (err) {
      setError('Failed to load script information');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'url' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleAddUrl = async () => {
    if (!scriptInfo) return;
    setUrlError('');

    // Basic URL validation
    const urlPattern = /^[a-zA-Z0-9-.*]+\.[a-zA-Z0-9-.]*[a-zA-Z0-9-]+$/;
    if (!urlPattern.test(newUrl)) {
      setUrlError('Invalid URL format. Use domain names only, wildcards (*) are allowed.');
      return;
    }

    try {
      const token = authService.getToken();
      console.log('token', token);
      const response = await fetch(`${API_URL}/projects/${projectId}/allowed-urls`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          allowedUrls: scriptInfo.allowedUrls ? [...scriptInfo.allowedUrls, newUrl] : [newUrl],
        }),
      });
      console.log('response', response);

      if (!response.ok) throw new Error('Failed to update allowed URLs');
      
      const updatedProject = await response.json();
      setScriptInfo({
        ...scriptInfo,
        allowedUrls: updatedProject.allowedUrls,
      });
      setNewUrl('');
      setShowUrlModal(false);
    } catch (err) {
      console.log(err)
      setError('Failed to update allowed URLs');
    }
  };

  const handleRemoveUrl = async (urlToRemove: string) => {
    if (!scriptInfo) return;

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/projects/${projectId}/allowed-urls`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          allowedUrls: scriptInfo.allowedUrls.filter(url => url !== urlToRemove),
        }),
      });

      if (!response.ok) throw new Error('Failed to update allowed URLs');
      
      const updatedProject = await response.json();
      setScriptInfo({
        ...scriptInfo,
        allowedUrls: updatedProject.allowedUrls,
      });
    } catch (err) {
      setError('Failed to remove URL');
    }
  };

  if (loading) return <div>Loading script information...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!scriptInfo) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-6">Script Integration</h2>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Allowed Domains</h3>
            <button
              onClick={() => setShowUrlModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Domain
            </button>
          </div>
          {scriptInfo?.allowedUrls?.length === 0 ? (
            <p className="text-gray-500">No domains added yet. Add domains where this script can run.</p>
          ) : (
            <ul className="space-y-2">
              {scriptInfo.allowedUrls && scriptInfo.allowedUrls.map((url) => (
                <li key={url} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <code className="text-sm">{url}</code>
                  <button
                    onClick={() => handleRemoveUrl(url)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Script URL</h3>
          <div className="flex items-center space-x-4">
            <code className="flex-1 bg-gray-50 p-3 rounded text-sm">
              {scriptInfo.scriptUrl}
            </code>
            <button
              onClick={() => copyToClipboard(scriptInfo.scriptUrl, 'url')}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {copied === 'url' ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Embed Code</h3>
          <div className="flex items-center space-x-4">
            <code className="flex-1 bg-gray-50 p-3 rounded text-sm">
              {scriptInfo.embedCode}
            </code>
            <button
              onClick={() => copyToClipboard(scriptInfo.embedCode, 'code')}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {copied === 'code' ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="text-yellow-800 font-medium">Important Notes</h4>
          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
            <li>The script will only run on the domains you specify above.</li>
            <li>You can use wildcards (*) for subdomains, e.g., *.example.com</li>
            <li>The script requires user permission for location access (weather and temperature conditions).</li>
            <li>Conditions are checked every 5 minutes to minimize API calls.</li>
            <li>Make sure your website is served over HTTPS for geolocation to work.</li>
            <li>Consider setting up your own weather API key for production use.</li>
          </ul>
        </div>
      </div>

      {/* Add Domain Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add Allowed Domain</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="e.g., example.com or *.example.com"
                  className="w-full p-2 border rounded-md"
                />
                {urlError && (
                  <p className="mt-1 text-sm text-red-600">{urlError}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Use * for wildcards, e.g., *.example.com for all subdomains
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUrlModal(false);
                    setNewUrl('');
                    setUrlError('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUrl}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Add Domain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 