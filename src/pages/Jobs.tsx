import { useState, useEffect } from 'react';
import { Briefcase, Edit2, Trash2, Plus, MapPin, DollarSign, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { JobModal } from '../components/JobModal';
import { ActivityPanel } from '../components/ActivityPanel';
import { jobsService } from '../services/jobs';
import { activitiesService } from '../services/activities';
import type { Database } from '../lib/database.types';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { UpgradePrompt } from '../components/UpgradePrompt';

type Job = Database['public']['Tables']['jobs']['Row'];

interface JobsPageState {
  view: 'list' | 'detail';
  selectedId?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
};

export function Jobs() {
  const { user } = useAuth();
  const [state, setState] = useState<JobsPageState>({ view: 'list' });
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const limits = usePlanLimits();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsService.getAll();
      setJobs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

const handleCreate = async (data: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
  const newJob = await jobsService.create({
    ...data,
    created_by: user?.id || null,
  });
  setJobs([newJob, ...jobs]);
  setModalOpen(false);
};

const handleUpdate = async (data: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
  if (!selectedJob) return;
  const updated = await jobsService.update(selectedJob.id, data);
  setJobs(jobs.map(j => j.id === updated.id ? updated : j));
  setSelectedJob(updated);
  setModalOpen(false);
};

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this job?')) return;
  try {
    await jobsService.delete(id);
    setJobs(jobs.filter(j => j.id !== id));
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to delete job');
  }
};

  const openJobDetail = async (job: any) => {
    setSelectedJob(job);
    setState({ view: 'detail', selectedId: job.id });
  };

  const handleEditClick = (job: any) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  if (state.view === 'detail' && selectedJob) {
    return (
      <JobDetail
        job={selectedJob}
        onBack={() => {
          setState({ view: 'list' });
          loadJobs();
        }}
        onEdit={() => handleEditClick(selectedJob)}
        onDelete={() => {
          handleDelete(selectedJob.id);
          setState({ view: 'list' });
        }}
        onStatusChange={async (status) => {
          try {
            const updated = await jobsService.updateStatus(selectedJob.id, status ?? 'Open');
            setJobs(jobs.map(j => j.id === updated.id ? updated : j));
            setSelectedJob(updated);
          } catch (err) {
            console.error('Failed to update status:', err);
          }
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs</h1>
          <p className="text-gray-600">Manage job postings and openings</p>
        </div>
        {limits.jobs.reached ? (
          <UpgradePrompt
            compact
            title={`Free plan limit reached (${limits.jobs.max} open jobs)`}
            description=""
          />
        ) : (
          <button
            onClick={() => { setSelectedJob(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Job
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-orange-100 p-4 rounded-full mb-4">
              <Briefcase className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Create job postings to start matching candidates with opportunities.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openJobDetail(job)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {job.company && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {job.company.name}
                      </div>
                    )}
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                    )}
                    {job.salary_range && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary_range}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(job);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(job.id);
                    }}
                    className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {job.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <JobModal
        isOpen={modalOpen}
        job={selectedJob}
        onClose={() => {
          setModalOpen(false);
          setSelectedJob(undefined);
        }}
        onSubmit={selectedJob ? handleUpdate : handleCreate}
      />
    </div>
  );
}

interface JobDetailProps {
  job: any;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Job['status']) => Promise<void>;
}

const STATUSES = ['Open', 'Closed', 'On Hold'] as const;

function JobDetail({ job, onBack, onEdit, onDelete, onStatusChange }: JobDetailProps) {
  const { user } = useAuth();
  const [statusUpdating, setStatusUpdating] = useState(false);

  const handleStatusChange = async (newStatus: typeof STATUSES[number]) => {
    setStatusUpdating(true);
    try {
      if (user) {
        await activitiesService.createStatusChange(
          'job', job.id, job.status, newStatus, user.id
        );
      }
      await onStatusChange(newStatus as any);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-700 font-medium">
        ← Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — job info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex gap-2">
                <button onClick={onEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={onDelete} className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-3">{job.title}</h1>

            <div className="mb-4">
              <select
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                disabled={statusUpdating}
                className={`w-full px-3 py-2 border-0 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[job.status]}`}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-3 text-sm">
              {job.company && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Company</p>
                  <p className="font-medium text-gray-900">{job.company.name}</p>
                </div>
              )}
              {job.location && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Location</p>
                  <p className="font-medium text-gray-900">{job.location}</p>
                </div>
              )}
              {job.salary_range && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Salary Range</p>
                  <p className="font-medium text-gray-900">{job.salary_range}</p>
                </div>
              )}
              {job.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Description</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — tabbed activity panel */}
        <div className="lg:col-span-2">
          <ActivityPanel
            entityType="job"
            entityId={job.id}
            addNote={(content, userId) => jobsService.addNote(job.id, content, userId)}
            getNotes={(id) => jobsService.getNotes(id)}
            deleteNote={(noteId) => jobsService.deleteNote(noteId)}
          />
        </div>
      </div>
    </div>
  );
}