import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export const tasksService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to(id, full_name),
        creator:created_by(full_name),
        related_candidate:candidates!tasks_related_entity_id_fkey(id, full_name),
        related_company:companies!tasks_related_entity_id_fkey(id, name),
        related_job:jobs!tasks_related_entity_id_fkey(id, title)
      `)
      .order('due_date', { ascending: true, nullsFirst: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to(id, full_name),
        creator:created_by(full_name)
      `)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(task: TaskInsert) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select(`
        *,
        assignee:assigned_to(id, full_name),
        creator:created_by(full_name)
      `)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, task: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update(task)
      .eq('id', id)
      .select(`
        *,
        assignee:assigned_to(id, full_name),
        creator:created_by(full_name)
      `)
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

  async updateStatus(id: string, status: Task['status']) {
    return this.update(id, { status });
  },

  async getTasksByDate(startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to(id, full_name),
        creator:created_by(full_name)
      `)
      .gte('due_date', startDate.toISOString())
      .lte('due_date', endDate.toISOString())
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },
};

export const profilesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .order('full_name', { ascending: true });
    if (error) throw error;
    return data;
  },
};
