import { supabase } from './supabase';

// get_user_organisation_id() is the same function every RLS policy calls, so
// the client and the database cannot disagree about which organisation the
// current user belongs to. One round trip, and it throws rather than letting
// an undefined reach an insert, where RLS would reject it with a message that
// says nothing about the real cause.
export async function getOrganisationId(): Promise<string> {
  const { data, error } = await supabase.rpc('get_user_organisation_id');
  if (error) throw error;
  if (!data) throw new Error('Not signed in, or no organisation for the current user');
  return data;
}