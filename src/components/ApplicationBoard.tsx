import { Link } from 'react-router-dom';
import { Briefcase, Building2, Trash2, User } from 'lucide-react';
import { APPLICATION_STAGES, PIPELINE_DOT_COLORS, pipelineBadgeClass, type ApplicationStage } from '../lib/enums';

// The shape both the job page and the Applications page load. The job is
// absent on the job page, where it would only repeat the page title.
export interface PipelineApplication {
  id: string;
  stage: string;
  candidate_id: string;
  job_id: string;
  applied_at: string | null;
  candidate?: { id: string; full_name: string; email: string | null } | null;
  job?: { id: string; title: string; company?: { id: string; name: string } | null } | null;
}

// Generic so each page gets its own rows back in the callbacks, with whatever
// extra fields it loaded.
interface ApplicationBoardProps<T extends PipelineApplication> {
  applications: T[];
  onStageChange: (application: T, stage: ApplicationStage) => void;
  onDelete: (application: T) => void;
}

// One board for every pipeline view, so moving a candidate works the same everywhere.
export function ApplicationBoard<T extends PipelineApplication>({ applications, onStageChange, onDelete }: ApplicationBoardProps<T>) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {APPLICATION_STAGES.map((stage) => {
        const apps = applications.filter(a => a.stage === stage);
        return (
          <div key={stage} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${PIPELINE_DOT_COLORS[stage]}`} />
                <h3 className="font-semibold text-gray-700 text-sm">{stage}</h3>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {apps.length}
              </span>
            </div>
            <div className="space-y-3">
              {apps.map((app) => (
                <ApplicationCard key={app.id} app={app} onStageChange={onStageChange} onDelete={onDelete} />
              ))}
              {apps.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-xs text-gray-400">Nobody here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ApplicationCard<T extends PipelineApplication>({ app, onStageChange, onDelete }: {
  app: T;
  onStageChange: ApplicationBoardProps<T>['onStageChange'];
  onDelete: ApplicationBoardProps<T>['onDelete'];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <Link to={`/candidates/${app.candidate_id}`} className="flex items-center gap-2 min-w-0 group">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600">
            {app.candidate?.full_name}
          </span>
        </Link>
        <button
          onClick={() => onDelete(app)}
          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
          title="Remove from this job"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {app.job && (
        <Link to={`/jobs/${app.job_id}`} className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 hover:text-blue-600">
          <Briefcase className="w-3 h-3" />
          {app.job.title}
        </Link>
      )}

      {app.job?.company && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
          <Building2 className="w-3 h-3" />
          {app.job.company.name}
        </div>
      )}

      <select
        value={app.stage}
        onChange={(e) => onStageChange(app, e.target.value as ApplicationStage)}
        className={`w-full mt-2 text-xs px-2 py-1.5 rounded-lg border-0 font-medium cursor-pointer ${pipelineBadgeClass(app.stage)}`}
      >
        {APPLICATION_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}