import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Candidate = Database['public']['Tables']['candidates']['Row'];
type CandidateInsert = Database['public']['Tables']['candidates']['Insert'];
type CandidateUpdate = Database['public']['Tables']['candidates']['Update';

export const candidatesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(candidate: Omit<CandidateInsert, 'created_by'>) {
    // 🔐 Always get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert({
        ...candidate,
        created_by: user.id, // ✅ valid FK every time
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, candidate: CandidateUpdate) {
    // 🚫 Never allow created_by changes
    const { created_by, ...safeUpdates } = candidate as any;

    const { data, error } = await supabase
      .from('candidates')
      .update(safeUpdates)
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

  async getNotes(candidateId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*, creator:created_by(full_name)')
      .eq('entity_type', 'candidate')
      .eq('entity_id', candidateId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addNote(candidateId: string, content: string, userId: string) {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        entity_type: 'candidate',
        entity_id: candidateId,
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

  async updateStatus(id: string, status: Candidate['status']) {
    return this.update(id, { status });
  },
}
