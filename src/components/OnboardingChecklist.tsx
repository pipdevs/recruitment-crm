import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  route: string;
  completed: boolean;
}

export function OnboardingChecklist() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'account',
      label: 'Create your account',
      description: 'You\'re in — welcome to RectoCRM.',
      route: '/dashboard',
      completed: true, // always true — they're logged in
    },
    {
      id: 'candidate',
      label: 'Add your first candidate',
      description: 'Start building your talent pipeline.',
      route: '/candidates',
      completed: false,
    },
    {
      id: 'company',
      label: 'Add a company',
      description: 'Track your clients and prospects.',
      route: '/companies',
      completed: false,
    },
    {
      id: 'job',
      label: 'Create a job',
      description: 'Post a role to start matching candidates.',
      route: '/jobs',
      completed: false,
    },
    {
      id: 'application',
      label: 'Link a candidate to a job',
      description: 'Create your first application to start the recruitment loop.',
      route: '/applications',
      completed: false,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (user && profile) {
      // Already completed onboarding
      if (profile.onboarding_completed) {
        setDismissed(true);
        return;
      }
      loadProgress();
    }
  }, [user, profile]);

  const loadProgress = async () => {
    try {
      const [candidatesRes, companiesRes, jobsRes, applicationsRes] = await Promise.all([
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('job_applications').select('id', { count: 'exact', head: true }),
      ]);

      setItems(prev => prev.map(item => {
        switch (item.id) {
          case 'account': return { ...item, completed: true };
          case 'candidate': return { ...item, completed: (candidatesRes.count ?? 0) > 0 };
          case 'company': return { ...item, completed: (companiesRes.count ?? 0) > 0 };
          case 'job': return { ...item, completed: (jobsRes.count ?? 0) > 0 };
          case 'application': return { ...item, completed: (applicationsRes.count ?? 0) > 0 };
          default: return item;
        }
      }));
    } catch (err) {
      console.error('Failed to load onboarding progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id);
    setCelebrating(true);
    setTimeout(() => {
      setDismissed(true);
      setCelebrating(false);
    }, 2000);
  };

  const handleDismiss = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id);
    setDismissed(true);
  };

  // Check if all items complete
  useEffect(() => {
    if (!loading && items.every(i => i.completed)) {
      markComplete();
    }
  }, [items, loading]);

  if (dismissed || loading) return null;

  const completedCount = items.filter(i => i.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  if (celebrating) {
    return (
      <div className="bg-teal-600 rounded-2xl p-6 mb-6 text-center animate-pulse">
        <p className="text-2xl mb-1">🎉</p>
        <p className="text-white font-bold text-lg">You're all set!</p>
        <p className="text-teal-100 text-sm mt-1">Welcome to RectoCRM. Let's get recruiting.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900">Get started with RectoCRM</h3>
              <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                {completedCount}/{items.length} done
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-xs">
              <div
                className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={e => { e.stopPropagation(); handleDismiss(); }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronUp className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {/* Checklist items */}
      {!collapsed && (
        <div className="border-t border-gray-100">
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => !item.completed && navigate(item.route)}
              className={`flex items-center gap-4 px-6 py-3.5 transition-colors border-b border-gray-50 last:border-0 ${
                item.completed
                  ? 'bg-gray-50 cursor-default'
                  : 'hover:bg-teal-50 cursor-pointer group'
              }`}
            >
              {/* Step number / check */}
              <div className="flex-shrink-0">
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-teal-500 transition-colors flex items-center justify-center">
                    <span className="text-xs text-gray-400 group-hover:text-teal-600 font-medium">
                      {index + 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {item.label}
                </p>
                {!item.completed && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                )}
              </div>

              {/* Arrow for incomplete items */}
              {!item.completed && (
                <span className="text-teal-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  Go →
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}