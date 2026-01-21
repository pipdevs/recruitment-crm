import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Job = Database['public']['Tables']['jobs']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];
type JobUpdate = Database['public']['Tables']['jobs']['Update'];

export const jobsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, company:companies(id, name), creator:created_by(full_name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, company:companies(id, name), creator:created_by(full_name)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(job: JobInsert) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select('*, company:companies(id, name), creator:created_by(full_name)')
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, job: JobUpdate) {
    const { data, error } = await supabase
      .from('jobs')
      .update(job)
      .eq('id', id)
      .select('*, company:companies(id, name), creator:created_by(full_name)')
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

  async getNotes(jobId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*, creator:created_by(full_name)')
      .eq('entity_type', 'job')
      .eq('entity_id', jobId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addNote(jobId: string, content: string, userId: string) {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        entity_type: 'job',
        entity_id: jobId,
        content,
        created_by: userId,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteNote(noteId: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);
    if (error) throw error;
  },

  async updateStatus(id: string, status: Job['status']) {
    return this.update(id, { status });
  },
};
