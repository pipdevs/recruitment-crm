import { supabase } from '../lib/supabase';
import { getOrganisationId } from '../lib/organisation';
import { activitiesService } from './activities';
import type { Database } from '../lib/database.types';

type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];
type JobApplicationUpdate = Database['public']['Tables']['job_applications']['Update'];

export const jobApplicationsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        candidate:candidate_id (id, full_name, email, status),
        job:job_id (id, title, company_id,
          company:company_id (id, name)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByJob(jobId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        candidate:candidate_id (id, full_name, email, phone, status)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByCandidate(candidateId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_id (id, title,
          company:company_id (id, name)
        )
      `)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(application: JobApplicationInsert) {
    const organisation_id = await getOrganisationId();
    const { data, error } = await supabase
      .from('job_applications')
      .insert([{ ...application, organisation_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Updates first, then logs on the candidate, so a rejected update records nothing.
  async updateStage(
    application: { id: string; candidate_id: string; stage: string },
    stage: string,
    jobTitle: string,
    authorId: string
  ) {
    const { error } = await supabase
      .from('job_applications')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', application.id);
    if (error) throw error;
    await activitiesService.createStageMove(application.candidate_id, jobTitle, application.stage, stage, authorId);
  },

  async update(id: string, updates: JobApplicationUpdate) {
    const { data, error } = await supabase
      .from('job_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};