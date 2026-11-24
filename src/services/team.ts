import { supabase } from '../lib/supabase';

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

  async getInviteByToken(token: string) {
    // Reads through the get_invite SECURITY DEFINER function: the invites
    // table is no longer readable by anon, so a direct select returns nothing.
    const { data, error } = await supabase
      .rpc('get_invite', { invite_token: token })
      .single();
    if (error) throw error;
    return data;
  },

  // Role changes, removal and leaving all go through SECURITY DEFINER RPCs.
  // Clients have no UPDATE permission on profiles.role or profiles.organisation_id,
  // so these are the only paths that can change them.
  async setMemberRole(memberId: string, role: string) {
    const { error } = await supabase.rpc('set_member_role', {
      p_member_id: memberId,
      p_role: role,
    });
    if (error) throw error;
  },

  async removeMember(memberId: string) {
    const { error } = await supabase.rpc('remove_member', { p_member_id: memberId });
    if (error) throw error;
  },

  async leaveOrganisation() {
    const { error } = await supabase.rpc('leave_organisation');
    if (error) throw error;
  },
};