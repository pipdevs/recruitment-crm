import { supabase } from '../lib/supabase';
import { getOrganisationId } from '../lib/organisation';
import type { Database } from '../lib/database.types';

type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export const jobsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, company:company_id(id, name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, company:company_id(id, name), contact:contact_id(id, full_name, job_title)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

    // A company's jobs with how many candidates are on each.
  async getByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, status, location, job_applications(count)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(job: JobInsert) {
    const organisation_id = await getOrganisationId();
    const { data, error } = await supabase
      .from('jobs')
      .insert([{ ...job, organisation_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, job: JobUpdate) {
    const { data, error } = await supabase
      .from('jobs')
      .update(job)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('jobs')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};