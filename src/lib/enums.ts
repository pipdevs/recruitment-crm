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

export type CandidateStatus = 'New' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
export type JobStatus = 'Open' | 'Closed' | 'On Hold';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type EntityType = 'candidate' | 'company' | 'job';