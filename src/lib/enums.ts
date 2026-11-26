// ============================================================
// App enumerations
//
// These mirror CHECK constraints in Postgres, not Postgres enum
// types, so `supabase gen types` emits them as plain `string` and
// cannot generate these unions. They live here rather than in
// database.types.ts because regenerating that file overwrites it.
//
// Keep in sync with:
//   candidates_status_check, jobs_status_check,
//   tasks_status_check, tasks_related_entity_type_check
// ============================================================

// The candidate's relationship with the agency. Progress on a specific
// job is the application's stage, never this.
export type CandidateStatus = 'New' | 'Contacted' | 'Active' | 'Placed' | 'Not Interested' | 'Do Not Contact';
export const CANDIDATE_STATUSES: CandidateStatus[] = ['New', 'Contacted', 'Active', 'Placed', 'Not Interested', 'Do Not Contact'];

export function isCandidateStatus(value: string | null | undefined): value is CandidateStatus {
  return value != null && (CANDIDATE_STATUSES as string[]).includes(value);
}

// Progress on one job. A candidate has one of these per job they're on.
export type ApplicationStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Placed' | 'Rejected';
export const APPLICATION_STAGES: ApplicationStage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Placed', 'Rejected'];
export type JobStatus = 'Open' | 'Closed' | 'On Hold';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type EntityType = 'candidate' | 'company' | 'job';

// One hue per pipeline word, shared by every place that shows one.
// Keyed on both vocabularies at once, so adding a status or a stage
// without giving it a colour is a type error. Tailwind only sees class
// names it can read literally, so the three roles are written out
// rather than built from a hue name.
export type PipelineValue = CandidateStatus | ApplicationStage;

export const PIPELINE_BADGE_COLORS: Record<PipelineValue, string> = {
  New: 'bg-gray-100 text-gray-800',
  Applied: 'bg-gray-100 text-gray-800',
  Screening: 'bg-blue-100 text-blue-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-amber-100 text-amber-800',
  Contacted: 'bg-sky-100 text-sky-800',
  Active: 'bg-indigo-100 text-indigo-800',
  'Not Interested': 'bg-orange-100 text-orange-800',
  'Do Not Contact': 'bg-red-100 text-red-800',
  Placed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export const PIPELINE_DOT_COLORS: Record<PipelineValue, string> = {
  // Candidate status
  New: 'bg-gray-400',
  Contacted: 'bg-sky-500',
  Active: 'bg-indigo-500',
  'Not Interested': 'bg-orange-500',
  'Do Not Contact': 'bg-red-500',
  // Application stage
  Applied: 'bg-gray-400',
  Screening: 'bg-blue-500',
  Interview: 'bg-purple-500',
  Offer: 'bg-amber-500',
  // Both
  Placed: 'bg-green-500',
  Rejected: 'bg-red-500',
};

// For the places where the value arrives as a plain string: the column
// is text in Postgres, and activity metadata is Json.
export function pipelineBadgeClass(value: string): string {
  return PIPELINE_BADGE_COLORS[value as PipelineValue] ?? 'bg-gray-100 text-gray-800';
}