import { useState, useEffect } from 'react';
import { Plus, Search, ChevronRight, Briefcase, User, Building2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobApplicationsService } from '../services/jobApplications';
import { supabase } from '../lib/supabase';

type ApplicationStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Placed' | 'Rejected';

const STAGES: ApplicationStage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Placed', 'Rejected'];

const STAGE_COLORS: Record<ApplicationStage, string> = {
  Applied: 'bg-gray-100 text-gray-700',
  Screening: 'bg-blue-100 text-blue-700',
  Interview: 'bg-yellow-100 text-yellow-700',
  Offer: 'bg-purple-100 text-purple-700',
  Placed: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const STAGE_BAR_COLORS: Record<ApplicationStage, string> = {
  Applied: 'bg-gray-400',
  Screening: 'bg-blue-500',
  Interview: 'bg-yellow-500',
  Offer: 'bg-purple-500',
  Placed: 'bg-green-500',
  Rejected: 'bg-red-500',
};

interface Application {
  id: string;
  stage: string;
  notes: string | null;
  applied_at: string | null;
  created_at: string | null;
  candidate_id: string;
  job_id: string;
  candidate?: { id: string; full_name: string; email: string | null; status: string | null } | null;
  job?: {
    id: string; title: string;
    company?: { id: string; name: string } | null;
  } | null;
}

export function JobApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<ApplicationStage | 'All'>('All');
  const [view, setView] = useState<'list' | 'board'>('board');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await jobApplicationsService.getAll();
      setApplications(data as Application[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (id: string, stage: ApplicationStage) => {
    try {
      await jobApplicationsService.updateStage(id, stage);
      setApplications(applications.map(a => a.id === id ? { ...a, stage } : a));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stage');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this application?')) return;
    try {
      await jobApplicationsService.delete(id);
      setApplications(applications.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  const filtered = applications.filter(a => {
    const matchesSearch =
      a.candidate?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.job?.title.toLowerCase().includes(search.toLowerCase()) ||
      a.job?.company?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'All' || a.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const byStage = (stage: ApplicationStage) => filtered.filter(a => a.stage === stage);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
          <p className="text-gray-600">Track candidates through your recruitment pipeline</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Application
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView('board')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'board' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
          >
            Board
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Stage filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['All', ...STAGES] as const).map((stage) => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              stageFilter === stage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {stage}
            {stage !== 'All' && (
              <span className="ml-1.5 text-xs opacity-75">
                {applications.filter(a => a.stage === stage).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : view === 'board' ? (
        <BoardView
          stages={STAGES}
          byStage={byStage}
          onStageChange={handleStageChange}
          onDelete={handleDelete}
        />
      ) : (
        <ListView
          applications={filtered}
          onStageChange={handleStageChange}
          onDelete={handleDelete}
        />
      )}

      {showAddModal && (
        <AddApplicationModal
          userId={user?.id || ''}
          onClose={() => setShowAddModal(false)}
          onCreated={(app) => {
            setApplications([app as Application, ...applications]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── Board View ────────────────────────────────────────────
function BoardView({ stages, byStage, onStageChange, onDelete }: {
  stages: ApplicationStage[];
  byStage: (stage: ApplicationStage) => Application[];
  onStageChange: (id: string, stage: ApplicationStage) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const apps = byStage(stage);
        return (
          <div key={stage} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${STAGE_BAR_COLORS[stage]}`} />
                <h3 className="font-semibold text-gray-700 text-sm">{stage}</h3>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {apps.length}
              </span>
            </div>
            <div className="space-y-3">
              {apps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  stages={stages}
                  onStageChange={onStageChange}
                  onDelete={onDelete}
                />
              ))}
              {apps.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-xs text-gray-400">No applications</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Application Card ──────────────────────────────────────
function ApplicationCard({ app, stages, onStageChange, onDelete }: {
  app: Application;
  stages: ApplicationStage[];
  onStageChange: (id: string, stage: ApplicationStage) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900 text-sm">
            {app.candidate?.full_name || 'Unknown'}
          </span>
        </div>
        <button
          onClick={() => onDelete(app.id)}
          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        <Briefcase className="w-3 h-3" />
        {app.job?.title || 'Unknown role'}
      </div>

      {app.job?.company && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Building2 className="w-3 h-3" />
          {app.job.company.name}
        </div>
      )}

      <select
        value={app.stage}
        onChange={(e) => onStageChange(app.id, e.target.value as ApplicationStage)}
        className={`w-full text-xs px-2 py-1.5 rounded-lg border-0 font-medium cursor-pointer ${STAGE_COLORS[app.stage as ApplicationStage]}`}
      >
        {stages.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

// ── List View ─────────────────────────────────────────────
function ListView({ applications, onStageChange, onDelete }: {
  applications: Application[];
  onStageChange: (id: string, stage: ApplicationStage) => void;
  onDelete: (id: string) => void;
}) {
  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-500">No applications found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Candidate</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 text-xs font-semibold">
                      {app.candidate?.full_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.candidate?.full_name}</p>
                    <p className="text-xs text-gray-500">{app.candidate?.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{app.job?.title}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{app.job?.company?.name}</td>
              <td className="px-6 py-4">
                <select
                  value={app.stage}
                  onChange={(e) => onStageChange(app.id, e.target.value as ApplicationStage)}
                  className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium cursor-pointer ${STAGE_COLORS[app.stage as ApplicationStage]}`}
                >
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-6 py-4 text-xs text-gray-500">
                {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onDelete(app.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Add Application Modal ─────────────────────────────────
function AddApplicationModal({ userId, onClose, onCreated }: {
  userId: string;
  onClose: () => void;
  onCreated: (app: any) => void;
}) {
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [stage, setStage] = useState<ApplicationStage>('Applied');
  const [notes, setNotes] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const [cRes, jRes] = await Promise.all([
        supabase.from('candidates').select('id, full_name').order('full_name'),
        supabase.from('jobs').select('id, title, company:company_id(name)').eq('status', 'Open').order('title'),
      ]);
      setCandidates(cRes.data || []);
      setJobs(jRes.data || []);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId || !jobId) return;
    setLoading(true);
    setError('');
    try {
      const created = await jobApplicationsService.create({
        candidate_id: candidateId,
        job_id: jobId,
        stage,
        notes: notes || null,
        created_by: userId,
      });
      onCreated(created);
    } catch (err: any) {
      if (err?.code === '23505') {
        setError('This candidate already has an application for this job.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create application');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Application</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate *</label>
            <select
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select candidate...</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job *</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select job...</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}{j.company?.name ? ` — ${j.company.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as ApplicationStage)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any notes about this application..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !candidateId || !jobId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}