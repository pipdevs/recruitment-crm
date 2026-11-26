import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobApplicationsService } from '../services/jobApplications';
import { jobsService } from '../services/jobs';
import { APPLICATION_STAGES, pipelineBadgeClass, type ApplicationStage } from '../lib/enums';

type Application = Awaited<ReturnType<typeof jobApplicationsService.getByCandidate>>[number];
type Job = Awaited<ReturnType<typeof jobsService.getAll>>[number];

// Every job this candidate is on, with the stage for each, and adding them to
// another open job without leaving the page.
export function CandidateJobs({ candidateId }: { candidateId: string }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [openJobs, setOpenJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setApplications(await jobApplicationsService.getByCandidate(candidateId));
  }, [candidateId]);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      load(),
      jobsService.getAll().then(jobs => setOpenJobs(jobs.filter(j => j.status === 'Open'))),
    ])
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load jobs'))
      .finally(() => setLoading(false));
  }, [load]);

  // Only offer jobs they aren't already on.
  const onJobIds = new Set(applications.map(a => a.job_id));
  const addable = openJobs.filter(j => !onJobIds.has(j.id));

  const handleAdd = async () => {
    if (!jobId || !user) return;
    setAdding(true);
    setError('');
    try {
      await jobApplicationsService.create({ candidate_id: candidateId, job_id: jobId, created_by: user.id });
      setJobId('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to job');
    } finally {
      setAdding(false);
    }
  };

  const handleStageChange = async (application: Application, stage: ApplicationStage) => {
    if (!user) return;
    setError('');
    try {
      await jobApplicationsService.updateStage(application, stage, application.job.title, user.id);
      setApplications(apps => apps.map(a => a.id === application.id ? { ...a, stage } : a));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stage');
    }
  };

  const handleDelete = async (application: Application) => {
    if (!confirm(`Remove from ${application.job.title}?`)) return;
    setError('');
    try {
      await jobApplicationsService.delete(application.id);
      setApplications(apps => apps.filter(a => a.id !== application.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from job');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        Jobs <span className="text-gray-400 font-normal">· {applications.length}</span>
      </h2>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <>
          {applications.length === 0 ? (
            <p className="text-sm text-gray-500 mb-3">Not on any jobs.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {applications.map(app => (
                <li key={app.id} className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${app.job_id}`} className="block text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                      {app.job.title}
                    </Link>
                    {app.job.company && <p className="text-xs text-gray-500 truncate">{app.job.company.name}</p>}
                  </div>
                  <select
                    value={app.stage}
                    onChange={e => handleStageChange(app, e.target.value as ApplicationStage)}
                    className={`text-xs px-2 py-1 rounded-lg border-0 font-medium cursor-pointer ${pipelineBadgeClass(app.stage)}`}
                  >
                    {APPLICATION_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => handleDelete(app)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    title="Remove from this job"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {addable.length > 0 && (
            <div className="flex gap-2">
              <select
                value={jobId}
                onChange={e => setJobId(e.target.value)}
                className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Add to an open job…</option>
                {addable.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title}{j.company ? ` — ${j.company.name}` : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                disabled={!jobId || adding}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                {adding ? 'Adding…' : 'Add'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}