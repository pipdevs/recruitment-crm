import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle2, ArrowRight, FileText, Loader2 } from 'lucide-react';
import { activitiesService, type EntityType } from '../services/activities';
import type { Json } from '../lib/database.types';

interface Activity {
  id: string;
  activity_type: string;
  message: string;
  metadata?: Json | null;
  author?: { id: string; full_name: string } | null;
  created_at: string | null;
}

interface ActivityFeedProps {
  entityType: EntityType;
  entityId: string;
  onNoteAdded?: () => void;
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  note_added: <MessageSquare className="w-4 h-4" />,
  status_changed: <ArrowRight className="w-4 h-4" />,
  stage_moved: <ArrowRight className="w-4 h-4" />,
  task_completed: <CheckCircle2 className="w-4 h-4" />,
  task_updated: <FileText className="w-4 h-4" />,
};

const ACTIVITY_COLORS: Record<string, string> = {
  note_added: 'text-blue-600 bg-blue-50',
  status_changed: 'text-orange-600 bg-orange-50',
  stage_moved: 'text-purple-600 bg-purple-50',
  task_completed: 'text-green-600 bg-green-50',
  task_updated: 'text-gray-600 bg-gray-50',
};

export function ActivityFeed({ entityType, entityId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivities();
  }, [entityType, entityId]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadActivities();
    }, 5000);

    return () => clearInterval(interval);
  }, [entityType, entityId]);

  const loadActivities = async () => {
    try {
      setError('');
      const data = await activitiesService.getByEntity(entityType, entityId);
      setActivities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const colorClass = ACTIVITY_COLORS[activity.activity_type] || ACTIVITY_COLORS.task_updated;
        const icon = ACTIVITY_ICONS[activity.activity_type] || ACTIVITY_ICONS.task_updated;

        return (
          <div
            key={activity.id}
            className="flex gap-3 pb-4 border-b border-gray-200 last:border-b-0"
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.author?.full_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {activity.message}
                  </p>
                </div>
                <p className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                  {formatDate(activity.created_at ?? '')}
                </p>
              </div>

          {(() => {
            const meta = activity.metadata as Record<string, unknown> | null;
            if (!meta) return null;
            if (activity.activity_type === 'note_added' && meta.note_content != null) {
              return (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{String(meta.note_content)}</p>
                </div>
              );
            }
            if (activity.activity_type === 'status_changed') {
              return (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded mr-2">
                    {String(meta.old_status)}
                  </span>
                  <span className="inline-block">→</span>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded ml-2">
                    {String(meta.new_status)}
                  </span>
                </div>
              );
            }
            if (activity.activity_type === 'stage_moved') {
              return (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded mr-2">
                    {String(meta.old_stage)}
                  </span>
                  <span className="inline-block">→</span>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded ml-2">
                    {String(meta.new_stage)}
                  </span>
                </div>
              );
            }
            return null;
          })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }