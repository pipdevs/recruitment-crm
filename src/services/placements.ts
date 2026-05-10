import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type PlacementInsert = Database['public']['Tables']['placements']['Insert'];
type PlacementUpdate = Database['public']['Tables']['placements']['Update'];

const getOrgId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data } = await supabase.from('profiles').select('organisation_id').eq('id', user.id).single();
  return data?.organisation_id;
};

export const placementsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('placements')
      .select(`
        *,
        candidate:candidate_id (id, full_name, email),
        job:job_id (id, title),
        company:company_id (id, name)
      `)
      .order('placement_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(placement: PlacementInsert) {
    const organisation_id = await getOrgId();
    const { data, error } = await supabase
      .from('placements')
      .insert([{ ...placement, organisation_id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: PlacementUpdate) {
    const { data, error } = await supabase
      .from('placements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('placements')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getSummary() {
    const { data, error } = await supabase
      .from('placements')
      .select('fee_amount, fee_status, placement_date');
    if (error) throw error;

    const total = data?.reduce((sum, p) => sum + (p.fee_amount || 0), 0) || 0;
    const paid = data?.filter(p => p.fee_status === 'Paid')
      .reduce((sum, p) => sum + (p.fee_amount || 0), 0) || 0;
    const pending = data?.filter(p => p.fee_status === 'Pending')
      .reduce((sum, p) => sum + (p.fee_amount || 0), 0) || 0;
    const invoiced = data?.filter(p => p.fee_status === 'Invoiced')
      .reduce((sum, p) => sum + (p.fee_amount || 0), 0) || 0;

    const thisMonth = data?.filter(p => {
      if (!p.placement_date) return false;
      const d = new Date(p.placement_date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length || 0;

    return { total, paid, pending, invoiced, count: data?.length || 0, thisMonth };
  },
};