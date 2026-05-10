import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];
type JobApplicationUpdate = Database['public']['Tables']['job_applications']['Update'];

const getOrgId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data } = await supabase.from('profiles').select('organisation_id').eq('id', user.id).single();
  return data?.organisation_id;
};

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
    const organisation_id = await getOrgId();
    const { data, error } = await supabase
      .from('job_applications')
      .insert([{ ...application, organisation_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStage(id: string, stage: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
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