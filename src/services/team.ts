import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Invite = Database['public']['Tables']['invites']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export const teamService = {
  async getMembers(organisationId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('organisation_id', organisationId)
      .order('full_name');
    if (error) throw error;
    return data;
  },

  async getInvites(organisationId: string) {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('organisation_id', organisationId)
      .eq('accepted', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async sendInvite(organisationId: string, email: string, role: string, invitedBy: string) {
    const { data, error } = await supabase
      .from('invites')
      .insert([{
        organisation_id: organisationId,
        email,
        role,
        invited_by: invitedBy,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async cancelInvite(id: string) {
    const { error } = await supabase
      .from('invites')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateMemberRole(id: string, role: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getInviteByToken(token: string) {
    const { data, error } = await supabase
      .from('invites')
      .select('*, organisation:organisation_id(id, name)')
      .eq('token', token)
      .eq('accepted', false)
      .single();
    if (error) throw error;
    return data;
  },

  async acceptInvite(token: string, userId: string, organisationId: string) {
    // Link user to organisation
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ organisation_id: organisationId })
      .eq('id', userId);
    if (profileError) throw profileError;

    // Mark invite as accepted
    const { error: inviteError } = await supabase
      .from('invites')
      .update({ accepted: true })
      .eq('token', token);
    if (inviteError) throw inviteError;
  },
};