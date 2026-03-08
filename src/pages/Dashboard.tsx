import { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, CheckSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ActivityFeed } from '../components/ActivityFeed';

interface DashboardStats {
  candidates: number;
  companies: number;
  openJobs: number;
  pendingTasks: number;
}

export function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    candidates: 0,
    companies: 0,
    openJobs: 0,
    pendingTasks: 0,
  });
  const [recentEntityId, setRecentEntityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [candidatesRes, companiesRes, jobsRes, tasksRes, activityRes] = await Promise.all([
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'Open'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('activities').select('entity_id').order('created_at', { ascending: false }).limit(1),
      ]);

      setStats({
        candidates: candidatesRes.count ?? 0,
        companies: companiesRes.count ?? 0,
        openJobs: jobsRes.count ?? 0,
        pendingTasks: tasksRes.count ?? 0,
      });

      if (activityRes.data && activityRes.data.length > 0) {
        setRecentEntityId(activityRes.data[0].entity_id);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Candidates', value: stats.candidates, icon: Users, color: 'bg-blue-500' },
    { label: 'Companies', value: stats.companies, icon: Building2, color: 'bg-green-500' },
    { label: 'Open Jobs', value: stats.openJobs, icon: Briefcase, color: 'bg-orange-500' },
    { label: 'Pending Tasks', value: stats.pendingTasks, icon: CheckSquare, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {profile?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {loading ? '—' : stat.value}
              </p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {recentEntityId ? (
            <ActivityFeed entityType="candidate" entityId={recentEntityId} />
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Tasks</h2>
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
}

function UpcomingTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('tasks')
          .select('id, title, due_date, status')
          .neq('status', 'Completed')
          .order('due_date', { ascending: true, nullsFirst: false })
          .limit(5);
        setTasks(data || []);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return <p className="text-gray-500 text-center py-8">No upcoming tasks</p>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isOverdue = task.due_date && new Date(task.due_date) < new Date();
        return (
          <div key={task.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{task.title}</p>
              {task.due_date && (
                <p className={`text-xs mt-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                  {isOverdue ? 'Overdue · ' : 'Due · '}
                  {new Date(task.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ml-3 ${
              task.status === 'In Progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {task.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}