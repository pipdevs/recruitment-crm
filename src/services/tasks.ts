import { supabase } from '../lib/supabase';
import { getOrganisationId } from '../lib/organisation';
import type { Database } from '../lib/database.types';

type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export const tasksService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data;
  },

  async create(task: TaskInsert) {
    const organisation_id = await getOrganisationId();
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, organisation_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, task: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update(task)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

export const profilesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .order('full_name');
    if (error) throw error;
    return data;
  },
};