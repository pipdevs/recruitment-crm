import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobsService } from '../services/jobs';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { JobModal } from './JobModal';
import { jobStatusBadgeClass } from '../lib/enums';
import type { Database } from '../lib/database.types';

type Job = Database['public']['Tables']['jobs']['Row'];
type CompanyJob = Awaited<ReturnType<typeof jobsService.getByCompany>>[number];

// The company's jobs with how many candidates are on each, and adding a job
// for this company without re-picking it.
export function CompanyJobs({ companyId }: { companyId: string }) {
  const { user } = useAuth();
  const limits = usePlanLimits();
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setJobs(await jobsService.getByCompany(companyId));
  }, [companyId]);

  useEffect(() => {
    setLoading(true);
    setError('');
    load()
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load jobs'))
      .finally(() => setLoading(false));
  }, [load]);

  const handleCreate = async (data: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'organisation_id'>) => {
    await jobsService.create({ ...data, created_by: user?.id || null });
    await load();
    setModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Jobs <span className="text-gray-400 font-normal">· {jobs.length}</span>
        </h2>
        {!limits.jobs.reached && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add job
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-gray-500">No jobs yet.</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map(job => {
            const candidates = job.job_applications[0]?.count ?? 0;
            return (
              <li key={job.id} className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${job.id}`} className="block text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                    {job.title}
                  </Link>
                  <p className="text-xs text-gray-500 truncate">
                    {candidates} {candidates === 1 ? 'candidate' : 'candidates'}
                    {job.location ? ` · ${job.location}` : ''}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${jobStatusBadgeClass(job.status)}`}>
                  {job.status}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <JobModal
        isOpen={modalOpen}
        defaultCompanyId={companyId}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}