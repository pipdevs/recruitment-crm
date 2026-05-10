import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export const contactsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        company:company_id (id, name)
      `)
      .order('full_name');
    if (error) throw error;
    return data;
  },

  async getByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', companyId)
      .order('is_primary', { ascending: false })
      .order('full_name');
    if (error) throw error;
    return data;
  },

  async create(contact: ContactInsert) {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contact])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, contact: ContactUpdate) {
    const { data, error } = await supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};