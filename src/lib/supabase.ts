import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type UserRole = 'Admin' | 'Manager' | 'Recruiter';
export type CandidateStatus = 'New' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
export type JobStatus = 'Open' | 'Closed' | 'On Hold';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type EntityType = 'candidate' | 'company' | 'job';