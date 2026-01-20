import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Company = Database['public']['Tables']['companies']['Row'];
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export const companiesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
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

  async create(company: Omit<CompanyInsert, 'created_by'>) {
    // 🔐 ALWAYS fetch the authenticated user here
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('companies')
      .insert({
        ...company,
        created_by: user.id, // ✅ guaranteed valid FK
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, company: CompanyUpdate) {
    // 🚫 NEVER update created_by
    const { created_by, ...safeUpdates } = company as any;

    const { data, error } = await supabase
      .from('companies')
      .update(safeUpdates)
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

  async getNotes(companyId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*, creator:created_by(full_name)')
      .eq('entity_type', 'company')
      .eq('entity_id', companyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addNote(companyId: string, content: string, userId: string) {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        entity_type: 'company',
        entity_id: companyId,
        content,
        created_by: userId,
      })
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
};
