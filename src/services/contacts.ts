import { supabase } from '../lib/supabase';
import { getOrganisationId } from '../lib/organisation';
import type { Database } from '../lib/database.types';

type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export const contactsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*, company:company_id(id, name)')
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
    const organisation_id = await getOrganisationId();
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ ...contact, organisation_id }])
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