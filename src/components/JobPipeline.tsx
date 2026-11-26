import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobApplicationsService } from '../services/jobApplications';
import { CandidatePicker } from './CandidatePicker';
import { ApplicationBoard, type PipelineApplication } from './ApplicationBoard';
import type { ApplicationStage } from '../lib/enums';

// The candidates on one job, and adding more without leaving the page.
export function JobPipeline({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<PipelineApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setApplications(await jobApplicationsService.getByJob(jobId));
  }, [jobId]);

  useEffect(() => {
    setLoading(true);
    setError('');
    load()
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load pipeline'))
      .finally(() => setLoading(false));
  }, [load]);

  const handleAdd = async () => {
    if (!candidateId || !user) return;
    setAdding(true);
    setError('');
    try {
      await jobApplicationsService.create({ candidate_id: candidateId, job_id: jobId, created_by: user.id });
      setCandidateId('');
      await load();
    } catch (err) {
      const duplicate = (err as { code?: string }).code === '23505';
      setError(duplicate ? 'That candidate is already on this job.' : err instanceof Error ? err.message : 'Failed to add candidate');
    } finally {
      setAdding(false);
    }
  };

  const handleStageChange = async (application: PipelineApplication, stage: ApplicationStage) => {
    if (!user) return;
    setError('');
    try {
      await jobApplicationsService.updateStage(application, stage, jobTitle, user.id);
      setApplications(apps => apps.map(a => a.id === application.id ? { ...a, stage } : a));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stage');
    }
  };

  const handleDelete = async (application: PipelineApplication) => {
    if (!confirm(`Remove ${application.candidate?.full_name ?? 'this candidate'} from this job?`)) return;
    setError('');
    try {
      await jobApplicationsService.delete(application.id);
      setApplications(apps => apps.filter(a => a.id !== application.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove candidate');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Pipeline <span className="text-gray-400 font-normal">· {applications.length}</span>
        </h2>
        <div className="flex items-center gap-2 w-full max-w-md">
          <div className="flex-1">
            <CandidatePicker value={candidateId} onChange={setCandidateId} />
          </div>
          <button
            onClick={handleAdd}
            disabled={!candidateId || adding}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <ApplicationBoard applications={applications} onStageChange={handleStageChange} onDelete={handleDelete} />
      )}
    </div>
  );
}