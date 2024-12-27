'use client';

import { useState, useEffect } from 'react';
import { authService } from '../../../../services/auth.service';
import {
  Condition,
  ConditionType,
  CreateConditionDto,
  TIME_OF_DAY_OPTIONS,
  WEATHER_OPTIONS,
  TEMPERATURE_RANGES,
} from '../../../../types/condition';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marketing-saas.pankajpandey.dev/api';

interface ConditionsProps {
  projectId: number;
}

export default function Conditions({ projectId }: ConditionsProps) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewConditionModal, setShowNewConditionModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [conditionToDelete, setConditionToDelete] = useState<number | null>(null);
  const [newCondition, setNewCondition] = useState<CreateConditionDto>({
    type: ConditionType.TIME_OF_DAY,
    value: '',
    variation: '',
    projectId,
  });

  useEffect(() => {
    fetchConditions();
  }, [projectId]);

  const fetchConditions = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/conditions/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch conditions');
      const data = await response.json();
      setConditions(data);
    } catch (err) {
      setError('Failed to load conditions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/conditions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCondition),
      });

      if (!response.ok) throw new Error('Failed to create condition');
      
      const createdCondition = await response.json();
      setConditions(prev => [...prev, createdCondition]);
      setShowNewConditionModal(false);
      setNewCondition({
        type: ConditionType.TIME_OF_DAY,
        value: '',
        variation: '',
        projectId,
      });
    } catch (err) {
      setError('Failed to create condition');
    }
  };

  const confirmDelete = (id: number) => {
    setConditionToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteCondition = async () => {
    if (!conditionToDelete) return;

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/conditions/${conditionToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete condition');
      
      setConditions(prev => prev.filter(condition => condition.id !== conditionToDelete));
      setShowDeleteConfirmation(false);
      setConditionToDelete(null);
    } catch (err) {
      setError('Failed to delete condition');
    }
  };

  const getValueOptions = (type: ConditionType) => {
    switch (type) {
      case ConditionType.TIME_OF_DAY:
        return TIME_OF_DAY_OPTIONS;
      case ConditionType.WEATHER:
        return WEATHER_OPTIONS;
      case ConditionType.TEMPERATURE:
        return TEMPERATURE_RANGES;
      default:
        return [];
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Conditions</h2>
        <button
          onClick={() => setShowNewConditionModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Condition
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading conditions...</div>
      ) : conditions.length === 0 ? (
        <div className="text-gray-500">No conditions defined yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {conditions.map((condition) => (
            <div
              key={condition.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{condition.type.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-600">
                    Value: {condition.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    Variation: {condition.variation}
                  </div>
                </div>
                <button
                  onClick={() => confirmDelete(condition.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Condition Modal */}
      {showNewConditionModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add New Condition</h2>
            <form onSubmit={handleCreateCondition}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Condition Type
                  </label>
                  <select
                    value={newCondition.type}
                    onChange={(e) =>
                      setNewCondition({
                        ...newCondition,
                        type: e.target.value as ConditionType,
                        value: '', // Reset value when type changes
                      })
                    }
                    className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {Object.values(ConditionType).map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Value
                  </label>
                  <select
                    value={newCondition.value}
                    onChange={(e) =>
                      setNewCondition({ ...newCondition, value: e.target.value })
                    }
                    className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a value</option>
                    {getValueOptions(newCondition.type).map((value) => (
                      <option key={value} value={value}>
                        {value.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Variation
                  </label>
                  <input
                    type="text"
                    value={newCondition.variation}
                    onChange={(e) =>
                      setNewCondition({ ...newCondition, variation: e.target.value })
                    }
                    placeholder="e.g., ?variation=a"
                    className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewConditionModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Create
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Condition</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this condition? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setConditionToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCondition}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 