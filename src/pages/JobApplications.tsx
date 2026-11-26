import { useState, useEffect } from 'react';
import { Plus, Search, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobApplicationsService } from '../services/jobApplications';
import { CandidatePicker } from '../components/CandidatePicker';
import { supabase } from '../lib/supabase';
import { APPLICATION_STAGES, pipelineBadgeClass, type ApplicationStage } from '../lib/enums';
import { ApplicationBoard } from '../components/ApplicationBoard';

type Application = Awaited<ReturnType<typeof jobApplicationsService.getAll>>[number];

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
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (application: Application, stage: ApplicationStage) => {
    if (!user) return;
    try {
      await jobApplicationsService.updateStage(application, stage, application.job.title, user.id);
      setApplications(applications.map(a => a.id === application.id ? { ...a, stage } : a));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stage');
    }
  };

  const handleDelete = async (application: Application) => {
    if (!confirm(`Remove ${application.candidate.full_name} from ${application.job.title}?`)) return;
    try {
      await jobApplicationsService.delete(application.id);
      setApplications(applications.filter(a => a.id !== application.id));
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
        {(['All', ...APPLICATION_STAGES] as const).map((stage) => (
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
        <ApplicationBoard
          applications={filtered}
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
          onCreated={() => {
            // Reload: the insert returns the row without the candidate and job names.
            loadApplications();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── List View ─────────────────────────────────────────────
function ListView({ applications, onStageChange, onDelete }: {
  applications: Application[];
  onStageChange: (application: Application, stage: ApplicationStage) => void;
  onDelete: (application: Application) => void;
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
                  onChange={(e) => onStageChange(app, e.target.value as ApplicationStage)}
                  className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium cursor-pointer ${pipelineBadgeClass(app.stage)}`}
                >
                  {APPLICATION_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-6 py-4 text-xs text-gray-500">
                {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onDelete(app)}
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
  onCreated: () => void;
}) {
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [stage, setStage] = useState<ApplicationStage>('Applied');
  const [notes, setNotes] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('id, title, company:company_id(name)')
        .eq('status', 'Open')
        .order('title');
      setJobs(data || []);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId || !jobId) return;
    setLoading(true);
    setError('');
    try {
      await jobApplicationsService.create({
        candidate_id: candidateId,
        job_id: jobId,
        stage,
        notes: notes || null,
        created_by: userId,
      });
      onCreated();
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
            <CandidatePicker value={candidateId} onChange={setCandidateId} />
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
              {APPLICATION_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
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