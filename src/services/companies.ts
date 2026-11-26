import { supabase } from '../lib/supabase';
import { getOrganisationId } from '../lib/organisation';
import type { Database } from '../lib/database.types';

type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export const companiesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

    async getById(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(company: CompanyInsert) {
    const organisation_id = await getOrganisationId();
    const { data, error } = await supabase
      .from('companies')
      .insert([{ ...company, organisation_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, company: CompanyUpdate) {
    const { data, error } = await supabase
      .from('companies')
      .update(company)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getNotes(entityId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*, creator:created_by(full_name)')
      .eq('entity_id', entityId)
      .eq('entity_type', 'company')
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
        entity_type: 'company',
        entity_id: entityId,
        content,
        created_by: createdBy,
        organisation_id,
      }]);
    if (error) throw error;
  },
};