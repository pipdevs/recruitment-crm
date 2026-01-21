import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { profilesService } from '../services/tasks';
import { candidatesService } from '../services/candidates';
import { companiesService } from '../services/companies';
import { jobsService } from '../services/jobs';
import type { Database, TaskStatus, EntityType } from '../lib/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];

const STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

interface TaskModalProps {
  isOpen: boolean;
  task?: Task & { assignee?: { id: string; full_name: string } };
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function TaskModal({ isOpen, task, onClose, onSubmit }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [relatedEntityType, setRelatedEntityType] = useState<EntityType | ''>('');
  const [relatedEntityId, setRelatedEntityId] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (relatedEntityType) {
      loadEntities(relatedEntityType);
    } else {
      setEntities([]);
      setRelatedEntityId('');
    }
  }, [relatedEntityType]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '');
      setStatus(task.status);
      setAssignedTo(task.assigned_to || '');
      setRelatedEntityType(task.related_entity_type || '');
      setRelatedEntityId(task.related_entity_id || '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setStatus('Pending');
      setAssignedTo('');
      setRelatedEntityType('');
      setRelatedEntityId('');
    }
    setError('');
  }, [task, isOpen]);

  const loadProfiles = async () => {
    try {
      const data = await profilesService.getAll();
      setProfiles(data || []);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  };

  const loadEntities = async (entityType: EntityType) => {
    try {
      let data;
      switch (entityType) {
        case 'candidate':
          data = await candidatesService.getAll();
          break;
        case 'company':
          data = await companiesService.getAll();
          break;
        case 'job':
          data = await jobsService.getAll();
          break;
      }
      setEntities(data || []);
    } catch (err) {
      console.error('Failed to load entities:', err);
      setEntities([]);
    }
  };

  const getEntityLabel = (entity: any, type: EntityType) => {
    switch (type) {
      case 'candidate':
        return entity.full_name;
      case 'company':
        return entity.name;
      case 'job':
        return entity.title;
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        title,
        description: description || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        status,
        assigned_to: assignedTo || null,
        related_entity_type: (relatedEntityType as EntityType) || null,
        related_entity_id: relatedEntityId || null,
        created_by: task?.created_by || null,
        created_at: task?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Task details and notes"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Unassigned</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name} ({profile.role})
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Related To (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type
                </label>
                <select
                  value={relatedEntityType}
                  onChange={(e) => setRelatedEntityType(e.target.value as EntityType | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  <option value="candidate">Candidate</option>
                  <option value="company">Company</option>
                  <option value="job">Job</option>
                </select>
              </div>

              {relatedEntityType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select {relatedEntityType}
                  </label>
                  <select
                    value={relatedEntityId}
                    onChange={(e) => setRelatedEntityId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {entities.map((entity) => (
                      <option key={entity.id} value={entity.id}>
                        {getEntityLabel(entity, relatedEntityType)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
