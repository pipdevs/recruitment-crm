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

async getNotes(entityId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*, creator:created_by(full_name)')
      .eq('entity_id', entityId)
      .eq('entity_type', 'job')
      .order('created_at', { ascending: false });
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

  async addNote(entityId: string, content: string, createdBy: string) {
    const organisation_id = await getOrganisationId();
    const { error } = await supabase
      .from('notes')
      .insert([{
        entity_type: 'job',
        entity_id: entityId,
        content,
        created_by: createdBy,
        organisation_id,
      }]);
    if (error) throw error;
  },
};