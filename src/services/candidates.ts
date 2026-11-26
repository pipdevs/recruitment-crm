import { supabase } from '../lib/supabase';
import { getOrganisationId } from '../lib/organisation';
import type { Database } from '../lib/database.types';

type CandidateInsert = Database['public']['Tables']['candidates']['Insert'];
type CandidateUpdate = Database['public']['Tables']['candidates']['Update'];

export const candidatesService = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // One page of candidates matching the search (see search_candidates in the database), plus the total number of matches.
  async search(term: string, page: number, pageSize: number) {
    const from = page * pageSize;
    const { data, error, count } = await supabase
      .rpc('search_candidates', { p_term: term }, { count: 'exact' })
      .order('full_name')
      .order('id')
      .range(from, from + pageSize - 1);
    if (error) throw error;
    return { candidates: data, total: count ?? 0 };
  },

  async create(candidate: CandidateInsert) {
    const organisation_id = await getOrganisationId();
    const { data, error } = await supabase
      .from('candidates')
      .insert([{ ...candidate, organisation_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, candidate: CandidateUpdate) {
    const { data, error } = await supabase
      .from('candidates')
      .update(candidate)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('candidates')
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
      .eq('entity_type', 'candidate')
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
        entity_type: 'candidate',
        entity_id: entityId,
        content,
        created_by: createdBy,
        organisation_id,
      }]);
    if (error) throw error;
  },
};