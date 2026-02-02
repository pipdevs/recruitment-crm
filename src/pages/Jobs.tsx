import { useState, useEffect } from 'react';
import { Briefcase, Edit2, Trash2, Plus, MapPin, DollarSign, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { JobModal } from '../components/JobModal';
import { ActivityFeed } from '../components/ActivityFeed';
import { jobsService } from '../services/jobs';
import { activitiesService } from '../services/activities';
import type { Database } from '../lib/database.types';

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
    try {
      const newJob = await jobsService.create({
        ...data,
        created_by: user?.id || null,
      });
      setJobs([newJob, ...jobs]);
      setModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdate = async (data: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedJob) return;
    try {
      const updated = await jobsService.update(selectedJob.id, data);
      setJobs(jobs.map(j => j.id === updated.id ? updated : j));
      setSelectedJob(updated);
      setModalOpen(false);
    } catch (err) {
      throw err;
    }
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
            const updated = await jobsService.updateStatus(selectedJob.id, status);
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
        <button
          onClick={() => {
            setSelectedJob(undefined);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Job
        </button>
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
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await jobsService.getNotes(job.id);
      setNotes(data || []);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;
    setAddingNote(true);
    try {
      await jobsService.addNote(job.id, newNote, user.id);
      await activitiesService.createNote('job', job.id, newNote, user.id);
      setNewNote('');
      await loadNotes();
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await jobsService.deleteNote(noteId);
      await loadNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleStatusChange = async (newStatus: typeof STATUSES[number]) => {
    setStatusUpdating(true);
    try {
      if (user) {
        await activitiesService.createStatusChange(
          'job',
          job.id,
          job.status,
          newStatus,
          user.id
        );
      }
      await onStatusChange(newStatus as any);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex gap-2">
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Status
              </label>
              <select
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                disabled={statusUpdating}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${STATUS_COLORS[job.status]} font-medium`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {job.company && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Company</p>
                  <p className="font-medium text-gray-900">{job.company.name}</p>
                </div>
              )}

              {job.location && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-medium text-gray-900">{job.location}</p>
                </div>
              )}

              {job.salary_range && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Salary Range</p>
                  <p className="font-medium text-gray-900">{job.salary_range}</p>
                </div>
              )}
            </div>

            {job.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Timeline</h2>
            <ActivityFeed entityType="job" entityId={job.id} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Notes</h2>

          <div className="space-y-3 mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={3}
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || addingNote}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {addingNote ? 'Adding...' : 'Add Note'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-600 font-medium">
                      {note.creator?.full_name || 'Unknown'}
                    </p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
